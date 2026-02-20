import React, { useMemo, useState } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import { getPrayerPathById, PRAYER_TEXTS } from './prayerContent';
import type { PrayerPathId } from './prayerContent';

interface PrayerSessionProps {
  prayerPathId: PrayerPathId | null;
  onBack: () => void;
  onComplete: () => void;
  onChangePath: () => void;
  theme: 'light' | 'dark';
}

export const PrayerSession: React.FC<PrayerSessionProps> = ({
  prayerPathId,
  onBack,
  onComplete,
  onChangePath,
  theme,
}) => {
  const [index, setIndex] = useState(0);
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const cardBg = theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/75 border-slate-700';

  const path = useMemo(() => (prayerPathId ? getPrayerPathById(prayerPathId) : null), [prayerPathId]);
  const prayers = prayerPathId ? PRAYER_TEXTS[prayerPathId] || [] : [];
  const prayerText = prayers[index] || '';

  if (!prayerPathId || prayers.length === 0) {
    return (
      <div className={`h-full flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center ${textColor}`}>
        <p className="text-sm mb-4">No prayer content loaded for this path yet.</p>
        <button
          onClick={onChangePath}
          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:opacity-90"
        >
          Select Prayer Path
        </button>
      </div>
    );
  }

  const nextPrayer = () => {
    buttonSoundService.play('click');
    setIndex((prev) => (prev + 1) % prayers.length);
  };

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
        <span className={`text-[10px] tracking-[0.22em] uppercase ${subTextColor} opacity-90`}>
          {path?.swahili || 'Prayer'} Session
        </span>
      </div>

      <div className={`rounded-2xl border p-5 shadow-lg mb-4 ${cardBg}`}>
        <h2 className="text-lg font-bold mb-1">{path?.label || 'Prayer'}</h2>
        <p className={`text-xs uppercase tracking-wide text-amber-400`}>
          Prayer {index + 1} of {prayers.length}
        </p>
      </div>

      <div className={`rounded-2xl border p-5 mb-4 min-h-[220px] flex items-center ${cardBg}`}>
        <p className={`text-base leading-relaxed ${subTextColor}`}>{prayerText}</p>
      </div>

      <div className={`rounded-2xl border p-4 mb-4 ${cardBg}`}>
        <p className={`text-sm ${subTextColor}`}>
          Phase 2 ships with curated prayer text for each path. In a later phase we can add optional AI-assisted personalization with guardrails.
        </p>
      </div>

      <div className="mt-auto pt-2 space-y-2">
        <button
          onClick={nextPrayer}
          className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Next Prayer
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => {
            buttonSoundService.play('confirm');
            onComplete();
          }}
          className={`w-full py-3 rounded-xl border font-semibold flex items-center justify-center gap-2 ${
            theme === 'light' ? 'border-slate-300 bg-white/80 text-slate-900' : 'border-slate-700 bg-slate-900/50 text-slate-100'
          }`}
        >
          Complete
          <CheckCircle2 size={16} />
        </button>
      </div>
    </div>
  );
};
