// src/components/SplashScreen.tsx

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AlchemistAvatar } from './AlchemistAvatar';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const handleEnter = () => {
    onComplete();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between text-slate-100">
      {/* Background image + slightly lighter overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/SPLASH_1765630178_ai-generated-background-2.jpg)'
        }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-md mx-auto px-6 pt-10 pb-8">
        {/* TOP: Glowing Energy Orb Avatar */}
        <div className="flex-1 flex items-start justify-center">
          <AlchemistAvatar
            size="md"
            mood="active"
            speaking={false}
            progress={0}
            className="mt-2"
          />
        </div>

        {/* MIDDLE: Title + updated spiritual text */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-5">
          {/* Title */}
          <div className="text-center">
            <div className="text-3xl leading-tight font-serif font-bold">
              <span className="block text-amber-200 drop-shadow-sm">Abundance</span>
              <span className="block text-amber-200 drop-shadow-sm">Alchemy</span>
            </div>
          </div>

          {/* Updated spiritual copy, centered */}
          <div className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto text-center space-y-1">
            <p>The Process of Transformational Change</p>
            <p>Always Begins with Us</p>
            <p>Causing Transformational Shifting of Your Reality</p>
            <p>Through The Power Of Your I Am Consciousness.</p>
          </div>

          {/* Tool pills: Affirmations, Meditation, Gratitude */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button className="px-4 py-2 rounded-full border border-slate-600/70 bg-slate-900/60 text-xs font-semibold tracking-[0.18em] uppercase text-slate-200 flex items-center space-x-2">
              <span className="text-amber-300">
                <Sparkles className="w-3 h-3" />
              </span>
              <span>Affirmations</span>
            </button>
            <button className="px-4 py-2 rounded-full border border-slate-600/70 bg-slate-900/60 text-xs font-semibold tracking-[0.18em] uppercase text-slate-200 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              <span>Meditation</span>
            </button>
            <button className="px-4 py-2 rounded-full border border-slate-600/70 bg-slate-900/60 text-xs font-semibold tracking-[0.18em] uppercase text-slate-200 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              <span>Gratitude</span>
            </button>
          </div>

          {/* Intention line */}
          <div className="text-[11px] tracking-[0.25em] uppercase text-slate-400 text-center pt-2">
            I Am Ready For Transformation
          </div>
        </div>

        {/* BOTTOM: Slightly smaller primary button + attribution */}
        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={handleEnter}
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-sm font-semibold tracking-[0.24em] uppercase text-slate-950 shadow-[0_18px_50px_rgba(249,115,22,0.55)] hover:brightness-110 transition-all px-6 py-3"
          >
            <span className="mr-2">Enter The Sacred Space</span>
            <Sparkles className="w-4 h-4" />
          </button>

          <p className="text-[12px] text-slate-500/80 text-center leading-relaxed">
            Based on the book &quot;I Am Practice&quot; by Michael Soaries.
          </p>
        </div>
      </div>
    </div>
  );
};
