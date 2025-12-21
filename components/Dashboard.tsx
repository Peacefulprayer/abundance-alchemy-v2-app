// src/components/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  UserProfile,
  PracticeType,
  Soundscape,
  GratitudeLog,
  CycleType,
  FocusArea
} from '../types';
import {
  Sun,
  Moon,
  Trophy,
  ExternalLink,
  Settings as SettingsIcon,
  ChevronDown,
  BookOpen,
  Sparkles as SparklesIcon,
  Wind,
  Music,
  LogOut
} from 'lucide-react';
import { AlchemistAvatar } from './AlchemistAvatar';
import { apiService } from '../services/apiService';
import { buttonSoundService } from '../services/buttonSoundService';

/**
 * Intent (this pass):
 * - Allow Layout background images to show through by removing the Dashboard's full-screen background.
 * - Keep the sacred-tech feel via glass surfaces and subtle overlays.
 * - Keep audio UX intentional (buttonSoundService) and keep types stable.
 */

type FocusAreaLike = FocusArea | string | undefined | null;

const getFocusAreaLabel = (focusArea: FocusAreaLike): string => {
  if (!focusArea) return '';
  return typeof focusArea === 'string' ? focusArea : focusArea.label || '';
};

interface DashboardProps {
  user: UserProfile;
  onStartPractice: (type: PracticeType, duration: number) => void;
  onOpenMeditation?: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  userAudioFile?: File | null;
  activeSoundscape?: Soundscape | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onStartPractice,
  onOpenMeditation,
  onOpenSettings,
  onSignOut,
  theme,
  userAudioFile,
  activeSoundscape
}) => {
  const [wisdom, setWisdom] = useState(
    'Your thoughts are the seeds of your reality. Plant them with intention.'
  );
  const [mode, setMode] = useState<PracticeType>(PracticeType.MORNING_IAM);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(20);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');

  const focusLabel = useMemo(() => {
    const first = (user as any)?.focusAreas?.[0] as FocusAreaLike;
    return getFocusAreaLabel(first) || 'General';
  }, [user]);

  useEffect(() => {
    apiService.getWisdom('GENERAL').then((text) => {
      if (text) setWisdom(text);
    });
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    setMode(hour < 18 ? PracticeType.MORNING_IAM : PracticeType.EVENING_ILOVE);
  }, []);

  const getCyclePeriodLabel = (cycle: CycleType): string => {
    switch (cycle) {
      case CycleType.DAILY:
        return 'Daily';
      case CycleType.WEEKLY:
        return 'Weekly';
      case CycleType.MONTHLY:
        return 'Monthly';
      default:
        return 'Current';
    }
  };

  const getDaysRemaining = (cycle: CycleType, lastDate: string | null): number => {
    if (!lastDate) {
      if (cycle === CycleType.MONTHLY) return 30;
      return cycle === CycleType.WEEKLY ? 7 : 1;
    }

    const last = new Date(lastDate);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (cycle === CycleType.MONTHLY) return Math.max(0, 30 - daysPassed);
    if (cycle === CycleType.WEEKLY) return Math.max(0, 7 - daysPassed);
    return 1; // daily
  };

  const getFocusDescription = (focus: string): string => {
    const descriptions: Record<string, string> = {
      Peace:
        'Cultivating inner stillness and releasing anxiety. You are learning to trust the calm within.',
      Purpose:
        'Discovering your unique calling and aligning with your highest path. Your purpose is unfolding.',
      'Love & Relationships':
        'Attracting authentic connections and deepening bonds. You are worthy of profound love.',
      'Wealth & Abundance':
        'Opening channels to prosperity and financial flow. Abundance is your natural state.',
      'Confidence & Inner Strength':
        'Stepping into your inherent strength and authority. You are powerful beyond measure.',
      'Health & Wholeness':
        'Honoring your body as a sacred vessel. Vitality flows through you effortlessly.',
      'Self-Love & Worthiness':
        'Embracing your divine perfection exactly as you are. You are enough, always.'
    };

    return descriptions[focus] || 'You are on a transformative journey of growth and self-discovery.';
  };

  const saveJournalEntry = () => {
    if (!journalEntry.trim()) return;

    buttonSoundService.play();

    const newLog: GratitudeLog = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString(),
      sessionType: PracticeType.MORNING_IAM,
      focusArea: focusLabel,
      text: journalEntry.trim()
    };

    const updatedUser = {
      ...user,
      gratitudeLogs: [...(user.gratitudeLogs || []), newLog]
    };

    localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    setJournalEntry('');
    setShowJournal(false);
    alert('✨ Reflection saved!');
  };

  const greeting = user.lastPracticeDate ? `Welcome back, ${user.name}` : `Greetings, ${user.name}`;

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300';

  const currentTrackName = userAudioFile ? `File: ${userAudioFile.name}` : activeSoundscape?.label || 'Ambient';

  const getAvatarMood = () => {
    if (mode === PracticeType.MORNING_IAM) return 'active';
    return 'calm';
  };

  return (
    <div className="h-full w-full overflow-y-auto pb-24 bg-transparent">
      {/* Optional soft veil to improve readability over busy images */}
      <div
        className={`pointer-events-none fixed inset-0 z-0 ${
          theme === 'light'
            ? 'bg-white/25'
            : 'bg-gradient-to-b from-black/25 via-black/15 to-black/30'
        }`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="relative pt-6 px-6 pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1 z-10">
              <h1 className={`text-2xl font-serif font-bold ${textColor}`}>{greeting}</h1>
              <div className="flex items-center space-x-2">
                <Trophy size={14} className="text-amber-500" />
                <span className={`text-xs font-bold uppercase tracking-wider ${subTextColor}`}>
                  {user.streak} Days
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                buttonSoundService.play();
                onOpenSettings();
              }}
              className={`p-2 rounded-full transition-colors z-10 ${
                theme === 'light'
                  ? 'bg-white/40 hover:bg-white/60 text-slate-700 backdrop-blur-md border border-white/30'
                  : 'bg-slate-900/40 hover:bg-slate-900/55 text-slate-200 backdrop-blur-md border border-white/10'
              }`}
            >
              <SettingsIcon size={20} />
            </button>
          </div>

          {/* Wisdom card */}
          <div
            className={`mt-6 relative p-5 rounded-2xl border backdrop-blur-md shadow-sm overflow-hidden group ${
              theme === 'light'
                ? 'bg-white/55 border-white/40'
                : 'bg-slate-900/35 border-white/10'
            }`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <SparklesIcon size={40} className="text-amber-500" />
            </div>

            <div className="flex items-start space-x-4 relative z-10">
              <div className="flex-shrink-0 mt-1">
                <AlchemistAvatar size="sm" mood={getAvatarMood()} speaking={false} />
              </div>
              <div>
                <p
                  className={`text-sm italic leading-relaxed font-medium ${
                    theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                  }`}
                >
                  “{wisdom}”
                </p>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-2">
                  - The Abundance Alchemist
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-6 mt-2">
          {/* Focus card */}
          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <h3 className={`text-[10px] font-bold uppercase tracking-widest ${subTextColor}`}>
                Your {getCyclePeriodLabel(user.cyclePreference)} Focus
              </h3>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {getDaysRemaining(user.cyclePreference, user.lastPracticeDate)} days left
              </span>
            </div>

            <div
              className={`p-5 rounded-2xl border transition-all backdrop-blur-md ${
                theme === 'light'
                  ? 'bg-white/55 border-white/40 shadow-sm'
                  : 'bg-slate-900/35 border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className={`text-xl font-bold ${textColor}`}>{focusLabel}</h2>
              </div>

              <p className={`text-xs leading-relaxed ${subTextColor}`}>{getFocusDescription(focusLabel)}</p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    buttonSoundService.play();
                    setShowJournal(!showJournal);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all backdrop-blur-md border ${
                    theme === 'light'
                      ? 'bg-white/35 hover:bg-white/45 text-slate-800 border-white/30'
                      : 'bg-slate-900/35 hover:bg-slate-900/45 text-amber-200 border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} />
                    <span className="text-xs font-bold">How is your {focusLabel} journey going?</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${showJournal ? 'rotate-180' : ''}`}
                  />
                </button>

                {showJournal && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 space-y-3">
                    <textarea
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      placeholder={`Reflect on your ${focusLabel} practice...`}
                      className={`w-full p-3 rounded-lg text-sm resize-none border backdrop-blur-md ${
                        theme === 'light'
                          ? 'bg-white/60 border-white/40 text-slate-900 placeholder-slate-500'
                          : 'bg-slate-950/40 border-white/10 text-slate-100 placeholder-slate-400'
                      } focus:ring-2 focus:ring-amber-500 outline-none`}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={saveJournalEntry}
                        className="bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Save Reflection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Practice mode toggle */}
          <div className="space-y-4">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest ${subTextColor} px-1`}>
              Choose Your Practice
            </h3>

            <div
              className={`relative p-1 rounded-full flex backdrop-blur-md border ${
                theme === 'light'
                  ? 'bg-white/45 border-white/35'
                  : 'bg-slate-900/35 border-white/10'
              }`}
            >
              <button
                onClick={() => {
                  buttonSoundService.play();
                  setMode(PracticeType.MORNING_IAM);
                }}
                className={`flex-1 py-3 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                  mode === PracticeType.MORNING_IAM
                    ? theme === 'light'
                      ? 'text-amber-900'
                      : 'text-amber-100'
                    : theme === 'light'
                      ? 'text-slate-500'
                      : 'text-slate-400'
                }`}
              >
                <Sun size={16} className="mr-2" />
                <span className="text-xs font-bold tracking-wide">I Am</span>
              </button>

              <button
                onClick={() => {
                  buttonSoundService.play();
                  setMode(PracticeType.EVENING_ILOVE);
                }}
                className={`flex-1 py-3 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                  mode === PracticeType.EVENING_ILOVE
                    ? theme === 'light'
                      ? 'text-indigo-900'
                      : 'text-indigo-100'
                    : theme === 'light'
                      ? 'text-slate-500'
                      : 'text-slate-400'
                }`}
              >
                <Moon size={16} className="mr-2" />
                <span className="text-xs font-bold tracking-wide">I Love</span>
              </button>

              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-500 ease-out ${
                  mode === PracticeType.MORNING_IAM
                    ? 'left-1 bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'left-[calc(50%+4px)] bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}
              />
            </div>

            <div
              className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-700 ${
                mode === PracticeType.MORNING_IAM
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-800 shadow-lg shadow-purple-500/20'
              }`}
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {mode === PracticeType.MORNING_IAM ? 'Begin I Am Practice' : 'Begin I Love Practice'}
                </h2>
                <p className="text-white/80 text-xs mb-6 max-w-[260px] leading-relaxed">
                  {mode === PracticeType.MORNING_IAM
                    ? 'Align your vibration with your highest self through powerful affirmations.'
                    : 'Release the day and return to love through gratitude and forgiveness.'}
                </p>

                {!showCustomTime ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 5, 15].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          buttonSoundService.play();
                          onStartPractice(mode, dur);
                        }}
                        className={`h-20 rounded-xl backdrop-blur-md border transition-all flex flex-col items-center justify-center space-y-1 group shadow-md ${
                          theme === 'light'
                            ? 'bg-white/55 hover:bg-white/65 border-white/40'
                            : 'bg-slate-900/35 hover:bg-slate-900/45 border-white/10'
                        } hover:scale-105`}
                      >
                        <span className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          {dur}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                          MIN
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-4 text-white">
                      <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                      <span className="text-xl font-bold text-amber-400">
                        {customTime}{' '}
                        <span className="text-xs text-white/60 font-normal">MIN</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={customTime}
                      onChange={(e) => setCustomTime(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-4"
                    />

                    <button
                      onClick={() => {
                        buttonSoundService.play();
                        onStartPractice(mode, customTime);
                      }}
                      className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors"
                    >
                      Start {customTime} Min Session
                    </button>

                    <button
                      onClick={() => {
                        buttonSoundService.play();
                        setShowCustomTime(false);
                      }}
                      className={`w-full text-center text-xs mt-3 opacity-70 hover:opacity-100 ${subTextColor}`}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {!showCustomTime && (
                  <button
                    onClick={() => {
                      buttonSoundService.play();
                      setShowCustomTime(true);
                    }}
                    className="w-full text-center text-xs opacity-80 hover:opacity-100 transition-opacity px-4 leading-relaxed"
                  >
                    <span className="block mt-4 text-[10px] font-bold uppercase tracking-widest text-white/70">
                      Prefer a longer experience?
                    </span>
                    <span className="block text-[10px] text-white/50">Click here to choose a custom time.</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meditation card */}
          {onOpenMeditation && (
            <div className="p-1 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/10">
              <div className={`rounded-xl p-4 flex items-center justify-between ${theme === 'light' ? 'bg-white/70 backdrop-blur-md' : 'bg-slate-950/35 backdrop-blur-md'}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Wind size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${textColor}`}>Meditation Practice</h3>
                    <p className={`text-[10px] ${subTextColor}`}>Guided Stillness: choose duration and soundscape</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    buttonSoundService.play();
                    onOpenMeditation();
                  }}
                  className={`py-2 rounded-lg font-bold text-sm transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  style={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}
                >
                  Open
                </button>
              </div>
            </div>
          )}

          {/* Now Playing */}
          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <Music size={12} className="text-amber-500" />
              <span>Now Playing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium truncate max-w-[150px] ${textColor}`}>{currentTrackName}</span>
              <button
                onClick={() => {
                  buttonSoundService.play();
                  onOpenSettings();
                }}
                className="text-[10px] font-bold text-amber-500 hover:underline"
              >
                CHANGE
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-4 pb-2 border-t border-white/10">
            <p className={`text-[10px] font-medium opacity-60 ${subTextColor}`}>Based on the book "I Am Practice" by</p>
            <p className={`text-xs font-serif font-bold ${textColor}`}>Michael Soaries</p>

            <a
              href="https://abundantthought.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[10px] text-amber-500 hover:text-amber-400 font-bold tracking-wider uppercase"
            >
              <span>Visit AbundantThought.com</span>
              <ExternalLink size={10} />
            </a>

            <div className="pt-4">
              <button
                onClick={() => {
                  buttonSoundService.play();
                  onSignOut();
                }}
                className="inline-flex items-center space-x-1 text-red-400 hover:text-red-500 text-xs font-medium"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
