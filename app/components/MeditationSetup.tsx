import React, { useState, useEffect } from 'react'
import { Clock, Music, Loader, PlayCircle } from 'lucide-react'
import { PracticeType, Soundscape, PracticeSessionConfig } from '../types'
import { apiService } from '../services/apiService'
import { audioManager } from '../services/audioManager'
import { buttonSoundService } from '../services/buttonSoundService'
import { href } from '../services/base'
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerBackButton,
  innerHeroCard,
  innerSectionFrame,
  innerSectionKicker,
  innerSecondaryButton,
} from '../styles/sacredInnerScreen'

interface MeditationSetupProps {
  onBack: () => void
  onBegin: (config: PracticeSessionConfig) => void
  theme: 'light' | 'dark'
  availableSoundscapes: Soundscape[]
  initialDuration?: number
}

const DURATIONS = [1, 5, 15, 30, 60]

export const MeditationSetup: React.FC<MeditationSetupProps> = ({
  onBack,
  onBegin,
  theme,
  availableSoundscapes,
  initialDuration = 15,
}) => {
  const meditationCompanionHref = href('companion-pages/meditation.html')
  const [duration, setDuration] = useState(initialDuration)
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [selectedSound, setSelectedSound] = useState<Soundscape | null>(null)
  const [meditationTracks, setMeditationTracks] = useState<Soundscape[]>([])
  const [loading, setLoading] = useState(true)

  const textColor = theme === 'light' ? 'text-slate-700' : 'text-white'
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300'
  const pageShell = INNER_PAGE_SHELL
  const sectionFrame = innerSectionFrame(theme)
  const heroCard = innerHeroCard(theme)
  const sectionKicker = innerSectionKicker(theme)
  const backButton = innerBackButton(theme)
  const secondaryButton = innerSecondaryButton(theme)
  const companionButton = secondaryButton.replace('w-full ', '')
  const meditationGlassCard =
    theme === 'light'
      ? 'rounded-[22px] bg-gradient-to-br from-violet-50/90 to-purple-50/80 border border-violet-300/40 p-4 shadow-[0_8px_24px_rgba(124,58,237,0.12)]'
      : 'rounded-[22px] bg-gradient-to-br from-violet-950/60 to-slate-900/70 border border-violet-500/25 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]'
  const meditationGlassButton =
    theme === 'light'
      ? 'rounded-[18px] border border-violet-300/50 bg-white/70 text-slate-800 transition-colors hover:bg-violet-50/50'
      : 'rounded-[18px] border border-violet-500/30 bg-violet-500/15 text-white transition-colors hover:bg-violet-500/25'

  useEffect(() => {
    let mounted = true
    const fetchTracks = async () => {
      try {
        const tracks = await apiService.getMeditationTracks()

        if (mounted) {
          if (tracks && tracks.length > 0) {
            setMeditationTracks(tracks)
            setSelectedSound(tracks[0])
          } else {
            const fallbacks = availableSoundscapes || []
            setMeditationTracks(fallbacks)
            setSelectedSound(fallbacks[0] || null)
          }
        }
      } catch (error) {
        console.error('Error loading meditation tracks:', error)
        if (mounted) {
          const fallbacks = availableSoundscapes || []
          setMeditationTracks(fallbacks)
          setSelectedSound(fallbacks[0] || null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchTracks()
    return () => {
      mounted = false
    }
  }, [availableSoundscapes])

  const handleSoundSelect = (sound: Soundscape) => {
    buttonSoundService.play('click')
    setSelectedSound(sound)
    audioManager.previewSoundscape(sound)
  }

  const handleBegin = () => {
    if (!selectedSound) return

    buttonSoundService.play('confirm')
    onBegin({
      type: PracticeType.MEDITATION,
      duration,
      soundscape: selectedSound,
      focusAreas: [],
    })
  }

  return (
    <div
      className={`h-full w-full overflow-y-auto px-4 pt-4 pb-8 custom-scrollbar ${textColor}`}
    >
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              buttonSoundService.play('back')
              onBack()
            }}
            className={backButton}
          >
            <span>←</span>
            <span className="font-semibold tracking-wide uppercase">Back</span>
          </button>
          <span className={INNER_TITLE_PILL}>Meditation Setup</span>
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
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

        <div className={sectionFrame}>
          <div className={`space-y-4 ${meditationGlassCard}`}>
            <p className={sectionKicker}>Duration</p>
            {!showCustomTime ? (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        buttonSoundService.play('click')
                        setDuration(d)
                      }}
                      className={`h-11 text-xs font-semibold ${
                        duration === d
                          ? 'rounded-[18px] border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)]'
                          : meditationGlassButton
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    buttonSoundService.play('click')
                    setShowCustomTime(true)
                  }}
                  className="mx-auto block rounded-full bg-black/75 px-4 py-2 text-center text-xs font-semibold tracking-[0.04em] text-white shadow-md transition-colors hover:bg-black/85"
                >
                  Prefer a custom timer? Choose your own meditation length.
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Custom duration</span>
                  <span className="font-bold text-amber-400">
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
                    buttonSoundService.play('back')
                    setShowCustomTime(false)
                  }}
                  className={`${meditationGlassButton} w-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]`}
                >
                  Back to Quick Times
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={sectionFrame}>
          <div className={`space-y-4 ${meditationGlassCard}`}>
            <div className="flex items-center gap-3">
              <Music className="text-violet-400" size={18} />
              <div>
                <p className={sectionKicker}>Soundscape (Acoustic Alchemy)</p>
                <h2
                  className={`mt-1 text-lg font-semibold ${theme === 'light' ? 'text-violet-700' : 'text-violet-300'}`}
                >
                  Choose Your Background Music
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[140px] flex-col items-center justify-center space-y-2">
                <Loader className="animate-spin text-amber-400" size={24} />
                <p className={`text-xs ${textColor}`}>Loading tracks...</p>
              </div>
            ) : (
              <div className="max-h-[280px] space-y-2 overflow-y-auto custom-scrollbar">
                {meditationTracks.length === 0 ? (
                  <div className="flex min-h-[140px] flex-col items-center justify-center space-y-2 rounded-[18px] border border-dashed border-amber-500/20 text-center">
                    <Music className="text-slate-500" size={32} />
                    <p className={`text-sm ${textColor}`}>No tracks found</p>
                  </div>
                ) : (
                  meditationTracks.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSoundSelect(s)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                        selectedSound?.id === s.id
                          ? theme === 'light'
                            ? 'rounded-[18px] border border-violet-400/55 bg-violet-100 text-violet-800'
                            : 'rounded-[18px] border border-violet-400/55 bg-violet-500/12 text-white'
                          : meditationGlassButton
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

        <div className={sectionFrame}>
          <div className={`${meditationGlassCard} space-y-3`}>
            <p
              className={`text-center text-[11px] font-semibold leading-relaxed ${textColor}`}
            >
              Set your intention, then breathe with the visual rhythm.
            </p>
            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleBegin}
                disabled={!selectedSound || loading}
                className={`${INNER_PRIMARY_BUTTON} px-4 py-2 text-xs w-full max-w-[280px]`}
              >
                Begin {duration} Minute Meditation
              </button>
              <a
                href={meditationCompanionHref}
                target="_blank"
                rel="noreferrer"
                className={`${companionButton} text-[10px] tracking-[0.14em] text-center`}
              >
                Open Meditation Companion Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
