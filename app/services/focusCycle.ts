import { CycleType } from '../types'

export function getFocusCycleProgress(cycle: CycleType, startedAt?: string | null, now = new Date()) {
  const totalDays = cycle === CycleType.WEEKLY ? 7 : cycle === CycleType.MONTHLY ? 30 : 1
  const parsed = startedAt ? new Date(startedAt) : now
  const start = Number.isNaN(parsed.getTime()) ? now : parsed
  const calendarDay = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const elapsed = Math.max(0, Math.round((calendarDay(now) - calendarDay(start)) / 86400000))
  return {
    totalDays,
    dayIndex: Math.min(totalDays, elapsed + 1),
    remainingDays: Math.max(0, totalDays - elapsed - 1),
    complete: elapsed >= totalDays,
  }
}
