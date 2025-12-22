// src/services/buttonSoundService.ts
import { playBell } from './audioService';

// Simple wrapper so the rest of the app can call buttonSoundService.play(...)

const playClick = () => playBell();
const playConfirm = () => playBell();
const playBack = () => playBell();
const playToggle = () => playBell();

export const buttonSoundService = {
  // Generic entry point: ignore type for now, all map to bell tone
  play: (_type: 'click' | 'confirm' | 'back' | 'toggle' = 'click') => playBell(),
  playClick,
  playConfirm,
  playBack,
  playToggle,
  setEnabled: (enabled: boolean) => {
    // Effects on/off is managed via setAudioSettings in audioService.
    // This hook is kept for API compatibility and logging.
    console.log(`Button sounds ${enabled ? 'enabled' : 'disabled'}`);
  }
};
