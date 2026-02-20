import React, { useMemo, useState } from 'react';
import { HandHeart, ChevronRight } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import { PRAYER_PATHS } from './prayerContent';
import type { PrayerPathId } from './prayerContent';

interface PrayerSetupProps {
  onBack: () => void;
  onContinue: (pathId: PrayerPathId) => void;
  theme: 'light' | 'dark';
}

export const PrayerSetup: React.FC<PrayerSetupProps> = ({ onBack, onContinue, theme }) => {
  const [selectedPathId, setSelectedPathId] = useState<PrayerPathId | ''>(() => {
    try {
      const value = localStorage.getItem('abundance_prayer_path') || '';
      return (PRAYER_PATHS.find((item) => item.id === value)?.id ?? '') as PrayerPathId | '';
    } catch {
      return '';
    }
  });
  const [saved, setSaved] = useState(false);

  const selectedPath = useMemo(
    () => PRAYER_PATHS.find((item) => item.id === selectedPathId) || null,
    [selectedPathId]
  );

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const cardBg = theme === 'light' ? 'bg-white/85 border-slate-200' : 'bg-slate-900/70 border-slate-700';

  const handleSavePath = () => {
    if (!selectedPathId) return;
    try {
      localStorage.setItem('abundance_prayer_path', selectedPathId);
    } catch {
      // ignore storage errors
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    onContinue(selectedPathId);
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
        <span className={`text-[10px] tracking-[0.22em] uppercase ${subTextColor} opacity-90`}>Omba / Pray</span>
      </div>

      <div className={`rounded-2xl border p-5 shadow-lg mb-4 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <HandHeart size={18} className="text-amber-400" />
          <h2 className="text-lg font-bold">Prayer Setup</h2>
        </div>
        <p className={`text-sm ${subTextColor}`}>
          Select your prayer path first. In the next phase, this will control prayer instructions and guided prayer text.
        </p>
      </div>

      <div className="grid gap-2 mb-4">
        {PRAYER_PATHS.map((path) => {
          const active = path.id === selectedPathId;
          return (
            <button
              key={path.id}
              onClick={() => {
                buttonSoundService.play('click');
                setSelectedPathId(path.id);
              }}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                active
                  ? 'bg-amber-500/20 border-amber-400/70'
                  : theme === 'light'
                  ? 'bg-white/80 border-slate-300 hover:border-amber-300'
                  : 'bg-slate-900/50 border-slate-700 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold">{path.label}</div>
                  <div className="text-xs text-amber-400 uppercase tracking-wide">{path.swahili}</div>
                </div>
                {active ? <ChevronRight size={16} className="text-amber-400" /> : null}
              </div>
              <div className={`text-xs mt-1 ${subTextColor}`}>{path.description}</div>
            </button>
          );
        })}
      </div>

      <div className={`rounded-2xl border p-4 mb-4 ${cardBg}`}>
        <div className="text-xs uppercase tracking-wide opacity-80 mb-2">Phase 2 Preview</div>
        <div className={`text-sm ${subTextColor} space-y-1`}>
          <p>1. Pre-prayer cultural or religious selection</p>
          <p>2. Tailored prayer instructions screen</p>
          <p>3. Guided prayer session screen</p>
        </div>
      </div>

      <button
        onClick={handleSavePath}
        disabled={!selectedPath}
        className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save & Continue
      </button>

      <div className={`text-center text-xs mt-3 ${saved ? 'text-emerald-400' : subTextColor}`}>
        {saved
          ? `Saved: ${selectedPath?.label || 'Prayer Path'}`
          : 'Your choice will be used in the next prayer flow screens.'}
      </div>
    </div>
  );
};
