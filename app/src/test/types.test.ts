import { describe, it, expect } from 'vitest'
import { AppMode, PracticeType, CycleType } from '../../types'

describe('AppMode enum', () => {
  it('should have all expected values', () => {
    expect(AppMode.PRE_SPLASH).toBe('PRE_SPLASH')
    expect(AppMode.SPLASH).toBe('SPLASH')
    expect(AppMode.WELCOME).toBe('WELCOME')
    expect(AppMode.NAMING_CEREMONY).toBe('NAMING_CEREMONY')
    expect(AppMode.AUTH).toBe('AUTH')
    expect(AppMode.RETURN_PORTAL).toBe('RETURN_PORTAL')
    expect(AppMode.ONBOARDING).toBe('ONBOARDING')
    expect(AppMode.TUTORIAL).toBe('TUTORIAL')
    expect(AppMode.DASHBOARD).toBe('DASHBOARD')
    expect(AppMode.PRACTICE_PREP).toBe('PRACTICE_PREP')
    expect(AppMode.PRACTICE).toBe('PRACTICE')
    expect(AppMode.SETTINGS).toBe('SETTINGS')
    expect(AppMode.LIBRARY).toBe('LIBRARY')
    expect(AppMode.STATS).toBe('STATS')
    expect(AppMode.MEDITATION_SETUP).toBe('MEDITATION_SETUP')
    expect(AppMode.PRAYER_SETUP).toBe('PRAYER_SETUP')
    expect(AppMode.PRAYER_GUIDE).toBe('PRAYER_GUIDE')
    expect(AppMode.PRAYER_SESSION).toBe('PRAYER_SESSION')
    expect(AppMode.PROFILE).toBe('PROFILE')
  })

  it('should have 19 total modes', () => {
    const values = Object.values(AppMode)
    expect(values).toHaveLength(19)
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
