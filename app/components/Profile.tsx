import React from 'react';
import type { UserProfile, FocusArea } from '../types';

interface ProfileProps {
  user: UserProfile;
  theme: 'light' | 'dark';
  onBack: () => void;
}

const focusLabel = (focus: FocusArea | undefined): string => {
  if (!focus) return 'General';
  return typeof focus === 'string' ? focus : focus.label;
};

export const Profile: React.FC<ProfileProps> = ({ user, theme, onBack }) => {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200'
      : 'bg-gradient-to-br from-slate-900/75 to-slate-950/75 border-slate-700';
  const itemBg =
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
        <span className={`text-[10px] tracking-[0.22em] uppercase ${subTextColor} opacity-90`}>
          Your Profile
        </span>
      </div>

      <div className={`rounded-2xl border p-5 shadow-lg ${cardBg}`}>
        <h2 className="text-lg font-bold">{user.name || 'Initiate'}</h2>
        <p className={`text-sm mt-1 ${subTextColor}`}>{user.email || 'No email on file'}</p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className={`rounded-xl border p-3 ${itemBg}`}>
            <div className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>Level</div>
            <div className="text-xl font-bold mt-1">{user.level}</div>
          </div>
          <div className={`rounded-xl border p-3 ${itemBg}`}>
            <div className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>Streak</div>
            <div className="text-xl font-bold mt-1">{user.streak}</div>
          </div>
          <div className={`rounded-xl border p-3 ${itemBg}`}>
            <div className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>Primary Focus</div>
            <div className="text-sm font-semibold mt-1">{focusLabel(user.focusAreas?.[0])}</div>
          </div>
          <div className={`rounded-xl border p-3 ${itemBg}`}>
            <div className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>Completed</div>
            <div className="text-xl font-bold mt-1">{user.affirmationsCompleted}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
