// components/PersonalGreeting.tsx - RETURN PORTAL
import React, { useMemo } from 'react';
import { CycleType, FocusArea, UserProfile } from '../types';
import BreathingOrb from './BreathingOrb';
import { buttonSoundService } from '../services/buttonSoundService';

interface PersonalGreetingProps {
  user: UserProfile;
  onContinue: () => void;
  onChooseNewFocus: () => void;
  theme?: 'light' | 'dark';
}

type FocusAreaLike = FocusArea | string | undefined | null;

const getFocusLabel = (focus: FocusAreaLike): string => {
  if (!focus) return 'General';
  return typeof focus === 'string' ? focus : focus.label || 'General';
};

const getFocusSwahili = (focus: FocusAreaLike): string => {
  if (!focus || typeof focus === 'string') return '';
  return focus.swahili || '';
};

const cycleDays = (cycle: CycleType): number => {
  if (cycle === CycleType.WEEKLY) return 7;
  if (cycle === CycleType.MONTHLY) return 30;
  return 1;
};

const readCycleStartISO = (): string | null =>
  localStorage.getItem('abundance_cycle_start') || null;

const writeCycleStartISO = (iso: string) =>
  localStorage.setItem('abundance_cycle_start', iso);

const daysBetween = (startISO: string, end: Date): number => {
  const start = new Date(startISO);
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

export const PersonalGreeting: React.FC<PersonalGreetingProps> = ({
  user,
  onContinue,
  onChooseNewFocus,
  theme = 'dark',
}) => {
  const displayName = useMemo(() => {
    return (user.preferredName || user.name || 'Friend').trim() || 'Friend';
  }, [user]);

  const firstFocus = useMemo(() => {
    const f = (user.focusAreas?.[0] ?? null) as FocusAreaLike;
    return f;
  }, [user]);

  const focus = useMemo(() => getFocusLabel(firstFocus), [firstFocus]);
  const focusSwahili = useMemo(() => getFocusSwahili(firstFocus), [firstFocus]);

  const totalDays = useMemo(() => cycleDays(user.cyclePreference), [user.cyclePreference]);

  const { dayIndex, remainingDays, complete } = useMemo(() => {
    const now = new Date();
    let startISO = readCycleStartISO();

    if (!startISO) {
      // Temporary bridge until backend stores focus_started_at.
      startISO = user.lastPracticeDate || now.toISOString();
      writeCycleStartISO(startISO);
    }

    const elapsed = daysBetween(startISO, now);
    const day = Math.min(totalDays, elapsed + 1);
    const remaining = Math.max(0, totalDays - (elapsed + 1));
    const isComplete = elapsed + 1 >= totalDays;

    return { dayIndex: day, remainingDays: remaining, complete: isComplete };
  }, [user.lastPracticeDate, totalDays]);

  const handleContinue = () => {
    buttonSoundService.play('click');
    onContinue();
  };

  const handleChooseNew = () => {
    buttonSoundService.play('click');
    onChooseNewFocus();
  };

  const titleCard =
    'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

  const bodyCard =
    'backdrop-blur-md rounded-2xl border border-amber-500/20 p-4 md:p-6 w-full max-w-[280px] shadow-xl bg-slate-900/40';

  const subText = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const mainText = theme === 'light' ? 'text-slate-900' : 'text-slate-100';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="mt-8 md:mt-12 mb-4 md:mb-6">
        <BreathingOrb size={80} breathingSpeed={4000} />
      </div>

      <div className={`${titleCard} mb-4 md:mb-6`}>
        <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
          Welcome Back
        </h1>
      </div>

      <div className={`${bodyCard} mb-6 md:mb-8`}>
        <div className="text-center space-y-2 md:space-y-3">
          <p className="text-sm md:text-base text-amber-400 font-medium tracking-wide">
            Karibu tena.
          </p>

          <p className={`text-xs md:text-sm italic ${subText}`}>
            The Ancestors are proud of your devotion.
          </p>

          <p className={`text-sm md:text-base font-light ${mainText}`}>
            Welcome back, <span className="text-amber-300">{displayName}</span>.
          </p>

          <div className={`pt-2 text-xs md:text-sm ${subText} space-y-1`}>
            <p>
              Your focus is <span className="text-amber-300 font-medium">{focus}</span>
              {focusSwahili ? <span className="text-slate-400"> ({focusSwahili})</span> : null}.
            </p>

            {!complete ? (
              <p>
                Day <span className="text-slate-200">{dayIndex}</span> of{' '}
                <span className="text-slate-200">{totalDays}</span>.{' '}
                <span className="text-slate-400">
                  {remainingDays} day{remainingDays === 1 ? '' : 's'} remaining.
                </span>
              </p>
            ) : (
              <p className="text-slate-300">
                Your cycle is complete. Would you like to continue in this focus, or choose a new one?
              </p>
            )}
          </div>

          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg"
            >
              Continue With This Focus
            </button>

            <button
              type="button"
              onClick={handleChooseNew}
              className="w-full px-4 py-1.5 rounded-lg border border-amber-500/40 text-amber-300 font-medium text-xs md:text-sm tracking-wide hover:bg-amber-500/10 transition-colors shadow-lg"
            >
              Choose A New Focus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
