import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Heart,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Zap,
} from 'lucide-react'
import {
  Affirmation,
  FocusArea,
  GratitudeLog,
  PracticeSessionConfig,
  PracticeType,
  Soundscape,
  PracticeAudioPhase,
} from '../types'
import {
  playBell,
  playCompletionSound,
  stopAmbience,
  restartAmbience,
} from '../services/audioService'
import { playMeditationBell, preloadMeditationBell } from '../services/meditationBell'
import { getMeditationWisdom } from '../services/geminiService'
import { api } from '../services/api'
import BreathingOrb from './BreathingOrb'

const getFocusAreaLabel = (focusArea: FocusArea | undefined): string => {
  if (!focusArea) return ''
  return typeof focusArea === 'string' ? focusArea : focusArea.label
}

const normalizeAffirmation = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().toLowerCase()

interface PracticeSessionProps {
  config: PracticeSessionConfig
  customAffirmations: Affirmation[]
  onComplete: (log?: GratitudeLog) => void
  onExit: () => void
  soundscape: Soundscape
  musicVolume?: number
  onMusicVolumeChange?: (volume: number) => void
  onAudioPhaseChange?: (phase: PracticeAudioPhase) => void
}

// SACRED GLASSMORPHISM TOKENS - matching Dashboard/Welcome
const GLASS_CARD = [
  'rounded-2xl border',
  'bg-black/40',
  'border-amber-500/15',
  'shadow-[0_8px_15px_rgba(0,0,0,0.6)]',
  'backdrop-blur-sm',
].join(' ')

const GLASS_SOFT_CARD = [
  'rounded-2xl border',
  'bg-black/25',
  'border-amber-500/10',
  'shadow-[0_6px_12px_rgba(0,0,0,0.5)]',
  'backdrop-blur-sm',
].join(' ')

const GLASS_INPUT = 'bg-black/40 border-amber-500/20 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none'

const sectionKicker = 'text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center'
const screenSectionFrame = 'mt-5'

const pageShell = 'mx-auto w-full max-w-[408px] space-y-5 pb-8'

const backButton = 'flex items-center gap-2 px-3 py-2 rounded-full border border-amber-500/20 bg-black/30 text-slate-300 hover:bg-amber-500/10 transition-colors'
const primaryButton = 'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 shadow-lg w-full'
const secondaryButton = 'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border border-amber-500/30 bg-black/30 text-amber-300 hover:bg-amber-500/10 w-full'
const titlePill = 'inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500'

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  config,
  customAffirmations,
  onComplete,
  onExit,
  soundscape,
  musicVolume = 50,
  onMusicVolumeChange,
  onAudioPhaseChange,
}) => {
  const [timeLeft, setTimeLeft] = useState(config.duration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [fallbackQueue, setFallbackQueue] = useState<string[]>([])
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const [currentAffirmation, setCurrentAffirmation] = useState('')
  const [meditationWisdom, setMeditationWisdom] = useState('')
  const [isFetchingAffirmation, setIsFetchingAffirmation] = useState(false)
  const [showGratitude, setShowGratitude] = useState(false)
  const [gratitudeText, setGratitudeText] = useState('')
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [volume, setVolume] = useState(musicVolume)
  const [bellError, setBellError] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [affirmationCount, setAffirmationCount] = useState(1)
  const [isNewAffirmation, setIsNewAffirmation] = useState(false)

  const isAdvancingRef = useRef(false)
  const recentAffirmationsRef = useRef<string[]>([])
  const currentAffirmationRef = useRef('')
  const timerStartedRef = useRef(false)
  const sessionEndedRef = useRef(false)
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (completionTimerRef.current !== null) clearTimeout(completionTimerRef.current)
  }, [])

  const isMeditation = config.type === PracticeType.MEDITATION
  const isMorning = config.type === PracticeType.MORNING_IAM
  const isILove = config.type === PracticeType.EVENING_ILOVE

  useEffect(() => { if (isMeditation) preloadMeditationBell() }, [isMeditation])

  const ringMeditationBell = () => {
    void playMeditationBell().then(played => setBellError(!played))
  }

  const textColor = 'text-slate-100'
  const subTextColor = 'text-slate-300'

  const meditationFocusLabel = (() => {
    const configured = getFocusAreaLabel(config.focusAreas?.[0])
    return configured.trim() || 'stillness'
  })()

  const loadSessionContent = useCallback(async () => {
    setIsLoadingContent(true)
    setAffirmationCount(1)
    recentAffirmationsRef.current = []

    const focusAreaRaw = config.focusAreas?.[0] || 'General'
    const focusLabel = getFocusAreaLabel(focusAreaRaw as FocusArea) || 'General'

    if (isMeditation) {
      const wisdom = await getMeditationWisdom(meditationFocusLabel)
      setMeditationWisdom(wisdom)
      setIsLoadingContent(false)
      return
    }

    const systemAffs = await api
      .getSystemAffirmations(config.type)
      .catch(() => [])
    const userAffs = customAffirmations.filter((a) => a.type === config.type)

    let allTexts = [
      ...userAffs.map((a) => a.text),
      ...systemAffs.map((a) => a.text),
    ]
    if (allTexts.length === 0) {
      allTexts = isMorning
        ? [
            'I am capable.',
            'I am strong.',
            'I am worthy.',
            'I am creating my reality.',
          ]
        : [
            'I love my life.',
            'I love who I am becoming.',
            'I love the peace I feel.',
          ]
    }

    for (let i = allTexts.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allTexts[i], allTexts[j]] = [allTexts[j], allTexts[i]]
    }

    setFallbackQueue(allTexts)
    setFallbackIndex(0)

    let firstAffirmation: string | null = null
    for (let i = 0; i < 6; i += 1) {
      const text = await api.getRandomAffirmation(config.type, focusLabel).catch(() => null)
      if (
        text &&
        normalizeAffirmation(text) !==
          normalizeAffirmation(currentAffirmationRef.current)
      ) {
        firstAffirmation = text
        break
      }
    }

    const initialAffirmation = firstAffirmation || allTexts[0]
    setCurrentAffirmation(initialAffirmation)
    if (initialAffirmation) {
      recentAffirmationsRef.current = [normalizeAffirmation(initialAffirmation)]
    }
    setIsLoadingContent(false)
  }, [
    config.focusAreas,
    config.type,
    customAffirmations,
    isMeditation,
    isMorning,
    meditationFocusLabel,
  ])

  useEffect(() => {
    void loadSessionContent()
  }, [loadSessionContent])

  useEffect(() => {
    currentAffirmationRef.current = currentAffirmation
  }, [currentAffirmation])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSessionEnd()
      return
    }

    let timer: ReturnType<typeof setInterval> | undefined
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timeLeft, isRunning])

  const handleNextAffirmation = async () => {
    if (
      isMeditation ||
      isLoadingContent ||
      isFetchingAffirmation ||
      isAdvancingRef.current
    ) {
      return
    }

    isAdvancingRef.current = true
    setIsFetchingAffirmation(true)
    setIsNewAffirmation(true)
    setTimeout(() => setIsNewAffirmation(false), 500)

    try {
      const currentNorm = normalizeAffirmation(currentAffirmation)
      const recentNorms = new Set(recentAffirmationsRef.current)

      if (fallbackQueue.length > 0) {
        const size = fallbackQueue.length
        let pickedIndex = -1
        for (let step = 1; step <= size; step += 1) {
          const candidateIndex = (fallbackIndex + step) % size
          const candidateText = fallbackQueue[candidateIndex]
          const candidateNorm = normalizeAffirmation(candidateText)
          if (
            candidateNorm !== '' &&
            candidateNorm !== currentNorm &&
            !recentNorms.has(candidateNorm)
          ) {
            pickedIndex = candidateIndex
            break
          }
        }
        if (pickedIndex < 0) {
          pickedIndex = (fallbackIndex + 1) % size
        }
        const pickedText = fallbackQueue[pickedIndex]
        setFallbackIndex(pickedIndex)
        setCurrentAffirmation(pickedText)
        setAffirmationCount((c) => c + 1)
        recentAffirmationsRef.current = [
          ...recentAffirmationsRef.current,
          normalizeAffirmation(pickedText),
        ].slice(-4)
        return
      }

      const focusAreaRaw = config.focusAreas?.[0] || 'General'
      const focusLabel =
        getFocusAreaLabel(focusAreaRaw as FocusArea) || 'General'

      let nextAffirmation: string | null = null
      for (let i = 0; i < 6; i += 1) {
        const text = await api.getRandomAffirmation(config.type, focusLabel)
        if (!text) continue
        const candidateNorm = normalizeAffirmation(text)
        if (
          candidateNorm !== '' &&
          candidateNorm !== currentNorm &&
          !recentNorms.has(candidateNorm)
        ) {
          nextAffirmation = text
          break
        }
      }

      if (nextAffirmation) {
        setCurrentAffirmation(nextAffirmation)
        setAffirmationCount((c) => c + 1)
        recentAffirmationsRef.current = [
          ...recentAffirmationsRef.current,
          normalizeAffirmation(nextAffirmation),
        ].slice(-4)
      }
    } finally {
      setIsFetchingAffirmation(false)
      isAdvancingRef.current = false
    }
  }

  const handleSessionEnd = () => {
    if (sessionEndedRef.current) return
    sessionEndedRef.current = true
    setIsRunning(false)
    onAudioPhaseChange?.('ending')
    if (isMeditation) ringMeditationBell()
    else playCompletionSound()
    // Delay showing gratitude screen so gong sound is heard first
    completionTimerRef.current = setTimeout(() => {
      setShowGratitude(true)
      onAudioPhaseChange?.('reflection')
    }, 2500)
  }

  const handleComplete = () => {
    if (!gratitudeText.trim()) {
      onComplete()
      return
    }

    const focusAreaValue = config.focusAreas?.[0] || 'General'
    const log: GratitudeLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      sessionType: config.type,
      focusArea: getFocusAreaLabel(focusAreaValue as FocusArea) || 'General',
      text: gratitudeText,
    }
    onComplete(log)
  }

  const toggleTimer = () => {
    if (!isRunning && !timerStartedRef.current && timeLeft > 0) {
      timerStartedRef.current = true
      if (isMeditation) ringMeditationBell()
    }
    onAudioPhaseChange?.(isRunning ? 'paused' : 'running')
    setIsRunning((prev) => !prev)
  }

  const resetTimer = () => {
    if (completionTimerRef.current !== null) clearTimeout(completionTimerRef.current)
    timerStartedRef.current = false
    sessionEndedRef.current = false
    setIsRunning(false)
    setTimeLeft(config.duration * 60)
    onAudioPhaseChange?.('ready')
  }

  const toggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    onMusicVolumeChange?.(nextMuted ? 0 : volume)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(e.target.value)
    setVolume(nextVolume)
    if (isMuted && nextVolume > 0) {
      setIsMuted(false)
    }
    onMusicVolumeChange?.(nextVolume)
  }

  const restartMusic = () => {
    restartAmbience()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress =
    ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100

  const practiceLabel = isMeditation
    ? 'Meditation'
    : isMorning
      ? 'I Am'
      : 'I Love'
  const practiceTitlePill = isILove
    ? 'inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-200 shadow-[0_0_14px_rgba(129,140,248,0.12)]'
    : titlePill
  const affirmationCardAccent = isILove
    ? 'border-indigo-400/20 shadow-[0_8px_15px_rgba(0,0,0,0.6),0_0_18px_rgba(129,140,248,0.10)]'
    : ''
  const affirmationProgressClass = isILove
    ? 'bg-gradient-to-r from-indigo-400 to-purple-500'
    : 'bg-gradient-to-r from-amber-400 to-orange-500'
  const affirmationInstructionClass = isILove ? 'text-indigo-200' : 'text-slate-300'

  if (showGratitude) {
    return (
      <div
        className={`h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar ${textColor}`}
      >
        <div className="relative min-h-full overflow-hidden px-4 pt-4 pb-8">
          <div className="sacred-radial-light" />
          <div className={`relative z-10 ${pageShell}`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  playBell()
                  onComplete()
                }}
                className={`${primaryButton} flex w-auto items-center gap-2 px-4 py-2`}
              >
                <span>✓</span>
                <span>Complete</span>
              </button>
              <span className={practiceTitlePill}>{practiceLabel}</span>
            </div>

            <div className={screenSectionFrame}>
              <div className={`${GLASS_CARD} p-6 text-center`}>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-br from-amber-300/30 to-orange-400/20 shadow-lg">
                  <Heart size={36} className="text-amber-400" />
                </div>
                <h1 className="text-2xl font-serif font-semibold">Session Complete</h1>
                <p className={`mt-3 text-sm leading-relaxed ${subTextColor}`}>
                  Take a moment to name what this practice opened, steadied, or
                  clarified in you.
                </p>
              </div>
            </div>

            <div className={screenSectionFrame}>
              <div className={`${GLASS_CARD} p-5`}>
                <p className={sectionKicker}>Reflection</p>
                <textarea
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder="What are you grateful for? (optional)"
                  className={`mt-3 min-h-[140px] w-full resize-none rounded-lg border p-4 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${GLASS_INPUT}`}
                  rows={5}
                  maxLength={10000}
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-300">
                  After saving, find this reflection in Maktaba under Gratitude Logs.
                </p>
                <button
                  onClick={() => {
                    playBell()
                    handleComplete()
                  }}
                  className={`${primaryButton} mt-4`}
                >
                  {gratitudeText.trim() ? 'Save & Continue' : 'Continue'}
                </button>
                <button
                  onClick={() => {
                    playBell()
                    onComplete()
                  }}
                  className={`${secondaryButton} mt-3`}
                >
                  Skip Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar ${textColor}`}
    >
      <div className="relative min-h-full overflow-hidden px-4 pt-4 pb-8">
        <div className="sacred-radial-light" />

        <div className={`relative z-10 ${pageShell}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                playBell()
                stopAmbience()
                onExit()
              }}
              className={backButton}
            >
              <span>←</span>
              <span className="font-semibold tracking-wide uppercase">Exit</span>
            </button>
            <span className={practiceTitlePill}>{practiceLabel}</span>
          </div>

          {/* Header: Orb + Breathing */}
          <div className={screenSectionFrame}>
            <div className={`${GLASS_SOFT_CARD} py-6`}>
              <div className="relative flex flex-col items-center justify-start gap-4 text-center">
                <div className="w-full px-5">
                  {/* Breathing Orb */}
                  <div className="flex justify-center">
                    <BreathingOrb size={100} breathingSpeed={4000} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Affirmation Display / Meditation Wisdom */}
          <div className={screenSectionFrame}>
            <div
              className={`${GLASS_CARD} text-center py-6 px-5 ${affirmationCardAccent} ${!isMeditation ? 'cursor-pointer select-none active:scale-[0.99]' : ''}`}
              onClick={!isMeditation ? handleNextAffirmation : undefined}
              onKeyDown={(event) => {
                if (isMeditation) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  void handleNextAffirmation()
                }
              }}
              role={!isMeditation ? 'button' : undefined}
              tabIndex={!isMeditation ? 0 : undefined}
              aria-label={!isMeditation ? 'Tap for next affirmation' : undefined}
            >
              {isMeditation ? (
                <>
                  <p className={sectionKicker}>Meditation Wisdom</p>
                  <h2 className="mt-2 text-xl font-serif text-white leading-relaxed">
                    {meditationWisdom || 'Breathe. Be still. Allow.'}
                  </h2>
                  <p className={`mt-3 text-xs leading-relaxed ${subTextColor}`}>
                    Focus: {meditationFocusLabel}
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1 ${sectionKicker}`}>
                      Affirmation {affirmationCount}
                    </span>
                  </div>
                  <div className="relative min-h-[100px] flex items-center justify-center px-4">
                    <p
                      className={`transition-all duration-300 ${isNewAffirmation ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'} font-medium text-base leading-relaxed`}
                    >
                      "{currentAffirmation}"
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className={`h-1 w-24 ${affirmationProgressClass} rounded-full overflow-hidden`}>
                      <div
                        className="h-full bg-amber-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <p className={`mt-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] ${affirmationInstructionClass}`}>
                    Speak Outloud - Tap Here to Change Affirmation
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className={screenSectionFrame}>
            <div className={`${GLASS_CARD} space-y-4 p-5`}>
              {/* Timer Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="text-amber-400" size={20} />
                  <div>
                    <p className={sectionKicker}>Timer</p>
                    <p className="text-3xl font-mono font-semibold">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full border border-amber-500/20 bg-black/30 text-slate-300 hover:bg-amber-500/10 transition-colors"
                    aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-32 accent-amber-500"
                    aria-label="Music volume"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-full border border-amber-500/20 bg-black/30 text-slate-300 hover:bg-amber-500/10 transition-colors"
                  aria-label="Reset Timer"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={toggleTimer}
                  data-no-sound={isMeditation ? 'true' : undefined}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
                  aria-label={isRunning ? 'Pause' : 'Start'}
                >
                  {isRunning ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button
                  onClick={handleNextAffirmation}
                  disabled={isMeditation || isLoadingContent || isFetchingAffirmation}
                  className="p-3 rounded-full border border-amber-500/20 bg-black/30 text-slate-300 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                  aria-label="Next Affirmation"
                >
                  <SkipBack size={20} />
                </button>
              </div>

              {/* Affirmation Counter */}
              {isMeditation && (
                <div className="text-center text-xs text-slate-300">
                  <p>One bell at Start and one when the timer finishes. Music volume does not mute the bell.</p>
                  <button type="button" data-no-sound="true" onClick={ringMeditationBell}
                    className="mt-2 text-amber-400 underline underline-offset-4">Test meditation bell</button>
                  {bellError && <p role="alert" className="mt-2 text-red-300">The bell could not play. Check this tab’s sound setting, then test it again.</p>}
                </div>
              )}
              <div className="text-center pt-2">
                <p className={`text-xs font-medium ${subTextColor}`}>
                  {isMeditation
                    ? `${affirmationCount} mindful breaths`
                    : `${affirmationCount} affirmations spoken`}
                </p>
              </div>

              {/* Music Controls */}
              <div className="border-t border-amber-500/15 pt-4">
                <div className="flex items-center gap-3">
                  <Music className="text-amber-400" size={18} />
                  <div className="flex-1">
                    <p className={sectionKicker}>Temple Sound</p>
                    <p className="text-xs truncate font-medium">
                      {soundscape?.label || 'Default Ambience'}
                    </p>
                  </div>
                  <button
                    onClick={restartMusic}
                    disabled={!timerStartedRef.current}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Restart
                  </button>
                </div>
              </div>

              {/* Exit Button */}
              <button
                onClick={() => {
                  playBell()
                  stopAmbience()
                  onExit()
                }}
                className={secondaryButton}
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeSession
