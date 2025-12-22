// src/services/audioService.ts
import type { Soundscape } from '../types';

let ambienceAudio: HTMLAudioElement | null = null;
let practiceAudio: HTMLAudioElement | null = null;

let effectsEnabled = true;
let musicEnabled = true;

// master volume 0..1
let masterVolume = 0.5;

// --- Web Audio state for synthetic tones ---
let audioContext: AudioContext | null = null;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function resolveUrl(input?: string | Soundscape): string | null {
  if (!input) return null;
  if (typeof input === 'string') return input;

  if (input.url) return input.url;

  return null;
}

// ---------- Settings / volume ----------

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
  // Practice pauses ambience
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

// ---------- Sacred tone (old playBell envelope) ----------

function ensureAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  } catch {
    return null;
  }
}

// Deep, slowly fading 110 Hz tone from old playBell
function playBellTone() {
  if (!effectsEnabled) return;

  const ctx = ensureAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.05 * masterVolume, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 4);

  osc.onended = () => {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      // ignore
    }
  };
}

// Public APIs using the bell tone

export function playCompletionSound() {
  playBellTone();
}

// Some code expects playBell()
export function playBell() {
  playBellTone();
}

// ---------- Shorter click pulse (optional) ----------

export function playClickPulse() {
  if (!effectsEnabled) return;

  const ctx = ensureAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(130.81, ctx.currentTime);

  const now = ctx.currentTime;
  const initialGain = 0.6 * masterVolume;

  gain.gain.setValueAtTime(initialGain, now);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, initialGain * 0.01),
    now + 0.1
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.12);

  oscillator.onended = () => {
    try {
      oscillator.disconnect();
      gain.disconnect();
    } catch {
      // ignore
    }
  };
}

// ---------- Compatibility aliases ----------

export function stopAll() {
  stopPracticeAudio(false);
  stopAmbience();
}

export function startSessionAudio(input?: string | Soundscape) {
  startPracticeAudio(input);
}

export function stopSessionAudio(resumeAmbience = false, ambienceToResume?: string | Soundscape) {
  stopPracticeAudio(resumeAmbience, ambienceToResume);
}
