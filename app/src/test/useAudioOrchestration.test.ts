import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAudioOrchestration } from '../../hooks/useAudioOrchestration'
import { playAmbience, stopAmbience } from '../../services/audioService'
import { AppMode, AppSettings, Soundscape } from '../../types'

vi.mock('../../services/audioService', () => ({
  playAmbience: vi.fn(),
  stopAmbience: vi.fn(),
}))

const createMockSettings = (
  overrides: Partial<AppSettings['reminders']> = {},
): AppSettings => ({
  theme: 'light',
  soundEffectsOn: true,
  musicOn: true,
  soundscapeId: 'default',
  iAmSoundscapeId: 'default',
  iLoveSoundscapeId: 'default',
  meditationSoundscapeId: 'default',
  ambienceVolume: 50,
  voiceId: 'default',
  reminders: {
    enabled: false,
    mode: 'SPECIFIC_TIMES',
    intervalMinutes: 60,
    specificTimes: ['08:00', '20:00'],
    timezone: 'UTC',
    snoozeMinutes: 15,
    notificationPermission: 'default',
    practiceTimes: {
      MORNING_IAM: { enabled: true, time: '07:00' },
      EVENING_ILOVE: { enabled: true, time: '20:30' },
      MEDITATION: { enabled: false, time: '12:30' },
      PRAYER: { enabled: false, time: '06:30' },
    },
    ...overrides,
  },
})

const mockSoundscape: Soundscape = {
  id: 'forest',
  label: 'Forest Ambience',
  url: '/audio/forest.mp3',
}

describe('useAudioOrchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderUseAudioOrchestration = (
    currentMode: AppMode,
    settings: AppSettings,
    activeSoundscape: Soundscape,
    prayerVolume = 45,
    isPrayerMode = false,
  ) => {
    return renderHook(() =>
      useAudioOrchestration({
        currentMode,
        settings,
        activeSoundscape,
        prayerVolume,
        isPrayerMode,
      }),
    )
  }

  describe('Silent modes', () => {
    it('should stop ambience for PRE_SPLASH mode', () => {
      renderUseAudioOrchestration(
        AppMode.PRE_SPLASH,
        createMockSettings(),
        mockSoundscape,
      )

      expect(stopAmbience).toHaveBeenCalledWith(300)
      expect(playAmbience).not.toHaveBeenCalled()
    })

    it('should stop ambience for WELCOME mode', () => {
      renderUseAudioOrchestration(
        AppMode.WELCOME,
        createMockSettings(),
        mockSoundscape,
      )

      expect(stopAmbience).toHaveBeenCalledWith(300)
      expect(playAmbience).not.toHaveBeenCalled()
    })

    it('should stop ambience for PRACTICE mode', () => {
      renderUseAudioOrchestration(
        AppMode.PRACTICE,
        createMockSettings(),
        mockSoundscape,
      )

      expect(stopAmbience).toHaveBeenCalledWith(300)
      expect(playAmbience).not.toHaveBeenCalled()
    })
  })

  describe('Ambience modes', () => {
    it('should play ambience for DASHBOARD mode when music is on', () => {
      const settings = createMockSettings()
      renderUseAudioOrchestration(AppMode.DASHBOARD, settings, mockSoundscape)

      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
      expect(stopAmbience).not.toHaveBeenCalled()
    })

    it('should stop ambience for DASHBOARD mode when music is off', () => {
      const settings = createMockSettings()
      settings.musicOn = false
      renderUseAudioOrchestration(AppMode.DASHBOARD, settings, mockSoundscape)

      expect(stopAmbience).toHaveBeenCalledWith(300)
      expect(playAmbience).not.toHaveBeenCalled()
    })

    it('should play ambience for SETTINGS mode', () => {
      renderUseAudioOrchestration(
        AppMode.SETTINGS,
        createMockSettings(),
        mockSoundscape,
      )

      expect(playAmbience).toHaveBeenCalled()
    })
  })

  describe('Volume handling', () => {
    it('should use prayerVolume when in prayer mode', () => {
      renderUseAudioOrchestration(
        AppMode.PRAYER_SESSION,
        createMockSettings(),
        mockSoundscape,
        60,
        true,
      )

      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 60)
    })

    it('should use ambienceVolume when not in prayer mode', () => {
      renderUseAudioOrchestration(
        AppMode.DASHBOARD,
        createMockSettings(),
        mockSoundscape,
        60,
        false,
      )

      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
    })
  })

  describe('Track changes', () => {
    it('should re-play ambience when soundscape changes', () => {
      const { rerender } = renderHook(
        ({ soundscape }: { soundscape: Soundscape }) =>
          useAudioOrchestration({
            currentMode: AppMode.DASHBOARD,
            settings: createMockSettings(),
            activeSoundscape: soundscape,
            prayerVolume: 50,
            isPrayerMode: false,
          }),
        { initialProps: { soundscape: mockSoundscape } },
      )

      vi.clearAllMocks()

      const newSoundscape: Soundscape = {
        id: 'ocean',
        label: 'Ocean',
        url: '/audio/ocean.mp3',
      }
      rerender({ soundscape: newSoundscape })

      expect(playAmbience).toHaveBeenCalledWith(newSoundscape, 50)
    })
  })
})
