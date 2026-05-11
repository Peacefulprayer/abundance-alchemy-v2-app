import React, { useMemo, useState } from 'react'
import { PracticeType } from '../types'
import type { Affirmation, GratitudeLog, Soundscape } from '../types'
import { audioManager } from '../services/audioManager'
import {
  SCREEN_PAGE_SHELL,
  SCREEN_TITLE_PILL,
  SCREEN_PRIMARY_BUTTON,
  screenHeroCard,
  screenInputBg,
  screenSectionFrame,
  screenSectionKicker,
  screenSubTextColor,
  screenSurfaceCard,
  screenTextColor,
} from '../styles/sacredScreen'

const CATEGORY_OPTIONS = [
  'General',
  'Peace',
  'Purpose',
  'Love & Relationships',
  'Wealth & Abundance',
  'Confidence & Inner Strength',
  'Health & Wholeness',
  'Self-Love & Worthiness',
] as const

interface LibraryProps {
  affirmations?: Affirmation[]
  customAffirmations?: Affirmation[]
  gratitudeLogs?: GratitudeLog[]
  onAdd: (
    text: string,
    type: PracticeType,
    category?: string,
  ) =>
    | Promise<{ ok: boolean; message?: string }>
    | { ok: boolean; message?: string }
  onRemove: (id: string) => Promise<void> | void
  onAudioUpload:
    | React.Dispatch<React.SetStateAction<File | null>>
    | ((file: File) => void)
  userAudioFile: File | null
  theme: 'light' | 'dark'
  soundscapes?: Soundscape[]
  activeSoundscapeId?: string
  onSetActiveSoundscape?: (id: string) => void
}

export const Library: React.FC<LibraryProps> = (props) => {
  const {
    theme,
    gratitudeLogs = [],
    onAdd,
    onRemove,
    onAudioUpload,
    userAudioFile,
    soundscapes = [],
    activeSoundscapeId,
    onSetActiveSoundscape,
  } = props

  const affirmations = useMemo(
    () => props.affirmations ?? props.customAffirmations ?? [],
    [props.affirmations, props.customAffirmations],
  )

  const [previewingId, setPreviewingId] = useState<string>('')
  const [newAffirmationText, setNewAffirmationText] = useState('')
  const [newAffirmationType, setNewAffirmationType] = useState<PracticeType>(
    PracticeType.MORNING_IAM,
  )
  const [newAffirmationCategory, setNewAffirmationCategory] =
    useState<string>('General')
  const [isSavingAffirmation, setIsSavingAffirmation] = useState(false)
  const [affirmationStatus, setAffirmationStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  const textColor = screenTextColor(theme)
  const subTextColor = screenSubTextColor(theme)
  const titlePill = SCREEN_TITLE_PILL
  const sectionFrame = screenSectionFrame(theme)
  const heroCard = `${screenHeroCard(theme)} text-inherit`
  const cardBg = `${screenSurfaceCard(theme)} text-inherit`
  const itemBorder =
    theme === 'light'
      ? 'border-amber-200/55 bg-white/92'
      : 'border-amber-500/15 bg-slate-950/82'
  const inputBg = screenInputBg(theme)
  const pageShell = `${SCREEN_PAGE_SHELL} pb-24`
  const sectionKicker = screenSectionKicker(theme)

  const handleAddAffirmation = async () => {
    const text = newAffirmationText.trim()
    if (!text || isSavingAffirmation) return

    setIsSavingAffirmation(true)
    setAffirmationStatus(null)
    try {
      const result = await onAdd(
        text,
        newAffirmationType,
        newAffirmationCategory,
      )
      if (!result?.ok) {
        setAffirmationStatus({
          kind: 'error',
          message: result?.message || 'Unable to save affirmation right now.',
        })
        return
      }

      setNewAffirmationText('')
      setNewAffirmationCategory('General')
      setAffirmationStatus({
        kind: 'success',
        message: 'Affirmation added.',
      })
    } catch {
      setAffirmationStatus({
        kind: 'error',
        message: 'Unable to save affirmation right now.',
      })
    } finally {
      setIsSavingAffirmation(false)
    }
  }

  return (
    <div
      className={`h-full w-full overflow-y-auto px-4 pt-4 custom-scrollbar ${textColor}`}
    >
      <div className={pageShell}>
        <div className={sectionFrame}>
          <div className={`${heroCard} p-5`}>
            <span className={titlePill}>Maktaba</span>
            <h2 className="mt-4 text-2xl font-serif font-medium">
              Sacred Library (Maktaba) Space
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${subTextColor}`}>
              Keep your sound, affirmations, and gratitude reflections gathered
              in one place for easy return.
            </p>
          </div>
        </div>

        {!!soundscapes.length && (
          <div className={sectionFrame}>
            <div className="px-1">
              <h3 className={titlePill}>Soundscapes</h3>
            </div>
            <div
              className={`mt-3 ${cardBg}`}
            >
              <p className={sectionKicker}>Available Atmospheres</p>
              <div className="mt-3 space-y-3">
                {soundscapes.map((s) => {
                  const id = String(s.id)
                  const previewing = previewingId === id
                  const isActive = activeSoundscapeId === id
                  return (
                    <div
                      key={id}
                      className={`rounded-[20px] border p-3 ${itemBorder}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.label}
                          </div>
                          <div
                            className={`mt-1 text-[11px] ${subTextColor} truncate`}
                          >
                            {s.category || 'Sacred ambience'}
                          </div>
                        </div>
                        {isActive ? (
                          <span className={titlePill}>Active</span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className={`flex-1 rounded-full border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                            theme === 'light'
                              ? 'border-amber-200/70 bg-white/90 hover:bg-white'
                              : 'border-amber-500/20 bg-slate-950/75 hover:bg-slate-950'
                          }`}
                          onClick={() => {
                            setPreviewingId(id)
                            audioManager.previewSoundscape(s)
                          }}
                        >
                          {previewing ? 'Previewing' : 'Preview'}
                        </button>
                        {onSetActiveSoundscape ? (
                          <button
                            className="flex-1 rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)]"
                            onClick={() => onSetActiveSoundscape(id)}
                          >
                            {isActive ? 'Selected' : 'Set'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className={sectionFrame}>
          <div className="px-1">
            <h3 className={titlePill}>Your Audio</h3>
          </div>
          <div className={`mt-3 ${cardBg}`}>
            <p className={sectionKicker}>Upload a Personal Track</p>
            <label
              className={`mt-3 flex cursor-pointer items-center justify-center rounded-[20px] border border-dashed px-4 py-6 text-center transition-colors ${
                theme === 'light'
                  ? 'border-amber-300/65 bg-white/80 hover:bg-white'
                  : 'border-amber-500/30 bg-slate-950/70 hover:bg-slate-950'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (typeof onAudioUpload === 'function') {
                    // Works for both a React state setter and a direct callback.
                    // @ts-ignore
                    onAudioUpload(f)
                  }
                }}
              />
              <div>
                <p className="text-sm font-medium">Choose an audio file</p>
                <p className={`mt-1 text-xs ${subTextColor}`}>
                  Add a personal meditation or ambience track to your sacred
                  space.
                </p>
              </div>
            </label>
            {userAudioFile ? (
              <div
                className={`mt-3 rounded-[20px] border px-4 py-3 text-sm shadow-sm ${itemBorder}`}
              >
                {userAudioFile.name}
              </div>
            ) : null}
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="px-1">
            <h3 className={titlePill}>Affirmations</h3>
          </div>
          <div className={`mt-3 ${cardBg}`}>
            <p className={sectionKicker}>Write Your Own</p>
            <div className="mt-3 space-y-3">
              <textarea
                value={newAffirmationText}
                onChange={(e) => setNewAffirmationText(e.target.value)}
                placeholder="Add your personal affirmation..."
                rows={3}
                className={`w-full rounded-[20px] border p-3 text-sm ${inputBg}`}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,120px)_minmax(0,1fr)_auto]">
                <select
                  value={newAffirmationType}
                  onChange={(e) =>
                    setNewAffirmationType(e.target.value as PracticeType)
                  }
                  className={`rounded-full border px-3 py-2 text-xs font-medium ${inputBg}`}
                >
                  <option value={PracticeType.MORNING_IAM}>I Am</option>
                  <option value={PracticeType.EVENING_ILOVE}>I Love</option>
                </select>
                <select
                  value={newAffirmationCategory}
                  onChange={(e) => setNewAffirmationCategory(e.target.value)}
                  className={`min-w-0 rounded-full border px-3 py-2 text-xs font-medium ${inputBg}`}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  className={`${SCREEN_PRIMARY_BUTTON} px-4 py-2 disabled:opacity-50`}
                  onClick={handleAddAffirmation}
                  disabled={isSavingAffirmation || !newAffirmationText.trim()}
                >
                  {isSavingAffirmation ? 'Saving' : 'Add'}
                </button>
              </div>
              {affirmationStatus ? (
                <div
                  className={`rounded-[18px] border px-3 py-2 text-xs ${
                    affirmationStatus.kind === 'success'
                      ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300'
                      : 'border-red-400/35 bg-red-500/10 text-red-200'
                  }`}
                >
                  {affirmationStatus.message}
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {affirmations.length === 0 ? (
                <div
                  className={`rounded-[20px] border px-4 py-5 text-sm ${itemBorder}`}
                >
                  No affirmations yet.
                </div>
              ) : (
                affirmations.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-[20px] border p-3 ${itemBorder}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm leading-relaxed">{a.text}</div>
                        {a.category ? (
                          <div
                            className={`mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}
                          >
                            {a.category}
                          </div>
                        ) : null}
                      </div>
                      <button
                        className="text-[11px] font-medium uppercase tracking-[0.18em] text-red-400 hover:text-red-300"
                        onClick={() => onRemove(a.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="px-1">
            <h3 className={titlePill}>Gratitude Logs</h3>
          </div>
          <div className={`mt-3 ${cardBg}`}>
            {gratitudeLogs.length === 0 ? (
              <div
                className={`rounded-[20px] border px-4 py-5 text-sm ${itemBorder}`}
              >
                No gratitude logs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {gratitudeLogs
                  .slice()
                  .reverse()
                  .map((g) => (
                    <div
                      key={g.id}
                      className={`rounded-[20px] border p-3 ${itemBorder}`}
                    >
                      <div className={`text-[11px] ${subTextColor}`}>
                        {new Date(g.date).toLocaleDateString()} • {g.focusArea}
                      </div>
                      <div className="mt-2 text-sm italic leading-relaxed">
                        "{g.text}"
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
