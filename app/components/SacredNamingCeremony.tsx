// components/SacredNamingCeremony.tsx - Pre-SNC added as first step (explicit WELCOME background)
import React, { useEffect, useState } from 'react';
import { SacredBackground } from './SacredBackground';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';

interface SacredNamingCeremonyProps {
  onComplete: (userData: { name: string }) => void;
  theme?: 'light' | 'dark';
}

const titleCardClasses =
  'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

const getContentCardClasses = (theme: 'light' | 'dark') => {
  const base =
    'backdrop-blur-md rounded-2xl border p-4 md:p-6 w-full max-w-[280px] shadow-xl';
  return theme === 'dark'
    ? `${base} bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10`
    : `${base} bg-gradient-to-b from-white to-slate-50 border-slate-200`;
};

type Step = 'prelude' | 'naming' | 'affirmation';

export const SacredNamingCeremony: React.FC<SacredNamingCeremonyProps> = ({
  onComplete,
  theme = 'dark',
}) => {
  const [name, setName] = useState('');
  const [hasSpiritualName, setHasSpiritualName] = useState(false);
  const [step, setStep] = useState<Step>('prelude');
  const [showPreludeNext, setShowPreludeNext] = useState(false);

  useEffect(() => {
    if (step !== 'prelude') return;
    setShowPreludeNext(false);
    const t = setTimeout(() => setShowPreludeNext(true), 1200);
    return () => clearTimeout(t);
  }, [step]);

  const handlePreludeNext = () => {
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

  const textColor = theme === 'light' ? 'text-slate-800' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const inputBg =
    theme === 'light'
      ? 'bg-white border-slate-300'
      : 'bg-slate-900/50 border-slate-700';

  const stepsForIndicator: Step[] = ['prelude', 'naming', 'affirmation'];

  return (
    <SacredBackground
      theme={theme}
      // ✅ Explicit per screen:
      backgroundType="NAMING_CEREMONY"
      fallbackBackgroundType="WELCOME"
    >
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="mt-4 md:mt-8 mb-3 md:mb-5">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        <div className={`${titleCardClasses} mb-3 md:mb-5`}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        <div
          className={`${getContentCardClasses(theme)} mb-6 md:mb-8 ${
            step === 'prelude'
              ? 'max-w-[280px] p-3 md:p-4 backdrop-blur-sm'
              : ''
          }`}
          style={
            step === 'prelude'
              ? {
                  backgroundColor: 'rgba(2, 6, 23, 0.92)',
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(2, 6, 23, 0.98), rgba(0, 0, 0, 0.92))',
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                }
              : undefined
          }
        >
          {step === 'prelude' && (
            <div className="text-center space-y-2">
              <div className="space-y-0.5">
                <h2 className={`text-sm md:text-base font-semibold text-slate-100`}>
                  Before the Naming
                </h2>
                <p className="text-[11px] md:text-xs text-slate-300">
                  A quiet moment of intention
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                <div className="space-y-0.5">
                  <p className="text-amber-400 text-xs font-semibold tracking-wide">
                    Orúkọ ńróni
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                <div className="space-y-1.5">
                  <p className="text-xs md:text-sm text-slate-100 font-light">
                    A name shapes
                    <br />
                    the one who bears it.
                  </p>

                  <div className="space-y-1 py-0.5">
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                    <p className="text-xs md:text-sm text-slate-100 font-light tracking-[0.03em]">
                      Pause a moment.
                    </p>
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  </div>

                  <p className="text-[11px] md:text-xs text-slate-300">
                    You are about to choose
                    <br />
                    how you will be called
                    <br />
                    in this sacred space.
                  </p>
                </div>

                <p className="text-[11px] md:text-xs text-slate-200">
                  Some names are given at birth.
                  <br />
                  Others are chosen along the way—
                  <br />
                  names that hold the hopes of
                  <br />
                  others for us,
                  <br />
                  trace who we have been,
                  <br />
                  speak to who we are becoming,
                  <br />
                  and express how we wish to be met.
                </p>

                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                <div className="space-y-1.5">
                  <p className="text-[11px] md:text-xs text-slate-300">
                    Walk into this space with intention.
                    <br />
                    How do you want to be called?
                  </p>
                  <div className="text-[11px] md:text-xs text-amber-200/90 space-y-0.5">
                    <p>Your given name?</p>
                    <p>A nickname?</p>
                    <p>A spiritual name?</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] md:text-xs text-slate-300">
                    Give it some thought.
                  </p>
                  <p className="text-[11px] md:text-xs text-slate-300">
                    When you are ready, click:
                  </p>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  onClick={handlePreludeNext}
                  className={`w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-[10px] md:text-xs tracking-wide shadow-lg hover:opacity-90 transition-all ${
                    showPreludeNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  Next
                </button>
                <div className="h-3 md:h-4" />
              </div>
            </div>
          )}

          {step === 'naming' && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className={`text-base md:text-lg font-bold ${textColor}`}>
                  {hasSpiritualName ? 'Your Spiritual Name' : 'Your Sacred Name'}
                </h2>
                <p className={`text-xs md:text-sm ${subTextColor}`}>
                  {hasSpiritualName
                    ? 'The name gifted to your spirit'
                    : 'Choose the name you wish to be called here.'}
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
                      placeholder={
                        hasSpiritualName ? 'Enter your spiritual name' : 'Enter your sacred name'
                      }
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
                    <br />
                    I am invoking an identity."
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

          {step === 'affirmation' && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className={`text-sm md:text-base font-semibold ${textColor}`}>
                  We Honor You, {name}
                </h2>
                <div className="h-1 w-14 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              </div>

              <div className="space-y-3">
                <div className="border border-amber-500/30 rounded-xl p-4 bg-gradient-to-b from-amber-500/5 to-transparent">
                  <p className={`text-xs md:text-sm ${textColor} font-light`}>
                    Your name is now woven
                    <br />
                    into the fabric
                    <br />
                    of this sacred space.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className={`text-xs md:text-sm ${subTextColor}`}>We honor your journey.</p>
                  <p className={`text-xs md:text-sm ${subTextColor}`}>We witness your becoming.</p>
                  <p className={`text-xs md:text-sm font-semibold text-amber-500 mt-3`}>
                    Ase. And so it is.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-xs text-amber-400">Preparing your sacred space...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Step indicator (completed; was truncated in paste) */}
        <div className="flex justify-center space-x-2">
          {stepsForIndicator.map((s) => {
            const isActive = s === step;
            const isCompleted = stepsForIndicator.indexOf(s) < stepsForIndicator.indexOf(step);

            return (
              <div
                key={s}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  isActive ? 'w-8 bg-amber-500' : isCompleted ? 'w-4 bg-amber-500/60' : 'w-4 bg-slate-500/40',
                ].join(' ')}
              />
            );
          })}
        </div>

        <div className="h-2 md:h-3" />
      </div>
    </SacredBackground>
  );
};
