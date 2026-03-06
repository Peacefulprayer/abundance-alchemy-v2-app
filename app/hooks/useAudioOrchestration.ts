// app/hooks/useAudioOrchestration.ts
import { useEffect, useRef } from 'react';
import { AppMode, Soundscape, AppSettings } from '../types';
import { playAmbience, stopAmbience } from '../services/audioService';

interface UseAudioOrchestrationProps {
  currentMode: AppMode;
  settings: AppSettings;
  activeSoundscape: Soundscape;
  prayerVolume: number;
  isPrayerMode: boolean;
}

// Modes where NO ambience should play (handled by WelcomeScreen or PracticeSession)
const SILENT_MODES = new Set<AppMode>([
  AppMode.PRE_SPLASH,
  AppMode.WELCOME,
  AppMode.PRACTICE,
]);

// Modes where ambience SHOULD play (if settings allow)
const AMBIENCE_MODES = new Set<AppMode>([
  AppMode.SPLASH,
  AppMode.NAMING_CEREMONY,
  AppMode.AUTH,
  AppMode.ONBOARDING,
  AppMode.TUTORIAL,
  AppMode.DASHBOARD,
  AppMode.LIBRARY,
  AppMode.SETTINGS,
  AppMode.STATS,
  AppMode.PROFILE,
  AppMode.RETURN_PORTAL,
  AppMode.MEDITATION_SETUP,
  AppMode.PRAYER_SETUP,
  AppMode.PRAYER_GUIDE,
  AppMode.PRAYER_SESSION,
]);

export function useAudioOrchestration({
  currentMode,
  settings,
  activeSoundscape,
  prayerVolume,
  isPrayerMode,
}: UseAudioOrchestrationProps) {
  const lastTrackKeyRef = useRef<string | null>(null);
  const lastVolumeRef = useRef<number>(0);

  useEffect(() => {
    // 🛑 SACRED AUDIO CONTRACT: Silent Modes
    if (SILENT_MODES.has(currentMode)) {
      stopAmbience(300);
      lastTrackKeyRef.current = null;
      lastVolumeRef.current = 0;
      return;
    }

    // ✅ SACRED AUDIO CONTRACT: Ambience Modes
    if (!AMBIENCE_MODES.has(currentMode)) {
      stopAmbience(300);
      lastTrackKeyRef.current = null;
      lastVolumeRef.current = 0;
      return;
    }

    // 🛑 User Setting: Music Off
    if (!settings.musicOn) {
      stopAmbience(300);
      lastTrackKeyRef.current = null;
      lastVolumeRef.current = 0;
      return;
    }

    // 🎚️ Determine Volume
    const targetVolume = isPrayerMode ? prayerVolume : settings.ambienceVolume;

    // ✅ Track Identity: Include URL to detect changes even if ID is same
    const currentTrackKey = `${activeSoundscape.id}|${activeSoundscape.url || ''}`;
    const trackChanged = lastTrackKeyRef.current !== currentTrackKey;
    
    // ✅ Volume Change: Use strict inequality (no > 1 threshold)
    const volumeChanged = lastVolumeRef.current !== targetVolume;

    // 🔄 Play if Track OR Volume Changed
    if (trackChanged || volumeChanged) {
      playAmbience(activeSoundscape, targetVolume);
      lastTrackKeyRef.current = currentTrackKey;
      lastVolumeRef.current = targetVolume;
    }
  }, [
    currentMode,
    settings.musicOn,
    settings.ambienceVolume,
    activeSoundscape,
    prayerVolume,
    isPrayerMode,
  ]);
}
