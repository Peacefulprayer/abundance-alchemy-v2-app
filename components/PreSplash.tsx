// components/PreSplash.tsx - FULLY RESTORED
import React, { useEffect } from 'react'; // React FIRST
import { ThemeMode } from '../types';
import { buttonSoundService } from '../services/buttonSoundService';
import { unlockAudio } from '../services/audioService';
import BreathingOrb from './BreathingOrb';

interface PreSplashProps {
  onContinue: () => void;
  theme: ThemeMode;
}

export const PreSplash: React.FC<PreSplashProps> = ({ onContinue, theme }) => {
    // Add this useEffect INSIDE the component function
  useEffect(() => {
    unlockAudio(); // This unlocks audio for iOS/Safari
  }, []);

  const handleContinue = () => {
    buttonSoundService.play('click');
    onContinue();
  };

  // Base card styling - CONSISTENT SHADOW FOR ALL
  const baseCardClasses = `backdrop-blur-md rounded-2xl border p-6 mb-4 transition-all w-full max-w-xs shadow-xl`;
  
  // Standard cards
  const standardCardClasses = `${baseCardClasses} ${
    theme === 'dark' 
      ? 'bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10' 
      : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
  }`;
  
  // Enhanced title card - DARKER, NOT FLAT
  const titleCardClasses = `${baseCardClasses} ${
    theme === 'dark' 
      ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-amber-500/15' 
      : 'bg-gradient-to-b from-slate-100 to-white border-slate-300/40'
  }`;

  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const subTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-slate-950 to-black' 
        : 'bg-gradient-to-b from-amber-50 to-white'
    }`}>
      
      {/* UNIVERSAL ORB - POSITIONED HIGHER */}
      <div className="mb-2 -mt-4">
        <BreathingOrb 
          size={120}
          breathingSpeed={4000}
        />
      </div>

      {/* TITLE CARD - DARKER, SMALLER TEXT */}
      <div className={titleCardClasses}>
        <h1 className="text-xl font-light tracking-[0.2em] text-amber-500 text-center">
          Abundance Alchemy
        </h1>
      </div>

      {/* WELCOME CARD - CENTERED TEXT */}
      <div className={standardCardClasses}>
        <div className="space-y-3 text-center">
          <p className={`text-base font-light ${textColor}`}>
            With Great Love, Welcome.
          </p>
          <div className={`space-y-2 ${subTextColor}`}>
            <p className="text-sm font-light leading-relaxed">
              We Are Honored, Standing Here With You
            </p>
            <p className="text-sm font-light leading-relaxed">
              As You Learn To Embrace The Power
            </p>
            <p className="text-sm font-light leading-relaxed">
              Of Your I Am Consciousness.
            </p>
          </div>
        </div>
      </div>

      {/* AUDIO CARD - ORANGE LINES, BOLDER TEXT */}
      <div className={standardCardClasses}>
        <div className="space-y-3 text-center">
          {/* Top line - ORANGE */}
          <div className="border-t border-amber-500/40 pt-3"></div>
          
          {/* Bolder audio text */}
          <div className="space-y-1">
            <p className="text-xs text-amber-500 font-semibold tracking-wide">
              Audio Enabled.
            </p>
            <p className="text-xs text-amber-500 font-semibold tracking-wide">
              Headphones Suggested.
            </p>
          </div>
          
          {/* Bottom line - ORANGE */}
          <div className="border-b border-amber-500/40 pb-3"></div>
        </div>
      </div>

      {/* UNIVERSAL BUTTON WITH TONE */}
      <button
        onClick={handleContinue}
        className="mt-6 px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg"
      >
        Enter When Ready
      </button>
    </div>
  );
};