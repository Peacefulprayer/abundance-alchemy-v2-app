// app/hooks/useAudioOrchestration.ts
import { useEffect, useRef, useState } from 'react';
import { AppMode, Soundscape, AppSettings, PracticeAudioPhase } from '../types';
import { playAmbience, stopAmbience, pauseAmbience } from '../services/audioService';

interface UseAudioOrchestrationProps {
  currentMode: AppMode;
  settings: AppSettings;
  activeSoundscape: Soundscape;
  prayerVolume: number;
  isPrayerMode: boolean;
  narrationPlaying?: boolean;
  practicePhase?: PracticeAudioPhase;
  practiceVolume?: number;
}

// Modes where background ambience is intentionally silent.
const SILENT_MODES = new Set<AppMode>([
  AppMode.PRE_SPLASH,
]);

// Modes where ambience SHOULD play (if settings allow)
const AMBIENCE_MODES = new Set<AppMode>([
  AppMode.PRACTICE_PREP,
  AppMode.WELCOME,
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
  AppMode.PRACTICE,
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
  narrationPlaying = false,
  practicePhase = 'ready',
  practiceVolume = 50,
}: UseAudioOrchestrationProps) {
  const lastTrackKeyRef = useRef<string | null>(null);
  const lastVolumeRef = useRef<number>(0);
  const lastModeRef = useRef<AppMode | null>(null);
  const [pageActive, setPageActive] = useState(() => !document.hidden && document.hasFocus());
  const [cuePlaying, setCuePlaying] = useState(false);

  useEffect(() => {
    const update = (event: Event) => setCuePlaying(Boolean((event as CustomEvent).detail));
    window.addEventListener('meditation-bell', update);
    return () => window.removeEventListener('meditation-bell', update);
  }, []);

  useEffect(() => {
    const activate = () => setPageActive(!document.hidden && document.hasFocus());
    const deactivate = () => setPageActive(false);
    window.addEventListener('focus', activate);
    window.addEventListener('blur', deactivate);
    window.addEventListener('pagehide', deactivate);
    document.addEventListener('visibilitychange', activate);
    return () => {
      window.removeEventListener('focus', activate);
      window.removeEventListener('blur', deactivate);
      window.removeEventListener('pagehide', deactivate);
      document.removeEventListener('visibilitychange', activate);
    };
  }, []);

  useEffect(() => {
    const modeChanged = lastModeRef.current !== currentMode;
    lastModeRef.current = currentMode;
    // 🛑 SACRED AUDIO CONTRACT: Silent Modes
    if (!pageActive || SILENT_MODES.has(currentMode)) {
      stopAmbience(300);
      lastTrackKeyRef.current = null;
      lastVolumeRef.current = 0;
      return;
    }
    if (currentMode === AppMode.PRACTICE && (practicePhase === 'paused' || practicePhase === 'ending')) {
      if (practicePhase === 'paused') pauseAmbience();
      else stopAmbience(300);
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
    const normalVolume = currentMode === AppMode.PRACTICE && practicePhase === 'running'
      ? practiceVolume : isPrayerMode ? prayerVolume : settings.ambienceVolume;
    const targetVolume = (currentMode === AppMode.WELCOME && narrationPlaying) || cuePlaying
      ? normalVolume * 0.2 : normalVolume;

    // ✅ Track Identity: Include URL to detect changes even if ID is same
    const currentTrackKey = `${activeSoundscape.id}|${activeSoundscape.url || ''}`;
    const trackChanged = lastTrackKeyRef.current !== currentTrackKey;
    
    // ✅ Volume Change: Use strict inequality (no > 1 threshold)
    const volumeChanged = lastVolumeRef.current !== targetVolume;

    // 🔄 Play if Track OR Volume Changed
    if (trackChanged || volumeChanged || modeChanged) {
      playAmbience(activeSoundscape, targetVolume);
      lastTrackKeyRef.current = currentTrackKey;
      lastVolumeRef.current = targetVolume;
    }
  }, [
    currentMode,
    pageActive,
    settings.musicOn,
    settings.ambienceVolume,
    activeSoundscape,
    prayerVolume,
    isPrayerMode,
    narrationPlaying,
    practicePhase,
    practiceVolume,
    cuePlaying,
  ]);

  useEffect(() => () => {
    stopAmbience(0);
    lastTrackKeyRef.current = null;
    lastVolumeRef.current = 0;
    lastModeRef.current = null;
  }, []);
}
