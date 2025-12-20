// src/components/Stats.tsx
import React from 'react';
import type { UserProfile, FocusArea } from '../types';

interface StatsProps {
  user: UserProfile;
}

function focusLabel(f: FocusArea | undefined): string {
  if (!f) return 'Focus';
  return typeof f === 'string' ? f : f.label;
}

export const Stats: React.FC<StatsProps> = ({ user }) => {
  const primaryFocus = focusLabel(user.focusAreas?.[0]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <h2 className="text-lg font-bold">Stats</h2>
        <p className="text-sm text-slate-300 mt-2">
          Primary focus: <span className="font-bold text-amber-300">{primaryFocus}</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Streak</div>
            <div className="text-2xl font-bold mt-1">{user.streak}</div>
          </div>
          <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-bold mt-1">{user.affirmationsCompleted}</div>
          </div>
        </div>
      </div>
    </div>
  );
};