// services/audioService.ts
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
  if ((input as any).url) return (input as any).url;
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

// ---------- Web Audio unlock + context ----------

function ensureAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      // resume must be called in/after a user gesture on iOS
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Call this once on the first user gesture (pointerdown/touchstart/click).
 * This makes synthetic UI tones reliable on iOS Safari.
 */
export function unlockAudio() {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  // Some browsers need a tiny "silent" node to fully unlock output
  try {
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);

    gain.gain.setValueAtTime(0.00001, t);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // ignore
      }
    };
  } catch {
    // ignore
  }
}

// ---------- Sacred tone (old playBell envelope) ----------

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

// ---------- Canonical button tap (NON-NEGOTIABLE) ----------

/**
 * Canonical UI button tap.
 * Short, soft, consistent. Safe to call on every click.
 */
export function playButtonTap() {
  if (!effectsEnabled) return;

  const ctx = ensureAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // A slightly higher pitch reads as "UI" without being harsh.
  const baseFreq = 196; // ~G3
  const peakGain = 0.10 * masterVolume; // keep quiet; this sits under soundscapes

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  // tiny pitch dip gives "tap" character
  osc.frequency.exponentialRampToValueAtTime(Math.max(60, baseFreq * 0.92), now + 0.05);

  // Envelope: fast attack, fast decay
  gain.gain.setValueAtTime(0.00001, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.07);

  osc.onended = () => {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      // ignore
    }
  };
}

// ---------- Backwards-compatible click pulse (optional) ----------

export function playClickPulse() {
  // Keep old API, but route it to the canonical tap so the tone stays uniform.
  playButtonTap();
}

// ---------- Back-compat exports (older code expects these names) ----------

// App.tsx expects these names. Map them to the current implementation.
// If your file already has startPracticeAudio/stopPracticeAudio, use those.
export function startSessionAudio(input?: string | Soundscape) {
  // startPracticeAudio exists in your earlier snippet
  return startPracticeAudio(input);
}

export function stopSessionAudio(resumeAmbience = false, ambienceToResume?: string | Soundscape) {
  return stopPracticeAudio(resumeAmbience, ambienceToResume);
}

// Some code (audioManager.ts) expects a stopAll() helper
export function stopAll() {
  try {
    stopPracticeAudio(false);
  } catch {
    // ignore
  }
  try {
    stopAmbience();
  } catch {
    // ignore
  }
}

