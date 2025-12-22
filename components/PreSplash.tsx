// src/components/PreSplash.tsx

import React from 'react';
import { Sparkles } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import { AlchemistAvatar } from './AlchemistAvatar';

interface PreSplashProps {
  onContinue: () => void;
  theme?: 'light' | 'dark';
}

export const PreSplash: React.FC<PreSplashProps> = ({
  onContinue,
  theme = 'dark',
}) => {
  const titleColor =
    theme === 'light' ? 'text-amber-500' : 'text-orange-400';
  const subTextColor =
    theme === 'light' ? 'text-yellow-600' : 'text-yellow-300';

  const handleContinue = () => {
    buttonSoundService.playClick();
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6">
      {/* Background gradient layer to delineate container */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />

      {/* Soft ambience glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 max-w-md w-full pb-10">
        {/* Logo with 80% opacity so it emerges from the dark */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 opacity-80">
            <img
              src="/logo.png"
              alt="Abundance Alchemy"
              className="h-10 w-auto drop-shadow-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Black-moon style orb: smaller, dark center with halo */}
          <div className="scale-90 relative">
            {/* Soft outer halo behind orb */}
            <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-3xl" />
            {/* Orb itself */}
            <div className="relative">
              <AlchemistAvatar
                size="sm"
                mood="active"
                speaking={false}
                progress={0}
              />
              {/* Darken core to feel like a black moon */}
              <div className="absolute inset-[20%] rounded-full bg-black/70" />
            </div>
          </div>
        </div>

        {/* Copy with audio guidance emphasis */}
        <div className="space-y-4 text-center">
          <h1
            className={`text-xl font-serif font-bold ${titleColor}`}
          >
            Abundance Alchemy
          </h1>

          <div className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            <p>With Great Love, Welcome.</p>
            <p>We Are Honored, Standing Here With You</p>
            <p>As You Learn To Embrace The Power</p>
            <p>Of Your I Am Consciousness.</p>
          </div>

          <div
            className={`text-xs ${subTextColor} leading-relaxed max-w-xs mx-auto mt-4 space-y-1`}
          >
            <p>Audio Enabled.</p>
            <p>Headphones Suggested.</p>
            <p>When Ready Click Next:</p>
          </div>
        </div>

        {/* Primary Next button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-sm font-semibold tracking-[0.2em] uppercase text-slate-950 shadow-[0_18px_40px_rgba(249,115,22,0.55)] hover:brightness-110 transition-all"
          >
            <span>Next</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
