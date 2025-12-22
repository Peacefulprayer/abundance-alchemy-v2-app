// src/components/WelcomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { AppMode, UserProfile } from '../types';
import { AlchemistAvatar } from './AlchemistAvatar';

interface WelcomeScreenProps {
  user: UserProfile | null;
  onComplete: (nextMode: AppMode) => void;
}

const WELCOME_URL =
  'https://abundantthought.com/abundance-alchemy/assets/audio/voices/welcome.mp3';
const WELCOME_DURATION_MS = 34000; // 34 seconds
const TRANSITION_DELAY_MS = 500; // breath after audio ends

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = new Audio(WELCOME_URL);
    let isCancelled = false;
    const nextMode = user ? AppMode.DASHBOARD : AppMode.AUTH;
    let transitionTimeout: number | undefined;

    const completeOnce = () => {
      if (isCancelled) return;
      isCancelled = true;
      onComplete(nextMode);
    };

    const scheduleTransition = () => {
      if (isCancelled) return;
      // small breath after audio completes / safety timeout
      transitionTimeout = window.setTimeout(() => {
        completeOnce();
      }, TRANSITION_DELAY_MS);
    };

    const handleEnded = () => {
      scheduleTransition();
    };

    audio.addEventListener('ended', handleEnded);

    // Small visual pause before starting audio
    const startTimeout = window.setTimeout(() => {
      if (isCancelled) return;
      audio
        .play()
        .catch(() => {
          // If autoplay fails, still allow progress + manual skip
        });
    }, 500);

    const start = performance.now();

    const tick = (now: number) => {
      if (isCancelled) return;
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / WELCOME_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed < WELCOME_DURATION_MS) {
        requestAnimationFrame(tick);
      } else {
        // Safety: if audio never fired 'ended', still schedule transition
        scheduleTransition();
      }
    };

    const rafId = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
      }
      clearTimeout(startTimeout);
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(rafId);
    };
  }, [user, onComplete]);

  const handleSkip = () => {
    const nextMode = user ? AppMode.DASHBOARD : AppMode.AUTH;
    onComplete(nextMode);
  };

  return (
    <div className="relative min-h-screen flex items-stretch justify-center bg-slate-950 text-slate-100">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/splash.jpg)'
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-6 py-10">
        {/* Top: breathing circle + avatar + title */}
        <div className="flex-1 flex flex-col items-center">
          {/* Breathing circle motif */}
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-slate-950/80 backdrop-blur-xl border border-emerald-300/10 shadow-[0_0_60px_rgba(16,185,129,0.45)] animate-pulse-slow flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/40 via-cyan-400/30 to-indigo-500/40 shadow-[0_0_40px_rgba(34,197,94,0.65)]" />
            </div>
            {/* Alchemist avatar overlaid slightly lower */}
            <div className="absolute inset-0 flex items-center justify-center translate-y-10">
              <AlchemistAvatar size="lg" mood="active" speaking={true} />
            </div>
          </div>

          {/* Title and supporting text */}
          <div className="mt-10 text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-[0.18em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-cyan-300">
              Abundance Alchemy
            </h1>
            <p className="text-sm text-slate-300">
              We Are Honored To Welcome You.
            </p>
            <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
              Take a breath and allow this sacred introduction to hold you.
            </p>
          </div>
        </div>

        {/* Middle: praying / progress */}
        <div className="mb-8 space-y-3">
          <div className="text-[11px] tracking-[0.2em] uppercase text-slate-400 text-center">
            We Are Praying Now
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Bottom: skip intro pill */}
        <div className="pb-4 space-y-3">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full inline-flex items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/60 backdrop-blur-lg px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-slate-200 hover:border-emerald-400/70 hover:text-emerald-200 transition-colors"
          >
            Skip intro
          </button>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            You can listen fully, or skip now and begin your journey.
          </p>
        </div>
      </div>
    </div>
  );
};
