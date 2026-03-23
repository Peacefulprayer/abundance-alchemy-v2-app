import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  Affirmation,
  FocusArea,
  GratitudeLog,
  PracticeSessionConfig,
  PracticeType,
  Soundscape,
} from '../types';
import { playCompletionSound, startAmbience, stopAmbience, updateVolume } from '../services/audioService';
import { getMeditationWisdom } from '../services/geminiService';
import { api } from '../services/api';
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerBackButton,
  innerHeroCard,
  innerInputBg,
  innerSectionFrame,
  innerSectionKicker,
  innerSecondaryButton,
  innerSurfaceCard,
} from '../styles/sacredInnerScreen';

const getFocusAreaLabel = (focusArea: FocusArea | undefined): string => {
  if (!focusArea) return '';
  return typeof focusArea === 'string' ? focusArea : focusArea.label;
};

const normalizeAffirmation = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().toLowerCase();

interface PracticeSessionProps {
  config: PracticeSessionConfig;
  customAffirmations: Affirmation[];
  onComplete: (log?: GratitudeLog) => void;
  onExit: () => void;
  userAudioFile?: File | null;
  theme: 'light' | 'dark';
  soundscape: Soundscape;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  config,
  customAffirmations,
  onComplete,
  onExit,
  userAudioFile,
  theme,
  soundscape,
}) => {
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [fallbackQueue, setFallbackQueue] = useState<string[]>([]);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [meditationWisdom, setMeditationWisdom] = useState('');
  const [isFetchingAffirmation, setIsFetchingAffirmation] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const audioInitialized = useRef(false);
  const isAdvancingRef = useRef(false);
  const recentAffirmationsRef = useRef<string[]>([]);

  const isMeditation = config.type === PracticeType.MEDITATION;
  const isMorning = config.type === PracticeType.MORNING_IAM;

  useEffect(() => {
    if (soundscape) {
      startAmbience(soundscape, 50);
      updateVolume(volume);
      audioInitialized.current = true;
    }

    void loadSessionContent();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSessionEnd();
      return;
    }

    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isRunning]);

  const loadSessionContent = async () => {
    setIsLoadingContent(true);
    recentAffirmationsRef.current = [];

    const focusAreaRaw = config.focusAreas?.[0] || 'General';
    const focusLabel = getFocusAreaLabel(focusAreaRaw as FocusArea) || 'General';

    if (isMeditation) {
      const wisdom = await getMeditationWisdom(focusLabel);
      setMeditationWisdom(wisdom);
      setIsLoadingContent(false);
      return;
    }

    const systemAffs = await api.getSystemAffirmations(config.type).catch(() => []);
    const userAffs = customAffirmations.filter((a) => a.type === config.type);

    let allTexts = [...userAffs.map((a) => a.text), ...systemAffs.map((a) => a.text)];
    if (allTexts.length === 0) {
      allTexts = isMorning
        ? ['I am capable.', 'I am strong.', 'I am worthy.', 'I am creating my reality.']
        : ['I love my life.', 'I love who I am becoming.', 'I love the peace I feel.'];
    }

    for (let i = allTexts.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTexts[i], allTexts[j]] = [allTexts[j], allTexts[i]];
    }

    setFallbackQueue(allTexts);
    setFallbackIndex(0);

    let firstAffirmation: string | null = null;
    for (let i = 0; i < 6; i += 1) {
      const text = await api.getRandomAffirmation(config.type, focusLabel);
      if (text && normalizeAffirmation(text) !== normalizeAffirmation(currentAffirmation)) {
        firstAffirmation = text;
        break;
      }
    }

    const initialAffirmation = firstAffirmation || allTexts[0];
    setCurrentAffirmation(initialAffirmation);
    if (initialAffirmation) {
      recentAffirmationsRef.current = [normalizeAffirmation(initialAffirmation)];
    }
    setIsLoadingContent(false);
  };

  const handleNextAffirmation = async () => {
    if (isMeditation || isLoadingContent || isFetchingAffirmation || isAdvancingRef.current) {
      return;
    }

    isAdvancingRef.current = true;
    setIsFetchingAffirmation(true);
    try {
      const focusAreaRaw = config.focusAreas?.[0] || 'General';
      const focusLabel = getFocusAreaLabel(focusAreaRaw as FocusArea) || 'General';
      const currentNorm = normalizeAffirmation(currentAffirmation);
      const recentNorms = new Set(recentAffirmationsRef.current);

      let nextAffirmation: string | null = null;
      for (let i = 0; i < 6; i += 1) {
        const text = await api.getRandomAffirmation(config.type, focusLabel);
        if (!text) continue;
        const candidateNorm = normalizeAffirmation(text);
        if (candidateNorm !== '' && candidateNorm !== currentNorm && !recentNorms.has(candidateNorm)) {
          nextAffirmation = text;
          break;
        }
      }

      if (nextAffirmation) {
        setCurrentAffirmation(nextAffirmation);
        recentAffirmationsRef.current = [
          ...recentAffirmationsRef.current,
          normalizeAffirmation(nextAffirmation),
        ].slice(-4);
        return;
      }

      if (fallbackQueue.length > 0) {
        const size = fallbackQueue.length;
        let pickedIndex = -1;
        for (let step = 1; step <= size; step += 1) {
          const candidateIndex = (fallbackIndex + step) % size;
          const candidateText = fallbackQueue[candidateIndex];
          const candidateNorm = normalizeAffirmation(candidateText);
          if (candidateNorm !== '' && candidateNorm !== currentNorm && !recentNorms.has(candidateNorm)) {
            pickedIndex = candidateIndex;
            break;
          }
        }
        if (pickedIndex < 0) {
          pickedIndex = (fallbackIndex + 1) % size;
        }
        const pickedText = fallbackQueue[pickedIndex];
        setFallbackIndex(pickedIndex);
        setCurrentAffirmation(pickedText);
        recentAffirmationsRef.current = [
          ...recentAffirmationsRef.current,
          normalizeAffirmation(pickedText),
        ].slice(-4);
      }
    } finally {
      setIsFetchingAffirmation(false);
      isAdvancingRef.current = false;
    }
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    playCompletionSound();
    setShowGratitude(true);
  };

  const handleComplete = () => {
    if (!gratitudeText.trim()) {
      onComplete();
      return;
    }

    const focusAreaValue = config.focusAreas?.[0] || 'General';
    const log: GratitudeLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      sessionType: config.type,
      focusArea: getFocusAreaLabel(focusAreaValue as FocusArea) || 'General',
      text: gratitudeText,
    };
    onComplete(log);
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(config.duration * 60);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    updateVolume(nextMuted ? 0 : volume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(e.target.value);
    setVolume(nextVolume);
    if (isMuted && nextVolume > 0) {
      setIsMuted(false);
    }
    updateVolume(nextVolume);
  };

  const restartMusic = () => {
    stopAmbience();
    setTimeout(() => {
      startAmbience(soundscape, 50);
      updateVolume(volume);
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100;
  const pageShell = INNER_PAGE_SHELL;
  const sectionFrame = innerSectionFrame(theme);
  const heroCard = innerHeroCard(theme);
  const surfaceCard = innerSurfaceCard(theme);
  const backButton = innerBackButton(theme);
  const inputBg = innerInputBg(theme);
  const sectionKicker = innerSectionKicker(theme);
  const secondaryButton = innerSecondaryButton(theme);
  const practiceGlassCard =
    'rounded-[22px] border border-white/12 bg-slate-950/78 p-4 text-white shadow-[0_22px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl';
  const practiceGlassControl =
    'inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 text-white transition-colors hover:bg-white/12';
  const practiceLabel = isMeditation
    ? 'Meditation'
    : isMorning
      ? 'I Am Practice'
      : 'I Love Practice';
  const practiceSubtitle = isMeditation
    ? 'Let the stillness settle around your breath and attention.'
    : isMorning
      ? 'Speak with certainty and let the words reshape your inner state.'
      : 'Move slowly, receive the words, and let gratitude lead the tone.';
  const accent = isMeditation
    ? {
        icon: 'text-emerald-400',
        softBorder:
          theme === 'light'
            ? 'border-emerald-300/60 bg-emerald-100/80 text-emerald-950'
            : 'border-emerald-400/35 bg-emerald-500/12 text-emerald-100',
        stops: ['#34d399', '#10b981'],
      }
    : isMorning
      ? {
          icon: 'text-amber-400',
          softBorder:
            theme === 'light'
              ? 'border-amber-300/60 bg-amber-100/80 text-amber-950'
              : 'border-amber-400/35 bg-amber-500/12 text-amber-100',
          stops: ['#fbbf24', '#f59e0b'],
        }
      : {
          icon: 'text-rose-300',
          softBorder:
            theme === 'light'
              ? 'border-rose-300/60 bg-rose-100/80 text-rose-950'
              : 'border-rose-400/35 bg-rose-500/12 text-rose-100',
          stops: ['#fb7185', '#f43f5e'],
        };
  const progressGradientId = `practice-progress-${config.type.toLowerCase()}`;

  const getInstructionText = () => {
    if (isMeditation) {
      return 'Take 3 slow deep breaths. Release the day and all it carried. Let silence settle over you, then begin the timer when you are ready.';
    }
    if (isMorning) {
      return 'Speak these affirmations out loud and rapidly. Let the vibration of your voice shift your frequency. Tap the text to advance.';
    }
    return 'Bring your awareness to gratitude. Speak slowly and allow each phrase to root itself in your subconscious. Tap to advance when ready.';
  };

  if (showGratitude) {
    return (
      <div className={`h-full w-full overflow-y-auto px-4 pt-4 pb-8 custom-scrollbar ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
        <div className={pageShell}>
          <div className="flex items-center justify-between">
            <div className={backButton}>
              <span>✓</span>
              <span>Complete</span>
            </div>
            <span className={INNER_TITLE_PILL}>{practiceLabel}</span>
          </div>

          <div className={sectionFrame}>
            <div className={`${heroCard} text-center`}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/12">
                <Heart size={28} className="text-amber-400" />
              </div>
              <h1 className="mt-4 text-2xl font-serif font-semibold">Session Complete</h1>
              <p className={`mt-2 text-sm leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                Take a moment to name what this practice opened, steadied, or clarified in you.
              </p>
            </div>
          </div>

          <div className={sectionFrame}>
            <div className={`${surfaceCard} space-y-4`}>
              <p className={sectionKicker}>Reflection</p>
              <textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="What are you grateful for? (optional)"
                className={`min-h-[140px] w-full resize-none rounded-[20px] border p-4 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${inputBg}`}
                rows={5}
                autoFocus
              />
              <button onClick={handleComplete} className={INNER_PRIMARY_BUTTON}>
                {gratitudeText.trim() ? 'Save & Continue' : 'Continue'}
              </button>
              <button onClick={() => onComplete()} className={secondaryButton}>
                Skip Reflection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 pb-8 custom-scrollbar ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopAmbience();
              onExit();
            }}
            className={backButton}
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <span className={INNER_TITLE_PILL}>{practiceLabel}</span>
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
            <p className={sectionKicker}>Sacred Session</p>
            <h1 className="mt-3 text-2xl font-serif font-semibold">{practiceLabel}</h1>
            <p className={`mt-2 text-sm leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              {practiceSubtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${accent.softBorder}`}>
                {config.duration} Minute Session
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                  isRunning
                    ? accent.softBorder
                    : theme === 'light'
                      ? 'border-amber-200/60 bg-white/90 text-slate-700'
                      : 'border-amber-500/18 bg-slate-900/75 text-slate-200'
                }`}
              >
                {isRunning ? 'In Progress' : 'Ready to Begin'}
              </span>
            </div>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className={`${practiceGlassCard} text-center`}>
            <p className={sectionKicker}>Timer</p>
            <div className="relative mt-4">
              <svg className="mx-auto h-48 w-48" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={theme === 'light' ? 'rgba(148,163,184,0.25)' : 'rgba(255,255,255,0.12)'}
                  strokeWidth="4"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={`url(#${progressGradientId})`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id={progressGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={accent.stops[0]} />
                    <stop offset="100%" stopColor={accent.stops[1]} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400">
                  Remaining
                </p>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-wider text-white">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${accent.softBorder}`}
              >
                {isRunning ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
              </button>
              <button
                onClick={resetTimer}
                className={`${practiceGlassControl} h-12 w-12`}
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className={`${practiceGlassCard} space-y-4`}>
            <p className={sectionKicker}>Guidance</p>
            <p className="text-sm leading-relaxed text-white">
              {getInstructionText()}
            </p>
          </div>
        </div>

        <div className={sectionFrame}>
          <button
            onClick={handleNextAffirmation}
            disabled={isMeditation || isLoadingContent || isFetchingAffirmation}
            className={`${practiceGlassCard} min-h-[180px] w-full text-left transition-all ${
              !isMeditation ? 'active:scale-[0.99]' : ''
            }`}
          >
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className={sectionKicker}>Active Reflection</p>
              {isLoadingContent ? (
                <div className="mt-6 animate-pulse text-sm text-white">Loading practice content...</div>
              ) : isMeditation ? (
                <div className="mt-5 space-y-4">
                  <div className={`mx-auto h-10 w-10 rounded-full border ${accent.softBorder} ${isRunning ? 'animate-pulse' : ''}`} />
                  <p className="max-w-[280px] text-base font-serif italic leading-relaxed text-white">
                    {meditationWisdom || 'Breathe deeply and find your center...'}
                  </p>
                </div>
              ) : (
                <>
                  <p
                    className="mt-5 text-base font-medium leading-relaxed text-white md:text-lg"
                    style={{ fontFamily: 'Trebuchet MS, Trebuchet, Arial, sans-serif' }}
                  >
                    {currentAffirmation}
                  </p>
                  {isRunning ? (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400/80">
                      <Zap size={10} />
                      <span>Tap for next affirmation</span>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </button>
        </div>

        <div className={sectionFrame}>
          <div className={`${practiceGlassCard} space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <p className={sectionKicker}>Temple Sound</p>
              <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                {userAudioFile?.name || soundscape?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className={`${practiceGlassControl} h-10 px-4 py-2`}>
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-2 w-full rounded-lg bg-slate-600 accent-amber-500"
              />
              <button onClick={restartMusic} className={`${practiceGlassControl} h-10 px-4 py-2`}>
                <SkipBack size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
