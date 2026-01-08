// src/services/buttonSoundService.ts - WITH DEBUGGING
import { playButtonTap, unlockAudio } from './audioService';

export type ButtonSoundVariant = 'click' | 'confirm' | 'back';

let lastPlayMs = 0;
const MIN_GAP_MS = 80;

function play(_variant: ButtonSoundVariant = 'click') {
  console.log('=== BUTTON TONE DEBUG START ===');
  const now = Date.now();
  console.log('Current time:', now, 'Last play:', lastPlayMs, 'Diff:', now - lastPlayMs);
  
  if (now - lastPlayMs < MIN_GAP_MS) {
    console.log('Button tone: Too soon since last play (cooldown)');
    console.log('=== BUTTON TONE DEBUG END ===');
    return;
  }
  lastPlayMs = now;

  console.log('Button tone: Attempting to play...');
  
  try {
    console.log('Step 1: Unlocking audio...');
    unlockAudio();
    console.log('Step 2: Audio unlocked');
    
    console.log('Step 3: Calling playButtonTap...');
    playButtonTap();
    console.log('Step 4: playButtonTap called successfully');
  } catch (error) {
    console.error('Button tone: Error playing tone:', error);
  }
  
  console.log('=== BUTTON TONE DEBUG END ===');
}

function playClick() {
  console.log('Button tone: playClick() called');
  play('click');
}

export const buttonSoundService = {
  play,
  playClick
};