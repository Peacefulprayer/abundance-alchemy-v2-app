import React, { useEffect, useMemo, useState } from 'react'
import { HandHeart, ChevronRight } from 'lucide-react'
import { buttonSoundService } from '../services/buttonSoundService'
import { href } from '../services/base'
import { PRAYER_PATHS } from './prayerContent'
import BreathingOrb from './BreathingOrb'
import type { PrayerPathId } from './prayerContent'
import type { PrayerProfile, Soundscape } from '../types'
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerAccentText,
  innerBackButton,
  innerGlassPanel,
  innerHeroCard,
  innerInputBg,
  innerItemCard,
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
  const itemCard = innerItemCard(theme)
  const inputBg = innerInputBg(theme)
  const sectionKicker = innerSectionKicker(theme)
  const backButton = innerBackButton(theme)
  const secondaryButton = innerSecondaryButton(theme)
  const centeredSecondaryButton = secondaryButton.replace('w-full ', '')
  const accentText = innerAccentText(theme)
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
  const languageOptions: Array<{
    value: PrayerProfile['language']
    label: string
  }> = [
    { value: 'english', label: 'English' },
    { value: 'swahili', label: 'Swahili' },
    { value: 'bilingual', label: 'Bilingual (EN + SW)' },
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

        <div className="mt-4 flex justify-center">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
            <p className={sectionKicker}>Omba Space Preparation</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/12">
                <HandHeart size={18} className="text-amber-400" />
              </div>
              <div className="text-center">
                <h1 className="font-serif text-xl font-semibold leading-tight">
                  <span className="block">OMBA</span>
                  <span className="block">Preparations:</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className="px-1">
            <h2 className={titlePill}>Omba (Prayer) Path</h2>
          </div>
          <div className={`mt-3 space-y-3 ${prayerSetupSectionCard}`}>
            <p className={sectionKicker}>Choose Your Tradition</p>
            <select
              value={selectedPathId}
              onChange={(e) => {
                buttonSoundService.play('click')
                setSelectedPathId(e.target.value as PrayerPathId)
              }}
              className={`w-full rounded-[18px] border px-3 py-3 text-sm ${prayerSetupInputBg}`}
            >
              <option value="">Select a prayer tradition</option>
              {PRAYER_PATHS.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.label}
                </option>
              ))}
            </select>

            {selectedPath ? (
              <div className={`${itemCard} mt-3 p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {selectedPath.label}
                    </div>
                    <div className={`mt-1 text-[10px] font-extrabold uppercase tracking-[0.22em] ${accentText}`}>
                      {selectedPath.swahili}
                    </div>
                  </div>
                  <ChevronRight size={16} className="mt-0.5 text-amber-400" />
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${subTextColor}`}>
                  {selectedPath.description}
                </p>
              </div>
            ) : (
              <p className={`text-xs leading-relaxed ${subTextColor}`}>
                Choose the tradition that best holds the tone of this prayer
                session.
              </p>
            )}
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className="px-1">
            <h2 className={titlePill}>OMBA Profile</h2>
          </div>
          <div className={`mt-3 space-y-4 ${prayerSetupSectionCard}`}>
            <p className={sectionKicker}>
              Set Your Intention. Choose Your Language.
            </p>
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

            </div>
          </div>
        </div>

        <div className={prayerSetupSectionWrap}>
          <div className="px-1">
            <h2 className={titlePill}>OMBA Ambience</h2>
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
                <span className={`text-xs font-bold ${accentText}`}>
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
            <button
              onClick={handleSavePath}
              disabled={!selectedPath}
              className={INNER_PRIMARY_BUTTON}
            >
              Save & Continue
            </button>

            <div className="flex justify-center">
              <a
                href={prayerCompanionHref}
                target="_blank"
                rel="noreferrer"
                className={`${centeredSecondaryButton} inline-flex items-center justify-center px-6 text-center`}
              >
                ABOUT PRAYER
              </a>
            </div>

            <div
              className={`rounded-[20px] border px-4 py-3 text-center text-xs ${
                saved
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300'
                  : theme === 'light'
                    ? `${itemCard} text-slate-700`
                    : `${itemCard} text-slate-200`
              }`}
            >
              {saved
                ? `Saved: ${selectedPath?.label || 'Prayer Path'} | ${profile.intent} | ${profile.language}`
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
