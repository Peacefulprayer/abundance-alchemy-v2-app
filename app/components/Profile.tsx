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
  const titlePill =
    'inline-flex items-center rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-sm';
  const sectionFrame =
    theme === 'light'
      ? 'rounded-[28px] border border-amber-200/60 bg-white/78 p-3 shadow-sm'
      : 'rounded-[28px] border border-amber-500/18 bg-slate-950/45 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)]';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-amber-200/60'
      : 'bg-gradient-to-br from-slate-900/70 to-slate-950/75 border-amber-500/20';
  const itemBg =
    theme === 'light'
      ? 'bg-white/92 border-amber-200/55'
      : 'bg-slate-950/82 border-amber-500/15';
  const pageShell = 'mx-auto w-full max-w-[440px] space-y-5 pb-24';
  const sectionKicker =
    theme === 'light'
      ? 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-700'
      : 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400/90';

  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 ${textColor}`}>
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
              theme === 'light'
                ? 'border-amber-200/70 bg-white/85 text-slate-700 hover:bg-white'
                : 'border-amber-500/20 bg-slate-950/70 text-slate-100 hover:bg-slate-950'
            }`}
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <span className={titlePill}>Your Profile</span>
        </div>

        <div className={sectionFrame}>
          <div className={`rounded-[24px] border p-5 shadow-lg ${cardBg}`}>
            <p className={sectionKicker}>Sacred Identity</p>
            <h2 className="mt-3 text-2xl font-serif font-semibold">{user.name || 'Initiate'}</h2>
            <p className={`mt-2 text-sm ${subTextColor}`}>{user.email || 'No email on file'}</p>
            <p className={`mt-4 text-sm leading-relaxed ${subTextColor}`}>
              This profile reflects the identity and intention you are carrying through your practice journey.
            </p>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h3 className={titlePill}>Journey Details</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className={`rounded-[24px] border p-4 shadow-sm ${itemBg}`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Level</div>
              <div className="mt-3 text-2xl font-semibold">{user.level}</div>
            </div>
            <div className={`rounded-[24px] border p-4 shadow-sm ${itemBg}`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Streak</div>
              <div className="mt-3 text-2xl font-semibold">{user.streak}</div>
            </div>
            <div className={`rounded-[24px] border p-4 shadow-sm ${itemBg}`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Primary Focus</div>
              <div className="mt-3 text-sm font-semibold leading-snug">{focusLabel(user.focusAreas?.[0])}</div>
            </div>
            <div className={`rounded-[24px] border p-4 shadow-sm ${itemBg}`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Completed</div>
              <div className="mt-3 text-2xl font-semibold">{user.affirmationsCompleted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
