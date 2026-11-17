import { getFocusCycleProgress } from '../services/focusCycle'
// components/Dashboard.tsx - SACRED GLASSMORPHISM (matches Welcome/Splash)
import React, { useState, useEffect, useCallback } from 'react'
import {
  UserProfile,
  PracticeType,
  Soundscape,
  GratitudeLog,
  CycleType,
  FocusArea,
} from '../types'
import {
  Sun,
  Moon,
  Trophy,
  ExternalLink,
  Music,
  LogOut,
  ChevronDown,
  BookOpen,
  Sparkles as SparklesIcon,
  Wind,
} from 'lucide-react'
import BreathingOrb from './BreathingOrb'
import { playBell } from '../services/audioService'
import { WISDOM_QUOTES, getQuotesByCategory } from '../data/wisdomQuotes'

const WISDOM_API_BASE = import.meta.env.VITE_API_BASE_URL || '/abundance-alchemy/api'

interface WisdomQuote {
  text: string
  author: string
  source?: string
}

const getFocusAreaLabel = (focusArea: FocusArea | undefined): string => {
  if (!focusArea) return 'GENERAL'
  return typeof focusArea === 'string' ? focusArea : focusArea.label
}

const fetchWisdomFromAPI = async (
  category: string,
  sessionId?: string,
): Promise<WisdomQuote | null> => {
  try {
    const query = new URLSearchParams({ category })
    if (sessionId?.trim()) {
      query.set('session_id', sessionId)
    }
    const res = await fetch(`${WISDOM_API_BASE}/get-wisdom.php?${query.toString()}`)
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    return null
  }
}

const formatWisdomQuote = (quote: WisdomQuote | null): WisdomQuote | null => {
  if (!quote) return null
  return {
    text: quote.text,
    author: quote.source ? `${quote.author} - ${quote.source}` : quote.author,
  }
}

const getWisdomKey = (quote: WisdomQuote): string =>
  `${quote.text}::${quote.author}`

const getFallbackQuote = (category: string): WisdomQuote => {
  const quotes = WISDOM_QUOTES.filter(
    (q) => q.category === category || category === 'GENERAL',
  )
  if (quotes.length === 0) {
    return {
      text: 'Your thoughts are the seeds of your reality. Plant them with intention.',
      author: 'The Abundance Alchemist',
    }
  }
  const idx = Math.floor(Math.random() * quotes.length)
  return {
    text: quotes[idx].text,
    author: quotes[idx].source
      ? `${quotes[idx].author} - ${quotes[idx].source}`
      : quotes[idx].author,
  }
}

const getAlternateFallbackQuote = (
  category: string,
  currentWisdomKey: string,
): WisdomQuote => {
  const categoryQuotes = getQuotesByCategory(
    (category === 'GENERAL' ? 'GENERAL' : category) as Parameters<
      typeof getQuotesByCategory
    >[0],
  )
  const normalizedQuotes = categoryQuotes.map((quote) => ({
    text: quote.text,
    author: quote.source ? `${quote.author} - ${quote.source}` : quote.author,
  }))
  const alternatives = normalizedQuotes.filter(
    (quote) => getWisdomKey(quote) !== currentWisdomKey,
  )

  if (alternatives.length === 0) {
    return getFallbackQuote(category)
  }

  const idx = Math.floor(Math.random() * alternatives.length)
  return alternatives[idx]
}

interface DashboardProps {
  user: UserProfile
  onStartPractice: (type: PracticeType, duration: number) => void
  onOpenMeditation: () => void
  onOpenSettings: () => void
  onOpenProfile?: () => void
  musicOn: boolean
  ambienceVolume: number
  onToggleMusic: () => void
  onVolumeChange: (volume: number) => void
  onSignOut: () => void
  onSaveReflection?: (log: GratitudeLog) => void
  theme: 'light' | 'dark'
  userAudioFile?: File | null
  activeSoundscape: Soundscape
}

// SACRED GLASSMORPHISM TOKENS - matching Welcome/Splash
// Dark glass cards: low opacity black/brown with blur, letting background image show through
const GLASS_CARD = [
  'rounded-2xl border',
  'bg-black/40',           // ~40% opacity black - more transparent, lets bg image through
  'border-amber-500/15',   // subtle gold edge
  'shadow-[0_8px_15px_rgba(0,0,0,0.6)]',  // reduced spread from 32px to 15px
  'backdrop-blur-sm',      // reduced blur from xl (24px) to sm (5px)
].join(' ')

const GLASS_SOFT_CARD = [
  'rounded-2xl border',
  'bg-black/25',           // slightly more transparent
  'border-amber-500/10',
  'shadow-[0_6px_12px_rgba(0,0,0,0.5)]',  // reduced spread from 24px to 12px
  'backdrop-blur-sm',      // reduced blur from md (12px) to sm (5px)
].join(' ')

const GLASS_INPUT = 'bg-black/40 border-amber-500/20 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none'

const GOLD = 'text-amber-400'
const TEXT_PRIMARY = 'text-slate-100'

const sectionKicker = 'text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center'
const screenTextColor = 'text-slate-100'
const screenSubTextColor = 'text-slate-300'
const screenAccentText = 'text-amber-400'
const screenSectionFrame = 'mt-5'
const statusPill = 'inline-flex items-center gap-1px rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-500'

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onSaveReflection,
  onStartPractice,
  onOpenMeditation,
  onOpenSettings,
  musicOn,
  ambienceVolume,
  onToggleMusic,
  onVolumeChange,
  onSignOut,
  userAudioFile,
  activeSoundscape,
}) => {
  const [wisdom, setWisdom] = useState<WisdomQuote>({
    text: 'Your thoughts are the seeds of your reality. Plant them with intention.',
    author: 'The Abundance Alchemist',
  })
  const [mode, setMode] = useState<PracticeType>(PracticeType.MORNING_IAM)
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [customTime, setCustomTime] = useState(20)
  const [showJournal, setShowJournal] = useState(false)
  const [journalEntry, setJournalEntry] = useState('')
  const [journalStatus, setJournalStatus] = useState<string>('')
  const [isSeekingWisdom, setIsSeekingWisdom] = useState(false)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('wisdom_session_id')
      if (!id) {
        id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('wisdom_session_id', id)
      }
      return id
    }
    return `sess_default`
  })

  const loadWisdom = useCallback(async () => {
    const focusLabel = getFocusAreaLabel(user.focusAreas[0]) || 'GENERAL'
    const apiQuote = await fetchWisdomFromAPI(focusLabel, sessionId)
    setWisdom(formatWisdomQuote(apiQuote) ?? getFallbackQuote(focusLabel))
  }, [user.focusAreas, sessionId])

  const handleSeekWisdom = useCallback(async () => {
    const focusLabel = getFocusAreaLabel(user.focusAreas[0]) || 'GENERAL'
    const currentWisdomKey = getWisdomKey(wisdom)
    setIsSeekingWisdom(true)

    try {
      let nextWisdom: WisdomQuote | null = null

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const apiQuote = await fetchWisdomFromAPI(
          focusLabel,
          `${sessionId}-${Date.now()}-${attempt}`,
        )
        const candidate =
          formatWisdomQuote(apiQuote) ?? getFallbackQuote(focusLabel)

        if (getWisdomKey(candidate) !== currentWisdomKey) {
          nextWisdom = candidate
          break
        }
      }

      if (nextWisdom) {
        setWisdom(nextWisdom)
      } else {
        setWisdom(getAlternateFallbackQuote(focusLabel, currentWisdomKey))
      }
    } finally {
      setIsSeekingWisdom(false)
    }
  }, [sessionId, user.focusAreas, wisdom])

  useEffect(() => {
    loadWisdom()
    if (typeof window === 'undefined') return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadWisdom()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadWisdom])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 18) {
      setMode(PracticeType.MORNING_IAM)
    } else {
      setMode(PracticeType.EVENING_ILOVE)
    }
  }, [])

  const getCyclePeriodLabel = (cycle: CycleType): string => {
    switch (cycle) {
      case 'DAILY':
        return 'Daily'
      case 'WEEKLY':
        return 'Weekly'
      case 'MONTHLY':
        return 'Monthly'
      default:
        return 'Current'
    }
  }

  const focusCycle = getFocusCycleProgress(user.cyclePreference, user.cycleStartedAt)

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
    }
    return (
      descriptions[focus] ||
      'You are on a transformative journey of growth and self-discovery.'
    )
  }

  const saveJournalEntry = () => {
    if (!journalEntry.trim()) return
    playBell()
    const newLog: GratitudeLog = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString(),
      sessionType: PracticeType.MORNING_IAM,
      focusArea: getFocusAreaLabel(user.focusAreas[0]) || 'General',
      text: journalEntry,
    }
    if (!onSaveReflection) {
      setJournalStatus('Unable to save right now. Please try again.')
      return
    }
    onSaveReflection(newLog)
    setJournalEntry('')
    setShowJournal(false)
    setJournalStatus('Reflection added to Gratitude Logs.')
    window.setTimeout(() => setJournalStatus(''), 2200)
  }

  const textColor = screenTextColor
  const subTextColor = screenSubTextColor
  const streakPill = 'inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500'
  const sacredAccentText = screenAccentText
  const daysLeftChip = statusPill
  // No page gradient - transparent so Layout's background image shows through
  const pageShell = `min-h-screen w-full bg-transparent overflow-x-hidden ${TEXT_PRIMARY} pb-16`
  const sectionKickerLocal = sectionKicker

  const currentTrackName = userAudioFile
    ? `File: ${userAudioFile.name}`
    : activeSoundscape.label
  const displayName = (user.preferredName || user.name || 'Initiate').trim()

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip px-4 pb-6 [overflow-wrap:anywhere]">
      <div className={pageShell}>
        {/* Header Section */}
        <div className="relative pt-6 pb-2">
          <div className="flex justify-center">
            <div className={streakPill}>
              <Trophy size={14} className="text-amber-200" />
              <span>
                {user.streak} {user.streak === 1 ? 'Day' : 'Days'} Streak
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <BreathingOrb size={80} breathingSpeed={4000} />
          </div>

          <div className={` ${screenSectionFrame}`}>
            <div className={`relative overflow-hidden group ${GLASS_SOFT_CARD} py-6`}>
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparklesIcon size={34} className={sacredAccentText} />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-start gap-4 text-center">
                <div className="w-full px-5">
                  <p className={`text-xs italic font-medium leading-relaxed ${subTextColor}`}>
                    \"{wisdom.text}\"
                  </p>
                  <p className={`mt-2 text-[9px] font-bold uppercase tracking-widest ${sacredAccentText}`}>
                    - {wisdom.author}
                  </p>
                  <button
                    onClick={() => {
                      playBell()
                      void handleSeekWisdom()
                    }}
                    disabled={isSeekingWisdom}
                    className={`mt-2 text-[9px] font-medium uppercase tracking-wider opacity-60 transition-opacity hover:opacity-100 text-amber-200 ${isSeekingWisdom ? 'cursor-wait opacity-100' : ''}`}
                    title="Seek fresh wisdom"
                  >
                    <SparklesIcon size={10} className="mr-1 inline" />
                    {isSeekingWisdom ? 'Seeking...' : 'Seek Wisdom'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={` ${screenSectionFrame}`}>
            <div className={`${GLASS_CARD} text-center py-5 px-5`}>
              <p className={sectionKickerLocal}>Dashboard / Dashibodi</p>
              <h1 className="mt-2 text-xl font-serif font-medium text-white">
                Tunakukaribisha
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-100">
                We Welcome You
              </p>
              <p className={`mt-2 text-base font-semibold tracking-[0.08em] ${sacredAccentText}`}>
                {displayName}
              </p>
              <div className="mt-3 text-xs leading-relaxed space-y-1">
                <p className={subTextColor}>Here is where you return to your focus,</p>
                <p className={subTextColor}>enter practice sessions, and choose your soundscape.</p>
              </div>
              <p className={`mt-2 text-xs leading-relaxed ${subTextColor}`}>
                Recharge and renew your I Am energies.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-4">
          <div className={screenSectionFrame}>
            <div className={`transition-all ${GLASS_CARD} p-5`}>
              <div className="mb-4 space-y-2 text-center">
                <div className="space-y-1">
                  <p className={sectionKickerLocal}>
                    YOUR {getCyclePeriodLabel(user.cyclePreference).toUpperCase()} FOCUS:
                  </p>
                  <h2 className={`text-lg font-bold ${textColor}`}>
                    {getFocusAreaLabel(user.focusAreas[0]) || 'your focus'}
                  </h2>
                </div>
                <p className={`text-sm ${subTextColor}`}>
                  This is Day {focusCycle.dayIndex} of {focusCycle.totalDays}
                </p>
                <span className={daysLeftChip}>
                  {focusCycle.remainingDays}{' '}
                  days left
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${subTextColor}`}>
                {getFocusDescription(
                  getFocusAreaLabel(user.focusAreas[0]) || 'focus',
                )}
              </p>

              <div className="mt-5 border-t border-amber-500/20 pt-5">
                <button
                  onClick={() => {
                    playBell()
                    setShowJournal(!showJournal)
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-3 transition-all border border-amber-500/20 bg-black/30 text-slate-100 hover:bg-amber-500/10"
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} className={GOLD} />
                    <span className="text-xs font-bold">
                      How is your{' '}
                      {getFocusAreaLabel(user.focusAreas[0]) || 'focus'}{' '}
                      journey going?
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform text-amber-500/70 ${
                      showJournal ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showJournal && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 space-y-3">
                    <textarea
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      placeholder={`Reflect on your ${getFocusAreaLabel(user.focusAreas[0]) || 'focus'} practice...`}
                      className={`w-full resize-none rounded-lg border p-3 text-sm ${GLASS_INPUT}`}
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

          <div className={screenSectionFrame}>
            <div className={`relative overflow-hidden transition-all duration-700 ${GLASS_CARD} p-5`}>
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                {mode === PracticeType.MORNING_IAM ? (
                  <Sun size={90} className="rotate-12 text-amber-300" />
                ) : (
                  <Moon size={90} className="-rotate-12 text-amber-300" />
                )}
              </div>
              <div className="relative z-10 space-y-4 text-center">
                <p className={sectionKickerLocal}>Choose Your Practice</p>
                <div className="relative p-1 rounded-full flex border border-amber-500/20 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(245,158,11,0.10)]">
                  <button
                    onClick={() => {
                      playBell()
                      setMode(PracticeType.MORNING_IAM)
                    }}
                    className={`relative z-10 flex flex-1 items-center justify-center rounded-full py-3 transition-colors ${
                      mode === PracticeType.MORNING_IAM
                        ? 'text-amber-100'
                        : 'text-slate-400'
                    }`}
                  >
                    <Sun size={16} className="mr-2" />
                    <span className="text-xs font-bold tracking-wide">I Am</span>
                  </button>
                  <button
                    onClick={() => {
                      playBell()
                      setMode(PracticeType.EVENING_ILOVE)
                    }}
                    className={`relative z-10 flex flex-1 items-center justify-center rounded-full py-3 transition-colors ${
                      mode === PracticeType.EVENING_ILOVE
                        ? 'text-rose-100'
                        : 'text-slate-400'
                    }`}
                  >
                    <Moon size={16} className="mr-2" />
                    <span className="text-xs font-bold tracking-wide">
                      I Love
                    </span>
                  </button>
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-500 ease-out ${
                      mode === PracticeType.MORNING_IAM
                        ? 'left-1 bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'left-[calc(50%+4px)] bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}
                  />
                </div>

                <div>
                  <p className={`mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] ${sectionKickerLocal}`}>
                    Guided Session
                  </p>
                  <h2 className={`mb-1 text-base font-normal ${textColor}`}>
                    {mode === PracticeType.MORNING_IAM
                      ? 'Begin I Am Practice'
                      : 'Begin I Love Practice'}
                  </h2>
                  <p className={`mb-4 text-[11px] leading-snug ${subTextColor}`}>
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
                            playBell()
                            onStartPractice(mode, dur)
                          }}
                          className="h-16 rounded-xl backdrop-blur-md border transition-all flex flex-col items-center justify-center space-y-0.5 group shadow-md bg-black/30 hover:scale-105 border-amber-500/20 text-white"
                        >
                          <span className="text-xl font-bold text-white">{dur}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">MIN</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 animate-in fade-in zoom-in-95 duration-300">
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
                          playBell()
                          onStartPractice(mode, customTime)
                        }}
                        className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors"
                      >
                        Start {customTime} Min Session
                      </button>
                      <button
                        onClick={() => {
                          playBell()
                          setShowCustomTime(false)
                        }}
                        className="w-full mt-3 py-2 rounded-xl border border-amber-500/30 text-white text-xs font-semibold hover:bg-amber-500/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!showCustomTime && (
                    <button
                      onClick={() => {
                        playBell()
                        setShowCustomTime(true)
                      }}
                      className="w-full text-center px-4 leading-relaxed group mt-4"
                    >
                      <span className="block text-[12px] font-bold uppercase tracking-widest group-hover:opacity-100 opacity-70 transition-opacity text-amber-200">
                        Prefer A Longer Experience?
                      </span>
                      <span className="mt-1 block text-[12px] opacity-50 group-hover:opacity-70 transition-opacity text-slate-300">
                        Click to choose a custom time.
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Meditation card - always visible */}
          <div className={screenSectionFrame}>
            <div className={`${GLASS_CARD} space-y-3 p-5`}>
              <p className={sectionKickerLocal}>Meditation</p>
              <div className="flex items-center gap-3 text-left">
                <div className="flex min-w-0 flex-1 items-center space-x-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/12 border border-amber-500/25 text-amber-200">
                    <Wind size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white">
                      Meditation Practice
                    </h3>
                    <p className="text-[10px] leading-snug text-slate-200">
                      Guided Stillness: Choose duration and soundscape for
                      silent meditation
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  playBell()
                  onOpenMeditation()
                }}
                className="w-full rounded-lg px-4 py-2 text-sm font-bold tracking-wide transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-95"
              >
                Open Meditation
              </button>
            </div>
          </div>

          {/* Now Playing / Temple Sound */}
          <div className={screenSectionFrame}>
            <div className={`${GLASS_CARD} space-y-3 p-5`}>
              <p className={sectionKickerLocal}>Temple Sound</p>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-amber-500">
                    <Music size={14} className={GOLD} />
                    <span>Now Playing</span>
                  </div>
                  <span className="mt-1 block truncate text-sm font-semibold text-slate-100">
                    {currentTrackName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    playBell()
                    onOpenSettings()
                  }}
                  className="shrink-0 text-xs font-extrabold tracking-wide hover:underline text-amber-500"
                >
                  CHANGE
                </button>
              </div>

              <div className="space-y-2 border-t border-amber-500/20 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music size={14} className="text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                      Music
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playBell()
                      onToggleMusic()
                    }}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      musicOn ? 'bg-emerald-600' : 'bg-slate-600'
                    }`}
                    aria-label="Toggle music"
                  >
                    <div
                      className={`absolute top-0.5 ${
                        musicOn ? 'right-0.5' : 'left-0.5'
                      } h-4 w-4 rounded-full bg-white transition-all`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-100">
                    Vol
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambienceVolume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="min-w-0 flex-1"
                    aria-label="Music volume"
                  />
                  <span className="w-8 text-right text-xs font-bold text-amber-500">
                    {ambienceVolume}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`${GLASS_CARD} space-y-2 text-center p-5`}>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-100">
                Based on the book &#8220;I Am Practice&#8221; by
              </p>
              <p className="text-sm font-serif font-bold text-amber-100">
                Michael Soaries
              </p>
            </div>
            <a
              href="https://abundantthought.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-bold tracking-wider uppercase hover:underline text-amber-500"
            >
              <span>Visit AbundantThought.com</span>
              <ExternalLink size={12} />
            </a>

            <div className="pt-2">
              <button
                onClick={() => {
                  playBell()
                  onSignOut()
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
  )
}
