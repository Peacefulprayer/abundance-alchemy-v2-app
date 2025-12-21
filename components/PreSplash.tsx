// components/PreSplash.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';
import { playClickPulse } from '../services/audioService';

interface PreSplashProps {
  onContinue: () => void;
  theme?: 'light' | 'dark';
}

export const PreSplash: React.FC<PreSplashProps> = ({
  onContinue,
  theme = 'dark',
}) => {
  const titleColor = theme === 'light' ? 'text-amber-500' : 'text-orange-400';
  const subTextColor = theme === 'light' ? 'text-yellow-600' : 'text-yellow-300';

  const handleContinue = () => {
    playClickPulse();
    onContinue();
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden animate-in fade-in duration-1000">
      {/* Background gradient layer to delineate container */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-slate-950/90 to-black" />

      {/* Soft ambience glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl" />
        <div
          className="absolute bottom-10 right-8 w-48 h-48 bg-purple-600/18 rounded-full blur-3xl"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Breathing circle (soft glowing animation) */}
        <div className="mt-6 mb-10 relative">
          {/* Outer glow that gently pulses behind the disc, tuned for smoother fade */}
          <div className="absolute inset-0 rounded-full bg-purple-500/18 blur-[30px] animate-pulse" />

          {/* Inner ring with slow breathing effect and slightly smaller circle for better edge fade on large screens */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-400 flex items-center justify-center shadow-[0_0_26px_rgba(168,85,247,0.7)] animate-[pulse_3s_ease-in-out_infinite]">
            <div
              className="relative rounded-full border border-purple-200/30 bg-slate-900/95"
              style={{ width: '5.8rem', height: '5.8rem' }}
            >
              {/* Subtle mystical specks (small and few) */}
              <span className="absolute w-[2px] h-[2px] rounded-full bg-amber-300/80 top-3 left-6" />
              <span className="absolute w-[2px] h-[2px] rounded-full bg-purple-300/80 bottom-4 right-5" />
              <span className="absolute w-[2px] h-[2px] rounded-full bg-indigo-300/80 top-1/2 left-1/3" />
            </div>
          </div>
        </div>

        {/* Logo with 80% opacity so it emerges from the dark */}
        <div
          className="relative group cursor-pointer mb-8"
          onClick={handleContinue}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
          <img
            src="https://abundantthought.com/abundance-alchemy/logo.png"
            alt="Abundant Thought"
            className="h-20 w-auto relative z-10 drop-shadow-2xl transform transition-transform duration-700 group-hover:scale-105 opacity-80"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Copy with updated styling and audio guidance emphasis */}
        <div className="space-y-2 mb-9">
          <h1
            className={`text-2xl font-serif font-bold ${titleColor} tracking-tight mb-3`}
          >
            Abundance Alchemy
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            With Great Love, Welcome.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            We Are Honored, Standing Here With You
          </p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            As You Learn To Embrace The Power
          </p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            Of Your I Am Consciousness.
          </p>

          <p
            className={`text-[15px] ${subTextColor} leading-relaxed max-w-xs mx-auto pt-3`}
          >
            Audio Enabled.
          </p>
          <p
            className={`text-[15px] ${subTextColor} leading-relaxed max-w-xs mx-auto`}
          >
            Headphones Suggested.
          </p>
          <p
            className={`text-[15px] ${subTextColor} leading-relaxed max-w-xs mx-auto`}
          >
            When Ready Click Next:
          </p>
        </div>

        {/* Primary Next button */}
        <button
          onClick={handleContinue}
          className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95 mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="absolute inset-0 border border-white/20 rounded-full" />
          <div className="relative flex items-center space-x-2 justify-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-50">
              Next
            </span>
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          </div>
        </button>
      </div>
    </div>
  );
};