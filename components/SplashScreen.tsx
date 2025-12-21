// src/components/SplashScreen.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}
export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const handleEnter = () => {
    onComplete();
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black">
      {/* Background image + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/SPLASH_1765630178_ai-generated-background-2.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-black" />

      {/* Existing soft glow blobs can follow if you still want them */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        ...
      </div> */}

      <div className="relative z-10 flex flex-col items-center text-left w-full max-w-sm">
        {/* rest of your Splash content */}

        {/* Breathing circle at top */}
        <div className="mt-4 mb-10 w-full flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-3xl animate-pulse" />
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-400 flex items-center justify-center shadow-[0_0_34px_rgba(168,85,247,0.8)] animate-[pulse_3s_ease-in-out_infinite]">
              <div className="w-28 h-28 rounded-full bg-slate-950/95 border border-purple-200/40" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="w-full mb-4">
          <h1 className="text-4xl font-serif font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-100 to-purple-200 drop-shadow-lg">
            Abundance
            <br />
            Alchemy
          </h1>
        </div>

        {/* Subtext with I Am / I Love emphasis */}
        <div className="w-full mb-8">
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
            We begin Transforming Your Reality Through The Power Of Your
          </p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
            <span className="text-amber-300 font-semibold">I Am</span> and{' '}
            <span className="text-purple-300 font-semibold">I Love</span>
          </p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
            Consciousness.
          </p>
        </div>

        {/* Tool pills: Affirmations, Meditation, Gratitude */}
        <div className="w-full flex flex-row flex-wrap gap-3 mb-8">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 border border-amber-400/40 shadow-md shadow-black/40 text-xs text-amber-100 backdrop-blur-md"
          >
            <span className="text-[10px]">✶</span>
            <span>Affirmations</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 border border-indigo-400/40 shadow-md shadow-black/40 text-xs text-indigo-100 backdrop-blur-md"
          >
            <span className="text-[10px]">☾</span>
            <span>Meditation</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 border border-purple-400/40 shadow-md shadow-black/40 text-xs text-purple-100 backdrop-blur-md"
          >
            <span className="text-[10px]">✺</span>
            <span>Gratitude</span>
          </button>
        </div>

        {/* Intention line */}
        <div className="w-full mb-4">
          <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">
            I Am Ready For Transformation
          </p>
        </div>

        {/* Primary button: Enter The Sacred Space */}
        <div className="w-full mb-6">
          <button
            type="button"
            onClick={handleEnter}
            className="group w-full relative flex items-center justify-center px-6 py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 shadow-xl shadow-purple-900/50 transform hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center space-x-3">
              <span className="text-sm font-bold uppercase tracking-[0.22em] text-slate-50">
                Enter The Sacred Space
              </span>
              <Sparkles size={18} className="text-amber-200" />
            </div>
          </button>
        </div>

        {/* Attribution */}
        <p className="mt-1 text-[11px] text-slate-500/80 max-w-xs">
          Based on the book "I Am Practice" by Michael Soaries.
        </p>
      </div>
    </div>
  );
};