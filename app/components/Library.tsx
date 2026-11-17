import React, { useEffect, useMemo, useState } from 'react'
import { PracticeType } from '../types'
import type { Affirmation, GratitudeLog, Soundscape } from '../types'
import { audioManager } from '../services/audioManager'
import BreathingOrb from './BreathingOrb'

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
    [props.affirmations, props.customAffirmations]
  )

  const [previewingId, setPreviewingId] = useState<string>('')
  useEffect(() => {
    if (!previewingId) return
    const timer = window.setTimeout(() => setPreviewingId(''), 10000)
    return () => window.clearTimeout(timer)
  }, [previewingId])
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
      className={`h-full w-full overflow-y-auto px-4 pt-4 custom-scrollbar text-slate-100`}
    >
      <div className="mx-auto w-full max-w-[408px] space-y-5 pb-24">
        <div className="mt-4 flex justify-center">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        <div className="mt-5">
          <div className="rounded-2xl border bg-black/40 border-amber-500/15 shadow-[0_8px_15px_rgba(0,0,0,0.6)] backdrop-blur-sm text-inherit p-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">Maktaba</span>
            <h2 className="mt-4 text-center font-serif text-xl font-medium leading-tight">
              <span className="block">Maktaba</span>
              <span className="block">Sacred Library Space</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Keep your sound, affirmations, and gratitude reflections gathered
              in one place for easy return.
            </p>
            <button type="button" onClick={() => {
              audioManager.playBell()
              const heading = document.getElementById('gratitude-logs')
              heading?.focus({preventScroll: true})
              heading?.scrollIntoView({behavior: 'smooth', block: 'start'})
            }}
              className="mt-3 inline-block text-sm text-amber-400 underline underline-offset-4">
              View Gratitude Logs ({gratitudeLogs.length})
            </button>
          </div>
        </div>

        {soundscapes.length && (
          <div className="mt-5">
            <div className="px-1">
              <h3 className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">Soundscapes</h3>
            </div>
            <div className="mt-3 rounded-2xl border bg-black/40 border-amber-500/15 shadow-[0_8px_15px_rgba(0,0,0,0.6)] backdrop-blur-sm text-inherit">
              <p className="text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center">Available Atmospheres</p>
              <div className="mt-3 space-y-3">
                {soundscapes.map((s) => {
                  const id = String(s.id)
                  const previewing = previewingId === id
                  const isActive = activeSoundscapeId === id
                  return (
                    <div
                      key={id}
                      className="rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.label}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-300 truncate">
                            {s.category || 'Sacred ambience'}
                          </div>
                        </div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">Active</span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 rounded-full border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors border-amber-500/20 bg-black/30 text-slate-300 hover:bg-amber-500/10"
                          onClick={() => {
                            if (previewing) {
                              audioManager.stopPreview()
                              setPreviewingId('')
                            } else {
                              setPreviewingId(id)
                              audioManager.previewSoundscape(s)
                            }
                          }}
                        >
                          {previewing ? 'Stop preview' : 'Preview (10 sec)'}
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

                {previewingId && (
                  <div className="mt-3 rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm p-3">
                    <p className="text-xs text-slate-300">Previewing: {soundscapes.find(s => String(s.id) === previewingId)?.label}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="px-1">
            <h3 className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">Your Audio</h3>
          </div>
          <div className="mt-3 rounded-2xl border bg-black/40 border-amber-500/15 shadow-[0_8px_15px_rgba(0,0,0,0.6)] backdrop-blur-sm text-inherit">
            <p className="text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center">Upload a Personal Track</p>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-[20px] border border-dashed px-4 py-6 text-center transition-colors border-amber-500/30 bg-black/25 hover:bg-black/35">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (typeof onAudioUpload === 'function') {
                    onAudioUpload(f)
                  }
                }}
              />
              <div>
                <p className="text-sm font-medium">Choose an audio file</p>
                <p className="mt-1 text-xs text-slate-300">
                  Add a personal meditation or ambience track to your sacred
                  space.
                </p>
              </div>
            </label>
            {userAudioFile ? (
              <div className="mt-3 rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm px-4 py-3 text-sm">
                {userAudioFile.name}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="px-1">
            <h3 className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">Affirmations</h3>
          </div>
          <div className="mt-3 rounded-2xl border bg-black/40 border-amber-500/15 shadow-[0_8px_15px_rgba(0,0,0,0.6)] backdrop-blur-sm text-inherit">
            <p className="text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center">Write Your Own</p>
            <div className="mt-3 space-y-3">
              <textarea
                value={newAffirmationText}
                onChange={(e) => setNewAffirmationText(e.target.value)}
                placeholder="Add your personal affirmation..."
                rows={3}
                className="w-full rounded-[20px] border p-3 text-sm bg-black/40 border-amber-500/20 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,120px)_minmax(0,1fr)_auto]">
                <select
                  value={newAffirmationType}
                  onChange={(e) =>
                    setNewAffirmationType(e.target.value as PracticeType)
                  }
                  className="rounded-full border px-3 py-2 text-xs font-medium bg-black/40 border-amber-500/20 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value={PracticeType.MORNING_IAM}>I Am</option>
                  <option value={PracticeType.EVENING_ILOVE}>I Love</option>
                </select>
                <select
                  value={newAffirmationCategory}
                  onChange={(e) => setNewAffirmationCategory(e.target.value)}
                  className="min-w-0 rounded-full border px-3 py-2 text-xs font-medium bg-black/40 border-amber-500/20 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 shadow-lg w-full px-4 py-2 disabled:opacity-50"
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
                <div className="rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm px-4 py-5 text-sm">
                  No affirmations yet.
                </div>
              ) : (
                affirmations.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm leading-relaxed">{a.text}</div>
                        {a.category ? (
                          <div className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-300">
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

        <div className="mt-5">
          <div className="px-1">
            <h3 id="gratitude-logs" tabIndex={-1} style={{scrollMarginTop: 16}} className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">Gratitude Logs</h3>
          </div>
          <div className="mt-3 rounded-2xl border bg-black/40 border-amber-500/15 shadow-[0_8px_15px_rgba(0,0,0,0.6)] backdrop-blur-sm text-inherit">
            {gratitudeLogs.length === 0 ? (
              <div className="rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm px-4 py-5 text-sm">
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
                      className="rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                    >
                      <div className="text-[11px] text-slate-300">
                        {new Date(g.date).toLocaleDateString()} • {g.focusArea}
                      </div>
                      <div className="mt-2 text-sm italic leading-relaxed text-slate-100">
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

