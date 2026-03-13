// components/WelcomeScreen.tsx - SACRED INVOCATION (state-driven; no localStorage trust)
import React, { useEffect, useRef, useState } from 'react';
import { AppMode, UserProfile } from '../types';
import { SacredBackground } from './SacredBackground';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';
import { href } from '../services/base';
import { stopAmbience } from '../services/audioService';
import {
  SACRED_LAYOUT,
  SACRED_TITLE_CARD,
  SACRED_BODY_CARD,
  SACRED_FOOTER_CARD,
  SACRED_INNER_WIDTH,
} from '../styles/sacredCards';

interface WelcomeScreenProps {
  // IMPORTANT: this must be the state user passed from App.tsx
  user: UserProfile | null;
  isReturningVisitor?: boolean;
  onComplete: (nextMode: AppMode) => void;
  theme?: 'light' | 'dark';
}

const WELCOME_URL = href('assets/audio/voices/welcome.mp3');
const WELCOME_DURATION_MS = 35000;
const FINISH_DELAY_MS = 1500;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  isReturningVisitor = false,
  onComplete,
  theme = 'dark',
}) => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const didFinishRef = useRef(false);
  const finishTimeoutRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const playbackStartedAtRef = useRef<number | null>(null);

  const isReturningUser = !!user;

  const proceed = React.useCallback(() => {
    if (didFinishRef.current) return;
    didFinishRef.current = true;

    const nextMode = isReturningUser
      ? AppMode.DASHBOARD
      : isReturningVisitor
      ? AppMode.AUTH
      : AppMode.NAMING_CEREMONY;
    finishTimeoutRef.current = window.setTimeout(() => {
      onComplete(nextMode);
    }, FINISH_DELAY_MS);
  }, [isReturningUser, isReturningVisitor, onComplete]);

  useEffect(() => {
    void stopAmbience(180);

    const audio = new Audio(WELCOME_URL);
    audio.preload = 'auto';
    audioRef.current = audio;

    const timer = setTimeout(() => {
      audio.play()
        .then(() => {
          playbackStartedAtRef.current = performance.now();
          setIsPlaying(true);
          setAudioBlocked(false);
        })
        .catch((err) => {
          console.log('Welcome audio play failed:', err);
          setIsPlaying(false);
          setAudioBlocked(true);
        });
    }, 500);

    const updateProgress = () => {
      if (didFinishRef.current) return;
      const hasAudioDuration = Number.isFinite(audio.duration) && audio.duration > 0;
      const hasCurrentTime = Number.isFinite(audio.currentTime) && audio.currentTime > 0;
      if (hasAudioDuration && hasCurrentTime) {
        setProgress(Math.min(100, (audio.currentTime / audio.duration) * 100));
        return;
      }
      if (playbackStartedAtRef.current) {
        const elapsed = performance.now() - playbackStartedAtRef.current;
        setProgress(Math.min(100, (elapsed / WELCOME_DURATION_MS) * 100));
        if (elapsed >= WELCOME_DURATION_MS) proceed();
      }
    };

    const handleEnded = () => { setIsPlaying(false); setProgress(100); proceed(); };
    const handlePlay = () => { if (!playbackStartedAtRef.current) playbackStartedAtRef.current = performance.now(); setIsPlaying(true); };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => updateProgress();
    const handleLoadedMetadata = () => updateProgress();

    progressTimerRef.current = window.setInterval(updateProgress, 120);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      clearTimeout(timer);
      if (finishTimeoutRef.current) { window.clearTimeout(finishTimeoutRef.current); finishTimeoutRef.current = null; }
      if (progressTimerRef.current) { window.clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [proceed]);

  const handleSkip = () => {
    buttonSoundService.play('click');
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    proceed();
  };

  const handleManualPlay = async () => {
    buttonSoundService.play('click');
    if (!audioRef.current) return;
    try {
      playbackStartedAtRef.current = performance.now();
      await audioRef.current.play();
      setAudioBlocked(false);
      setIsPlaying(true);
    } catch (err) {
      console.log('Manual welcome audio play failed:', err);
      setAudioBlocked(true);
      setIsPlaying(false);
    }
  };

  return (
    <SacredBackground theme={theme} backgroundType="SPLASH_WELCOME" fallbackBackgroundType="SPLASH">
      <div className={SACRED_LAYOUT}>

        <BreathingOrb size={80} breathingSpeed={4000} />

        <div className={SACRED_TITLE_CARD}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        <div className={SACRED_BODY_CARD}>
          <div className="text-center space-y-2 md:space-y-3">
            <p className="text-sm md:text-base text-slate-200 font-extralight">
              We Are Honored To Be Here<br />With You Now
            </p>
            <div className="space-y-1 md:space-y-1.5 text-slate-200 text-xs md:text-sm font-light">
              <p>Pausing A Moment</p>
              <p>Breathing In The Divine</p>
              <p>We Let Go And Allow</p>
              <p>Immersing Ourselves</p>
              <p>In This Sacred Invocation</p>
              <p>Uniting Hearts And Minds</p>
              <p className="pt-1 text-amber-500 text-xs md:text-sm">Ase.</p>
            </div>
          </div>
        </div>

        <div className={`${SACRED_INNER_WIDTH} space-y-3`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-black/60 border border-white/25 text-[11px] tracking-[0.15em] uppercase text-white mb-2 shadow-[0_0_14px_rgba(0,0,0,0.45)]">
              WE ARE PRAYING NOW
            </div>
            <div className="w-full h-1 md:h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {audioBlocked ? (
            <p className="text-center text-[11px] text-amber-200">
              Audio did not begin automatically. You can play the invocation or continue in silence.
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2">
            {audioBlocked ? (
              <button
                type="button"
                onClick={handleManualPlay}
                className="px-4 py-1.5 rounded-lg border border-amber-400/40 text-amber-200 font-medium text-xs md:text-sm tracking-wide hover:bg-amber-500/10 transition-colors"
              >
                Play Invocation
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg"
            >
              Skip Invocation
            </button>
          </div>
        </div>

        <div className={SACRED_FOOTER_CARD}>
          <div className="text-center space-y-2">
            <p className="text-xs text-white leading-relaxed">
              Collectively affirming<br />what in our hearts we know is true.
            </p>
            <div className="text-[10px] md:text-[11px] text-white space-y-0.5">
              <p>All images and Music: Pixabay.com free use license</p>
              <p>(unless otherwise noted)</p>
            </div>
          </div>
        </div>

      </div>
    </SacredBackground>
  );
};
