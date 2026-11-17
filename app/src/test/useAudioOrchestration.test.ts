import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAudioOrchestration } from '../../hooks/useAudioOrchestration'
import { playAmbience, stopAmbience, pauseAmbience } from '../../services/audioService'
import { AppMode, AppSettings, Soundscape } from '../../types'

vi.mock('../../services/audioService', () => ({
  playAmbience: vi.fn(),
  stopAmbience: vi.fn(),
  pauseAmbience: vi.fn(),
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
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
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

    it('keeps normal ambience in WELCOME before narration starts', () => {
      renderUseAudioOrchestration(
        AppMode.WELCOME,
        createMockSettings(),
        mockSoundscape,
      )

      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
      expect(stopAmbience).not.toHaveBeenCalled()
    })

    it('keeps app ambience during practice preparation', () => {
      renderUseAudioOrchestration(
        AppMode.PRACTICE_PREP,
        createMockSettings(),
        mockSoundscape,
      )

      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
      expect(stopAmbience).not.toHaveBeenCalled()
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

    it('should play ambience for PRACTICE mode when music is on', () => {
      const settings = createMockSettings()
      renderUseAudioOrchestration(AppMode.PRACTICE, settings, mockSoundscape)

      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
      expect(stopAmbience).not.toHaveBeenCalled()
    })
  })

  describe('Volume handling', () => {
    it('follows timer phases and keeps the music channel quiet for the end bell', () => {
      const settings=createMockSettings()
      type Phase = 'ready'|'running'|'paused'|'ending'|'reflection'
      const {rerender}=renderHook(({phase}:{phase:Phase})=>useAudioOrchestration({
        currentMode:AppMode.PRACTICE,settings,activeSoundscape:mockSoundscape,
        prayerVolume:50,isPrayerMode:false,practicePhase:phase,practiceVolume:30,
      }),{initialProps:{phase:'ready' as Phase}})
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape,50)
      rerender({phase:'running'})
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape,30)
      rerender({phase:'paused'})
      expect(pauseAmbience).toHaveBeenCalled()
      rerender({phase:'running'})
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape,30)
      rerender({phase:'ending'})
      expect(stopAmbience).toHaveBeenCalledWith(300)
      rerender({phase:'reflection'})
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape,50)
    })

    it('ducks ambience under Welcome narration and restores it when the voice ends', () => {
      const settings = createMockSettings()
      const { rerender } = renderHook(({ talking }: { talking: boolean }) =>
        useAudioOrchestration({ currentMode: AppMode.WELCOME, settings,
          activeSoundscape: mockSoundscape, prayerVolume: 50, isPrayerMode: false,
          narrationPlaying: talking }), { initialProps: { talking: false } })
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape, 50)
      rerender({ talking: true })
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape, 10)
      rerender({ talking: false })
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape, 50)
      expect(stopAmbience).not.toHaveBeenCalled()
    })

    it('keeps Music off during Welcome narration', () => {
      renderHook(() => useAudioOrchestration({ currentMode: AppMode.WELCOME,
        settings: { ...createMockSettings(), musicOn: false }, activeSoundscape: mockSoundscape,
        prayerVolume: 50, isPrayerMode: false, narrationPlaying: true }))
      expect(playAmbience).not.toHaveBeenCalled()
      expect(stopAmbience).toHaveBeenCalled()
    })

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
    it('ducks music while the dedicated meditation bell plays, then restores it', () => {
      renderUseAudioOrchestration(AppMode.MEDITATION_SETUP, createMockSettings(), mockSoundscape)
      act(() => { window.dispatchEvent(new CustomEvent('meditation-bell', {detail: true})) })
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape, 10)
      act(() => { window.dispatchEvent(new CustomEvent('meditation-bell', {detail: false})) })
      expect(playAmbience).toHaveBeenLastCalledWith(mockSoundscape, 50)
    })
    it('quiets an inactive app tab and restores its selected track on focus', () => {
      renderUseAudioOrchestration(AppMode.DASHBOARD, createMockSettings(), mockSoundscape)
      vi.clearAllMocks()
      act(() => { window.dispatchEvent(new Event('blur')) })
      expect(stopAmbience).toHaveBeenCalled()
      vi.clearAllMocks()
      act(() => { window.dispatchEvent(new Event('focus')) })
      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
    })

    it('restores the selected ambience after leaving a preview screen', () => {
      const settings = createMockSettings()
      const { rerender } = renderHook(
        ({ mode }: { mode: AppMode }) => useAudioOrchestration({
          currentMode: mode, settings, activeSoundscape: mockSoundscape,
          prayerVolume: 50, isPrayerMode: false,
        }),
        { initialProps: { mode: AppMode.LIBRARY } },
      )
      vi.clearAllMocks()
      rerender({ mode: AppMode.DASHBOARD })
      expect(playAmbience).toHaveBeenCalledWith(mockSoundscape, 50)
    })

    it('stops ambience when the app orchestration unmounts', () => {
      const { unmount } = renderUseAudioOrchestration(
        AppMode.DASHBOARD, createMockSettings(), mockSoundscape,
      )
      vi.clearAllMocks()
      unmount()
      expect(stopAmbience).toHaveBeenCalledWith(0)
    })

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
