// services/audioService.ts
// Robust singleton for managing background ambience + narration ducking

import { Soundscape } from '../types';
import { getAudioContext, unlockAudio as unlockToneAudio } from './buttonTone';

let masterVolume = 1;
const TRACK_SWITCH_FADE_OUT_MS = 320;
const TRACK_SWITCH_FADE_IN_MS = 900;
const SAME_TRACK_VOLUME_RAMP_MS = 450;
const STOP_FADE_MS = 900;

function playTone(frequency: number, durationMs: number, volume = 0.25) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.value = 0.0001;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const attack = 0.02;
  const release = Math.max(0.03, durationMs / 1000 - attack);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);

  osc.start(now);
  osc.stop(now + attack + release);
}

class AudioService {
  private static instance: AudioService;

  // Audio elements
  private ambience: HTMLAudioElement;
  private narration: HTMLAudioElement | null = null;

  // State
  private currentSoundscapeId: string | null = null;
  private currentSoundscapeUrl: string | null = null;
  private isAmbiencePlaying = false;
  private baseVolume = 0.5; // Applied volume (0.0 - 1.0)
  private baseVolumeRaw = 0.5; // Unscaled volume (0.0 - 1.0)
  private fadeInterval: number | null = null;

  private constructor() {
    this.ambience = new Audio();
    this.ambience.loop = true;
    this.ambience.preload = 'auto';

    // Resume context on first interaction if needed (browser policy)
    const unlockAudio = () => {
      if (this.ambience.paused && this.isAmbiencePlaying) {
        this.ambience.play().catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Starts playing a soundscape. 
   * If already playing this ID, does nothing (seamless).
   * If changing IDs, crossfades.
   */
  public async playAmbience(soundscape: Soundscape, volume = 0.5) {
    this.baseVolumeRaw = volume / 100; // Convert 0-100 to 0.0-1.0 if needed, or assume input is 0-1

    // Normalization: specific check if input is > 1 (e.g. 50 vs 0.5)
    if (volume > 1) this.baseVolumeRaw = volume / 100;
    else this.baseVolumeRaw = volume;
    this.baseVolume = Math.max(0, Math.min(1, this.baseVolumeRaw)) * masterVolume;

    // Guard: Missing URL
    if (!soundscape.url) {
      console.warn('AudioService: No URL for soundscape', soundscape.label);
      return;
    }

    // Case 1: Already playing this exact track source
    if (
      this.currentSoundscapeId === soundscape.id &&
      this.currentSoundscapeUrl === soundscape.url &&
      this.isAmbiencePlaying
    ) {
      // Just ensure volume is correct (in case it was ducked)
      this.fadeVolume(this.baseVolume, SAME_TRACK_VOLUME_RAMP_MS);
      if (this.ambience.paused) this.ambience.play().catch(e => console.warn('Resume failed', e));
      return;
    }

    // Case 2: Changing tracks (or starting from stopped)
    this.currentSoundscapeId = soundscape.id;
    this.currentSoundscapeUrl = soundscape.url;
    this.isAmbiencePlaying = true;

    // Fade out old if playing
    if (!this.ambience.paused) {
      await this.fadeVolume(0, TRACK_SWITCH_FADE_OUT_MS);
    }

    this.ambience.src = soundscape.url;
    this.ambience.volume = 0; // Start silent for fade-in

    try {
      await this.ambience.play();
      this.fadeVolume(this.baseVolume, TRACK_SWITCH_FADE_IN_MS);
    } catch (error) {
      console.warn('AudioService: Autoplay prevented or load failed', error);
    }
  }

  /**
   * Stops ambience with a fade out.
   */
  public async stopAmbience(duration = STOP_FADE_MS) {
    if (!this.isAmbiencePlaying) return;

    this.isAmbiencePlaying = false;
    this.currentSoundscapeId = null; // Reset ID so next play is fresh
    this.currentSoundscapeUrl = null;

    await this.fadeVolume(0, duration);
    this.ambience.pause();
    this.ambience.currentTime = 0; // Reset track
  }

  /**
   * Plays a narration file (one-shot).
   * Automatically ducks (lowers) ambience volume while playing.
   * Restores ambience when done.
   */
  public playNarration(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any existing narration
      if (this.narration) {
        this.narration.pause();
        this.narration = null;
      }

      const audio = new Audio(url);
      this.narration = audio;

      // Duck ambience to 20% of its base volume
      const duckedVolume = this.baseVolume * 0.2;
      this.fadeVolume(duckedVolume, 500);

      audio.volume = 1.0; // Narrator is always full volume

      const finish = () => {
        // Only restore if we haven't started a NEW narration in the meantime
        if (this.narration === audio) {
          this.fadeVolume(this.baseVolume, 1000); // Restore ambience
          this.narration = null;
        }
        resolve();
      };

      audio.onended = finish;

      audio.onerror = (e) => {
        console.error('Narration error', e);
        finish(); // Restore ambience anyway
        reject(e);
      };

      audio.play().catch(e => {
        console.warn('Narration playback failed', e);
        finish();
      });
    });
  }

  /**
   * Stops any active narration immediately and restores ambience.
   */
  public stopNarration() {
    if (this.narration) {
      this.narration.pause();
      this.narration = null;
      // Restore ambience immediately
      this.fadeVolume(this.baseVolume, 800);
    }
  }

  public setMasterVolume(volume: number) {
    masterVolume = Math.max(0, Math.min(1, volume));
    this.baseVolume = Math.max(0, Math.min(1, this.baseVolumeRaw)) * masterVolume;
    if (this.isAmbiencePlaying) {
      this.ambience.volume = this.baseVolume;
    }
  }

  /**
   * Smoothly fades volume to target value over duration (ms).
   */
  private fadeVolume(target: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.fadeInterval) window.clearInterval(this.fadeInterval);

      const start = this.ambience.volume;
      const startTime = Date.now();

      // Clamp target
      const safeTarget = Math.max(0, Math.min(1, target));

      if (duration === 0) {
        this.ambience.volume = safeTarget;
        resolve();
        return;
      }

      this.fadeInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Linear fade (simple but effective)
        this.ambience.volume = start + (safeTarget - start) * progress;

        if (progress >= 1) {
          if (this.fadeInterval) window.clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          resolve();
        }
      }, 50); // 20fps update
    });
  }
}

// Export singleton instance + standalone helper for App.tsx compatibility
export const audioService = AudioService.getInstance();
export const stopAmbience = (duration?: number) => audioService.stopAmbience(duration);
export const playAmbience = (s: Soundscape, v?: number) => audioService.playAmbience(s, v);
export const playNarration = (url: string) => audioService.playNarration(url);
export const unlockAudio = () => unlockToneAudio();

export const playButtonTap = () => {
  try {
    playBell();
  } catch {
    // ignore
  }
};

export const playBell = () => {
  try {
    unlockToneAudio();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 110Hz = Deep A2 note (Tibetan bowl style)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(110, t);

    // Envelope: quick attack, long sacred decay
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.05, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    oscillator.start(t);
    oscillator.stop(t + 2.5);
  } catch {
    // ignore
  }
};

export const playCompletionSound = () => {
  try {
    unlockToneAudio();
    playTone(660, 140, 0.22);
    playTone(880, 180, 0.18);
  } catch {
    // ignore
  }
};

export const startAmbience = (soundscape: Soundscape | string, volume = 50) => {
  if (typeof soundscape === 'string') {
    return audioService.playAmbience({ id: soundscape, label: 'Ambience', url: soundscape }, volume);
  }
  return audioService.playAmbience(soundscape, volume);
};

export const stopAll = async () => {
  audioService.stopNarration();
  await audioService.stopAmbience(0);
};

export const setMasterVolume = (volume: number) => {
  audioService.setMasterVolume(volume);
};

export const updateVolume = (volume: number) => {
  const normalized = volume > 1 ? volume / 100 : volume;
  audioService.setMasterVolume(normalized);
};
