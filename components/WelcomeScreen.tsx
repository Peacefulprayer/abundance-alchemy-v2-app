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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = new Audio(WELCOME_URL);
    let isCancelled = false;

    const handleEnded = () => {
      if (isCancelled) return;
      const nextMode = user ? AppMode.DASHBOARD : AppMode.AUTH;
      onComplete(nextMode);
    };

    audio.addEventListener('ended', handleEnded);

    // Small visual pause before starting audio
    const startTimeout = setTimeout(() => {
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
        // Safety: if audio hasn't fired 'ended' yet, trigger completion
        handleEnded();
      }
    };

    const rafId = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
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
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/splash.jpg')",
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-black/95" />

      <div className="relative z-10 flex flex-col items-center justify-between h-full max-w-sm w-full px-8 py-10">
        {/* Top breathing circle + avatar */}
        <div className="flex flex-col items-center">
          <div className="mb-8 mt-6 relative">
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-400 flex items-center justify-center shadow-[0_0_26px_rgba(168,85,247,0.7)] animate-[pulse_3s_ease-in-out_infinite]">
              <div className="w-20 h-20 rounded-full bg-slate-900/95 border border-purple-200/30" />
            </div>
          </div>

          <AlchemistAvatar size="lg" mood="active" speaking={true} />

          <h1 className="mt-6 text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-indigo-200 drop-shadow-lg text-center">
            Abundance Alchemy
          </h1>

          <p className="mt-4 text-sm text-slate-300 leading-relaxed text-center max-w-xs">
            We Are Honored To Welcome You.
            <br />
            Take a breath and allow this sacred introduction to hold you.
          </p>
        </div>

        {/* Middle: praying / progress */}
        <div className="w-full mt-10 mb-6">
          <p className="text-xs tracking-[0.2em] text-slate-400 uppercase text-center mb-3">
            We Are Praying Now
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Bottom: skip intro pill */}
        <div className="w-full flex flex-col items-center">
          <button
            type="button"
            onClick={handleSkip}
            className="px-5 py-2 rounded-full backdrop-blur-md bg-slate-900/60 border border-slate-500/50 text-xs text-slate-200 hover:bg-slate-800/80 transition-colors shadow-lg shadow-black/40"
          >
            Skip intro
          </button>
          <p className="mt-3 text-[11px] text-slate-500 text-center max-w-xs">
            You can listen fully, or skip now and begin your journey.
          </p>
        </div>
      </div>
    </div>
  );
};