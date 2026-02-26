import React from 'react';
import { HandHeart, ArrowRight } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import { getPrayerPathById, PRAYER_GUIDE_STEPS } from './prayerContent';
import type { PrayerPathId } from './prayerContent';
import type { PrayerProfile } from '../types';

interface PrayerGuideProps {
  prayerPathId: PrayerPathId | null;
  prayerProfile: PrayerProfile;
  onBack: () => void;
  onStartPrayer: () => void;
  onChangePath: () => void;
  theme: 'light' | 'dark';
}

export const PrayerGuide: React.FC<PrayerGuideProps> = ({
  prayerPathId,
  prayerProfile,
  onBack,
  onStartPrayer,
  onChangePath,
  theme,
}) => {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200'
      : 'bg-gradient-to-br from-slate-900/75 to-slate-950/75 border-slate-700';
  const formatToken = (value: string) =>
    value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  if (!prayerPathId) {
    return (
      <div className={`h-full flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center ${textColor}`}>
        <p className="text-sm mb-4">No prayer path selected yet.</p>
        <button
          onClick={onChangePath}
          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:opacity-90"
        >
          Select Prayer Path
        </button>
      </div>
    );
  }

  const path = getPrayerPathById(prayerPathId);
  const steps = PRAYER_GUIDE_STEPS[prayerPathId] || [];

  return (
    <div className={`h-full flex flex-col p-4 max-w-md mx-auto pb-8 overflow-y-auto custom-scrollbar ${textColor}`}>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => {
            buttonSoundService.play('back');
            onBack();
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-[11px] text-slate-100 hover:bg-black/80 transition-colors"
        >
          <span className="mr-1">←</span>
          <span className="font-semibold tracking-wide uppercase">Back</span>
        </button>
        <span className={`text-[10px] tracking-[0.22em] uppercase ${subTextColor} opacity-90`}>Prayer Guide</span>
      </div>

      <div className={`rounded-2xl border p-5 shadow-lg mb-4 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <HandHeart size={18} className="text-amber-400" />
          <h2 className="text-lg font-bold">{path?.label || 'Prayer'} Instructions</h2>
        </div>
        <p className={`text-xs uppercase tracking-wide text-amber-400 mb-2`}>{path?.swahili || ''}</p>
        <p className={`text-sm ${subTextColor}`}>{path?.description || 'Prepare your heart and intention.'}</p>
      </div>

      <div className={`rounded-2xl border p-4 mb-4 ${cardBg}`}>
        <div className="text-xs uppercase tracking-wide opacity-80 mb-3">Prayer Profile</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs">
            Intent: <span className="font-semibold">{formatToken(prayerProfile.intent)}</span>
          </div>
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs">
            Tone: <span className="font-semibold">{formatToken(prayerProfile.tone)}</span>
          </div>
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs">
            Language: <span className="font-semibold">{formatToken(prayerProfile.language)}</span>
          </div>
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs">
            Style: <span className="font-semibold">{formatToken(prayerProfile.style)}</span>
          </div>
        </div>
        <div className="text-xs uppercase tracking-wide opacity-80 mb-3">How To Pray In This Flow</div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={`${prayerPathId}-${index}`} className="flex gap-2 items-start">
              <span className="text-[11px] mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                {index + 1}
              </span>
              <p className={`text-sm leading-relaxed ${subTextColor}`}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-2 space-y-2">
        <button
          onClick={() => {
            buttonSoundService.play('confirm');
            onStartPrayer();
          }}
          className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Begin Prayer
          <ArrowRight size={16} />
        </button>
        <button
          onClick={onChangePath}
          className={`w-full py-2 rounded-xl border text-sm ${theme === 'light' ? 'border-slate-300 bg-white/80' : 'border-slate-700 bg-slate-900/50'} ${textColor}`}
        >
          Change Prayer Path
        </button>
      </div>
    </div>
  );
};
