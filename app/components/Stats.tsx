import React from 'react'
import type { UserProfile, FocusArea } from '../types'
import {
  GLASS_CARD,
  sectionKicker,
  screenSectionFrame,
  TEXT_SECONDARY,
  titlePill,
  backButton,
  pageShell,
  screenTextColor,
} from '../styles/sacredGlass'

interface StatsProps {
  user: UserProfile
  theme: 'light' | 'dark'
  onBack: () => void
}

function focusLabel(f: FocusArea | undefined): string {
  if (!f) return 'Focus'
  return typeof f === 'string' ? f : f.label
}

export const Stats: React.FC<StatsProps> = ({ user, onBack }) => {
  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 ${screenTextColor}`}>
      <div className={`${pageShell} pb-24`}>
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

        <div className={screenSectionFrame}>
          <div className={`${GLASS_CARD} p-5 text-center`}>
            <p className={sectionKicker}>Journey Snapshot</p>
            <h2 className="mt-3 text-2xl font-serif font-medium">
              Your Sacred Rhythm
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${TEXT_SECONDARY}`}>
              Track the pattern of your devotion, your current focus, and the
              momentum you are building.
            </p>
          </div>
        </div>

        <div className={screenSectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h3 className={titlePill}>Current Focus</h3>
          </div>
          <div className={`mt-3 ${GLASS_CARD} p-5`}>
            <p className={sectionKicker}>Primary Intention</p>
            <h2 className="mt-2 text-xl font-medium">{focusLabel(user.focusAreas?.[0] || '')}</h2>
            <p className={`mt-2 text-sm leading-relaxed ${TEXT_SECONDARY}`}>
              This is the space your recent practice is helping you nourish and
              bring into alignment.
            </p>
          </div>
        </div>

        <div className={screenSectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h3 className={titlePill}>Practice Totals</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className={`${GLASS_CARD} p-4`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${TEXT_SECONDARY}`}>
                Streak
              </div>
              <div className="mt-3 text-3xl font-medium">{user.streak}</div>
              <p className={`mt-1 text-xs ${TEXT_SECONDARY}`}>
                Consecutive days in practice
              </p>
            </div>
            <div className={`${GLASS_CARD} p-4`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${TEXT_SECONDARY}`}>
                Completed
              </div>
              <div className="mt-3 text-3xl font-medium">
                {user.affirmationsCompleted}
              </div>
              <p className={`mt-1 text-xs ${TEXT_SECONDARY}`}>
                Completed I Am, I Love and meditation sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
