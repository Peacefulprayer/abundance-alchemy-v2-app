// src/components/Onboarding.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, CycleType } from '../types';
import { ChevronRight, Sparkles } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';

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
};

const FOCUS_AREAS: FocusChoice[] = [
  {
    id: 'peace',
    label: 'Peace',
    swahili: 'Amani',
    icon: '☮️',
    explanation:
      'Used for both inner peace and societal peace. Example: “Nina amani moyoni.” (I have peace in my heart).',
    swAffirmation: 'Nina amani moyoni.'
  },
  {
    id: 'purpose',
    label: 'Purpose',
    swahili: 'Kusudi',
    icon: '🎯',
    explanation:
      'Kusudi means intention or purpose — the inner “why” that guides your steps.',
    swAffirmation: 'Nina kusudi wazi na thabiti.'
  },
  {
    id: 'love',
    label: 'Love & Relationships',
    swahili: 'Upendo na Mahusiano',
    icon: '💖',
    explanation:
      'Upendo = love (deep affection); mahusiano = relationships (between people).',
    swAffirmation: 'Nina upendo na mahusiano yenye afya.'
  },
  {
    id: 'wealth',
    label: 'Wealth & Abundance',
    swahili: 'Utajiri na Wingi',
    icon: '💰',
    explanation:
      'Utajiri means wealth/riches; wingi means plenty/abundance — used spiritually and materially.',
    swAffirmation: 'Utajiri na wingi vinaflow kwangu.'
  },
  {
    id: 'confidence',
    label: 'Confidence & Inner Strength',
    swahili: 'Kujiamini na Nguvu ya Ndani',
    icon: '🔥',
    explanation:
      'Kujiamini = self-confidence; nguvu ya ndani = inner strength/power.',
    swAffirmation: 'Ninajiamini; nina nguvu ya ndani.'
  },
  {
    id: 'health',
    label: 'Health & Wholeness',
    swahili: 'Afya na Ukamilifu',
    icon: '🌿',
    explanation:
      'Afya = health; ukamilifu = completeness/wholeness — balance in body, mind, and spirit.',
    swAffirmation: 'Nina afya na ukamilifu.'
  },
  {
    id: 'selflove',
    label: 'Self-Love & Worthiness',
    swahili: 'Kujipenda na Ustahili',
    icon: '🪞',
    explanation:
      'Kujipenda = self-love; ustahili = worthiness/deserving.',
    swAffirmation: 'Najipenda; ninastahili mema.'
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName || '');
  const [preferredName, setPreferredName] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string>('');
  const [cycleType, setCycleType] = useState<CycleType>(CycleType.DAILY);

  useEffect(() => {
    if (initialName && !name) setName(initialName);
  }, [initialName]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedFocusObj = useMemo(
    () => FOCUS_AREAS.find((f) => f.id === selectedFocus) || null,
    [selectedFocus]
  );

  const selectedFocusLabel = selectedFocusObj?.label || '';

  const next = () => {
    buttonSoundService.play();
    setStep((s) => Math.min(5, s + 1));
  };

  const back = () => {
    buttonSoundService.play();
    setStep((s) => Math.max(1, s - 1));
  };

  const complete = () => {
    buttonSoundService.play();

    // IMPORTANT: match types.ts exactly:
    // - focusAreas: string[]
    // - cyclePreference: CycleType
    // - NO preferredName field in UserProfile (in your current types.ts)
    const profile: UserProfile = {
      name: (preferredName || name).trim(),          // keeps your “preferred name” behavior without changing types
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
    <div className="h-full flex flex-col p-6 max-w-md mx-auto text-slate-100 pb-24 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-amber-400" size={18} />
          <h1 className="text-xl font-serif font-bold">Welcome</h1>
        </div>
        <div className="text-xs text-slate-400">Step {step} / 5</div>
      </div>

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2">What should we call you?</h2>
            <p className="text-xs text-slate-400 mb-4">
              This is the name that follows you through the app experience.
              If <span className="text-amber-400 font-bold">{name || 'your name'}</span> is fine, click Next.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={next}
                disabled={!name.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preferred Name */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2">Preferred name</h2>
            <p className="text-xs text-slate-400 mb-4">
              Optional. Leave blank to use <span className="text-amber-400 font-bold">{name}</span>.
            </p>
            <input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder={`e.g., ${name}`}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={back}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold"
              >
                Back
              </button>
              <button
                onClick={next}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Focus selection (English + Swahili only) */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-1">Choose your focus</h2>
            <p className="text-xs text-slate-400 mb-4">Pick the area you want to strengthen first.</p>

            <div className="grid grid-cols-1 gap-2">
              {FOCUS_AREAS.map((focus) => {
                const active = selectedFocus === focus.id;
                return (
                  <button
                    key={focus.id}
                    onClick={() => {
                      buttonSoundService.play();
                      setSelectedFocus(focus.id);
                    }}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      active
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-lg leading-none mt-0.5">{focus.icon}</div>
                        <div>
                          <div className="font-bold text-sm">{focus.label}</div>
                          <div className="text-xs text-amber-400 font-bold">{focus.swahili}</div>
                        </div>
                      </div>
                      <div
                        className={`mt-1 w-4 h-4 rounded-full border ${
                          active ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={back}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!selectedFocus}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Focus explanation + Swahili affirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-1">
              {selectedFocusObj?.label}{' '}
              <span className="text-amber-400 font-bold">
                {selectedFocusObj ? `(${selectedFocusObj.swahili})` : ''}
              </span>
            </h2>

            <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-200 leading-relaxed">{selectedFocusObj?.explanation}</p>

              {selectedFocusObj?.swAffirmation && (
                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    Bonus affirmation (Swahili)
                  </div>
                  <div className="mt-1 text-sm font-bold text-amber-300">
                    “{selectedFocusObj.swAffirmation}”
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={back}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold"
              >
                Back
              </button>
              <button
                onClick={next}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Cycle Type */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2">How often do you want to practice?</h2>
            <p className="text-xs text-slate-400 mb-4">You can change this later.</p>

            <div className="space-y-2">
              {[
                { v: CycleType.DAILY, label: 'Daily', sub: 'A steady rhythm every day.' },
                { v: CycleType.WEEKLY, label: 'Weekly', sub: 'A gentle pace each week.' }
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
                        <div className="text-xs text-slate-400">{opt.sub}</div>
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

            <div className="mt-4 flex justify-between">
              <button
                onClick={back}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold"
              >
                Back
              </button>
              <button
                onClick={complete}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};