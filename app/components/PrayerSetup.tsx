import React, { useEffect, useMemo, useState } from 'react'
import { HandHeart, ChevronRight } from 'lucide-react'
import { buttonSoundService } from '../services/buttonSoundService'
import { href } from '../services/base'
import { PRAYER_PATHS } from './prayerContent'
import type { PrayerPathId } from './prayerContent'
import type { PrayerProfile, Soundscape } from '../types'
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerBackButton,
  innerGlassPanel,
  innerHeroCard,
  innerInputBg,
  innerSectionFrame,
  innerSectionKicker,
  innerSecondaryButton,
  innerSubTextColor,
  innerSurfaceCard,
  innerTextColor,
} from '../styles/sacredInnerScreen'

interface PrayerSetupProps {
  onBack: () => void
  onContinue: (pathId: PrayerPathId, profile: PrayerProfile) => void
  initialProfile: PrayerProfile
  availableSoundscapes: Soundscape[]
  selectedSoundscapeId: string
  prayerVolume: number
  onChangeSoundscape: (id: string) => void
  onChangePrayerVolume: (volume: number) => void
  theme: 'light' | 'dark'
}

export const PrayerSetup: React.FC<PrayerSetupProps> = ({
  onBack,
  onContinue,
  initialProfile,
  availableSoundscapes,
  selectedSoundscapeId,
  prayerVolume,
  onChangeSoundscape,
  onChangePrayerVolume,
  theme,
}) => {
  const prayerCompanionHref = href('companion-pages/prayer.html')
  const [selectedPathId, setSelectedPathId] = useState<PrayerPathId | ''>(
    () => {
      try {
        const value = localStorage.getItem('abundance_prayer_path') || ''
        return (PRAYER_PATHS.find((item) => item.id === value)?.id ?? '') as
          | PrayerPathId
          | ''
      } catch {
        return ''
      }
    },
  )
  const [profile, setProfile] = useState<PrayerProfile>(initialProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(initialProfile)
  }, [initialProfile])

  const selectedPath = useMemo(
    () => PRAYER_PATHS.find((item) => item.id === selectedPathId) || null,
    [selectedPathId],
  )
  const prayerTracks = useMemo(
    () =>
      (availableSoundscapes || []).filter((s) => {
        const cat = String(s.category || '').toUpperCase()
        return !['MORNING_IAM', 'EVENING_ILOVE'].includes(cat)
      }),
    [availableSoundscapes],
  )

  const textColor = innerTextColor(theme)
  const subTextColor = innerSubTextColor(theme)
  const pageShell = INNER_PAGE_SHELL
  const titlePill = INNER_TITLE_PILL
  const sectionFrame = innerSectionFrame(theme)
  const heroCard = innerHeroCard(theme)
  const surfaceCard = innerSurfaceCard(theme)
  const glassPanel = innerGlassPanel(theme)
  const inputBg = innerInputBg(theme)
  const sectionKicker = innerSectionKicker(theme)
  const backButton = innerBackButton(theme)
  const secondaryButton = innerSecondaryButton(theme)
  const centeredSecondaryButton = secondaryButton.replace('w-full ', '')
  const prayerSetupSectionWrap = 'space-y-3'
  const prayerSetupSectionCard = surfaceCard
  const prayerSetupInputBg = inputBg

  const intentOptions: Array<{
    value: PrayerProfile['intent']
    label: string
  }> = [
    { value: 'guidance', label: 'Guidance' },
    { value: 'gratitude', label: 'Gratitude' },
    { value: 'healing', label: 'Healing' },
    { value: 'protection', label: 'Protection' },
    { value: 'provision', label: 'Provision' },
    { value: 'forgiveness', label: 'Forgiveness' },
  ]
  const toneOptions: Array<{ value: PrayerProfile['tone']; label: string }> = [
    { value: 'gentle', label: 'Gentle' },
    { value: 'contemplative', label: 'Contemplative' },
    { value: 'joyful', label: 'Joyful' },
    { value: 'bold', label: 'Bold' },
  ]
  const languageOptions: Array<{
    value: PrayerProfile['language']
    label: string
  }> = [
    { value: 'english', label: 'English' },
    { value: 'swahili', label: 'Swahili' },
    { value: 'bilingual', label: 'Bilingual (EN + SW)' },
  ]
  const styleOptions: Array<{ value: PrayerProfile['style']; label: string }> =
    [
      { value: 'short', label: 'Short' },
      { value: 'standard', label: 'Standard' },
      { value: 'extended', label: 'Extended' },
    ]

  const handleSavePath = () => {
    if (!selectedPathId) return
    try {
      localStorage.setItem('abundance_prayer_path', selectedPathId)
      localStorage.setItem('abundance_prayer_profile', JSON.stringify(profile))
    } catch {
      // ignore storage errors
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    onContinue(selectedPathId, profile)
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
          <span className={titlePill}>Omba / Pray</span>
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
            <p className={sectionKicker}>Sacred Preparation</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/12">
                <HandHeart size={18} className="text-amber-400" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-serif font-semibold">
                  Prayer Setup
                </h1>
                <p className={`mt-1 text-sm ${subTextColor}`}>
                  Choose the path, atmosphere, and prayer profile you want this
                  session to carry.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className="px-1">
            <h2 className={titlePill}>Prayer Path</h2>
          </div>
          <div className={`mt-3 space-y-3 ${prayerSetupSectionCard}`}>
            <p className={sectionKicker}>Choose Your Tradition</p>
            {PRAYER_PATHS.map((path) => {
              const active = path.id === selectedPathId
              return (
                <button
                  key={path.id}
                  onClick={() => {
                    buttonSoundService.play('click')
                    setSelectedPathId(path.id)
                  }}
                  className={`w-full rounded-[20px] border p-4 text-left transition-all ${
                    active
                      ? theme === 'light'
                        ? 'border-amber-400/80 bg-amber-100/80 shadow-sm'
                        : 'border-amber-400/60 bg-amber-500/12 shadow-[0_10px_25px_rgba(0,0,0,0.22)]'
                      : theme === 'light'
                        ? 'border-amber-200/60 bg-white/85 hover:border-amber-300'
                        : 'border-amber-500/15 bg-slate-950/70 hover:border-amber-500/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{path.label}</div>
                      <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400">
                        {path.swahili}
                      </div>
                    </div>
                    {active ? (
                      <ChevronRight
                        size={16}
                        className="mt-0.5 text-amber-400"
                      />
                    ) : null}
                  </div>
                  <p className={`mt-3 text-sm leading-relaxed ${subTextColor}`}>
                    {path.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className="px-1">
            <h2 className={titlePill}>Prayer Profile</h2>
          </div>
          <div className={`mt-3 space-y-4 ${prayerSetupSectionCard}`}>
            <p className={sectionKicker}>Intention, Tone, Language, Style</p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  className={`mb-1 block text-xs font-semibold ${subTextColor}`}
                >
                  Intention
                </label>
                <select
                  value={profile.intent}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      intent: e.target.value as PrayerProfile['intent'],
                    }))
                  }
                  className={`w-full rounded-[18px] border px-3 py-3 text-sm ${prayerSetupInputBg}`}
                >
                  {intentOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`mb-1 block text-xs font-semibold ${subTextColor}`}
                >
                  Tone
                </label>
                <select
                  value={profile.tone}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      tone: e.target.value as PrayerProfile['tone'],
                    }))
                  }
                  className={`w-full rounded-[18px] border px-3 py-3 text-sm ${prayerSetupInputBg}`}
                >
                  {toneOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`mb-1 block text-xs font-semibold ${subTextColor}`}
                >
                  Language
                </label>
                <select
                  value={profile.language}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      language: e.target.value as PrayerProfile['language'],
                    }))
                  }
                  className={`w-full rounded-[18px] border px-3 py-3 text-sm ${prayerSetupInputBg}`}
                >
                  {languageOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`mb-1 block text-xs font-semibold ${subTextColor}`}
                >
                  Style
                </label>
                <select
                  value={profile.style}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      style: e.target.value as PrayerProfile['style'],
                    }))
                  }
                  className={`w-full rounded-[18px] border px-3 py-3 text-sm ${prayerSetupInputBg}`}
                >
                  {styleOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className="px-1">
            <h2 className={titlePill}>Prayer Ambience</h2>
          </div>
          <div className={`mt-3 space-y-4 ${glassPanel}`}>
            <p className={sectionKicker}>Sound and Volume</p>
            <div>
              <label
                className={`mb-1 block text-xs font-semibold ${subTextColor}`}
              >
                Prayer Sound
              </label>
              <select
                value={selectedSoundscapeId}
                onChange={(e) => {
                  buttonSoundService.play('click')
                  onChangeSoundscape(e.target.value)
                }}
                className={`w-full rounded-[18px] border px-3 py-3 text-sm ${prayerSetupInputBg}`}
              >
                {prayerTracks.length === 0 ? (
                  <option value="">Default Prayer Ambience</option>
                ) : (
                  prayerTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.label}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className={`text-xs font-semibold ${subTextColor}`}>
                  Prayer Volume
                </label>
                <span className="text-xs font-bold text-amber-400">
                  {prayerVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={prayerVolume}
                onChange={(e) => onChangePrayerVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className={`mt-2 text-xs ${subTextColor}`}>
                The selected ambience will continue into the guide and prayer
                session.
              </p>
            </div>
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className={`${prayerSetupSectionCard} space-y-3`}>
            <a
              href={prayerCompanionHref}
              target="_blank"
              rel="noreferrer"
              className={`${centeredSecondaryButton} inline-flex items-center justify-center px-6 text-center`}
            >
              Open Prayer Companion Page
            </a>
            <button
              onClick={handleSavePath}
              disabled={!selectedPath}
              className={INNER_PRIMARY_BUTTON}
            >
              Save & Continue
            </button>

            <div
              className={`rounded-[20px] border px-4 py-3 text-center text-xs ${
                saved
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300'
                  : theme === 'light'
                    ? 'border-amber-200/60 bg-white/85 text-slate-700'
                    : 'border-amber-500/20 bg-slate-950/70 text-slate-200'
              }`}
            >
              {saved
                ? `Saved: ${selectedPath?.label || 'Prayer Path'} | ${profile.intent} | ${profile.tone}`
                : 'Your selected path and profile will carry forward into the guide and session.'}
            </div>
            <button
              type="button"
              onClick={() => {
                buttonSoundService.play('back')
                onBack()
              }}
              className={secondaryButton}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
