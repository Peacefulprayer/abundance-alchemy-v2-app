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
const WELCOME_DURATION_MS = 34664;
const FINISH_DELAY_MS = 1500;
const INVOCATION_CAPTIONS = [
  { startMs: 0, endMs: 6000, text: 'Welcome to Abundance Alchemy, your I am transformation station.' },
  { startMs: 6000, endMs: 11000, text: 'I am an abundance alchemist. I stand as witness and guide for your practice.' },
  { startMs: 11000, endMs: 18000, text: 'Your morning I am, your evening I love, and your meditation moments of gratitude sealing the work.' },
  { startMs: 18000, endMs: 20000, text: 'Remember the Divine One said,' },
  { startMs: 20000, endMs: 25000, text: 'Where two or more are gathered there shall I be, with the Divine One invoked.' },
  { startMs: 25000, endMs: 26000, text: 'Ancestors at the ready,' },
  { startMs: 26000, endMs: WELCOME_DURATION_MS, text: 'set your focus, speak your word, rest in gratitude, and let divine law do the rest.' },
] as const;

const getInvocationCaption = (elapsedMs: number, durationMs: number): string => {
  const normalizedDuration = durationMs > 0 ? durationMs : WELCOME_DURATION_MS;
  const scaledElapsed = Math.max(0, Math.min(WELCOME_DURATION_MS, (elapsedMs / normalizedDuration) * WELCOME_DURATION_MS));
  const activeCue =
    INVOCATION_CAPTIONS.find((cue) => scaledElapsed >= cue.startMs && scaledElapsed < cue.endMs) ||
    INVOCATION_CAPTIONS[INVOCATION_CAPTIONS.length - 1];
  return activeCue.text;
};

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
  const [currentCaption, setCurrentCaption] = useState<string>(INVOCATION_CAPTIONS[0].text);
  const [showTranscript, setShowTranscript] = useState(false);
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
        const elapsedMs = audio.currentTime * 1000;
        const durationMs = audio.duration * 1000;
        setProgress(Math.min(100, (audio.currentTime / audio.duration) * 100));
        setCurrentCaption(getInvocationCaption(elapsedMs, durationMs));
        return;
      }
      if (playbackStartedAtRef.current) {
        const elapsed = performance.now() - playbackStartedAtRef.current;
        setProgress(Math.min(100, (elapsed / WELCOME_DURATION_MS) * 100));
        setCurrentCaption(getInvocationCaption(elapsed, WELCOME_DURATION_MS));
        if (elapsed >= WELCOME_DURATION_MS) proceed();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      setCurrentCaption(INVOCATION_CAPTIONS[INVOCATION_CAPTIONS.length - 1].text);
      proceed();
    };
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
      setCurrentCaption(INVOCATION_CAPTIONS[0].text);
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
            <p className="text-xs md:text-sm font-extrabold uppercase tracking-[0.22em] text-amber-400">
              Invocation
            </p>
            <p className="text-sm md:text-base text-slate-200 font-extralight">
              Welcome To Abundance Alchemy<br />Your I Am Transformation Station
            </p>
            <div className="space-y-1 md:space-y-1.5 text-slate-200 text-xs md:text-sm font-light">
              <p>I Am An Abundance Alchemist</p>
              <p>I Stand As Witness And Guide For Your Practice</p>
              <p className="pt-1 text-emerald-400 text-xs md:text-sm">
                Live Captions Below Follow The Spoken Invocation
              </p>
            </div>
          </div>
        </div>

        <div className={`${SACRED_INNER_WIDTH} space-y-3`}>
          <div className="text-center">
            <div className="inline-flex animate-breath items-center justify-center px-3 py-1 rounded-full bg-black/60 border border-white/25 text-[11px] tracking-[0.15em] uppercase text-white mb-2 shadow-[0_0_14px_rgba(0,0,0,0.45)]">
              WE ARE PRAYING NOW
            </div>
            <div className="w-full h-1 md:h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="rounded-[22px] border border-white/12 bg-slate-950/72 px-4 py-3 text-center shadow-[0_18px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400">
              Closed Captions
            </p>
            <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-white md:text-base">
              {currentCaption}
            </p>
            <button
              type="button"
              onClick={() => setShowTranscript((prev) => !prev)}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/12"
            >
              {showTranscript ? 'Hide Full Invocation Text' : 'Show Full Invocation Text'}
            </button>
            {showTranscript ? (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-left">
                {INVOCATION_CAPTIONS.map((cue, index) => (
                  <p key={`${cue.startMs}-${index}`} className="text-xs leading-relaxed text-slate-200">
                    {cue.text}
                  </p>
                ))}
              </div>
            ) : null}
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
