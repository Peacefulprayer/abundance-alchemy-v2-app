// components/PersonalGreeting.tsx - RETURN PORTAL
import React, { useMemo } from 'react';
import { CycleType, FocusArea, UserProfile } from '../types';
import BreathingOrb from './BreathingOrb';
import { buttonSoundService } from '../services/buttonSoundService';
import {
  SACRED_LAYOUT,
  SACRED_ORB_WRAPPER,
  SACRED_TITLE_CARD,
  SACRED_BODY_CARD,
  SACRED_CARD_GAP,
} from '../styles/sacredCards';

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

const cycleDays = (cycle: CycleType): number => {
  if (cycle === CycleType.WEEKLY) return 7;
  if (cycle === CycleType.MONTHLY) return 30;
  return 1;
};

const cycleStorageKey = (user: UserProfile, focus: string): string => {
  const owner = (user.email || user.name || 'user').trim().toLowerCase().replace(/\s+/g, '_');
  const focusKey = (focus || 'general').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return `abundance_cycle_start:${owner}:${focusKey}`;
};

const readCycleStartISO = (key: string): string | null =>
  localStorage.getItem(key) || null;

const writeCycleStartISO = (key: string, iso: string) =>
  localStorage.setItem(key, iso);

const daysBetween = (startISO: string, end: Date): number => {
  const start = new Date(startISO);
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

export const PersonalGreeting: React.FC<PersonalGreetingProps> = ({
  user,
  onContinue,
  onChooseNewFocus,
}) => {
  const displayName = useMemo(() => {
    return (user.preferredName || user.name || 'Friend').trim() || 'Friend';
  }, [user]);

  const firstFocus = useMemo(() => {
    const f = (user.focusAreas?.[0] ?? null) as FocusAreaLike;
    return f;
  }, [user]);

  const focus = useMemo(() => getFocusLabel(firstFocus), [firstFocus]);
  const cycleKey = useMemo(() => cycleStorageKey(user, focus), [focus, user]);

  const totalDays = useMemo(() => cycleDays(user.cyclePreference), [user.cyclePreference]);

  const { dayIndex, remainingDays, complete } = useMemo(() => {
    const now = new Date();
    let startISO = readCycleStartISO(cycleKey);

    if (!startISO) {
      startISO = user.lastPracticeDate || now.toISOString();
      writeCycleStartISO(cycleKey, startISO);
    }

    const elapsed = daysBetween(startISO, now);
    const day = Math.min(totalDays, elapsed + 1);
    const remaining = Math.max(0, totalDays - (elapsed + 1));
    const isComplete = elapsed + 1 >= totalDays;

    return { dayIndex: day, remainingDays: remaining, complete: isComplete };
  }, [cycleKey, totalDays, user.lastPracticeDate]);

  const handleContinue = () => {
    buttonSoundService.play('click');
    onContinue();
  };

  const handleChooseNew = () => {
    buttonSoundService.play('click');
    onChooseNewFocus();
  };

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

      {/* BODY CARD */}
      <div className={`${SACRED_BODY_CARD} ${SACRED_CARD_GAP}`}>
        <div className="text-center space-y-2 md:space-y-3">
          <p className="text-sm md:text-base font-normal tracking-wide text-white">
            Karibu Tena.
          </p>

          <p className="text-sm md:text-base font-normal tracking-wide text-white">
            Welcome Back
          </p>

          <p className="text-[10px] md:text-sm leading-tight whitespace-nowrap text-white">
            The Ancestors acknowledge your devotion.
          </p>

          <p className="text-sm md:text-base font-normal text-white pt-1">
            {displayName}, your focus is:
          </p>

          <p className="text-sm md:text-base font-normal text-white">
            {focus}.
          </p>

          <div className="pt-2 text-sm md:text-base font-normal text-white space-y-1">
            {!complete ? (
              <p>
                Day {dayIndex} of {totalDays}.{' '}
                <span className="text-white/85">
                  {remainingDays} day{remainingDays === 1 ? '' : 's'} remaining.
                </span>
              </p>
            ) : (
              <>
                <p>You have completed your cycle.</p>
                <p>Continue with this focus,</p>
                <p>or choose a new one?</p>
              </>
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
