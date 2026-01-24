// src/services/buttonSoundService.ts - WITH DEBUGGING
import { playButtonTap, unlockAudio } from './audioService';

export type ButtonSoundVariant = 'click' | 'confirm' | 'back';

let lastPlayMs = 0;
const MIN_GAP_MS = 80;

function play(_variant: ButtonSoundVariant = 'click') {
  const now = Date.now();
  
  if (now - lastPlayMs < MIN_GAP_MS) {
    return;
  }
  lastPlayMs = now;
  
  try {
    unlockAudio();
    playButtonTap();
  } catch (error) {
    console.error('Button tone: Error playing tone:', error);
  }
}

function playClick() {
  play('click');
}

export const buttonSoundService = {
  play,
  playClick
};
