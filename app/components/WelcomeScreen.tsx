// components/WelcomeScreen.tsx - SACRED INVOCATION (validated-user only; no localStorage trust)
import React, { useEffect, useRef, useState } from 'react';
import { AppMode, UserAccount } from '../types';
import { SacredBackground } from './SacredBackground';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';
import { href } from '../services/base';
import { stopAmbience } from '../services/audioService';

interface WelcomeScreenProps {
  // IMPORTANT: this must be the *validated* user passed from App.tsx
  user: UserAccount | null;
  onComplete: (nextMode: AppMode) => void;
  theme?: 'light' | 'dark';
}

const WELCOME_URL = href('assets/audio/voices/welcome.mp3');
const WELCOME_DURATION_MS = 35000;
const FINISH_DELAY_MS = 1500;

// UNIVERSAL TITLE CARD CLASSES
const titleCardClasses =
  'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

// UNIVERSAL CONTENT CARD CLASSES
const bodyCardClasses =
  'backdrop-blur-md rounded-2xl border border-amber-500/20 p-4 md:p-6 w-full max-w-[280px] shadow-xl space-y-3 md:space-y-4 bg-slate-900/30';

const footerCardClasses =
  'backdrop-blur-md rounded-2xl border border-amber-500/20 p-3 w-full max-w-[280px] shadow-xl bg-slate-900/20';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  onComplete,
  theme = 'dark',
}) => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const didFinishRef = useRef(false);
  const finishTimeoutRef = useRef<number | null>(null);

  // ✅ Returning/new decision is based ONLY on validated user prop (no localStorage)
  const isReturningUser = !!user;

  const proceed = React.useCallback(() => {
    if (didFinishRef.current) return;
    didFinishRef.current = true;

    const nextMode = isReturningUser ? AppMode.DASHBOARD : AppMode.NAMING_CEREMONY;
    finishTimeoutRef.current = window.setTimeout(() => {
      onComplete(nextMode);
    }, FINISH_DELAY_MS);
  }, [isReturningUser, onComplete]);

  useEffect(() => {
    void stopAmbience();
    const audio = new Audio(WELCOME_URL);
    audioRef.current = audio;

    const timer = setTimeout(() => {
      audio.play().catch((err) => {
        console.log('Welcome audio play failed:', err);
        setIsPlaying(false);
      });
    }, 500);

    const start = performance.now();

    const tick = (now: number) => {
      if (didFinishRef.current) return;
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / WELCOME_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed < WELCOME_DURATION_MS) {
        requestAnimationFrame(tick);
      } else {
        proceed();
      }
    };

    requestAnimationFrame(tick);

    const handleEnded = () => {
      setIsPlaying(false);
      proceed();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      clearTimeout(timer);
      if (finishTimeoutRef.current) {
        window.clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
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

  return (
    <SacredBackground
      theme={theme}
      // ✅ Explicit per screen:
      backgroundType="SPLASH_WELCOME"
      // ✅ Optional, explicit fallback:
      fallbackBackgroundType="SPLASH"
    >
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="mt-8 md:mt-12 mb-4 md:mb-6">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        <div className={`${titleCardClasses} mb-4 md:mb-6`}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        <div className={`${bodyCardClasses} mb-6 md:mb-8`}>
          <div className="text-center space-y-2 md:space-y-3">
            <p className="text-sm md:text-base text-slate-200 font-light">
              We Are Honored To Be Here
              <br />
              With You Now
            </p>
            <div className="space-y-1 md:space-y-1.5 text-slate-300 text-xs md:text-sm">
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

        <div className="w-full max-w-[280px] space-y-3 md:space-y-4">
          <div className="text-center">
            <div className="text-[11px] md:text-[12px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-amber-500 mb-1 md:mb-2">
              WE ARE PRAYING NOW
            </div>
            <div className="w-full h-1 md:h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSkip}
              className="mt-4 md:mt-6 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg"
            >
              Skip Intro
            </button>
          </div>
        </div>

        <div className="mt-6 md:mt-8 w-full flex justify-center">
          <div className={footerCardClasses}>
            <div className="text-center space-y-2">
              <p className="text-xs text-white leading-relaxed">
                Collectively affirming
                <br />
                what in our hearts we know is true.
              </p>
              <div className="text-[10px] md:text-[11px] text-white space-y-0.5">
                <p>All images and Music: Pixabay.com free use license</p>
                <p>(unless otherwise noted)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-6 md:h-4"></div>
      </div>
    </SacredBackground>
  );
};
