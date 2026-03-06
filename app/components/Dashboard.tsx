// components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  PracticeType,
  Soundscape,
  GratitudeLog,
  CycleType,
  FocusArea,  // ADD THIS
} from '../types';
import {
  Sun,
  Moon,
  Trophy,
  ExternalLink,
  Book,
  Clock,
  Music,
  LogOut,
  ChevronDown,
  BookOpen,
  Sparkles as SparklesIcon,
  Wind,
  User
} from 'lucide-react';
import { AlchemistAvatar } from './AlchemistAvatar';
import { apiService } from '../services/apiService';
import { playBell } from '../services/audioService';

// Helper to extract string from FocusArea union type
const getFocusAreaLabel = (focusArea: FocusArea | undefined): string => {
  if (!focusArea) return '';
  return typeof focusArea === 'string' ? focusArea : focusArea.label;
};

interface DashboardProps {
  user: UserProfile;
  onStartPractice: (type: PracticeType, duration: number) => void;
  onOpenMeditation?: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  musicOn: boolean;
  ambienceVolume: number;
  onToggleMusic: () => void;
  onVolumeChange: (volume: number) => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  userAudioFile?: File | null;
  activeSoundscape: Soundscape;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onStartPractice,
  onOpenMeditation,
  onOpenSettings,
  onOpenProfile,
  musicOn,
  ambienceVolume,
  onToggleMusic,
  onVolumeChange,
  onSignOut,
  theme,
  userAudioFile,
  activeSoundscape,
}) => {
  const [wisdom, setWisdom] = useState(
    'Your thoughts are the seeds of your reality. Plant them with intention.'
  );
  const [mode, setMode] = useState<PracticeType>(PracticeType.MORNING_IAM);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(20);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalStatus, setJournalStatus] = useState<string>('');

  useEffect(() => {
    apiService.getWisdom('GENERAL').then((text) => {
      if (text) {
        setWisdom(text);
      }
    });
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 18) {
      setMode(PracticeType.MORNING_IAM);
    } else {
      setMode(PracticeType.EVENING_ILOVE);
    }
  }, []);

  const getCyclePeriodLabel = (cycle: CycleType): string => {
    switch (cycle) {
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return 'Current';
    }
  };

  const getDaysRemaining = (cycle: CycleType, lastDate: string | null): number => {
    if (!lastDate)
      return cycle === 'DAILY' ? 1 : cycle === 'WEEKLY' ? 7 : 30;
    const last = new Date(lastDate);
    const now = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (cycle === 'DAILY') return 1;
    if (cycle === 'WEEKLY') return Math.max(0, 7 - daysPassed);
    return Math.max(0, 30 - daysPassed);
  };

  const getFocusDescription = (focus: string): string => {
    const descriptions: Record<string, string> = {
      Peace:
        'Cultivating inner stillness and releasing anxiety. You are learning to trust the calm within.',
      Purpose:
        'Discovering your unique calling and aligning with your highest path. Your purpose is unfolding.',
      'Life Purpose':
        'Discovering your unique calling and aligning with your highest path. Your purpose is unfolding.',
      'Love & Relationships':
        'Attracting authentic connections and deepening bonds. You are worthy of profound love.',
      'Love Relationships':
        'Attracting authentic connections and deepening bonds. You are worthy of profound love.',
      'Wealth & Abundance':
        'Opening channels to prosperity and financial flow. Abundance is your natural state.',
      'Wealth Abundance':
        'Opening channels to prosperity and financial flow. Abundance is your natural state.',
      'Confidence & Inner Strength':
        'Stepping into your inherent strength and authority. You are powerful beyond measure.',
      'Confidence Inner Power':
        'Stepping into your inherent strength and authority. You are powerful beyond measure.',
      'Health & Wholeness':
        'Honoring your body as a sacred vessel. Vitality flows through you effortlessly.',
      'Health Wholeness':
        'Honoring your body as a sacred vessel. Vitality flows through you effortlessly.',
      'Self-Love & Worthiness':
        'Embracing your divine perfection exactly as you are. You are enough, always.',
      'Self-Love Worthiness':
        'Embracing your divine perfection exactly as you are. You are enough, always.',
    };
    return (
      descriptions[focus] ||
      'You are on a transformative journey of growth and self-discovery.'
    );
  };

  const saveJournalEntry = () => {
    if (!journalEntry.trim()) return;
    playBell();
    const newLog: GratitudeLog = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString(),
      sessionType: PracticeType.MORNING_IAM,
      focusArea: getFocusAreaLabel(user.focusAreas[0]) || 'General',
      text: journalEntry,
    };
    const updatedUser = {
      ...user,
      gratitudeLogs: [...user.gratitudeLogs, newLog],
    };
    localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    setJournalEntry('');
    setShowJournal(false);
    setJournalStatus('Reflection saved.');
    window.setTimeout(() => setJournalStatus(''), 2200);
  };

  const greeting = user.lastPracticeDate
    ? `Welcome back, ${user.name}`
    : `Greetings, ${user.name}`;

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const whitePill =
    'inline-flex items-center rounded-full border border-amber-300/45 bg-gradient-to-r from-slate-950/78 to-slate-900/72 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-sm';
  const headerPill =
    'inline-flex items-center rounded-full border border-amber-300/45 bg-gradient-to-r from-slate-950/82 to-slate-900/76 px-3 py-1.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-sm';
  const streakPill =
    'inline-flex items-center gap-2 rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-sm';
  const glassCard =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200 shadow-sm'
      : 'bg-gradient-to-br from-slate-900/55 to-slate-950/65 border-slate-700/50';
  const buttonBg =
    theme === 'light'
      ? 'bg-slate-100 hover:bg-amber-100 border-slate-200'
      : 'bg-slate-800/60 hover:bg-slate-700/60 border-white/5';
  const sectionTitleChip = whitePill;
  const daysLeftChip =
    'inline-flex items-center rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-sm';
  const infoCardBg =
    theme === 'light'
      ? 'rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm'
      : 'rounded-2xl border border-slate-700/60 bg-slate-900/55 p-3 shadow-sm';
  
  const getAvatarMood = () => {
    if (mode === PracticeType.MORNING_IAM) return 'active';
    return 'calm';
  };

  const currentTrackName = userAudioFile
    ? `File: ${userAudioFile.name}`
    : activeSoundscape.label;

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden pb-24">
      {/* Header Section */}
      <div className="relative pt-4 px-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 z-10">
            <div className={headerPill}>
              {greeting}
            </div>
          </div>
          <div className="flex items-center gap-3 z-10">
            <div className={streakPill}>
              <Trophy size={14} className="text-amber-700" />
              <span>
                {user.streak} {user.streak === 1 ? 'Day' : 'Days'} Streak
              </span>
            </div>
            {onOpenProfile ? (
              <button
                onClick={onOpenProfile}
                aria-label="Open profile"
                className={`p-2 rounded-full transition-colors ${
                  theme === 'light'
                    ? 'bg-white/50 hover:bg-white text-slate-600'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <User size={20} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Wisdom card */}
        <div
          className={`mt-4 relative p-4 rounded-2xl border backdrop-blur-md overflow-hidden group ${glassCard}`}
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <SparklesIcon size={40} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-start text-center gap-3 pt-1">
            <div className="flex-shrink-0">
              <AlchemistAvatar size="sm" mood={getAvatarMood()} speaking={false} className="mx-auto" />
            </div>
            <div className="w-full">
              <p
                className={`text-sm italic leading-relaxed font-medium ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                "{wisdom}"
              </p>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-2">
                - The Abundance Alchemist
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* Focus card */}
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <h3 className={sectionTitleChip}>
              Your {getCyclePeriodLabel(user.cyclePreference)} Focus
            </h3>
            <span className={daysLeftChip}>
              {getDaysRemaining(
                user.cyclePreference,
                user.lastPracticeDate
              )}{' '}
              days left
            </span>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${glassCard}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className={`text-lg font-bold ${textColor}`}>
                {getFocusAreaLabel(user.focusAreas[0]) || 'your focus'}
              </h2>
              {/* If you had an icon for focus, it could go here */}
            </div>
            
            <p className={`text-xs leading-relaxed ${subTextColor}`}>
              {getFocusDescription(getFocusAreaLabel(user.focusAreas[0]) || 'focus')}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-700/10">
              <button
                onClick={() => {
                  playBell();
                  setShowJournal(!showJournal);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  theme === 'light'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-amber-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold">
                    How is your {getFocusAreaLabel(user.focusAreas[0]) || 'focus'} journey going?
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${
                    showJournal ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showJournal && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 space-y-3">
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder={`Reflect on your ${getFocusAreaLabel(user.focusAreas[0]) || 'focus'} practice...`}
                    className={`w-full p-3 rounded-lg text-sm resize-none border ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-slate-900/50 border-slate-600 text-slate-100 placeholder-slate-500'
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
              {journalStatus ? (
                <div className="mt-3 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  {journalStatus}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Practice mode toggle */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <h3 className={sectionTitleChip}>
              Choose Your Practice
            </h3>
          </div>

          <div
            className={`relative p-1 rounded-full flex ${
              theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          >
            <button
              onClick={() => {
                playBell();
                setMode(PracticeType.MORNING_IAM);
              }}
              className={`flex-1 py-3 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                mode === PracticeType.MORNING_IAM
                  ? theme === 'light'
                    ? 'text-amber-900'
                    : 'text-amber-100'
                  : 'text-slate-400'
              }`}
            >
              <Sun size={16} className="mr-2" />
              <span className="text-xs font-bold tracking-wide">I Am</span>
            </button>
            <button
              onClick={() => {
                playBell();
                setMode(PracticeType.EVENING_ILOVE);
              }}
              className={`flex-1 py-3 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                mode === PracticeType.EVENING_ILOVE
                  ? theme === 'light'
                    ? 'text-rose-900'
                    : 'text-rose-100'
                  : 'text-slate-400'
              }`}
            >
              <Moon size={16} className="mr-2" />
              <span className="text-xs font-bold tracking-wide">I Love</span>
            </button>

            {/* Sliding background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-500 ease-out ${
                mode === PracticeType.MORNING_IAM
                  ? 'left-1 bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'left-[calc(50%+4px)] bg-gradient-to-r from-rose-500 to-red-600'
              }`}
            />
          </div>

          <div
            className={`rounded-3xl p-4 relative overflow-hidden transition-all duration-700 ${
              mode === PracticeType.MORNING_IAM
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'
                : 'bg-gradient-to-br from-rose-600 to-red-700 shadow-lg shadow-rose-500/20'
            }`}
          >
            {/* Background Texture */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              {mode === PracticeType.MORNING_IAM ? (
                <Sun size={120} className="text-white rotate-12" />
              ) : (
                <Moon size={120} className="text-white -rotate-12" />
              )}
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-1">
                {mode === PracticeType.MORNING_IAM
                  ? 'Begin I Am Practice'
                  : 'Begin I Love Practice'}
              </h2>
              <p className="text-white/80 text-xs mb-4 max-w-[200px] leading-relaxed">
                {mode === PracticeType.MORNING_IAM
                  ? 'Align your vibration with your highest self through powerful affirmations.'
                  : 'Release the day and return to love through gratitude and forgiveness.'}
              </p>

              {/* Duration selection - smaller boxes */}
              {!showCustomTime ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 5, 15].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        playBell();
                        onStartPractice(mode, dur);
                      }}
                      className={`h-20 rounded-xl backdrop-blur-md border transition-all flex flex-col items-center justify-center space-y-1 group shadow-md ${buttonBg} hover:scale-105`}
                    >
                      <span
                        className={`text-xl font-bold ${
                          theme === 'light' ? 'text-slate-800' : 'text-white'
                        }`}
                      >
                        {dur}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-300'
                        }`}
                      >
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
                      playBell();
                      onStartPractice(mode, customTime);
                    }}
                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Start {customTime} Min Session
                  </button>
                  <button
                    onClick={() => {
                      playBell();
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
                    playBell();
                    setShowCustomTime(true);
                  }}
                  className={`w-full text-center text-xs opacity-70 hover:opacity-100 transition-opacity ${subTextColor} px-4 leading-relaxed group`}
                >
                  <span className="block mt-4 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">
                    Prefer A Longer Experience?
                  </span>
                  <span className="block text-[10px] text-white/40">
                    Click Here To Choose a Custom Time For Your Practice.
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Meditation card */}
        {onOpenMeditation && (
          <div
            className={`p-1 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/10`}
          >
            <div className={`rounded-xl p-4 flex items-center justify-between ${theme === 'light' ? 'bg-gradient-to-br from-white/95 to-amber-50/60' : 'bg-gradient-to-br from-slate-900 to-slate-950'}`}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Wind size={20} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${textColor}`}>Meditation Practice</h3>
                  <p className={`text-[10px] ${subTextColor}`}>
                    Guided Stillness: Choose duration and soundscape for silent meditation
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                   playBell();
                   onOpenMeditation(); 
                }}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                  theme === 'light'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
                style={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}
              >
                Open
              </button>
            </div>
          </div>
        )}

        {/* Now Playing */}
        <div className={infoCardBg}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <Music size={12} className="text-amber-500" />
              <span>Now Playing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium truncate max-w-[150px] ${textColor}`}>
                {currentTrackName}
              </span>
              <button
                onClick={() => {
                  playBell();
                  onOpenSettings();
                }}
                className="text-[10px] font-bold text-amber-500 hover:underline"
              >
                CHANGE
              </button>
            </div>
          </div>
        </div>

        {/* Quick Audio Controls */}
        <div className={`${infoCardBg} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music size={14} className="text-amber-500" />
              <span className={`text-xs font-bold uppercase tracking-wider ${subTextColor}`}>
                Music
              </span>
            </div>
            <button
              onClick={() => {
                playBell();
                onToggleMusic();
              }}
              className={`w-10 h-5 rounded-full transition-colors ${
                musicOn ? 'bg-emerald-600' : 'bg-slate-600'
              } relative`}
              aria-label="Toggle music"
            >
              <div
                className={`absolute top-0.5 ${
                  musicOn ? 'right-0.5' : 'left-0.5'
                } w-4 h-4 bg-white rounded-full transition-all`}
              />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor}`}>
                Volume
              </span>
              <span className="text-[10px] text-amber-500 font-bold">
                {ambienceVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ambienceVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full mt-2"
              aria-label="Music volume"
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`${infoCardBg} text-center space-y-2`}>
          <p className={`text-[10px] font-medium opacity-60 ${subTextColor}`}>
            Based on the book "I Am Practice" by
          </p>
          <p className={`text-xs font-serif font-bold ${textColor}`}>
            Michael Soaries
          </p>
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
                playBell();
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
  );
};
