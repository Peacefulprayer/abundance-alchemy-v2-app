import { describe, it, expect } from 'vitest'
import { AppMode, PracticeType, CycleType } from '../../types'

const CORE_APP_MODES = [
  'PRE_SPLASH',
  'SPLASH',
  'WELCOME',
  'NAMING_CEREMONY',
  'AUTH',
  'RETURN_PORTAL',
  'ONBOARDING',
  'TUTORIAL',
  'DASHBOARD',
  'PRACTICE_PREP',
  'PRACTICE',
  'SETTINGS',
  'LIBRARY',
  'STATS',
  'MEDITATION_SETUP',
  'PRAYER_SETUP',
  'PRAYER_GUIDE',
  'PRAYER_SESSION',
  'PROFILE',
] as const

describe('AppMode enum', () => {
  it('should have all expected values', () => {
    for (const mode of CORE_APP_MODES) {
      expect(AppMode[mode]).toBe(mode)
    }
  })

  it('should include the core app modes without duplicate enum values', () => {
    const values = Object.values(AppMode)
    for (const mode of CORE_APP_MODES) {
      expect(values).toContain(mode)
    }
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('PracticeType enum', () => {
  it('should have all expected values', () => {
    expect(PracticeType.MORNING_IAM).toBe('MORNING_IAM')
    expect(PracticeType.EVENING_ILOVE).toBe('EVENING_ILOVE')
    expect(PracticeType.GRATITUDE).toBe('GRATITUDE')
    expect(PracticeType.MEDITATION).toBe('MEDITATION')
  })

  it('should have 4 total practice types', () => {
    const values = Object.values(PracticeType)
    expect(values).toHaveLength(4)
  })
})

describe('CycleType enum', () => {
  it('should have all expected values', () => {
    expect(CycleType.DAILY).toBe('DAILY')
    expect(CycleType.WEEKLY).toBe('WEEKLY')
    expect(CycleType.MONTHLY).toBe('MONTHLY')
  })

  it('should have 3 total cycle types', () => {
    const values = Object.values(CycleType)
    expect(values).toHaveLength(3)
  })
})
