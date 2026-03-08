// src/components/Onboarding.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, CycleType } from '../types';
import { ChevronRight, Sparkles } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';
import { SacredBackground } from './SacredBackground';
import {
  SACRED_LAYOUT,
  SACRED_TITLE_CARD,
  SACRED_BODY_CARD,
  SACRED_INNER_WIDTH,
} from '../styles/sacredCards';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialName?: string;
}

type FocusChoice = {
  id: string;
  label: string;        // English
  swahili: string;      // Swahili term
  icon: string;
  explanation: string;  // shown on the next screen
  swAffirmation: string; // bonus affirmation (Swahili)
  swAffirmationEn: string; // English translation
};

const FOCUS_AREAS: FocusChoice[] = [
  {
    id: 'peace',
    label: 'Peace',
    swahili: 'Amani',
    icon: '☮️',
    explanation:
      'Used for both inner peace and societal peace. Example: “Nina amani moyoni.” (I have peace in my heart).',
    swAffirmation: 'Nina amani moyoni.',
    swAffirmationEn: 'I have peace in my heart.'
  },
  {
    id: 'purpose',
    label: 'Purpose',
    swahili: 'Kusudi',
    icon: '🎯',
    explanation:
      'Kusudi means intention or purpose — the inner “why” that guides your steps.',
    swAffirmation: 'Nina kusudi wazi na thabiti.',
    swAffirmationEn: 'I have clear and steady purpose.'
  },
  {
    id: 'love',
    label: 'Love & Relationships',
    swahili: 'Upendo na Mahusiano',
    icon: '💖',
    explanation:
      'Upendo = love (deep affection); mahusiano = relationships (between people).',
    swAffirmation: 'Nina upendo na mahusiano yenye afya.',
    swAffirmationEn: 'I have love and healthy relationships.'
  },
  {
    id: 'wealth',
    label: 'Wealth & Abundance',
    swahili: 'Utajiri na Wingi',
    icon: '💰',
    explanation:
      'Utajiri means wealth/riches; wingi means plenty/abundance — used spiritually and materially.',
    swAffirmation: 'Utajiri na wingi vinaflow kwangu.',
    swAffirmationEn: 'Wealth and abundance flow to me.'
  },
  {
    id: 'confidence',
    label: 'Confidence & Inner Strength',
    swahili: 'Kujiamini na Nguvu ya Ndani',
    icon: '🔥',
    explanation:
      'Kujiamini = self-confidence; nguvu ya ndani = inner strength/power.',
    swAffirmation: 'Ninajiamini; nina nguvu ya ndani.',
    swAffirmationEn: 'I am confident; I have inner strength.'
  },
  {
    id: 'health',
    label: 'Health & Wholeness',
    swahili: 'Afya na Ukamilifu',
    icon: '🌿',
    explanation:
      'Afya = health; ukamilifu = completeness/wholeness — balance in body, mind, and spirit.',
    swAffirmation: 'Nina afya na ukamilifu.',
    swAffirmationEn: 'I have health and wholeness.'
  },
  {
    id: 'selflove',
    label: 'Self-Love & Worthiness',
    swahili: 'Kujipenda na Ustahili',
    icon: '🪞',
    explanation:
      'Kujipenda = self-love; ustahili = worthiness/deserving.',
    swAffirmation: 'Najipenda; ninastahili mema.',
    swAffirmationEn: 'I love myself; I deserve good things.'
  }
];


export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName || '');
  const [selectedFocus, setSelectedFocus] = useState<string>('');
  const [cycleType, setCycleType] = useState<CycleType>(CycleType.DAILY);
  const visibleStepOrder = [1, 3, 4, 5];

  useEffect(() => {
    if (initialName && !name) setName(initialName);
  }, [initialName]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedFocusObj = useMemo(
    () => FOCUS_AREAS.find((f) => f.id === selectedFocus) || null,
    [selectedFocus]
  );

  const selectedFocusLabel = selectedFocusObj?.label || '';
  const displayName = name.trim() || '___';
  const visibleStep = Math.max(1, visibleStepOrder.indexOf(step) + 1);
  const totalVisibleSteps = visibleStepOrder.length;

  const next = () => {
    buttonSoundService.play();
    setStep((s) => {
      if (s === 1) return 3;
      if (s === 3) return 4;
      if (s === 4) return 5;
      return 5;
    });
  };

  const back = () => {
    buttonSoundService.play();
    setStep((s) => {
      if (s === 5) return 4;
      if (s === 4) return 3;
      if (s === 3) return 1;
      return 1;
    });
  };

  const complete = () => {
    buttonSoundService.play();

    // IMPORTANT: match types.ts exactly:
    // - focusAreas: string[]
    // - cyclePreference: CycleType
    // - NO preferredName field in UserProfile (in your current types.ts)
    const profile: UserProfile = {
      name: name.trim(),
      focusAreas: [selectedFocusLabel || 'General'], // string[]
      cyclePreference: cycleType,
      streak: 0,
      level: 1,
      affirmationsCompleted: 0,
      lastPracticeDate: null,
      customAffirmations: [],
      gratitudeLogs: []
    };

    onComplete(profile);
  };

  return (
    <SacredBackground theme="dark" backgroundType="ONBOARDING" fallbackBackgroundType="AUTH">
    <div className={SACRED_LAYOUT}>
      <BreathingOrb size={80} breathingSpeed={4000} />

      <div className={SACRED_TITLE_CARD}>
        <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
          Abundance Alchemy
        </h1>
      </div>

      <div className={SACRED_BODY_CARD}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-amber-400" size={16} />
            <h2 className="text-sm md:text-base font-bold text-amber-400">Welcome</h2>
          </div>
          <div className="text-[10px] text-slate-300">Step {visibleStep} / {totalVisibleSteps}</div>
        </div>

        <div className="space-y-4 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1 text-slate-100">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base md:text-lg font-bold">
                  We welcome you {displayName}.
                </h3>
                <p className="text-xs text-slate-200">It has been spoken. So it is, Ase.</p>
              </div>
              <p className="text-xs text-slate-200">
                This is the name that follows you through the app experience.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={next}
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-black font-medium text-xs md:text-sm tracking-wide shadow-lg flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Focus selection (English + Swahili only) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs md:text-sm font-medium mb-1">
                  Name chosen: {displayName}. Select your practice focus.
                </h3>
                <p className="text-xs text-slate-200">This will add strength to the work.</p>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {FOCUS_AREAS.map((focus) => {
                  const active = selectedFocus === focus.id;
                  return (
                    <button
                      key={focus.id}
                      onClick={() => {
                        buttonSoundService.play();
                        setSelectedFocus(focus.id);
                      }}
                      className={`w-full text-left rounded-xl border px-3 py-2 transition-all ${
                        active
                          ? 'bg-amber-500/10 border-amber-500/40'
                          : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm leading-none">{focus.icon}</div>
                          <div>
                            <div className="text-sm font-normal">{focus.label}</div>
                            <div className="text-xs text-amber-400">{focus.swahili}</div>
                          </div>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${
                            active ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={back}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold text-xs md:text-sm"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={!selectedFocus}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-black font-medium text-xs md:text-sm tracking-wide shadow-lg flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Focus explanation + Swahili affirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-bold">
                {selectedFocusObj?.label}{' '}
                <span className="text-amber-400 font-bold">
                  {selectedFocusObj ? `(${selectedFocusObj.swahili})` : ''}
                </span>
              </h3>
              <p className="text-xs text-slate-200">We now hold your focus in our vision.</p>

              <div className="rounded-2xl border border-amber-500/20 bg-slate-900/40 p-4">
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {selectedFocusObj?.explanation}
                </p>

                {selectedFocusObj?.swAffirmation && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20">
                    <div className="mt-1 text-sm font-bold text-amber-300">
                      “{selectedFocusObj.swAffirmation}”
                    </div>
                    {selectedFocusObj.swAffirmationEn && (
                      <div className="mt-1 text-xs text-slate-200">
                        “{selectedFocusObj.swAffirmationEn}”
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={back}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold text-xs md:text-sm"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide shadow-lg flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Cycle Type */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base md:text-lg font-normal mb-1">Choose your practice period</h3>
                <p className="text-xs text-slate-200">You can change this later.</p>
              </div>

              <div className="space-y-2">
                {[
                  { v: CycleType.DAILY, label: 'Daily', sub: 'A steady rhythm every day.' },
                  { v: CycleType.WEEKLY, label: 'Weekly', sub: 'A gentle pace each week.' },
                  { v: CycleType.MONTHLY, label: 'Monthly', sub: 'A spacious rhythm each month.' }
                ].map((opt) => {
                  const active = cycleType === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={() => {
                        buttonSoundService.play();
                        setCycleType(opt.v);
                      }}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        active
                          ? 'bg-indigo-500/10 border-indigo-400/40'
                          : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-300">{opt.sub}</div>
                        </div>
                        <div
                          className={`mt-1 w-4 h-4 rounded-full border ${
                            active ? 'border-indigo-400 bg-indigo-400' : 'border-slate-500'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={back}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold text-xs md:text-sm"
                >
                  Back
                </button>
                <button
                  onClick={complete}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 font-bold text-xs md:text-sm"
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${SACRED_INNER_WIDTH} flex justify-center space-x-2`}>
        {Array.from({ length: totalVisibleSteps }).map((_, i) => {
          const index = i + 1;
          const isActive = index === visibleStep;
          const isCompleted = index < visibleStep;
          return (
            <div
              key={index}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                isActive ? 'w-8 bg-amber-500' : isCompleted ? 'w-4 bg-amber-500/60' : 'w-4 bg-slate-500/40',
              ].join(' ')}
            />
          );
        })}
      </div>
    </div>
    </SacredBackground>
  );
};
