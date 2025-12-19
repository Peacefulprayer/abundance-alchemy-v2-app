import React, { useState, useEffect, useRef } from 'react';
import { PracticeSessionConfig, Affirmation, GratitudeLog, PracticeType, Soundscape, FocusArea } from '../types';
import { Heart, Play, Pause, RotateCcw, Volume2, VolumeX, SkipBack, Zap } from 'lucide-react';
import { playCompletionSound, updateVolume, stopAmbience, startAmbience } from '../services/audioService';
import { getMeditationWisdom } from '../services/geminiService';
import { apiService } from '../services/apiService';

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
  // Timer State
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Content State
  const [affirmationQueue, setAffirmationQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [meditationWisdom, setMeditationWisdom] = useState('');

  // UI State
  const [showGratitude, setShowGratitude] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Audio State
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioInitialized = useRef(false);

  const isMeditation = config.type === PracticeType.MEDITATION;
  const isMorning = config.type === PracticeType.MORNING_IAM;

  useEffect(() => {
    // Initialize Audio
    if (soundscape) {
      startAmbience(soundscape);
      updateVolume(volume);
      audioInitialized.current = true;
    }

    // Load Content
    loadSessionContent();

    // Cleanup is handled by App.tsx when mode changes
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSessionEnd();
      return;
    }

    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timeLeft, isRunning]);

  // Load Content Logic
  const loadSessionContent = async () => {
    setIsLoadingContent(true);

    // FIX: Extract label from FocusArea object or use fallback string
    const focusAreaRaw = config.focusAreas?.[0] || 'General';
    const focusLabel = typeof focusAreaRaw === 'string' 
      ? focusAreaRaw 
      : (focusAreaRaw as FocusArea)?.label || 'General';

    if (isMeditation) {
      const wisdom = await getMeditationWisdom(focusLabel);
      setMeditationWisdom(wisdom);
    } else {
      // System + User affirmations
      const systemAffs = await apiService.getSystemAffirmations(config.type);
      const userAffs = customAffirmations.filter((a) => a.type === config.type);

      let allTexts = [
        ...userAffs.map((a) => a.text),
        ...systemAffs.map((a) => a.text),
      ];

      if (allTexts.length === 0) {
        allTexts = isMorning
          ? ['I am capable.', 'I am strong.', 'I am worthy.', 'I am creating my reality.']
          : ['I love my life.', 'I love who I am becoming.', 'I love the peace I feel.'];
      }

      // Shuffle texts (Fisher-Yates)
      for (let i = allTexts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTexts[i], allTexts[j]] = [allTexts[j], allTexts[i]];
      }

      setAffirmationQueue(allTexts);
    }

    setIsLoadingContent(false);
  };

  const handleNextAffirmation = () => {
    if (!isMeditation && affirmationQueue.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % affirmationQueue.length);
    }
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    playCompletionSound();
    setShowGratitude(true);
  };

  const handleComplete = () => {
    if (gratitudeText.trim()) {
      // FIX: Ensure focusArea is a FocusArea object or string
      const focusAreaValue = config.focusAreas?.[0] || 'General';
      
      const log: GratitudeLog = {
        id: `log-${Date.now()}`,
        date: new Date().toISOString(),
        sessionType: config.type,
        focusArea: focusAreaValue,
        text: gratitudeText,
      };
      onComplete(log);
    } else {
      onComplete();
    }
  };

  // Timer Controls
  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(config.duration * 60);
  };

  // Audio Controls
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (newMuteState) {
      updateVolume(0);
    } else {
      updateVolume(volume);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
    updateVolume(newVol);
  };

  const restartMusic = () => {
    stopAmbience();
    setTimeout(() => {
      startAmbience(soundscape);
      updateVolume(volume);
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100;

  const getGradient = () => {
    if (config.type === PracticeType.MORNING_IAM)
      return 'from-amber-900 via-slate-900 to-slate-950';
    if (config.type === PracticeType.EVENING_ILOVE)
      return 'from-indigo-900 via-slate-900 to-slate-950';
    return 'from-emerald-900 via-slate-900 to-slate-950';
  };

  const getInstructionText = () => {
    if (isMeditation)
      return 'Take 3 slow deep breathes. Release the day and all it held, holds, could hold. Allow the silence to settle over you. When you are ready start the timer and allow Meditation to settle within you.';
    if (isMorning)
      return 'Speak these affirmations out loud and rapidly. Let the vibration of your voice shift your frequency. Tap the text to advance to the next affirmation.';
    return 'Bring your awareness to the feeling of gratitude. Speak slowly and plant these seeds into your subconscious. Tap to advance when you are ready.';
  };

  // Gratitude screen
  if (showGratitude) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 max-w-md mx-auto bg-gradient-to-br ${getGradient()}`}>
        <div className="text-center space-y-6 animate-in fade-in zoom-in w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center shadow-2xl">
            <Heart size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-white">Session Complete!</h2>
          <p className="text-slate-300 text-sm">Take a moment to reflect on your practice</p>

          <textarea
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            placeholder="What are you grateful for? (optional)"
            className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 resize-none focus:ring-2 focus:ring-amber-500 outline-none"
            rows={4}
            autoFocus
          />

          <div className="space-y-3 w-full">
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
            >
              {gratitudeText.trim() ? 'Save & Continue' : 'Continue'}
            </button>

            <button
              onClick={() => onComplete()}
              className="w-full text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main practice screen
  return (
    <div className={`h-full flex flex-col relative bg-gradient-to-br ${getGradient()}`}>
      {/* Header */}
      <header className="px-4 pt-8 pb-3 z-20 relative">
        {/* Back pill button */}
        <button
          onClick={() => {
            stopAmbience();
            onExit();
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-11px text-slate-100 hover:bg-black/80 transition-colors absolute left-4 top-3 sm:top-4"
        >
          <span className="mr-1">←</span>
          <span className="font-semibold tracking-wide uppercase">Back</span>
        </button>

        {/* Title aligned away from the audio slider, a bit lower */}
        <div className="flex justify-center sm:justify-end">
          <div className="flex items-center space-x-2 mt-6 sm:mt-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-8 object-contain drop-shadow-md"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
            <h1 className="font-serif font-bold text-white tracking-wide text-sm drop-shadow-md">
              Abundance Alchemy
            </h1>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 pt-4 max-w-md mx-auto w-full overflow-y-auto custom-scrollbar pb-8">
        <div className="w-full space-y-6 flex flex-col items-center">
          {/* Instructions */}
          <div className="text-center animate-in fade-in slide-in-from-bottom-2 px-2">
            <p className="text-slate-200 text-sm leading-relaxed font-serif italic opacity-90">
              {getInstructionText()}
            </p>
          </div>

          {/* Progress Circle & Timer */}
          <div className="text-center space-y-4">
            <div className="relative">
              <svg className="w-48 h-48 mx-auto" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p
                  className={`text-4xl font-bold text-white tabular-nums tracking-wider ${
                    !isRunning ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  {formatTime(timeLeft)}
                </p>
              </div>

              <div className="flex space-x-3 mt-3">
                <button
                  onClick={toggleTimer}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
                >
                  {isRunning ? (
                    <Pause size={20} className="text-white fill-current" />
                  ) : (
                    <Play size={20} className="text-white fill-current" />
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
                >
                  <RotateCcw size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content (affirmations or meditation wisdom) */}
          <button
            onClick={handleNextAffirmation}
            disabled={isMeditation || isLoadingContent}
            className={`text-center animate-in fade-in slide-in-from-bottom-4 min-h-[120px] flex flex-col items-center justify-center w-full rounded-2xl p-4 transition-all ${
              !isMeditation ? 'active:scale-95 hover:bg-white/5 cursor-pointer' : ''
            }`}
          >
            {isLoadingContent ? (
              <div className="animate-pulse text-slate-400 text-sm">Loading practices...</div>
            ) : isMeditation ? (
              <div className="space-y-3">
                <div
                  className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 ${
                    isRunning ? 'animate-pulse' : ''
                  }`}
                />
                <p className="text-base font-serif text-slate-200 italic leading-relaxed px-4">
                  {meditationWisdom || 'Breathe deeply and find your center...'}
                </p>
              </div>
            ) : (
              <p className="text-xl md:text-2xl font-serif text-white leading-relaxed px-4 drop-shadow-md font-medium">
                {affirmationQueue[currentIndex]}
              </p>
            )}

            {isRunning && !isMeditation && (
              <div className="mt-4 flex items-center space-x-2 text-[10px] uppercase tracking-widest text-slate-400/60">
                <Zap size={10} />
                <span>Tap for next</span>
              </div>
            )}
          </button>

          {/* Unified Audio Controls */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-4 shadow-lg w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <button onClick={toggleMute} className="text-slate-300 hover:text-white transition-colors">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate max-w-[80px]">
                  {soundscape?.label}
                </span>
                <button
                  onClick={restartMusic}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
