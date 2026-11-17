// services/audioService.ts
// Robust singleton for managing background ambience + narration ducking

import { Soundscape } from '../types';
import { getAudioContext, unlockAudio as unlockToneAudio } from './buttonTone';
import { href } from './base';

let masterVolume = 1;
let interactionSoundsEnabled = true;
export const setInteractionSoundsEnabled = (enabled: boolean) => { interactionSoundsEnabled = enabled; };
const TRACK_SWITCH_FADE_OUT_MS = 320;
const TRACK_SWITCH_FADE_IN_MS = 900;
const SAME_TRACK_VOLUME_RAMP_MS = 450;
const STOP_FADE_MS = 900;

class AudioService {
  private static instance: AudioService;

  // Audio elements
  private ambience: HTMLAudioElement;
  private narration: HTMLAudioElement | null = null;

  // State
  private currentSoundscapeId: string | null = null;
  private currentSoundscapeUrl: string | null = null;
  private loadedSoundscapeUrl: string | null = null;
  private hasAudioFocus = true;
  private isAmbiencePlaying = false;
  private baseVolume = 0.5; // Applied volume (0.0 - 1.0)
  private baseVolumeRaw = 0.5; // Unscaled volume (0.0 - 1.0)
  private fadeInterval: number | null = null;
  private finishFade: (() => void) | null = null;
  private ambienceOperation = 0;
  private previewTimer: number | null = null;
  private previewSequence = 0;
  private previewActive = false;
  private previewReturn: { track: Soundscape; volume: number; time: number } | null = null;

  private clearPreview() {
    ++this.previewSequence;
    this.previewActive = false;
    if (this.previewTimer !== null) window.clearTimeout(this.previewTimer);
    this.previewTimer = null;
    this.previewReturn = null;
  }

  private constructor() {
    this.ambience = new Audio();
    this.ambience.loop = true;
    this.ambience.preload = 'auto';
    const quiet = () => {
      this.hasAudioFocus = false;
      this.stopNarration();
      void this.stopAmbience(0);
    };
    window.addEventListener('blur', quiet);
    window.addEventListener('pagehide', quiet);
    window.addEventListener('focus', () => { this.hasAudioFocus = !document.hidden; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) quiet();
      else this.hasAudioFocus = document.hasFocus();
    });

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
  public async playAmbience(soundscape: Soundscape, volume = 50, preview = false) {
    if (!preview) this.clearPreview();
    if (!this.hasAudioFocus || document.hidden) return;
    this.baseVolumeRaw = Number.isFinite(volume) ? volume / 100 : 0;
    this.baseVolume = Math.max(0, Math.min(1, this.baseVolumeRaw)) * masterVolume;

    // Guard: Missing URL
    if (!soundscape.url) {
      console.warn('AudioService: No URL for soundscape', soundscape.label);
      return;
    }
    const operation = ++this.ambienceOperation;

    // Case 1: Already playing this exact track source
    if (
      this.currentSoundscapeId === soundscape.id &&
      this.currentSoundscapeUrl === soundscape.url &&
      this.loadedSoundscapeUrl === soundscape.url
    ) {
      this.isAmbiencePlaying = true;
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
    if (operation !== this.ambienceOperation) return;

    this.ambience.src = soundscape.url;
    this.loadedSoundscapeUrl = soundscape.url;
    this.ambience.volume = 0; // Start silent for fade-in

    try {
      await this.ambience.play();
      if (operation === this.ambienceOperation && this.isAmbiencePlaying) {
        this.fadeVolume(this.baseVolume, TRACK_SWITCH_FADE_IN_MS);
      }
    } catch (error) {
      console.warn('AudioService: Autoplay prevented or load failed', error);
    }
  }

  /**
   * Stops ambience with a fade out.
   */
  public async stopAmbience(duration = STOP_FADE_MS) {
    this.clearPreview();
    const operation = ++this.ambienceOperation;

    this.isAmbiencePlaying = false;
    this.currentSoundscapeId = null; // Reset ID so next play is fresh
    this.currentSoundscapeUrl = null;

    await this.fadeVolume(0, this.ambience.paused ? 0 : duration);
    if (operation !== this.ambienceOperation) return;
    this.ambience.pause();
    this.ambience.currentTime = 0; // Reset track
  }

  public pauseAmbience() {
    this.clearPreview();
    ++this.ambienceOperation;
    this.finishFade?.();
    this.isAmbiencePlaying = false;
    this.ambience.pause();
  }

  public restartAmbience() {
    this.ambience.currentTime = 0;
  }

  public async previewAmbience(track: Soundscape, volume = 50) {
    if (!this.hasAudioFocus || document.hidden) return;
    const sequence = ++this.previewSequence;
      const alreadyPreviewing = this.previewActive;
    this.previewActive = true;
    if (this.previewTimer !== null) window.clearTimeout(this.previewTimer);
      if (!alreadyPreviewing && !this.previewReturn && this.isAmbiencePlaying && this.currentSoundscapeUrl) {
      this.previewReturn = {
        track: { id: this.currentSoundscapeId!, label: 'Ambience', url: this.currentSoundscapeUrl },
        volume: this.baseVolumeRaw * 100, time: this.ambience.currentTime,
      };
    }
    await this.playAmbience(track, volume, true);
    if (sequence !== this.previewSequence) return;
    const operation = this.ambienceOperation;
    this.previewTimer = window.setTimeout(() => {
      if (operation !== this.ambienceOperation) return;
      this.endPreview();
    }, 10000);
  }

  public endPreview() {
    if (!this.previewActive) return;
    const previous = this.previewReturn;
    this.clearPreview();
    if (previous) {
      void this.playAmbience(previous.track, previous.volume).then(() => {
        if (this.currentSoundscapeUrl === previous.track.url) this.ambience.currentTime = previous.time;
      });
    } else {
      void this.stopAmbience(200);
    }
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
    // Cancellation must settle the old promise so its caller can discard stale work.
    this.finishFade?.();
    return new Promise((resolve) => {
      const finish = () => {
        if (this.fadeInterval !== null) window.clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.finishFade = null;
        resolve();
      };
      this.finishFade = finish;

      const start = this.ambience.volume;
      const startTime = Date.now();

      // Clamp target
      const safeTarget = Math.max(0, Math.min(1, target));

      if (duration <= 0) {
        this.ambience.volume = safeTarget;
        finish();
        return;
      }

      this.fadeInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Linear fade (simple but effective)
        this.ambience.volume = start + (safeTarget - start) * progress;

        if (progress >= 1) {
          finish();
        }
      }, 50); // 20fps update
    });
  }
}

// Export singleton instance + standalone helper for App.tsx compatibility
export const audioService = AudioService.getInstance();
export const stopAmbience = (duration?: number) => audioService.stopAmbience(duration);
export const pauseAmbience = () => audioService.pauseAmbience();
export const restartAmbience = () => audioService.restartAmbience();
export const previewAmbience = (s: Soundscape, volume = 50) => audioService.previewAmbience(s, volume);
export const stopPreview = () => audioService.endPreview();
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
  if (!interactionSoundsEnabled) return;
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
    // Try to play the gong sound file from gongs folder
    const gong = new Audio(href('assets/audio/gongs/gong.mp3'))
    gong.volume = 0.7
    gong.play().catch(() => {
      // Fallback to synthesized gong sound if file fails
      playSynthGong()
    })
  } catch {
    // Fallback to synthesized gong sound
    playSynthGong()
  }
}

// Synthesized gong fallback
const playSynthGong = () => {
  try {
    const ctx = getAudioContext()
    unlockToneAudio()
    
    const now = ctx.currentTime
    const duration = 2.5
    
    // Fundamental tone (deep gong base)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = 110 // A2 - deep tone
    gain1.gain.setValueAtTime(0.0001, now)
    gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.05)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + duration)
    
    // Second harmonic (adds richness)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 220 // A3
    gain2.gain.setValueAtTime(0.0001, now)
    gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.03)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now)
    osc2.stop(now + duration * 0.8)
    
    // Third harmonic (shimmer)
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.value = 330 // E4
    gain3.gain.setValueAtTime(0.0001, now + 0.1)
    gain3.gain.exponentialRampToValueAtTime(0.08, now + 0.2)
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(now + 0.1)
    osc3.stop(now + duration * 0.6)
  } catch {
    // ignore
  }
}

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
