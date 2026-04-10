// components/PreSplash.tsx - FIXED UNIVERSAL DESIGN
import { useEffect } from 'react';
import { ThemeMode } from '../types';
import { buttonSoundService } from '../services/buttonSoundService';
import { unlockAudio } from '../services/audioService';
import BreathingOrb from './BreathingOrb';
import {
  SACRED_LAYOUT,
  SACRED_ORB_WRAPPER,
  SACRED_TITLE_CARD,
  SACRED_BODY_CARD,
  SACRED_CARD_GAP,
  SACRED_INNER_WIDTH,
} from '../styles/sacredCards';

interface PreSplashProps {
  onContinue: () => void;
  theme: ThemeMode;
  isReady?: boolean;
}

export const PreSplash = ({ onContinue, theme, isReady = true }: PreSplashProps) => {
  useEffect(() => {
    unlockAudio();
  }, []);

  const handleContinue = () => {
    buttonSoundService.play('click');
    onContinue();
  };

  const contentCardClasses =
    theme === 'dark'
      ? SACRED_BODY_CARD
      : 'sacred-glass rounded-2xl border border-slate-200 p-4 md:p-6 w-full max-w-[300px] md:max-w-[380px] shadow-xl bg-gradient-to-b from-white/95 to-slate-50/90';

  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const subTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`${SACRED_LAYOUT} bg-black`}>
      {/* ORB */}
      <div className={SACRED_ORB_WRAPPER}>
        <BreathingOrb size={80} breathingSpeed={4000} />
      </div>

      {/* TITLE CARD */}
      <div className={`${SACRED_TITLE_CARD} ${SACRED_CARD_GAP}`}>
        <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
          Abundance Alchemy
        </h1>
      </div>

      {/* WELCOME CARD */}
      <div className={`${contentCardClasses} ${SACRED_CARD_GAP}`}>
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

      {/* AUDIO NOTICE CARD */}
      <div className={`${contentCardClasses} ${SACRED_CARD_GAP}`}>
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

      <p className={`text-[10px] md:text-[11px] text-white italic tracking-[0.02em] text-center mb-2 ${SACRED_INNER_WIDTH}`}>
        Rūaḥ ʾĔlōhīm stirs over ṯōhū wāḇōhū: movement begins.
      </p>

      {/* ENTER BUTTON */}
      <button
        onClick={handleContinue}
        disabled={!isReady}
        className="mt-2 md:mt-4 px-4 py-1.5 md:px-5 md:py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg disabled:cursor-wait disabled:opacity-60"
      >
        {isReady ? 'Enter When Ready' : 'Preparing Your Entry'}
      </button>
    </div>
  );
};

export default PreSplash;
