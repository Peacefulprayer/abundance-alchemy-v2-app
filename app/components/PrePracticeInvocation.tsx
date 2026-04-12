import React, { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import BreathingOrb from './BreathingOrb'
import { playBell } from '../services/audioService'

type PracticeVariant = 'iam' | 'ilove' | 'meditation'

interface PrePracticeInvocationProps {
  variant: PracticeVariant
  onBegin: () => void
  onSkip?: () => void
  showSkip?: boolean
}

const STORAGE_KEY_IAM = 'hidePrep_iam'
const STORAGE_KEY_ILOVE = 'hidePrep_ilove'
const STORAGE_KEY_MEDITATION = 'hidePrep_meditation'

const getStorageKey = (variant: PracticeVariant) => {
  switch (variant) {
    case 'iam':
      return STORAGE_KEY_IAM
    case 'ilove':
      return STORAGE_KEY_ILOVE
    case 'meditation':
      return STORAGE_KEY_MEDITATION
  }
}

const content = {
  iam: {
    title: 'I Am Practice',
    subtitle: 'Sacred Declaration',
    intro:
      'This is the heart of the app. Your I Am shapes the life unfolding before you. Understand this, and you understand the sacred co-creative power you hold.',
    instructions: [
      'Speak each affirmation aloud and feel it resonate in your body',
      'Tap to advance — the faster the better',
      'If one lands deeply, pause and let it settle',
      'Do not overthink — simply speak and move',
    ],
    cta: 'Begin Practice',
    orbSpeed: 4000,
    accentFrom: 'from-amber-400',
    accentTo: 'to-orange-500',
    accentText: 'text-orange-600',
    numberBg: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30',
    cardBg: 'bg-white',
    instructionBadge: 'from-amber-400 to-orange-500',
    instructionCard: 'bg-white',
  },
  ilove: {
    title: 'I Love Practice',
    subtitle: 'Sacred Appreciation',
    intro:
      "This is the heart of the app. Love is the power, the engine, the glue, the thread that holds the world — the entire universe we know and don't know together. Your capacity for love, to both give and receive, is the frequency that shapes the unfolding of your world.",
    practiceNote:
      'Evening Practice moves in a softer current than Morning I Am. This is the hour of inward turning — a time to grow quiet, to gather your heart, and to let love prepare the inner ground for rest, renewal, and the morning to come. Be sure the space is free of distractions and comfortable.',
    instructions: [
      'Feel each word in your heart and body',
      'Speak slowly, aloud or in silence',
      'Tap gently to receive the next affirmation',
      'Let love be the rhythm that carries you inward',
    ],
    readyText: 'When you are ready:',
    cta: 'Begin Practice',
    quote:
      'We practice but an ancient truth we knew before illusion seemed to claim the world. And we remind the world that it is free of all illusions every time we say:\n\nGod is but Love, and therefore so am I.',
    quoteAttribution: 'A Course in Miracles: Review Lessons 171-180',
    orbSpeed: 5000,
    accentFrom: 'from-yellow-200',
    accentTo: 'to-amber-300',
    accentText: 'text-amber-600',
    numberBg: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-400/30',
    cardBg: 'bg-white',
    instructionBadge: 'from-yellow-300 to-amber-400',
    instructionCard: 'bg-white',
  },
  meditation: {
    title: 'Meditation',
    subtitle: 'Sacred Stillness',
    intro:
      'This is the heart of the app. In stillness, you find clarity. Let go of effort and allow yourself to simply be.',
    instructions: [
      'Find a comfortable position and close your eyes',
      'Follow the guidance and let thoughts pass',
      'Return to the breath whenever the mind wanders',
      'Rest in the space between thoughts',
    ],
    cta: 'Begin Meditation',
    orbSpeed: 6000,
    accentFrom: 'from-emerald-400',
    accentTo: 'to-teal-500',
    accentText: 'text-emerald-600',
    numberBg: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30',
    cardBg: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30',
    instructionBadge: 'from-emerald-400 to-teal-500',
    instructionCard: 'bg-white/60',
  },
}

const PrePracticeInvocation: React.FC<PrePracticeInvocationProps> = ({
  variant,
  onBegin,
  onSkip,
  showSkip = true,
}) => {
  const [hideEveryTime, setHideEveryTime] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(variant))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHideEveryTime(stored === 'true')
  }, [variant])

  const handleHideEveryTimeChange = (checked: boolean) => {
    playBell()
    setHideEveryTime(checked)
    localStorage.setItem(getStorageKey(variant), String(checked))
  }

  const handleBegin = () => {
    playBell()
    onBegin()
  }

  const handleSkip = () => {
    playBell()
    onSkip?.()
  }

  const c = content[variant]

  const accentClass = `${c.accentFrom} ${c.accentTo}`

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8">
      <div className="sacred-radial-light" />

      <div className="relative z-10 mx-auto w-full max-w-[400px] space-y-6">
        <div className="text-center">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.22em] ${c.accentText}`}
          >
            {c.subtitle}
          </p>
          <h1
            className="mt-2 font-display text-3xl font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {c.title}
          </h1>
        </div>

        <div className="flex justify-center">
          <BreathingOrb size={112} breathingSpeed={c.orbSpeed} />
        </div>

        <div className="text-center">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.22em] ${c.accentText}`}
          >
            How to Practice
          </p>
        </div>

        <div
          className={`rounded-[24px] border p-5 ${c.cardBg} ${c.borderColor}`}
        >
          <p
            className="text-sm leading-relaxed text-slate-900"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {c.intro}
          </p>
          {'practiceNote' in c && c.practiceNote && (
            <p
              className="mt-3 text-sm leading-relaxed font-semibold italic text-slate-900"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {c.practiceNote}
            </p>
          )}
        </div>

        <div
          className={`rounded-[20px] border p-4 ${c.borderColor} ${c.instructionCard}`}
        >
          <ul className="space-y-2">
            {c.instructions.map((instruction, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-slate-900"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${c.numberBg || accentClass} text-[9px] font-bold text-white`}
                >
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {'readyText' in c && c.readyText && (
          <div className="text-center">
            <p className={`text-xs font-medium italic ${c.accentText}`}>
              {c.readyText}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleBegin}
            className={`flex w-full items-center justify-center gap-2 rounded-full border bg-gradient-to-r px-5 py-3 text-sm font-semibold uppercase tracking-wider text-slate-900 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${accentClass} ${c.borderColor}`}
          >
            <span>{c.cta}</span>
            <ChevronRight size={16} />
          </button>

          {showSkip && onSkip && (
            <button
              onClick={handleSkip}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-600"
            >
              <span>Skip for now</span>
            </button>
          )}

          {'quote' in c && c.quote && (
            <div
              className={`rounded-[20px] border p-4 ${c.borderColor} ${c.cardBg}`}
            >
              <p
                className="text-xs italic leading-relaxed text-slate-900"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {c.quote}
              </p>
              {'quoteAttribution' in c && c.quoteAttribution && (
                <p
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${c.accentText}`}
                >
                  — {c.quoteAttribution}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <input
              type="checkbox"
              id="hide-every-time"
              checked={hideEveryTime}
              onChange={(e) => handleHideEveryTimeChange(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <label
              htmlFor="hide-every-time"
              className="cursor-pointer text-[11px] text-slate-500"
            >
              Don&apos;t show every time
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrePracticeInvocation
