import React from 'react'
import type { UserProfile, FocusArea } from '../types'
import {
  SCREEN_PAGE_SHELL,
  SCREEN_TITLE_PILL,
  screenBackButton,
  screenHeroCard,
  screenSectionFrame,
  screenSectionKicker,
  screenSubTextColor,
  screenSurfaceCard,
  screenTextColor,
} from '../styles/sacredScreen'

interface StatsProps {
  user: UserProfile
  theme: 'light' | 'dark'
  onBack: () => void
}

function focusLabel(f: FocusArea | undefined): string {
  if (!f) return 'Focus'
  return typeof f === 'string' ? f : f.label
}

export const Stats: React.FC<StatsProps> = ({ user, theme, onBack }) => {
  const primaryFocus = focusLabel(user.focusAreas?.[0])
  const textColor = screenTextColor(theme)
  const subTextColor = screenSubTextColor(theme)
  const titlePill = SCREEN_TITLE_PILL
  const backButton = screenBackButton(theme)
  const sectionFrame = screenSectionFrame(theme)
  const cardBg = screenHeroCard(theme)
  const statCardBg = screenSurfaceCard(theme)
  const pageShell = `${SCREEN_PAGE_SHELL} pb-24`
  const sectionKicker = screenSectionKicker(theme)

  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 ${textColor}`}>
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={backButton}
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <span className={titlePill}>Sacred Stats</span>
        </div>

        <div className={sectionFrame}>
          <div
            className={`${cardBg} p-5 text-center`}
          >
            <p className={sectionKicker}>Journey Snapshot</p>
            <h2 className="mt-3 text-2xl font-serif font-medium">
              Your Sacred Rhythm
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${subTextColor}`}>
              Track the pattern of your devotion, your current focus, and the
              momentum you are building.
            </p>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h3 className={titlePill}>Current Focus</h3>
          </div>
          <div className={`mt-3 ${screenSurfaceCard(theme)} p-5`}>
            <p className={sectionKicker}>Primary Intention</p>
            <h2 className="mt-2 text-xl font-medium">{primaryFocus}</h2>
            <p className={`mt-2 text-sm leading-relaxed ${subTextColor}`}>
              This is the space your recent practice is helping you nourish and
              bring into alignment.
            </p>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h3 className={titlePill}>Practice Totals</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div
              className={`rounded-[24px] border p-4 shadow-sm ${statCardBg}`}
            >
              <div
                className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}
              >
                Streak
              </div>
              <div className="mt-3 text-3xl font-medium">{user.streak}</div>
              <p className={`mt-1 text-xs ${subTextColor}`}>
                Consecutive days in practice
              </p>
            </div>
            <div
              className={`rounded-[24px] border p-4 shadow-sm ${statCardBg}`}
            >
              <div
                className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}
              >
                Completed
              </div>
              <div className="mt-3 text-3xl font-medium">
                {user.affirmationsCompleted}
              </div>
              <p className={`mt-1 text-xs ${subTextColor}`}>
                Affirmations spoken or received
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
