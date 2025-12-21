// src/services/audioService.ts
import type { Soundscape } from '../types';

let ambienceAudio: HTMLAudioElement | null = null;
let practiceAudio: HTMLAudioElement | null = null;

let effectsEnabled = true;
let musicEnabled = true;

// master volume 0..1
let masterVolume = 0.5;

// --- Web Audio state for synthetic pulse ---
let audioContext: AudioContext | null = null;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function resolveUrl(input?: string | Soundscape): string | null {
  if (!input) return null;
  if (typeof input === 'string') return input;

  // If you store actual URLs on soundscapes, prefer those
  if (input.url) return input.url;

  // Fallback: treat id as a relative asset path if you use that convention
  // Example: id === "RAIN" -> "/abundance-alchemy/assets/audio/ambience/RAIN.mp3"
  // If you don't want this, just return null here.
  return null;
}

export function setAudioSettings(effectsOn: boolean, musicOn: boolean) {
  effectsEnabled = effectsOn;
  musicEnabled = musicOn;

  if (ambienceAudio) ambienceAudio.muted = !musicEnabled;
  if (practiceAudio) practiceAudio.muted = !musicEnabled;
}

export function setMasterVolume(v: number) {
  masterVolume = clamp01(v);
  if (ambienceAudio) ambienceAudio.volume = masterVolume;
  if (practiceAudio) practiceAudio.volume = masterVolume;
}

// Some code calls this name
export function setVolume(v: number) {
  setMasterVolume(v);
}

// Legacy components often pass 0–100
export function updateVolume(volPercent: number) {
  setMasterVolume(clamp01(volPercent / 100));
}

// ---------- Ambience ----------
export function startAmbience(input?: string | Soundscape, volumePercent?: number) {
  if (!musicEnabled) return;

  const url = resolveUrl(input);
  if (!url) return;

  const v = volumePercent === undefined ? masterVolume : clamp01(volumePercent / 100);

  // If same ambience already playing, do nothing
  if (ambienceAudio && ambienceAudio.src.includes(url) && !ambienceAudio.paused) {
    ambienceAudio.volume = v;
    return;
  }

  stopAmbience();

  ambienceAudio = new Audio(url);
  ambienceAudio.loop = true;
  ambienceAudio.volume = v;
  ambienceAudio.muted = !musicEnabled;

  ambienceAudio.play().catch(() => {});
}

export function stopAmbience() {
  if (ambienceAudio) {
    ambienceAudio.pause();
    ambienceAudio = null;
  }
}

// ---------- Practice Audio ----------
export function startPracticeAudio(input?: string | Soundscape) {
  if (!musicEnabled) return;

  const url = resolveUrl(input);
  if (!url) return;

  stopPracticeAudio(false);
  // Practice pauses ambience; keeping your prior behavior:
  stopAmbience();

  practiceAudio = new Audio(url);
  practiceAudio.loop = true;
  practiceAudio.volume = masterVolume;
  practiceAudio.muted = !musicEnabled;

  practiceAudio.play().catch(() => {});
}

export function stopPracticeAudio(resumeAmbience = false, ambienceToResume?: string | Soundscape) {
  if (practiceAudio) {
    practiceAudio.pause();
    practiceAudio = null;
  }

  if (resumeAmbience) {
    startAmbience(ambienceToResume);
  }
}

// ---------- UI helpers ----------
export function previewSoundscape(input?: string | Soundscape) {
  const url = resolveUrl(input);
  if (!url) return;

  const preview = new Audio(url);
  preview.volume = masterVolume;
  preview.play().catch(() => {});
}

// Completion bell (Om-style) using audio file
export function playCompletionSound() {
  if (!effectsEnabled) return;

  // Use whichever path your project actually has:
  const bell = new Audio('/abundance-alchemy/assets/audio/bell.mp3');
  bell.volume = masterVolume;
  bell.play().catch(() => {});
}

// Some code expects playBell()
export function playBell() {
  playCompletionSound();
}

// ---------- Synthetic deep pulse (Web Audio) ----------
export function playClickPulse() {
  // Respect sound effects setting
  if (!effectsEnabled) return;

  try {
    // Lazily create shared AudioContext
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContext;

    // On some browsers, context must be resumed after a user gesture
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    // Deep, mystical thud ~ C3 (130.81 Hz)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(130.81, ctx.currentTime);

    // Start with modest gain scaled by masterVolume, then exponential decay
    const now = ctx.currentTime;
    const initialGain = 0.6 * masterVolume;

    gain.gain.setValueAtTime(initialGain, now);
    // Fast decay over ~0.1s
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, initialGain * 0.01), now + 0.1);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.12);

    // Cleanup
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  } catch {
    // Fail silently; do not break UI if Web Audio is unavailable
  }
}

// ---------- Compatibility aliases ----------
export function stopAll() {
  stopPracticeAudio(false);
  stopAmbience();
}

// Some App.tsx versions referenced these names:
export function startSessionAudio(input?: string | Soundscape) {
  startPracticeAudio(input);
}
export function stopSessionAudio(resumeAmbience = false, ambienceToResume?: string | Soundscape) {
  stopPracticeAudio(resumeAmbience, ambienceToResume);
}