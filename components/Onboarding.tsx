// src/components/Onboarding.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, CycleType } from '../types';
import { ChevronRight, Sparkles } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialName?: string;
}

const FOCUS_AREAS = [
  { id: 'peace', label: 'Peace', icon: '☮️' },
  { id: 'purpose', label: 'Purpose', icon: '🎯' },
  { id: 'love', label: 'Love & Relationship', icon: '💖' },
  { id: 'wealth', label: 'Wealth & Abundance', icon: '💰' },
  { id: 'confidence', label: 'Confidence & Inner strength', icon: '⚡' },
  { id: 'health', label: 'Health & Wholeness', icon: '🌱' },
  { id: 'selflove', label: 'Self-Love & Worthiness', icon: '✨' },
];

const FOCUS_WISDOM: Record<string, string> = {
  Peace: 'In the stillness of peace, all chaos dissolves. Your journey to inner calm begins now.',
  Purpose: 'Your unique light is needed in this world. Step boldly onto the path of your destiny.',
  'Love & Relationship':
    'Love is the fundamental frequency of the universe. Open your heart to receive and give freely.',
  'Wealth & Abundance':
    'The universe is infinitely abundant. Align your vibration to receive the prosperity that is your birthright.',
  'Confidence & Inner strength': 'True power comes from within. Stand tall in the truth of who you are.',
  'Health & Wholeness': 'Your body is a sacred vessel. Honor it with gratitude and witness its natural vitality.',
  'Self-Love & Worthiness': 'You are worthy simply because you exist. Embrace your divine perfection.',
};

const CYCLES = [
  { value: CycleType.DAILY, label: 'Daily', description: 'New focus each day' },
  { value: CycleType.WEEKLY, label: 'Weekly', description: 'Same focus for 7 days' },
  { value: CycleType.MONTHLY, label: 'Monthly', description: 'Deep dive for 30 days' },
];

function readNameFromStorage(): string {
  const keys = [
    'aa_register_name',
    'abundance_register_name',
    'abundance_pending_name',
    'register_name',
    'pending_name',
    'auth_register_name',
    'aa_onboarding_name',
  ];
  try {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v && v.trim()) return v.trim();
    }
  } catch {}
  return '';
}

type FocusChoice = { id: string; label: string };

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName = '' }) => {
  const seededName = useMemo(() => {
    const fromProp = (initialName || '').trim();
    if (fromProp) return fromProp;
    return readNameFromStorage();
  }, [initialName]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState(seededName);
  const [spiritualName, setSpiritualName] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<FocusChoice | null>(null);
  const [cycle, setCycle] = useState<CycleType>(CycleType.WEEKLY);

  useEffect(() => {
    try {
      if (name && name.trim()) localStorage.setItem('aa_onboarding_name', name.trim());
      if (spiritualName && spiritualName.trim()) localStorage.setItem('aa_onboarding_spiritual_name', spiritualName.trim());
    } catch {}
  }, [name, spiritualName]);

  const handleComplete = () => {
    buttonSoundService.play('confirm');
    
    const displayName = (spiritualName || '').trim() || name.trim();

    // IMPORTANT: focusAreas must be objects with label/value (prevents `.label` runtime crashes elsewhere)
    const focusAreas = selectedFocus
      ? ([{ label: selectedFocus.label, value: selectedFocus.id }] as any)
      : ([] as any);

    const profile: UserProfile = {
      name: displayName,
      focusAreas,
      cyclePreference: cycle,
      streak: 0,
      lastPracticeDate: null,
      affirmationsCompleted: 0,
      level: 1,
      customAffirmations: [],
      gratitudeLogs: [],
    };

    try {
      localStorage.setItem('aa_onboarding_name', name.trim());
    } catch {}

    onComplete(profile);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return !!selectedFocus;
    if (step === 4) return true;
    if (step === 5) return true;
    return false;
  };

  const selectedFocusLabel = selectedFocus?.label || '';

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 max-w-md mx-auto text-slate-100">
      <div className="w-full mb-4">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 mx-0.5 rounded-full transition-all ${s <= step ? 'bg-amber-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">Step {step} of 5</p>
      </div>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-start py-2">
        {/* STEP 1: NAME */}
        {step === 1 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 my-auto">
            <div className="text-center space-y-3">
              <Sparkles size={48} className="mx-auto text-amber-500" />
              <h1 className="text-2xl font-serif font-bold">Welcome Abundance Alchemist.</h1>
              <p className="text-slate-400 text-sm">What would you prefer to be called?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                />
                {!!name.trim() && (
                  <p className="text-[11px] text-slate-400 italic mt-2">
                    If <span className="text-slate-200 font-semibold">{name.trim()}</span> is fine, click Next.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">Your Spiritual Name</label>
                <input
                  type="text"
                  value={spiritualName}
                  onChange={(e) => setSpiritualName(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 italic mt-2">
                  If left blank, we'll use your name above.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 italic">When you are ready, click Next.</p>
          </div>
        )}

        {/* STEP 2: INTRO */}
        {step === 2 && (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 my-auto text-center px-4">
            <h1 className="text-amber-400 text-sm font-bold uppercase tracking-widest leading-loose">
              Where The Attention Goes,
              <br />
              The Energy Flows
            </h1>
            <h2 className="text-2xl font-serif font-bold text-white">Choose Your Focus</h2>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
            <p className="text-slate-300 text-sm leading-relaxed">
              While there may seem to be many issues pressing, it is suggested to have your attention focus on{' '}
              <strong className="text-white">one area</strong>, for a maximum boost to your Alchemical efforts.
            </p>
            <p className="text-xs text-slate-500 italic">When you are ready, click Next.</p>
          </div>
        )}

        {/* STEP 3: SELECTION */}
        {step === 3 && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2 mb-2">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                Select One Area for Focused Transformation:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-4">
              {FOCUS_AREAS.map((area) => {
                const isSelected = selectedFocus?.id === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      buttonSoundService.play('click');
                      setSelectedFocus({ id: area.id, label: area.label });
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center h-24 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/20 shadow-lg scale-[1.02]'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{area.icon}</div>
                    <p className="text-xs font-bold leading-tight">{area.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-slate-400 italic">Make your selection, then click Next.</p>
          </div>
        )}

        {/* STEP 4: WISDOM */}
        {step === 4 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 my-auto text-center px-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
              <Sparkles size={32} className="text-white" />
            </div>

            <h2 className="text-xl font-bold text-amber-400 uppercase tracking-widest text-xs">You Have Chosen:</h2>
            <h1 className="text-3xl font-serif font-bold text-white">{selectedFocusLabel}</h1>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mt-4">
              <p className="text-slate-200 text-base italic font-serif leading-relaxed">
                "
                {FOCUS_WISDOM[selectedFocusLabel] ||
                  'Your focus directs your power. Let this intention guide your transformation.'}
                "
              </p>
            </div>
            <p className="text-xs text-slate-500 italic mt-4">Absorb this wisdom, then click Next.</p>
          </div>
        )}

        {/* STEP 5: CYCLE */}
        {step === 5 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 my-auto">
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-serif font-bold">Choose Your Cycle</h1>
              <p className="text-slate-400 text-sm">
                How long do you want to focus on{' '}
                <span className="text-amber-400 font-semibold">{selectedFocusLabel}</span>?
              </p>
            </div>

            <div className="space-y-3">
              {CYCLES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    buttonSoundService.play('click');
                    setCycle(c.value);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    cycle === c.value
                      ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <p className="text-lg font-bold">{c.label}</p>
                    <p className="text-sm text-slate-400">{c.description}</p>
                  </div>
                  {cycle === c.value && (
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <ChevronRight size={16} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full mt-auto space-y-3 pt-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm -mx-8 px-8 pb-0">
        {step < 5 ? (
          <button
            type="button"
            onClick={() => {
              buttonSoundService.play('click');
              setStep(step + 1);
            }}
            disabled={!canProceed()}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canProceed()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={20} />
            <span>Begin Your Journey</span>
          </button>
        )}

        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              buttonSoundService.play('back');
              setStep(step - 1);
            }}
            className="w-full text-slate-400 hover:text-slate-300 text-sm transition-colors text-center py-2"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};