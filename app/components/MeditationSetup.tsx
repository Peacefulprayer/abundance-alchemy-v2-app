import React, { useState, useEffect } from 'react'
import { Clock, Music, Loader, PlayCircle } from 'lucide-react'
import { PracticeType, Soundscape, PracticeSessionConfig } from '../types'
import { apiService } from '../services/apiService'
import { audioManager } from '../services/audioManager'
import { buttonSoundService } from '../services/buttonSoundService'
import { href } from '../services/base'
import { playMeditationBell } from '../services/meditationBell'

const DURATIONS = [1, 5, 15, 30, 60]

// SACRED GLASSMORPHISM TOKENS - matching Dashboard/PracticeSession
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

const sectionKicker = 'text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center'
const screenSectionFrame = 'mt-5'

const pageShell = 'mx-auto w-full max-w-[408px] space-y-5 pb-8'

const titlePill = 'inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500'

const GLASS_ACTION_ROW = 'relative p-1 rounded-full flex border border-amber-500/20 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(245,158,11,0.10)]'

interface MeditationSetupProps {
  onBack: () => void
  onBegin: (config: PracticeSessionConfig) => void
  availableSoundscapes: Soundscape[]
  initialDuration?: number
  preferredSoundscapeId?: string
}

export const MeditationSetup: React.FC<MeditationSetupProps> = ({
  onBack,
  onBegin,
  availableSoundscapes,
  initialDuration = 15,
  preferredSoundscapeId,
}) => {
  const meditationCompanionHref = href('companion-pages/meditation.html')
  const [duration, setDuration] = useState(initialDuration)
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [selectedSound, setSelectedSound] = useState<Soundscape | null>(null)
  const [meditationTracks, setMeditationTracks] = useState<Soundscape[]>([])
  const [loading, setLoading] = useState(true)
  const [bellError, setBellError] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchTracks = async () => {
      try {
        const tracks = await apiService.getMeditationTracks()

        if (mounted) {
          if (tracks && tracks.length > 0) {
            setMeditationTracks(tracks)
            setSelectedSound(tracks.find(s => s.id === preferredSoundscapeId) || tracks[0])
          } else {
            const fallbacks = availableSoundscapes || []
            setMeditationTracks(fallbacks)
            setSelectedSound(fallbacks.find(s => s.id === preferredSoundscapeId) || fallbacks[0] || null)
          }
        }
      } catch (error) {
        console.error('Error loading meditation tracks:', error)
        if (mounted) {
          const fallbacks = availableSoundscapes || []
          setMeditationTracks(fallbacks)
          setSelectedSound(fallbacks.find(s => s.id === preferredSoundscapeId) || fallbacks[0] || null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchTracks()
    return () => {
      mounted = false
    }
  }, [availableSoundscapes, preferredSoundscapeId])

  const handleSoundSelect = (sound: Soundscape) => {
    setSelectedSound(sound)
    audioManager.previewSoundscape(sound)
  }

  const handleBegin = () => {
    if (!selectedSound) return

    onBegin({
      type: PracticeType.MEDITATION,
      duration,
      soundscape: selectedSound,
      focusAreas: [],
    })
  }

  const textColor = 'text-slate-100'
  const subTextColor = 'text-slate-300'

  return (
    <div
      data-no-sound="true"
      className={`h-full w-full overflow-y-auto px-4 pt-4 pb-8 custom-scrollbar ${textColor}`}
    >
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              buttonSoundService.play('back')
              onBack()
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-amber-500/20 bg-black/30 text-slate-300 hover:bg-amber-500/10 transition-colors"
          >
            <span>←</span>
            <span className="font-semibold tracking-wide uppercase">Back</span>
          </button>
          <span className={titlePill}>Meditation Setup</span>
        </div>

        {/* Header: Sacred Stillness */}
        <div className={screenSectionFrame}>
          <div className={`${GLASS_SOFT_CARD} py-5`}>
            <p className={sectionKicker}>Sacred Stillness</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/35 bg-violet-500/12">
                <Clock className="text-violet-400" size={18} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-serif text-center">
                  Choose Your Duration
                </h1>
                <p className={`mt-1 text-sm text-center ${subTextColor}`}>
                  Set the rhythm and the atmosphere before you begin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className={screenSectionFrame}>
          <div className={`${GLASS_CARD} space-y-4 p-5`}>
            <p className={sectionKicker}>Duration</p>
            {!showCustomTime ? (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDuration(d)
                      }}
                      className={`h-11 text-xs font-semibold ${
                        duration === d
                          ? 'rounded-[18px] border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)]'
                          : 'relative p-1 rounded-full flex border border-amber-500/20 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(245,158,11,0.10)]'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomTime(true)
                  }}
                  className={`mx-auto block rounded-full px-4 py-2 text-center text-xs font-semibold tracking-[0.04em] shadow-md transition-colors ${GLASS_ACTION_ROW}`}
                >
                  Prefer a custom timer? Choose your own meditation length.
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className={textColor}>Custom duration</span>
                  <span className="font-bold text-amber-200">
                    {duration} min
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-amber-500"
                  aria-label="Custom meditation duration"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomTime(false)
                  }}
                  className={`relative p-1 rounded-full flex border border-amber-500/20 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(245,158,11,0.10)] w-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]`}
                >
                  Back to Quick Times
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Soundscape Selection */}
        <div className={screenSectionFrame}>
          <div className={`${GLASS_CARD} space-y-4 p-5`}>
            <div className="flex items-center gap-3">
              <Music className="text-violet-400" size={18} />
              <div>
                <p className={sectionKicker}>Soundscape (Acoustic Alchemy)</p>
                <h2 className={`mt-1 text-lg font-semibold text-violet-300`}>
                  Choose Your Background Music
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[140px] flex-col items-center justify-center space-y-2">
                <Loader className="animate-spin text-amber-400" size={24} />
                <p className="text-xs text-slate-100">Loading tracks...</p>
              </div>
            ) : (
              <div className="max-h-[280px] space-y-2 overflow-y-auto custom-scrollbar">
                {meditationTracks.length === 0 ? (
                  <div className={`flex min-h-[140px] flex-col items-center justify-center space-y-2 border-dashed text-center ${GLASS_SOFT_CARD}`}>
                    <Music className="text-slate-500" size={32} />
                    <p className="text-sm text-slate-100">No tracks found</p>
                  </div>
                ) : (
                  meditationTracks.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSoundSelect(s)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                        selectedSound?.id === s.id
                          ? 'rounded-[18px] border border-violet-400/55 bg-violet-500/12 text-white'
                          : 'relative p-1 rounded-full flex border border-amber-500/20 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(245,158,11,0.10)]'
                      }`}
                    >
                      <span className="truncate font-medium">{s.label}</span>
                      {selectedSound?.id === s.id ? (
                        <PlayCircle size={14} className="animate-pulse" />
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Begin Button */}
        <div className={screenSectionFrame}>
          <div className={`${GLASS_CARD} space-y-3 p-5`}>
            <p className="text-center text-[11px] font-semibold leading-relaxed text-slate-100">
              Set your intention, then breathe with the visual rhythm.
            </p>
            <div className="flex flex-col items-center gap-2 w-full">
              <button
            onClick={handleBegin}
            data-no-sound="true"
                disabled={!selectedSound || loading}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 shadow-lg w-full`}
              >
                Begin {duration} Minute Meditation
              </button>
                <button type="button" data-no-sound="true"
                  onClick={() => { void playMeditationBell().then(played => setBellError(!played)) }}
                  className="w-full text-center text-sm text-amber-400 underline underline-offset-4">
                  Test meditation bell
                </button>
                <p className="text-center text-xs text-slate-300">Timer bells are separate from your music selection and music volume.</p>
                {bellError && <p role="alert" className="text-sm text-red-300">The bell could not play. Check this tab’s sound setting, then try again.</p>}
              <a
                href={meditationCompanionHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border border-amber-500/30 bg-black/30 text-amber-300 hover:bg-amber-500/10 text-center text-[10px] tracking-[0.14em]"
              >
                ABOUT MEDITATION
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
