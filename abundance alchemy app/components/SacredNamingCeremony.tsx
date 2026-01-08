// components/SacredNamingCeremony.tsx - FIXED UNIVERSAL DESIGN
import React, { useState } from 'react';
import { SacredBackground } from './SacredBackground';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';

interface SacredNamingCeremonyProps {
  onComplete: (userData: { name: string }) => void;
  theme?: 'light' | 'dark';
}

// UNIVERSAL TITLE CARD CLASSES (EXACT MATCH)
const titleCardClasses = "backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10";

// UNIVERSAL CONTENT CARD CLASSES (EXACT MATCH)
const getContentCardClasses = (theme: 'light' | 'dark') => {
  const base = "backdrop-blur-md rounded-2xl border p-4 md:p-6 w-full max-w-[280px] shadow-xl";
  return theme === 'dark' 
    ? `${base} bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10`
    : `${base} bg-gradient-to-b from-white to-slate-50 border-slate-200`;
};

export const SacredNamingCeremony: React.FC<SacredNamingCeremonyProps> = ({
  onComplete,
  theme = 'dark',
}) => {
  const [name, setName] = useState('');
  const [hasSpiritualName, setHasSpiritualName] = useState(false);
  const [step, setStep] = useState<'introduction' | 'naming' | 'affirmation'>('introduction');

  const handleBegin = () => {
    buttonSoundService.play('click');
    setStep('naming');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    buttonSoundService.play('click');
    setStep('affirmation');
    
    setTimeout(() => {
      onComplete({ name: name.trim() });
    }, 3000);
  };

  const handleSkipIntroduction = () => {
    buttonSoundService.play('click');
    setStep('naming');
  };

  // Theme colors
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const inputBg = theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900/50 border-slate-700';

  return (
    <SacredBackground theme={theme} backgroundType="default">
      {/* UNIVERSAL CONTAINER: justify-center for PC, no scroll */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
        
        {/* UNIVERSAL ORB - 80PX SIZE with EXACT spacing */}
        <div className="mt-8 md:mt-12 mb-4 md:mb-6">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        {/* UNIVERSAL TITLE CARD - SINGLE LINE */}
        <div className={`${titleCardClasses} mb-4 md:mb-6`}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        {/* DYNAMIC CONTENT WITH UNIVERSAL CARD */}
        <div className={`${getContentCardClasses(theme)} mb-6 md:mb-8`}>
          
          {/* STEP 1: INTRODUCTION */}
          {step === 'introduction' && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className={`text-base md:text-lg font-bold ${textColor}`}>
                  Sacred Naming Ceremony
                </h2>
                <p className={`text-xs md:text-sm ${subTextColor}`}>
                  Let us honor your presence
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="border-t border-amber-500/30 pt-3">
                  <p className={`text-sm md:text-base ${textColor} font-light`}>
                    What shall we call you
                  </p>
                  <p className={`text-xs md:text-sm ${subTextColor} mt-1`}>
                    in this sacred space?
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-1 w-6 bg-amber-500/50 rounded-full"></div>
                    <p className={`text-xs ${subTextColor}`}>
                      Your given name, a nickname, or spiritual name
                    </p>
                    <div className="h-1 w-6 bg-amber-500/50 rounded-full"></div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => setHasSpiritualName(!hasSpiritualName)}
                      className={`text-xs ${hasSpiritualName ? 'text-amber-400' : subTextColor} hover:text-amber-300 transition-colors`}
                    >
                      {hasSpiritualName ? '✓ I have a spiritual name' : 'I already have a spiritual name'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleBegin}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg"
                >
                  Begin Ceremony
                </button>
                <button
                  onClick={handleSkipIntroduction}
                  className="w-full mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Skip introduction
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NAME ENTRY */}
          {step === 'naming' && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className={`text-base md:text-lg font-bold ${textColor}`}>
                  {hasSpiritualName ? 'Your Spiritual Name' : 'Your Sacred Name'}
                </h2>
                <p className={`text-xs md:text-sm ${subTextColor}`}>
                  {hasSpiritualName 
                    ? 'The name gifted to your spirit'
                    : 'What name feels true to your heart here?'}
                </p>
              </div>
              
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                      {hasSpiritualName ? '🕊️' : '✨'}
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={hasSpiritualName ? "Enter your spiritual name" : "Enter your sacred name"}
                      className={`w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
                      autoFocus
                    />
                  </div>
                  <p className={`text-xs ${subTextColor}`}>
                    This name will appear in your affirmations and meditations
                  </p>
                </div>

                <div className="border-t border-amber-500/30 pt-3">
                  <p className={`text-xs md:text-sm ${subTextColor} italic`}>
                    "I am not just entering a name...
                    <br />I am invoking an identity."
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasSpiritualName ? 'Honor My Spiritual Name' : 'Claim My Sacred Name'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: AFFIRMATION */}
          {step === 'affirmation' && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className={`text-base md:text-lg font-bold ${textColor}`}>
                  We Honor You, {name}
                </h2>
                <div className="h-1 w-16 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              </div>
              
              <div className="space-y-3">
                <div className="border border-amber-500/30 rounded-xl p-4 bg-gradient-to-b from-amber-500/5 to-transparent">
                  <p className={`text-sm md:text-base ${textColor} font-light`}>
                    Your name is now woven into
                    <br />the fabric of this sacred space.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className={`text-xs md:text-sm ${subTextColor}`}>
                    We honor your journey.
                  </p>
                  <p className={`text-xs md:text-sm ${subTextColor}`}>
                    We witness your becoming.
                  </p>
                  <p className={`text-xs md:text-sm font-bold text-amber-500 mt-3`}>
                    Ase. And so it is.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-xs text-amber-400">
                    Preparing your sacred space...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CEREMONY PROGRESS INDICATOR */}
        <div className="flex justify-center space-x-2">
          {['introduction', 'naming', 'affirmation'].map((s, index) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                step === s 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* BOTTOM SPACING */}
        <div className="h-6 md:h-4"></div>
      </div>
    </SacredBackground>
  );
};