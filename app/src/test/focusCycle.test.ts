import { describe, expect, it } from 'vitest'
import { CycleType } from '../../types'
import { getFocusCycleProgress } from '../../services/focusCycle'

describe('account focus periods', () => {
  const start = new Date(2026, 9, 4, 10).toISOString()
  it('shows six days remaining on the first day of a week', () => {
    expect(getFocusCycleProgress(CycleType.WEEKLY, start, new Date(2026, 9, 4, 18)))
      .toEqual({ totalDays: 7, dayIndex: 1, remainingDays: 6, complete: false })
  })
  it('uses the same saved start on another browser', () => {
    expect(getFocusCycleProgress(CycleType.WEEKLY, start, new Date(2026, 9, 5, 9)))
      .toMatchObject({ dayIndex: 2, remainingDays: 5, complete: false })
  })
  it('keeps the final day active and completes after all seven days', () => {
    expect(getFocusCycleProgress(CycleType.WEEKLY, start, new Date(2026, 9, 10, 18)).complete).toBe(false)
    expect(getFocusCycleProgress(CycleType.WEEKLY, start, new Date(2026, 9, 11, 9)).complete).toBe(true)
  })
  it('does not finish a daily period immediately on selection', () => {
    expect(getFocusCycleProgress(CycleType.DAILY, start, new Date(2026, 9, 4, 18)).complete).toBe(false)
    expect(getFocusCycleProgress(CycleType.DAILY, start, new Date(2026, 9, 5, 9)).complete).toBe(true)
  })
  it('uses a thirty-day monthly period and handles missing legacy starts', () => {
    expect(getFocusCycleProgress(CycleType.MONTHLY, start, new Date(2026, 9, 4, 18)).remainingDays).toBe(29)
    expect(getFocusCycleProgress(CycleType.WEEKLY, null).complete).toBe(false)
  })
})
