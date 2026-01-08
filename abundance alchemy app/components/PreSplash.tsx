// components/PreSplash.tsx - FIXED UNIVERSAL DESIGN
import React, { useEffect } from 'react';
import { ThemeMode } from '../types';
import { buttonSoundService } from '../services/buttonSoundService';
import { unlockAudio } from '../services/audioService';
import BreathingOrb from './BreathingOrb';

interface PreSplashProps {
  onContinue: () => void;
  theme: ThemeMode;
}

export const PreSplash = ({ onContinue, theme }: PreSplashProps) => {
  useEffect(() => {
    unlockAudio();
  }, []);

  const handleContinue = () => {
    buttonSoundService.play('click');
    onContinue();
  };

  // UNIVERSAL TITLE CARD CLASSES
  const titleCardClasses =
    'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

  // UNIVERSAL CONTENT CARD CLASSES
  const getContentCardClasses = () => {
    const base =
      'backdrop-blur-md rounded-2xl border p-4 md:p-6 w-full max-w-[280px] shadow-xl';
    return theme === 'dark'
      ? `${base} bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10`
      : `${base} bg-gradient-to-b from-white to-slate-50 border-slate-200`;
  };

  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const subTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-slate-950 to-black'
          : 'bg-gradient-to-b from-amber-50 to-white'
      }`}
    >
      {/* UNIVERSAL ORB - 80PX SIZE */}
      <div className="mt-8 md:mt-12 mb-4 md:mb-6">
        <BreathingOrb size={80} breathingSpeed={4000} />
      </div>

      {/* UNIVERSAL TITLE CARD - SINGLE LINE */}
      <div className={`${titleCardClasses} mb-4 md:mb-6`}>
        <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
          Abundance Alchemy
        </h1>
      </div>

      {/* WELCOME CARD */}
      <div className={`${getContentCardClasses()} mb-4 md:mb-4`}>
        <div className="space-y-3 text-center">
          <p className={`text-sm md:text-base font-light ${textColor} mb-2`}>
            With Great Love, Welcome.
          </p>
          <div className={`space-y-2 ${subTextColor}`}>
            <p className="text-xs md:text-sm font-light leading-relaxed">
              We Are Honored
            </p>
            <p className="text-xs md:text-sm font-light leading-relaxed">
              Standing Here With You
            </p>
            <p className="text-xs md:text-sm font-light leading-relaxed">
              As You Learn To Embrace The Power
            </p>
            <p className="text-xs md:text-sm font-light leading-relaxed">
              Of Your I Am Consciousness.
            </p>
          </div>
        </div>
      </div>

      {/* AUDIO CARD */}
      <div className={`${getContentCardClasses()} mb-6 md:mb-4`}>
        <div className="space-y-2 md:space-y-3 text-center">
          <div className="border-t border-amber-500/40 pt-2 md:pt-3"></div>

          <div className="space-y-0.5 md:space-y-1">
            <p className="text-[11px] md:text-xs text-amber-500 font-semibold tracking-wide">
              Audio Is Enabled.
            </p>
            <p className="text-[11px] md:text-xs text-amber-500 font-semibold tracking-wide">
              Headphones Strongly Suggested.
            </p>
          </div>

          <div className="border-b border-amber-500/40 pb-2 md:pb-3"></div>
        </div>
      </div>

      {/* UNIVERSAL BUTTON */}
      <button
        onClick={handleContinue}
        className="mt-4 md:mt-6 px-4 py-1.5 md:px-5 md:py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg"
      >
        Enter When Ready
      </button>
    </div>
  );
};

// Add default export to make imports unambiguous/build-green.
export default PreSplash;
