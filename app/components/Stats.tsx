// src/components/Stats.tsx
import React from 'react';
import type { UserProfile, FocusArea } from '../types';

interface StatsProps {
  user: UserProfile;
  theme: 'light' | 'dark';
  onBack: () => void;
}

function focusLabel(f: FocusArea | undefined): string {
  if (!f) return 'Focus';
  return typeof f === 'string' ? f : f.label;
}

export const Stats: React.FC<StatsProps> = ({ user, theme, onBack }) => {
  const primaryFocus = focusLabel(user.focusAreas?.[0]);
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const titlePill =
    'inline-flex items-center rounded-full border border-amber-300/45 bg-gradient-to-r from-slate-950/78 to-slate-900/72 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-sm';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200'
      : 'bg-gradient-to-br from-slate-900/75 to-slate-950/75 border-slate-700';
  const statCardBg =
    theme === 'light'
      ? 'bg-white/85 border-slate-200'
      : 'bg-slate-900/65 border-white/10';

  return (
    <div className={`p-4 max-w-md mx-auto pb-24 ${textColor}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-[11px] text-slate-100 hover:bg-black/80 transition-colors"
        >
          <span className="mr-1">←</span>
          <span className="font-semibold tracking-wide uppercase">Back</span>
        </button>
        <span className={titlePill}>
          Sacred Stats
        </span>
      </div>

      <div className={`rounded-2xl border p-5 shadow-lg ${cardBg}`}>
        <h2 className="text-lg font-bold">Journey Stats</h2>
        <p className={`text-sm mt-2 ${subTextColor}`}>
          Primary focus: <span className="font-bold text-amber-300">{primaryFocus}</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className={`rounded-xl border p-4 ${statCardBg}`}>
            <div className={`text-xs uppercase tracking-wider ${subTextColor}`}>Streak</div>
            <div className="text-2xl font-bold mt-1">{user.streak}</div>
          </div>
          <div className={`rounded-xl border p-4 ${statCardBg}`}>
            <div className={`text-xs uppercase tracking-wider ${subTextColor}`}>Completed</div>
            <div className="text-2xl font-bold mt-1">{user.affirmationsCompleted}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
