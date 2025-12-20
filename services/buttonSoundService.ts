// buttonSoundService.ts - UPDATED WITH CORRECT PATHS
import { audioManager } from '../services/audioManager';

// Button sound URLs - CORRECTED PATHS
const BUTTON_SOUNDS = {
  click: './assets/audio/ui/click.mp3',
  confirm: './assets/audio/ui/confirm.mp3',
  back: './assets/audio/ui/back.mp3',
  toggle: './assets/audio/ui/click.mp3', // Using click for toggle since no toggle.mp3
};

// Fallback sounds if files don't exist
const createFallbackSound = (frequency: number, duration: number = 0.1) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Web Audio API not supported for fallback sounds');
  }
};

const playButtonSound = (type: keyof typeof BUTTON_SOUNDS = 'click') => {
  // Check if audio manager is ready
  if (!audioManager) {
    console.warn('Audio manager not ready');
    return;
  }
  
  try {
    // Try to play the actual sound file
    const soundUrl = BUTTON_SOUNDS[type];
    console.log(`Attempting to play button sound: ${soundUrl}`);
    audioManager.playSoundEffect(soundUrl);
  } catch (error) {
    console.warn(`Button sound ${type} not available, using fallback`, error);
    
    // Fallback frequencies for different button types
    const frequencies = {
      click: 800,
      confirm: 1200,
      back: 600,
      toggle: 1000,
    };
    
    createFallbackSound(frequencies[type] || 800);
  }
};

// Convenience functions
const playClick = () => playButtonSound('click');
const playConfirm = () => playButtonSound('confirm');
const playBack = () => playButtonSound('back');
const playToggle = () => playButtonSound('toggle');

// Export service object that matches App.tsx expectations
export const buttonSoundService = {
  play: playButtonSound,
  playClick,
  playConfirm,
  playBack,
  playToggle,
  setEnabled: (enabled: boolean) => {
    // Update audio manager settings
    console.log(`Button sounds ${enabled ? 'enabled' : 'disabled'}`);
    audioManager.updateSettings({ soundEffects: enabled });
  }
};