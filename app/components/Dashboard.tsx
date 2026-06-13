// components/Dashboard.tsx
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
import { AlchemistAvatar } from './AlchemistAvatar'
import { playBell } from '../services/audioService'
import { WISDOM_QUOTES, getQuotesByCategory } from '../data/wisdomQuotes'
import {
  SCREEN_PAGE_SHELL,
  SCREEN_STATUS_PILL,
  SCREEN_TITLE_PILL,
  screenGlassPanel,
  screenHeroCard,
  screenInputBg,
  screenAccentText,
  screenActionRow,
  screenSectionFrame,
  screenSectionKicker,
  screenSubTextColor,
  screenSurfaceCard,
  screenTextColor,
} from '../styles/sacredScreen'

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
    const query = new URLSearchParams({
      category,
    })
    if (sessionId?.trim()) {
      query.set('session_id', sessionId)
    }
    const res = await fetch(
      `${WISDOM_API_BASE}/get-wisdom.php?${query.toString()}`,
    )
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
  onOpenMeditation?: () => void
  onOpenSettings: () => void
  onOpenProfile?: () => void
  musicOn: boolean
  ambienceVolume: number
  onToggleMusic: () => void
  onVolumeChange: (volume: number) => void
  onSignOut: () => void
  theme: 'light' | 'dark'
  userAudioFile?: File | null
  activeSoundscape: Soundscape
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onStartPractice,
  onOpenMeditation,
  onOpenSettings,
  musicOn,
  ambienceVolume,
  onToggleMusic,
  onVolumeChange,
  onSignOut,
  theme,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(PracticeType.MORNING_IAM)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const getDaysRemaining = (
    cycle: CycleType,
    lastDate: string | null,
  ): number => {
    if (!lastDate) return cycle === 'DAILY' ? 1 : cycle === 'WEEKLY' ? 7 : 30
    const last = new Date(lastDate)
    const now = new Date()
    const daysPassed = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (cycle === 'DAILY') return 1
    if (cycle === 'WEEKLY') return Math.max(0, 7 - daysPassed)
    return Math.max(0, 30 - daysPassed)
  }

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
    const updatedUser = {
      ...user,
      gratitudeLogs: [...user.gratitudeLogs, newLog],
    }
    sessionStorage.setItem('abundance_user', JSON.stringify(updatedUser))
    localStorage.removeItem('abundance_user')
    setJournalEntry('')
    setShowJournal(false)
    setJournalStatus('Reflection saved.')
    window.setTimeout(() => setJournalStatus(''), 2200)
  }

  const textColor = screenTextColor(theme)
  const subTextColor = screenSubTextColor(theme)
  const whitePill = SCREEN_TITLE_PILL
  const streakPill = `${SCREEN_TITLE_PILL} gap-2`
  const heroCard = screenHeroCard(theme)
  const glassCard = screenGlassPanel(theme)
  const compactGlassCard = screenGlassPanel(theme)
  const sacredAccentText = screenAccentText(theme)
  const sacredActionText = theme === 'light' ? 'text-amber-700' : 'text-amber-200'
  const buttonBg =
    theme === 'light'
      ? 'bg-slate-100 hover:bg-amber-100 border-slate-200'
      : 'border-amber-500/20 bg-slate-950/70 hover:bg-slate-900/80'
  const sectionTitleChip = whitePill
  const daysLeftChip = SCREEN_STATUS_PILL
  const infoCardBg = screenSurfaceCard(theme)
  const lowCardLabelText = screenAccentText(theme)
  const lowCardBodyText = theme === 'light' ? 'text-slate-800' : 'text-slate-100'
  const pageShell = `${SCREEN_PAGE_SHELL} pb-24`
  const sectionFrame = screenSectionFrame(theme)
  const sectionKicker = screenSectionKicker(theme)
  const inputBg = screenInputBg(theme)
  const toggleShell =
    theme === 'light'
      ? 'relative p-1 rounded-full flex border border-slate-200/70 bg-white/90 shadow-sm'
      : 'relative p-1 rounded-full flex border border-white/10 bg-slate-900/80 shadow-xl'
  const journalToggleBg =
    theme === 'light'
      ? 'bg-slate-100 hover:bg-amber-100 text-slate-800 border border-slate-200/60'
      : `${screenActionRow(theme)} text-slate-100`
  const lowerSectionTitle = `${sectionTitleChip} mx-auto`

  const getAvatarMood = () => {
    if (mode === PracticeType.MORNING_IAM) return 'active'
    return 'calm'
  }

  const currentTrackName = userAudioFile
    ? `File: ${userAudioFile.name}`
    : activeSoundscape.label
  const displayName = (user.preferredName || user.name || 'Initiate').trim()

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden pb-24">
      <div className={pageShell}>
        {/* Header Section */}
        <div className="relative pt-4 px-4 pb-1">
          <div className="flex justify-center">
            <div className={streakPill}>
              <Trophy size={14} className="text-amber-200" />
              <span>
                {user.streak} {user.streak === 1 ? 'Day' : 'Days'} Streak
              </span>
            </div>
          </div>

          <div className={`mt-3 ${sectionFrame}`}>
            <div className={`relative overflow-hidden group ${compactGlassCard}`}>
              <div
                className={`pointer-events-none absolute inset-x-12 top-3 h-20 rounded-full blur-3xl ${
                  theme === 'light'
                    ? 'bg-amber-200/35'
                    : 'bg-amber-300/10'
                }`}
              />
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparklesIcon size={34} className={sacredAccentText} />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-start gap-3 text-center">
                <div className="flex-shrink-0">
                  <AlchemistAvatar
                    size="sm"
                    mood={getAvatarMood()}
                    speaking={false}
                    className="mx-auto"
                  />
                </div>
                <div className="w-full">
                  <p className={`text-xs italic font-medium leading-relaxed ${subTextColor}`}>
                    "{wisdom.text}"
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
                    className={`mt-2 text-[9px] font-medium uppercase tracking-wider opacity-60 transition-opacity hover:opacity-100 ${
                      sacredActionText
                    } ${isSeekingWisdom ? 'cursor-wait opacity-100' : ''}`}
                    title="Seek fresh wisdom"
                  >
                    <SparklesIcon size={10} className="mr-1 inline" />
                    {isSeekingWisdom ? 'Seeking...' : 'Seek Wisdom'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-3 ${sectionFrame}`}>
            <div className={`${heroCard} text-center py-4`}>
              <p className={sectionKicker}>Dashboard / Dashibodi</p>
              <h1
                className={`mt-2 text-xl font-serif font-medium ${
                  theme === 'light' ? 'text-slate-950' : 'text-white'
                }`}
              >
                Tunakukaribisha
              </h1>
              <p
                className={`mt-1 text-sm font-medium ${
                  theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                }`}
              >
                We Welcome You
              </p>
              <p
                className={`mt-2 text-base font-semibold tracking-[0.08em] ${sacredAccentText}`}
              >
                {displayName}
              </p>
              <p
                className={`mt-2 text-base font-serif ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Your sacred gathering space
              </p>
              <p className={`mt-2 text-xs leading-relaxed ${subTextColor}`}>
                Here is where you return to your focus, enter practice
                sessions, and choose your soundscape.
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${subTextColor}`}>
                Recharge and renew your I Am energies.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-5 mt-2">
          <div className={sectionFrame}>
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <h3 className={sectionTitleChip}>
                  Your {getCyclePeriodLabel(user.cyclePreference)} Focus
                </h3>
                <span className={daysLeftChip}>
                  {getDaysRemaining(
                    user.cyclePreference,
                    user.lastPracticeDate,
                  )}{' '}
                  days left
                </span>
              </div>

              <div
                className={`transition-all ${glassCard}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <p className={sectionKicker}>Current Intention</p>
                    <h2 className={`text-lg font-bold ${textColor}`}>
                      {getFocusAreaLabel(user.focusAreas[0]) || 'your focus'}
                    </h2>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${subTextColor}`}>
                  {getFocusDescription(
                    getFocusAreaLabel(user.focusAreas[0]) || 'focus',
                  )}
                </p>

                <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <button
                    onClick={() => {
                      playBell()
                      setShowJournal(!showJournal)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${journalToggleBg}`}
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen size={16} />
                      <span className="text-xs font-bold">
                        How is your{' '}
                        {getFocusAreaLabel(user.focusAreas[0]) || 'focus'}{' '}
                        journey going?
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
                        className={`w-full resize-none rounded-lg border p-3 text-sm ${inputBg} focus:ring-2 focus:ring-amber-500 outline-none`}
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
          </div>

          <div className={sectionFrame}>
            <div className="space-y-4">
              <div className="flex justify-center">
                <h3 className={lowerSectionTitle}>Choose Your Practice</h3>
              </div>

              <div className={toggleShell}>
                <button
                  onClick={() => {
                    playBell()
                    setMode(PracticeType.MORNING_IAM)
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
                    playBell()
                    setMode(PracticeType.EVENING_ILOVE)
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
                  <span className="text-xs font-bold tracking-wide">
                    I Love
                  </span>
                </button>
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-500 ease-out ${
                    mode === PracticeType.MORNING_IAM
                      ? 'left-1 bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'left-[calc(50%+4px)] bg-gradient-to-r from-amber-400 to-orange-500'
                  }`}
                />
              </div>

              <div
                className={`relative overflow-hidden transition-all duration-700 ${heroCard}`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  {mode === PracticeType.MORNING_IAM ? (
                    <Sun size={90} className="rotate-12 text-amber-300" />
                  ) : (
                    <Moon size={90} className="-rotate-12 text-amber-300" />
                  )}
                </div>

                <div className="relative z-10 text-center">
                  <p
                    className={`mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] ${sectionKicker}`}
                  >
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
                          className={`h-16 rounded-xl backdrop-blur-md border transition-all flex flex-col items-center justify-center space-y-0.5 group shadow-md ${buttonBg} hover:scale-105`}
                        >
                          <span
                            className={`text-xl font-bold ${
                              theme === 'light'
                                ? 'text-slate-800'
                                : 'text-white'
                            }`}
                          >
                            {dur}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              theme === 'light'
                                ? 'text-slate-500'
                                : 'text-slate-300'
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
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Duration
                        </span>
                        <span className="text-xl font-bold text-amber-400">
                          {customTime}{' '}
                          <span className="text-xs text-white/60 font-normal">
                            MIN
                          </span>
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
                        className="w-full mt-3 py-2 rounded-xl border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
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
                      <span
                        className={`block text-[10px] font-bold uppercase tracking-widest group-hover:opacity-100 opacity-70 transition-opacity ${
                          mode === PracticeType.MORNING_IAM
                            ? sacredActionText
                            : 'mx-auto w-fit rounded-full bg-black/75 px-3 py-1 text-white shadow-md'
                        }`}
                      >
                        Prefer A Longer Experience?
                      </span>
                      <span
                        className={`mt-1 block text-[10px] opacity-50 group-hover:opacity-70 transition-opacity ${
                          mode === PracticeType.MORNING_IAM
                            ? subTextColor
                            : 'mx-auto w-fit rounded-full bg-black/70 px-3 py-1 text-white shadow-md'
                        }`}
                      >
                        Click to choose a custom time.
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {onOpenMeditation && (
            <div className={sectionFrame}>
              <div className="flex justify-center mb-3">
                <h3 className={lowerSectionTitle}>Meditation</h3>
              </div>
              <div
                className={infoCardBg}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        theme === 'light'
                          ? 'bg-violet-100 border border-violet-300/50 text-violet-600'
                          : 'bg-amber-500/12 border border-amber-500/25 text-amber-200'
                      }`}
                    >
                      <Wind size={20} />
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm ${
                          theme === 'light'
                            ? 'text-violet-900'
                            : 'text-white'
                        }`}
                      >
                        Meditation Practice
                      </h3>
                      <p
                        className={`text-[10px] ${
                          theme === 'light'
                            ? 'text-violet-700'
                            : 'text-slate-200'
                        }`}
                      >
                        Guided Stillness: Choose duration and soundscape for
                        silent meditation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playBell()
                      onOpenMeditation()
                    }}
                    className={`py-2 rounded-lg font-bold text-sm transition-all px-4 ${
                      theme === 'light'
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={sectionFrame}>
            <div className="flex justify-center mb-3">
              <h3 className={lowerSectionTitle}>Temple Sound</h3>
            </div>

            <div className={infoCardBg}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className={`flex items-center space-x-2 text-xs uppercase font-bold tracking-wider ${lowCardLabelText}`}>
                    <Music size={14} />
                    <span>Now Playing</span>
                  </div>
                  <span
                    className={`mt-1 block truncate text-sm font-semibold ${lowCardBodyText}`}
                  >
                    {currentTrackName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    playBell()
                    onOpenSettings()
                  }}
                  className={`shrink-0 text-xs font-extrabold tracking-wide hover:underline ${lowCardLabelText}`}
                >
                  CHANGE
                </button>
              </div>
            </div>

            <div className={`${infoCardBg} mt-3 space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music size={14} className={lowCardLabelText} />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${lowCardBodyText}`}
                  >
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
                <span
                  className={`shrink-0 text-xs font-bold uppercase tracking-wider ${lowCardBodyText}`}
                >
                  Vol
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambienceVolume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1"
                  aria-label="Music volume"
                />
                <span className={`w-8 text-right text-xs font-bold ${lowCardLabelText}`}>
                  {ambienceVolume}%
                </span>
              </div>
            </div>
          </div>

          <div className={`${infoCardBg} space-y-1.5 text-center`}>
            <p className={`text-xs font-semibold ${lowCardBodyText}`}>
              Based on the book "I Am Practice" by
            </p>
            <p
              className={`text-sm font-serif font-bold ${
                theme === 'light' ? 'text-slate-950' : 'text-amber-100'
              }`}
            >
              Michael Soaries
            </p>
            <a
              href="https://abundantthought.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center space-x-1 text-xs font-bold tracking-wider uppercase hover:underline ${lowCardLabelText}`}
            >
              <span>Visit AbundantThought.com</span>
              <ExternalLink size={12} />
            </a>

            <div className="pt-1">
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
