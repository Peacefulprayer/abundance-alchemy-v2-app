// src/services/audioManager.ts
import {
  playBell,
  startAmbience,
  previewAmbience,
  stopPreview,
  stopAll,
  setMasterVolume
} from './audioService';

export const audioManager = {
  stopPreview,
  playBell: () => playBell(),
  
  setVolume: (volume: number) => setMasterVolume(volume),
  
  stopAll: () => stopAll(),
  
  playAmbience: (url: string) => startAmbience(url),
  
  previewSoundscape: (soundscape: any) => {
    console.log('Previewing:', soundscape);
    if (typeof soundscape === 'string') {
      void previewAmbience({id:soundscape,label:'Preview',url:soundscape}, 50);
      return;
    }
    if (soundscape?.url) {
      void previewAmbience(soundscape, 50);
    }
  },
  
  playSoundEffect: (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  },
  
  updateSettings: (settings: { soundEffects?: boolean; musicOn?: boolean }) => {
    console.log('Audio settings updated:', settings);
    // Your existing setAudioSettings logic here
  }
};
