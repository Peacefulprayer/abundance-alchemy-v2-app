// services/audioService.ts
// A Hybrid Service to bridge new Audio Logic with existing components

let soundEffectsEnabled = true;
let musicEnabled = true;

// 1. Core State
let ambienceAudio: HTMLAudioElement | null = null;
let sessionAudio: HTMLAudioElement | null = null;

// 2. Settings Management
export const setAudioSettings = (soundEffects: boolean, music: boolean) => {
  soundEffectsEnabled = soundEffects;
  musicEnabled = music;

  if (!musicEnabled) {
    if (ambienceAudio) ambienceAudio.pause();
    if (sessionAudio) sessionAudio.pause();
  } else {
    // Resume ambience if it was supposed to be playing
    if (ambienceAudio && !sessionAudio) {
      ambienceAudio.play().catch(e => console.warn('Resume blocked', e));
    }
  }
};

// 3. Sound Effects (Bell)
export const playBell = () => {
  if (!soundEffectsEnabled) return;
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn('AudioContext error', e);
  }
};

export const playCompletionSound = () => {
  if (!soundEffectsEnabled) return;
  // Simple sequence
  setTimeout(() => playBell(), 0);
  setTimeout(() => playBell(), 300);
};

// 4. Ambience Logic (The New Way)
const resolveGlobalTrackUrl = (soundscapeId: string): string => {
  // Map IDs to URLs here
  if (soundscapeId === 'RAIN') return 'https://www.abundantthought.com/abundance-alchemy/assets/audio/ambient/rain.mp3';
  if (soundscapeId === 'FOREST') return 'https://www.abundantthought.com/abundance-alchemy/assets/audio/ambient/forest.mp3';
  
  // Default fallback
  return 'https://www.abundantthought.com/abundance-alchemy/assets/audio/ambient/calm.mp3';
};

export const startAmbience = (soundscapeId: string, volume: number) => {
  if (!musicEnabled) return;

  try {
    const newUrl = resolveGlobalTrackUrl(soundscapeId);

    // If already playing correct track, just ensure volume
    if (ambienceAudio && ambienceAudio.src === newUrl && !ambienceAudio.paused) {
      ambienceAudio.volume = Math.max(0, Math.min(1, volume / 100));
      return;
    }

    // Stop existing
    stopAmbience();

    // Start new
    ambienceAudio = new Audio(newUrl);
    ambienceAudio.loop = true;
    ambienceAudio.volume = Math.max(0, Math.min(1, volume / 100));
    ambienceAudio.play().catch(err => console.warn('Ambience blocked', err));
  } catch (e) {
    console.error('Ambience error', e);
  }
};

export const stopAmbience = () => {
  if (ambienceAudio) {
    ambienceAudio.pause();
    ambienceAudio = null;
  }
};

export const updateAmbienceVolume = (volume: number) => {
  if (ambienceAudio) ambienceAudio.volume = Math.max(0, Math.min(1, volume / 100));
  if (sessionAudio) sessionAudio.volume = Math.max(0, Math.min(1, volume / 100));
};

// Alias for compatibility
export const updateVolume = updateAmbienceVolume;

// 5. Session Audio (Meditation)
export const startSessionAudio = (url: string, volume: number) => {
  if (!musicEnabled) return;
  try {
    if (sessionAudio) {
      sessionAudio.pause();
      sessionAudio = null;
    }
    sessionAudio = new Audio(url);
    sessionAudio.loop = true;
    sessionAudio.volume = Math.max(0, Math.min(1, volume / 100));
    sessionAudio.play().catch(err => console.warn('Session blocked', err));
  } catch (e) {
    console.error('Session audio error', e);
  }
};

export const stopSessionAudio = () => {
  if (sessionAudio) {
    sessionAudio.pause();
    sessionAudio = null;
  }
};

export const previewSoundscape = (soundscape: any) => {
  console.log('Previewing', soundscape);
  playBell(); // Simple feedback
};

// --- THE BRIDGE ---
// This exports a fake audioManager so old components don't crash on import.
export const audioManager = {
  playBell: playBell,
  setVolume: updateVolume,
  stopAll: () => { stopAmbience(); stopSessionAudio(); },
  playAmbience: (url: string) => console.log('Legacy playAmbience called', url),
};
