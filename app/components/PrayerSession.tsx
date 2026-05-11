import React, { useEffect, useMemo, useState } from 'react'
import { RotateCcw, CheckCircle2, Trash2 } from 'lucide-react'
import { buttonSoundService } from '../services/buttonSoundService'
import { api } from '../services/api'
import {
  getPrayerPathById,
  PRAYER_GUIDE_STEPS,
  PRAYER_TEXTS,
} from './prayerContent'
import type { PrayerPathId } from './prayerContent'
import type { PrayerProfile, UserPrayer } from '../types'
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerBackButton,
  innerGlassPanel,
  innerInputBg,
  innerSectionKicker,
  innerSecondaryButton,
  innerSubTextColor,
  innerSurfaceCard,
  innerTextColor,
} from '../styles/sacredInnerScreen'

interface PrayerSessionProps {
  prayerPathId: PrayerPathId | null
  prayerProfile: PrayerProfile
  onBack: () => void
  onComplete: () => void
  onChangePath: () => void
  theme: 'light' | 'dark'
}

export const PrayerSession: React.FC<PrayerSessionProps> = ({
  prayerPathId,
  prayerProfile,
  onBack,
  onComplete,
  onChangePath,
  theme,
}) => {
  const LOCAL_USER_PRAYERS_KEY = 'abundance_local_user_prayers'
  const [index, setIndex] = useState(0)
  const [curatedPrayers, setCuratedPrayers] = useState<string[]>(() =>
    prayerPathId ? PRAYER_TEXTS[prayerPathId] || [] : [],
  )
  const [userPrayers, setUserPrayers] = useState<UserPrayer[]>([])
  const [guideSteps, setGuideSteps] = useState<string[]>(() =>
    prayerPathId ? PRAYER_GUIDE_STEPS[prayerPathId] || [] : [],
  )
  const [customTitle, setCustomTitle] = useState('')
  const [customText, setCustomText] = useState('')
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [isSavingPrayer, setIsSavingPrayer] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const textColor = innerTextColor(theme)
  const subTextColor = innerSubTextColor(theme)
  const pageShell = `${INNER_PAGE_SHELL} max-w-[408px] space-y-3.5`
  const sectionFrame =
    theme === 'light'
      ? 'rounded-[24px] bg-gradient-to-br from-amber-50/40 to-white/80 border border-amber-200/30 p-2.5 shadow-[0_8px_24px_rgba(180,140,80,0.12)]'
      : 'rounded-[24px] bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-white/10 p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.4)]'
  const heroCard =
    theme === 'light'
      ? 'rounded-[20px] bg-gradient-to-br from-amber-50/50 to-white/90 border border-amber-200/40 p-4 shadow-[0_12px_32px_rgba(180,140,80,0.15)]'
      : 'rounded-[20px] bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-amber-500/20 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)]'
  const sectionKicker = innerSectionKicker(theme)
  const backButton = innerBackButton(theme)
  const secondaryButton = innerSecondaryButton(theme)
  const inputBg = innerInputBg(theme)
  const surfaceCard = innerSurfaceCard(theme)
  const glassPanel = innerGlassPanel(theme)
  const prayerSessionSectionWrap = 'space-y-2'
  const prayerProfileCard = surfaceCard
  const sacredFlowCard = surfaceCard
  const customPrayerCard = surfaceCard
  const savedPrayerCard = surfaceCard
  const actionCard = glassPanel
  const prayerSessionInputBg = inputBg
  const prayerTextCard =
    theme === 'light'
      ? 'relative overflow-hidden rounded-[18px] border border-amber-300/35 bg-slate-950 px-4 py-4 text-white shadow-[0_22px_48px_rgba(15,23,42,0.32)]'
      : 'relative overflow-hidden rounded-[18px] border border-white/14 bg-slate-950/95 px-4 py-4 text-white shadow-[0_22px_48px_rgba(0,0,0,0.42)]'
  const readLocalUserPrayers = (pathId: PrayerPathId): UserPrayer[] => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_PRAYERS_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      const prayers = Array.isArray(parsed?.[pathId]) ? parsed[pathId] : []
      return prayers.filter((item: UserPrayer) => item && item.body)
    } catch {
      return []
    }
  }
  const writeLocalUserPrayers = (
    pathId: PrayerPathId,
    prayers: UserPrayer[],
  ) => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_PRAYERS_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      parsed[pathId] = prayers
      localStorage.setItem(LOCAL_USER_PRAYERS_KEY, JSON.stringify(parsed))
    } catch {
      // ignore storage errors
    }
  }
  const formatToken = (value: string) =>
    value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

  useEffect(() => {
    let isMounted = true
    setSaveError(null)
    setIndex(0)

    if (!prayerPathId) {
      setCuratedPrayers([])
      setUserPrayers([])
      setGuideSteps([])
      return () => {
        isMounted = false
      }
    }

    setIsLoadingContent(true)
    setCuratedPrayers(PRAYER_TEXTS[prayerPathId] || [])
    setGuideSteps(PRAYER_GUIDE_STEPS[prayerPathId] || [])
    const localPrayers = readLocalUserPrayers(prayerPathId)

    void Promise.allSettled([
      api.getPrayerContent(prayerPathId),
      api.getUserPrayers(prayerPathId),
    ])
      .then((results) => {
        if (!isMounted) return

        const contentResult = results[0]
        if (
          contentResult.status === 'fulfilled' &&
          contentResult.value.sessionPrayers.length > 0
        ) {
          setCuratedPrayers(contentResult.value.sessionPrayers)
          if (contentResult.value.guideSteps.length > 0) {
            setGuideSteps(contentResult.value.guideSteps)
          }
        } else {
          setCuratedPrayers(PRAYER_TEXTS[prayerPathId] || [])
          setGuideSteps(PRAYER_GUIDE_STEPS[prayerPathId] || [])
        }

        const userPrayerResult = results[1]
        if (userPrayerResult.status === 'fulfilled') {
          setUserPrayers([...userPrayerResult.value, ...localPrayers])
        } else {
          setUserPrayers(localPrayers)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingContent(false)
      })

    return () => {
      isMounted = false
    }
  }, [prayerPathId])

  const path = useMemo(
    () => (prayerPathId ? getPrayerPathById(prayerPathId) : null),
    [prayerPathId],
  )
  const prayerEntries = useMemo(
    () => [
      ...curatedPrayers.map((text) => ({
        id: `curated-${text}`,
        text,
        isUserPrayer: false,
        title: '',
      })),
      ...userPrayers.map((item) => ({
        id: `user-${item.id}`,
        text: item.body,
        isUserPrayer: true,
        title: item.title,
        userPrayerId: item.id,
      })),
    ],
    [curatedPrayers, userPrayers],
  )
  const prayerEntry = prayerEntries[index] || null

  useEffect(() => {
    if (index >= prayerEntries.length) {
      setIndex(0)
    }
  }, [index, prayerEntries.length])

  if (prayerPathId && isLoadingContent && prayerEntries.length === 0) {
    return (
      <div
        className={`h-full flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center ${textColor}`}
      >
        <p className="mb-4 text-sm">Loading prayer content...</p>
      </div>
    )
  }

  if (!prayerPathId || prayerEntries.length === 0) {
    return (
      <div
        className={`h-full flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center ${textColor}`}
      >
        <p className="mb-4 text-sm">
          No prayer content loaded for this path yet.
        </p>
        <button onClick={onChangePath} className={INNER_PRIMARY_BUTTON}>
          Select Prayer Path
        </button>
      </div>
    )
  }

  const nextPrayer = () => {
    buttonSoundService.play('click')
    setIndex((prev) => (prev + 1) % prayerEntries.length)
  }

  const handleSavePrayer = async () => {
    if (!prayerPathId || !customText.trim()) return
    setIsSavingPrayer(true)
    setSaveError(null)
    try {
      const result = await api.addUserPrayer(
        prayerPathId,
        customText.trim(),
        customTitle.trim(),
      )
      if (!result?.success) {
        throw new Error(result?.message || 'Unable to save prayer.')
      }
      const refreshed = await api.getUserPrayers(prayerPathId)
      const localPrayers = readLocalUserPrayers(prayerPathId)
      setUserPrayers([...refreshed, ...localPrayers])
      setCustomTitle('')
      setCustomText('')
      setIndex(curatedPrayers.length)
    } catch (error) {
      const localPrayer: UserPrayer = {
        id: `local-${Date.now()}`,
        path_key: prayerPathId,
        title: customTitle.trim(),
        body: customText.trim(),
        created_at: new Date().toISOString(),
      }
      const nextLocal = [...readLocalUserPrayers(prayerPathId), localPrayer]
      writeLocalUserPrayers(prayerPathId, nextLocal)
      setUserPrayers((prev) => [...prev, localPrayer])
      setCustomTitle('')
      setCustomText('')
      setIndex(curatedPrayers.length)
      setSaveError(
        error instanceof Error
          ? `${error.message} Saved on this device instead.`
          : 'Saved on this device instead.',
      )
    } finally {
      setIsSavingPrayer(false)
    }
  }

  const handleDeletePrayer = async (id: string) => {
    if (!prayerPathId) return
    try {
      if (id.startsWith('local-')) {
        const refreshedLocal = readLocalUserPrayers(prayerPathId).filter(
          (item) => item.id !== id,
        )
        writeLocalUserPrayers(prayerPathId, refreshedLocal)
        setUserPrayers((prev) => prev.filter((item) => item.id !== id))
      } else {
        await api.removeUserPrayer(id)
        const refreshed = await api.getUserPrayers(prayerPathId)
        const localPrayers = readLocalUserPrayers(prayerPathId)
        setUserPrayers([...refreshed, ...localPrayers])
      }
      setIndex((prev) => Math.max(0, Math.min(prev, prayerEntries.length - 2)))
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Unable to remove prayer.',
      )
    }
  }

  const profileChipClass =
    theme === 'light'
      ? 'rounded-[14px] border border-amber-200/70 bg-white/82 px-2.5 py-2 text-[10px] text-slate-700'
      : 'rounded-[14px] border border-white/12 bg-slate-950/78 px-2.5 py-2 text-[10px] text-slate-100'
  const flowStepClass =
    theme === 'light'
      ? 'flex gap-2.5 rounded-[14px] border border-emerald-200/65 bg-white/88 px-3 py-2 text-slate-800'
      : 'flex gap-2.5 rounded-[14px] border border-white/12 bg-slate-950/78 px-3 py-2 text-slate-100'
  const savedPrayerItemClass =
    theme === 'light'
      ? 'rounded-[14px] border border-violet-200/70 bg-white/86 px-3 py-2.5 text-slate-700'
      : 'rounded-[14px] border border-white/12 bg-slate-950/78 px-3 py-2.5 text-slate-100'

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
          <span className={INNER_TITLE_PILL}>
            {path?.swahili || 'Prayer'} Session
          </span>
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
            <p className={sectionKicker}>Prayer Session</p>
            <h1 className="mt-2.5 text-[1.7rem] font-serif font-semibold leading-tight">
              {path?.label || 'Prayer'}
            </h1>
            <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400">
              Prayer {index + 1} of {prayerEntries.length}
            </p>
            <p className={`mt-3 text-[13px] leading-relaxed ${subTextColor}`}>
              Move slowly through the words. Let the language guide your
              breathing, posture, and attention.
            </p>
            {isLoadingContent ? (
              <p className={`mt-3 text-xs ${subTextColor}`}>
                Loading prayer content...
              </p>
            ) : null}
          </div>
        </div>

        <div className={prayerSessionSectionWrap}>
          <div className={`${prayerTextCard} min-h-[180px] flex items-center`}>
            <div className="relative z-10 w-full">
              {prayerEntry?.isUserPrayer && prayerEntry.title ? (
                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                  {prayerEntry.title}
                </p>
              ) : null}
              <p className="text-[14px] leading-6 text-white md:text-[15px] md:leading-7">
                {prayerEntry?.text || ''}
              </p>
            </div>
          </div>
        </div>

        <div className={prayerSessionSectionWrap}>
          <div className={`space-y-2.5 ${prayerProfileCard}`}>
            <p className={sectionKicker}>Prayer Profile</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Intention', formatToken(prayerProfile.intent)],
                ['Tone', formatToken(prayerProfile.tone)],
                ['Language', formatToken(prayerProfile.language)],
                ['Style', formatToken(prayerProfile.style)],
              ].map(([label, value]) => (
                <div key={label} className={profileChipClass}>
                  <div className="font-extrabold uppercase tracking-[0.18em] text-amber-400">
                    {label}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-inherit">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <p className={`text-[12px] leading-relaxed ${subTextColor}`}>
              Curated prayers can now be managed from the backend, and your own
              saved prayers can be added to this session.
            </p>
          </div>
        </div>

        <div className={prayerSessionSectionWrap}>
          <div className={`${sacredFlowCard} space-y-2.5`}>
            <p className={sectionKicker}>Sacred Flow</p>
            <div className="space-y-2">
              {guideSteps.map((step, stepIndex) => (
                <div
                  key={`${prayerPathId}-flow-${stepIndex}`}
                  className={flowStepClass}
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-extrabold text-amber-300">
                    {stepIndex + 1}
                  </span>
                  <p
                    className={`text-[12px] leading-relaxed ${
                      theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={prayerSessionSectionWrap}>
          <div className={`${customPrayerCard} space-y-2.5`}>
            <p className={sectionKicker}>Add Your Own Prayer</p>
            <input
              type="text"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              placeholder="Optional title"
              className={`w-full rounded-[14px] border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${prayerSessionInputBg}`}
            />
            <textarea
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder="Write your personal prayer here."
              rows={4}
              className={`w-full resize-none rounded-[14px] border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${prayerSessionInputBg}`}
            />
            {saveError ? (
              <p
                className={`text-sm ${
                  theme === 'light' ? 'text-rose-700' : 'text-rose-300'
                }`}
              >
                {saveError}
              </p>
            ) : null}
            <button
              onClick={handleSavePrayer}
              disabled={isSavingPrayer || !customText.trim()}
              className={INNER_PRIMARY_BUTTON}
            >
              {isSavingPrayer ? 'Saving Prayer...' : 'Save Personal Prayer'}
            </button>
          </div>
        </div>

        {userPrayers.length > 0 ? (
          <div className={prayerSessionSectionWrap}>
            <div className={`${savedPrayerCard} space-y-2`}>
              <p className={sectionKicker}>Saved Personal Prayers</p>
              {userPrayers.map((item) => (
                <div key={item.id} className={savedPrayerItemClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {item.title ? (
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                          {item.title}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[12px] leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePrayer(item.id)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose-400/35 bg-rose-500/10 text-rose-200"
                      aria-label="Delete saved prayer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={prayerSessionSectionWrap}>
          <div className={`${actionCard} space-y-2`}>
            <button
              onClick={nextPrayer}
              className={`${INNER_PRIMARY_BUTTON} flex items-center justify-center gap-2`}
            >
              Next Prayer
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => {
                buttonSoundService.play('confirm')
                onComplete()
              }}
              className={`${secondaryButton} flex items-center justify-center gap-2`}
            >
              Complete
              <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
