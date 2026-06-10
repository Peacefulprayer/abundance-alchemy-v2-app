import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Heart,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import {
  Affirmation,
  FocusArea,
  GratitudeLog,
  PracticeSessionConfig,
  PracticeType,
  Soundscape,
} from '../types'
import {
  playBell,
  playCompletionSound,
  startAmbience,
  stopAmbience,
  updateVolume,
} from '../services/audioService'
import { getMeditationWisdom } from '../services/geminiService'
import { api } from '../services/api'
import BreathingOrb from './BreathingOrb'
import {
  SCREEN_PRIMARY_BUTTON,
  SCREEN_TITLE_PILL,
  screenBackButton,
  screenGlassPanel,
  screenHeroCard,
  screenInputBg,
  screenSectionFrame,
  screenSectionKicker,
  screenSecondaryButton,
  screenSubTextColor,
  screenSurfaceCard,
  screenTextColor,
} from '../styles/sacredScreen'

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
  userAudioFile?: File | null
  theme: 'light' | 'dark'
  soundscape: Soundscape
}

type SessionVariant = 'iam' | 'ilove' | 'meditation'

const PracticeSession: React.FC<PracticeSessionProps> = ({
  config,
  customAffirmations,
  onComplete,
  onExit,
  userAudioFile,
  theme,
  soundscape,
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
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [affirmationCount, setAffirmationCount] = useState(1)
  const [isNewAffirmation, setIsNewAffirmation] = useState(false)

  const audioInitialized = useRef(false)
  const isAdvancingRef = useRef(false)
  const recentAffirmationsRef = useRef<string[]>([])
  const currentAffirmationRef = useRef('')

  const isMeditation = config.type === PracticeType.MEDITATION
  const isMorning = config.type === PracticeType.MORNING_IAM

  const getVariant = (): SessionVariant => {
    if (isMeditation) return 'meditation'
    if (isMorning) return 'iam'
    return 'ilove'
  }

  const variant = getVariant()
  const textColor = screenTextColor(theme)
  const subTextColor = screenSubTextColor(theme)
  const pageShell = 'mx-auto w-full max-w-[408px] space-y-5 pb-8'
  const sectionFrame = screenSectionFrame(theme)
  const heroCard = screenHeroCard(theme)
  const surfaceCard = screenSurfaceCard(theme)
  const glassPanel = screenGlassPanel(theme)
  const sectionKicker = screenSectionKicker(theme)
  const backButton = screenBackButton(theme)
  const secondaryButton = screenSecondaryButton(theme)
  const inputBg = screenInputBg(theme)

  const meditationFocusLabel = (() => {
    const configured = getFocusAreaLabel(config.focusAreas?.[0])
    return configured.trim() || 'stillness'
  })()

  useEffect(() => {
    currentAffirmationRef.current = currentAffirmation
  }, [currentAffirmation])

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
      const text = await api.getRandomAffirmation(config.type, focusLabel)
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
    if (soundscape) {
      startAmbience(soundscape, 50)
      updateVolume(50)
      audioInitialized.current = true
    }
    void loadSessionContent()
  }, [loadSessionContent, soundscape])

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
      const focusAreaRaw = config.focusAreas?.[0] || 'General'
      const focusLabel =
        getFocusAreaLabel(focusAreaRaw as FocusArea) || 'General'
      const currentNorm = normalizeAffirmation(currentAffirmation)
      const recentNorms = new Set(recentAffirmationsRef.current)

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
        return
      }

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
      }
    } finally {
      setIsFetchingAffirmation(false)
      isAdvancingRef.current = false
    }
  }

  const handleSessionEnd = () => {
    setIsRunning(false)
    playCompletionSound()
    // Delay showing gratitude screen so gong sound is heard first
    setTimeout(() => {
      setShowGratitude(true)
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

  const toggleTimer = () => setIsRunning((prev) => !prev)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(config.duration * 60)
  }

  const toggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    updateVolume(nextMuted ? 0 : volume)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(e.target.value)
    setVolume(nextVolume)
    if (isMuted && nextVolume > 0) {
      setIsMuted(false)
    }
    updateVolume(nextVolume)
  }

  const restartMusic = () => {
    stopAmbience()
    setTimeout(() => {
      startAmbience(soundscape, 50)
      updateVolume(volume)
    }, 100)
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

  const variantStyles = {
    iam: {
      bgGradient: 'from-amber-400 via-orange-400 to-orange-500',
      orbClass: 'bg-gradient-to-br from-amber-300 to-orange-400',
      orbGlow: 'orb-glow-iam',
      orbPulse: 'animate-breath',
      textColor: 'text-slate-900',
      accentColor: 'text-orange-600',
      borderColor: 'border-orange-500/30',
      progressGradient: 'from-amber-500 to-orange-500',
    },
    ilove: {
      bgGradient: 'from-yellow-200 via-amber-200 to-amber-300',
      orbClass: 'bg-gradient-to-br from-amber-200 to-yellow-300',
      orbGlow: 'orb-glow-love',
      orbPulse: 'animate-breathe',
      textColor: 'text-slate-900',
      accentColor: 'text-amber-600',
      borderColor: 'border-amber-400/30',
      progressGradient: 'from-yellow-300 to-amber-400',
    },
    meditation: {
      bgGradient: 'from-violet-500 via-fuchsia-500 to-purple-600',
      orbClass: 'bg-gradient-to-br from-violet-400 to-fuchsia-500',
      orbGlow: 'orb-glow-love',
      orbPulse: 'animate-breath',
      textColor: 'text-white',
      accentColor: 'text-violet-200',
      borderColor: 'border-violet-400/30',
      progressGradient: 'from-violet-400 to-fuchsia-500',
    },
  }

  const styles = variantStyles[variant]

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
                className={`${SCREEN_PRIMARY_BUTTON} flex w-auto items-center gap-2 px-4 py-2`}
              >
                <span>✓</span>
                <span>Complete</span>
              </button>
              <span className={SCREEN_TITLE_PILL}>{practiceLabel}</span>
            </div>

            <div className={sectionFrame}>
              <div className={`${heroCard} p-6 text-center`}>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-br from-amber-300/30 to-orange-400/20 shadow-lg">
                  <Heart size={36} className="text-amber-400" />
                </div>
                <h1 className="font-display text-2xl font-semibold">
                  Session Complete
                </h1>
                <p className={`mt-3 text-sm leading-relaxed ${subTextColor}`}>
                  Take a moment to name what this practice opened, steadied, or
                  clarified in you.
                </p>
              </div>
            </div>

            <div className={sectionFrame}>
              <div className={`${glassPanel} p-5`}>
                <p className={sectionKicker}>Reflection</p>
                <textarea
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder="What are you grateful for? (optional)"
                  className={`mt-3 min-h-[140px] w-full resize-none rounded-[20px] border p-4 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${inputBg}`}
                  rows={5}
                  autoFocus
                />
                <button
                  onClick={() => {
                    playBell()
                    handleComplete()
                  }}
                  className={`${SCREEN_PRIMARY_BUTTON} mt-4`}
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
              className={`${backButton} px-4 py-2`}
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <span className={SCREEN_TITLE_PILL}>{practiceLabel}</span>
          </div>

          <div className={sectionFrame}>
            <div className={`${heroCard} p-5 text-center`}>
              <p className={sectionKicker}>
                {variant === 'iam'
                  ? 'Sacred Declaration'
                  : variant === 'ilove'
                    ? 'Sacred Appreciation'
                    : 'Sacred Stillness'}
              </p>
              <h1
                className={`font-display mt-2 text-2xl font-semibold ${theme === 'light' ? 'text-slate-950' : styles.textColor}`}
              >
                {practiceLabel} Practice
              </h1>
              <p className={`mt-1 text-xs font-medium ${subTextColor}`}>
                {meditationFocusLabel}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${theme === 'light' ? 'border-amber-300/40 bg-amber-100/65 text-slate-900' : styles.textColor + ' ' + styles.borderColor + ' bg-white/10'}`}
                >
                  {config.duration} Min
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                    isRunning
                      ? theme === 'light'
                        ? 'border-amber-300/40 bg-amber-100/65 text-slate-900'
                        : `${styles.textColor} ${styles.borderColor} bg-white/10`
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

          <div className="flex flex-col items-center">
            <div className="relative h-[132px] w-[132px]">
              <BreathingOrb
                size={96}
                breathingSpeed={variant === 'iam' ? 4200 : variant === 'ilove' ? 5000 : 4800}
              />
              <div className="pointer-events-none absolute inset-0 z-[1100] flex flex-col items-center justify-center">
                <p className="text-xl font-semibold tabular-nums text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/80">
                  Remaining
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => {
                  playBell()
                  resetTimer()
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${styles.borderColor} ${variant === 'meditation' ? 'bg-violet-500/18 text-white hover:bg-violet-500/28' : 'bg-white/40 text-slate-900 hover:bg-white/60'} transition-colors`}
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => {
                  playBell()
                  toggleTimer()
                }}
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${styles.borderColor} ${variant === 'meditation' ? 'bg-violet-500/24 text-violet-100 hover:bg-violet-500/34' : 'bg-white/50 text-slate-900'} transition-all hover:scale-105 active:scale-95`}
              >
                {isRunning ? (
                  <Pause size={24} className="fill-current" />
                ) : (
                  <Play size={24} className="fill-current ml-1" />
                )}
              </button>
              <div className="h-10 w-10" />
            </div>

            <div className="mt-4 w-full max-w-[280px]">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progress}%`,
                    background:
                      variant === 'meditation'
                        ? 'linear-gradient(90deg, #a78bfa, #d946ef)'
                        : variant === 'iam'
                          ? 'linear-gradient(90deg, #fbbf24, #f97316)'
                          : 'linear-gradient(90deg, #fcd34d, #f59e0b)',
                  }}
                />
              </div>
            </div>
          </div>

          {!isMeditation && (
            <button
              onClick={() => {
                playBell()
                handleNextAffirmation()
              }}
              disabled={isLoadingContent || isFetchingAffirmation}
              className={`w-full rounded-[24px] border p-6 text-center transition-all active:scale-[0.98] ${theme === 'light' ? 'bg-gradient-to-br from-amber-100/80 to-orange-100/60 border-amber-300/40 shadow-lg' : 'bg-gradient-to-br from-slate-800/80 to-slate-900/90 border-white/10 shadow-xl'} ${isNewAffirmation ? 'animate-affirmation-rise' : ''}`}
            >
              <div className="flex flex-col items-center">
                <p className={sectionKicker}>Affirmations</p>
                <p
                  className={`mt-2 text-sm font-extrabold uppercase tracking-widest ${styles.accentColor}`}
                >
                  #{affirmationCount}
                </p>
                {isLoadingContent ? (
                  <div className="mt-4 animate-pulse text-sm text-slate-500">
                    Loading practice content...
                  </div>
                ) : (
                  <p
                    className={`mt-3 text-base font-medium leading-relaxed md:text-lg ${styles.textColor} ${isRunning ? 'animate-pulse-subtle' : ''}`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {currentAffirmation}
                  </p>
                )}
                {isRunning && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                    <Zap size={12} />
                    <span>Tap to advance →</span>
                  </div>
                )}
              </div>
            </button>
          )}

          {isMeditation && (
            <div
              className={`rounded-[24px] border p-6 text-center ${theme === 'light' ? 'bg-gradient-to-br from-violet-100/80 to-fuchsia-100/60 border-violet-300/40 shadow-lg' : 'bg-gradient-to-br from-violet-950/65 to-slate-900/90 border-violet-500/20 shadow-xl'}`}
            >
              <div className="flex flex-col items-center">
                <div className="pointer-events-none mb-4">
                  <BreathingOrb size={42} breathingSpeed={4800} />
                </div>
                <p
                  className={`text-base font-display italic leading-relaxed ${styles.textColor}`}
                >
                  {meditationWisdom || 'Breathe deeply and find your center...'}
                </p>
              </div>
            </div>
          )}

          <div className={`${surfaceCard} p-4`}>
            <div className="flex items-center justify-between">
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.18em] ${sectionKicker}`}
              >
                Temple Sound
              </p>
              <span
                className={`truncate text-[10px] font-medium uppercase tracking-wider ${styles.textColor} opacity-60`}
              >
                {userAudioFile?.name || soundscape?.label}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => {
                  playBell()
                  toggleMute()
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'light' ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-white/20 text-slate-300 hover:bg-white/5'}`}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-2 flex-1 rounded-lg bg-slate-600 accent-amber-500"
              />
              <button
                onClick={() => {
                  playBell()
                  restartMusic()
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'light' ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-white/20 text-slate-300 hover:bg-white/5'}`}
              >
                <SkipBack size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PracticeSession }
export default PracticeSession
