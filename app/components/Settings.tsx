import React, { useState } from 'react'
import { AppSettings, ReminderPractice, Soundscape } from '../types'
import {
  ArrowLeft,
  Volume2,
  Music,
  RefreshCw,
  LogOut,
  Clock,
  Upload,
} from 'lucide-react'
import { buttonSoundService } from '../services/buttonSoundService'
import BreathingOrb from './BreathingOrb'
import {
  SCREEN_PAGE_SHELL,
  SCREEN_TITLE_PILL,
  screenAccentText,
  screenActionRow,
  screenBackButton,
  screenHeroCard,
  screenInputBg,
  screenItemCard,
  screenSectionFrame,
  screenSectionKicker,
  screenSubTextColor,
  screenSurfaceCard,
  screenTextColor,
} from '../styles/sacredScreen'

interface SettingsProps {
  settings: AppSettings
  onChangeSettings: (settings: AppSettings) => void
  onRequestReminderPermission?: () => void
  onPreviewSoundscape?: (id: string) => void
  onChangeFocus: () => void
  onBack: () => void
  onSignOut: () => void
  onReplayTutorial: () => void
  onReplayWelcomeInvocation: () => void
  onAudioUpload: (file: File, category: string) => void
  theme: 'light' | 'dark'
  userAudioFile: File | null
  availableSoundscapes: Soundscape[]
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onChangeSettings,
  onRequestReminderPermission,
  onPreviewSoundscape,
  onChangeFocus,
  onBack,
  onSignOut,
  onReplayTutorial,
  onReplayWelcomeInvocation,
  onAudioUpload,
  theme,
  userAudioFile,
  availableSoundscapes,
}) => {
  const [uploadCategory, setUploadCategory] = useState('MEDITATION')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const textColor = screenTextColor(theme)
  const subTextColor = screenSubTextColor(theme)
  const titlePill = SCREEN_TITLE_PILL
  const pageShell = `${SCREEN_PAGE_SHELL} pb-24`
  const sectionFrame = screenSectionFrame(theme)
  const cardBg = screenHeroCard(theme)
  const surfaceCard = screenSurfaceCard(theme)
  const itemCard = screenItemCard(theme)
  const inputBg = screenInputBg(theme)
  const sectionKicker = screenSectionKicker(theme)
  const backButton = screenBackButton(theme)
  const actionRow = screenActionRow(theme)
  const accentText = screenAccentText(theme)
  const reminderRows: Array<{ id: ReminderPractice; label: string }> = [
    { id: 'MORNING_IAM', label: 'I Am' },
    { id: 'EVENING_ILOVE', label: 'I Love' },
    { id: 'MEDITATION', label: 'Meditation' },
    { id: 'PRAYER', label: 'Omba (Prayer)' },
  ]

  const normalize = (cat: string | undefined) => (cat || '').toUpperCase()

  const ambienceTracks = availableSoundscapes.filter((s) => {
    const cat = normalize(s.category as string)
    return ![
      'MEDITATION',
      'MORNING_IAM',
      'EVENING_ILOVE',
      'CHANT',
      'OM',
    ].includes(cat)
  })

  const iAmTracks = availableSoundscapes.filter((s) =>
    ['MORNING_IAM', 'MUSIC', 'GENERAL'].includes(
      normalize(s.category as string),
    ),
  )

  const iLoveTracks = availableSoundscapes.filter((s) =>
    ['EVENING_ILOVE', 'MUSIC', 'GENERAL'].includes(
      normalize(s.category as string),
    ),
  )

  const meditationTracks = availableSoundscapes.filter((s) =>
    ['MEDITATION', 'MUSIC'].includes(normalize(s.category as string)),
  )

  const toggleSoundEffects = () => {
    buttonSoundService.play('click')
    onChangeSettings({ ...settings, soundEffectsOn: !settings.soundEffectsOn })
  }

  const toggleMusic = () => {
    buttonSoundService.play('click')
    onChangeSettings({ ...settings, musicOn: !settings.musicOn })
  }

  const updateVolume = (volume: number) => {
    onChangeSettings({ ...settings, ambienceVolume: volume })
  }

  const updateSpecificSoundscape = (key: keyof AppSettings, id: string) => {
    buttonSoundService.play('click')
    onChangeSettings({ ...settings, [key]: id })
    if (id && key !== 'soundscapeId' && onPreviewSoundscape) {
      onPreviewSoundscape(id)
    }
  }

  const toggleReminders = () => {
    buttonSoundService.play('click')
    onChangeSettings({
      ...settings,
      reminders: {
        ...settings.reminders,
        enabled: !settings.reminders.enabled,
      },
    })
  }

  const updatePracticeReminder = (
    practice: ReminderPractice,
    patch: Partial<{ enabled: boolean; time: string }>,
  ) => {
    buttonSoundService.play('click')
    const current = settings.reminders.practiceTimes[practice]
    onChangeSettings({
      ...settings,
      reminders: {
        ...settings.reminders,
        practiceTimes: {
          ...settings.reminders.practiceTimes,
          [practice]: {
            ...current,
            ...patch,
          },
        },
      },
    })
  }

  const updateSnoozeMinutes = (minutes: 15 | 30 | 60) => {
    buttonSoundService.play('click')
    onChangeSettings({
      ...settings,
      reminders: { ...settings.reminders, snoozeMinutes: minutes },
    })
  }

  const applyDeviceTimezone = () => {
    buttonSoundService.play('click')
    let timezone = settings.reminders.timezone
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || timezone
    } catch {
      // keep current timezone
    }
    onChangeSettings({
      ...settings,
      reminders: { ...settings.reminders, timezone },
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    buttonSoundService.play('click')
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = () => {
    if (uploadFile) {
      buttonSoundService.play('confirm')
      onAudioUpload(uploadFile, uploadCategory)
      setUploadFile(null)
    }
  }

  const getSourceLabel = (s: Soundscape) => {
    const isCloud = !isNaN(Number(s.id)) || s.url?.includes('user_')
    return isCloud ? `${s.label} (Uploaded)` : `${s.label} (Included)`
  }

  return (
    <div
      className={`h-full w-full overflow-y-auto px-4 pt-4 custom-scrollbar ${textColor}`}
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
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <span className={titlePill}>Settings</span>
        </div>

        <div className="mt-4 flex justify-center">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        <div className={sectionFrame}>
          <div className={`${cardBg} p-5`}>
            <p className={sectionKicker}>Personalize Your Sacred Space</p>
            <h1 className="mt-3 text-center font-serif text-xl leading-tight">
              <span className="block">Shape the Atmosphere</span>
              <span className="block">Around You</span>
            </h1>
            <p className={`mt-2 text-sm leading-relaxed ${subTextColor}`}>
              Adjust the look, sound, reminders, and support tools that hold
              your daily practice together.
            </p>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="px-1">
            <h2 className={titlePill}>Audio</h2>
          </div>
          <div className="mt-3 space-y-3">
            <div className={`${surfaceCard} p-5`}>
              <p className={sectionKicker}>Core Audio</p>
              <div className="mt-3 flex items-start gap-3">
                <Volume2 size={18} className="mt-1 text-emerald-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium uppercase tracking-[0.18em]">
                      Master Volume
                    </span>
                    <span className="text-xs font-medium text-amber-500">
                      {settings.ambienceVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.ambienceVolume}
                      aria-label="Core audio volume"
                    onChange={(e) => updateVolume(Number(e.target.value))}
                    className="mt-3 w-full cursor-pointer appearance-none rounded-lg accent-amber-500"
                  />
                  <p className={`mt-2 text-xs ${subTextColor}`}>
                    Controls ambience and music levels throughout the app.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={itemCard}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Sound Effects</p>
                      <p className={`mt-1 text-xs ${subTextColor}`}>
                        Clicks, confirmations, and transitions
                      </p>
                    </div>
                    <button
                      onClick={toggleSoundEffects}
                      className={`relative h-7 w-12 rounded-full transition-colors ${
                        settings.soundEffectsOn
                          ? 'bg-amber-500'
                          : 'bg-black/40 border border-amber-500/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                          settings.soundEffectsOn ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className={itemCard}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Music</p>
                      <p className={`mt-1 text-xs ${subTextColor}`}>
                        Background tracks during practice
                      </p>
                    </div>
                    <button
                      onClick={toggleMusic}
                      className={`relative h-7 w-12 rounded-full transition-colors ${
                        settings.musicOn ? 'bg-amber-500' : 'bg-black/40 border border-amber-500/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                          settings.musicOn ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${surfaceCard} p-5`}>
              <p className={sectionKicker}>Soundscape Assignments</p>
              <div className="mt-4 space-y-3">
                <div className={itemCard}>
                  <label className={sectionKicker}>
                    App Ambience
                  </label>
                  <p className={`mt-2 text-xs leading-relaxed ${subTextColor}`}>
                    Applies immediately to the background atmosphere when Music
                    is on.
                  </p>
                  <select
                    value={settings.soundscapeId}
                    onChange={(e) =>
                      updateSpecificSoundscape('soundscapeId', e.target.value)
                    }
                    className={`mt-2 w-full rounded-full border px-3 py-2 text-sm ${inputBg}`}
                  >
                    <option value="">Select Ambience</option>
                    {ambienceTracks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {getSourceLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={itemCard}>
                  <label className={sectionKicker}>
                    I Am Practice
                  </label>
                  <select
                    value={settings.iAmSoundscapeId}
                    onChange={(e) =>
                      updateSpecificSoundscape(
                        'iAmSoundscapeId',
                        e.target.value,
                      )
                    }
                    className={`mt-2 w-full rounded-full border px-3 py-2 text-sm ${inputBg}`}
                  >
                    <option value="">Use Default</option>
                    {iAmTracks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {getSourceLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={itemCard}>
                  <label className={sectionKicker}>
                    I Love Practice
                  </label>
                  <select
                    value={settings.iLoveSoundscapeId}
                    onChange={(e) =>
                      updateSpecificSoundscape(
                        'iLoveSoundscapeId',
                        e.target.value,
                      )
                    }
                    className={`mt-2 w-full rounded-full border px-3 py-2 text-sm ${inputBg}`}
                  >
                    <option value="">Use Default</option>
                    {iLoveTracks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {getSourceLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={itemCard}>
                  <label className={sectionKicker}>
                    Meditation
                  </label>
                  <select
                    value={settings.meditationSoundscapeId}
                    onChange={(e) =>
                      updateSpecificSoundscape(
                        'meditationSoundscapeId',
                        e.target.value,
                      )
                    }
                    className={`mt-2 w-full rounded-full border px-3 py-2 text-sm ${inputBg}`}
                  >
                    <option value="">Use Default</option>
                    {meditationTracks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {getSourceLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`${surfaceCard} p-5`}>
              <p className={sectionKicker}>Upload Your Music</p>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    'MORNING_IAM',
                    'EVENING_ILOVE',
                    'MEDITATION',
                    'AMBIENCE',
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        buttonSoundService.play('click')
                        setUploadCategory(cat)
                      }}
                      className={`rounded-full border px-2 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] transition-colors ${
                        uploadCategory === cat
                          ? 'border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 text-slate-950'
                          : `${inputBg} hover:opacity-90`
                      }`}
                    >
                      {cat === 'MORNING_IAM'
                        ? 'I Am'
                        : cat === 'EVENING_ILOVE'
                          ? 'I Love'
                          : cat === 'MEDITATION'
                            ? 'Meditation'
                            : 'Ambience'}
                    </button>
                  ))}
                </div>

                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-[20px] border border-dashed px-4 py-4 transition-colors ${
                    uploadFile
                      ? 'border-emerald-500 bg-emerald-500/10'
                        : `${actionRow}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Music
                      size={18}
                      className={
                        uploadFile ? 'text-emerald-400' : 'text-amber-500'
                      }
                    />
                    <span className="text-sm font-medium">
                      {uploadFile ? uploadFile.name : 'Choose audio file'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className={`text-xs ${subTextColor}`}>Browse</span>
                </label>

                {uploadFile ? (
                  <button
                    onClick={handleUploadSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)]"
                  >
                    <Upload size={16} />
                    <span>Upload to {uploadCategory.replace('_', ' ')}</span>
                  </button>
                ) : null}

                {userAudioFile ? (
                  <div className={itemCard}>
                    <p className="text-sm font-medium">
                      Current uploaded track
                    </p>
                    <p className={`mt-1 text-xs ${subTextColor}`}>
                      {userAudioFile.name}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h2 className={titlePill}>Practice Reminders</h2>
            <button
              onClick={toggleReminders}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                settings.reminders.enabled ? 'bg-amber-500' : 'bg-black/40 border border-amber-500/20'
              }`}
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  settings.reminders.enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className={`mt-3 ${surfaceCard} p-5`}>
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-1 text-amber-500" />
              <div>
                <p className={sectionKicker}>Gentle Structure</p>
                <p className={`mt-2 text-sm leading-relaxed ${subTextColor}`}>
                    Set times for each practice while the app is open.
                    Reminders do not currently run after you close the app.
                </p>
              </div>
            </div>

            {settings.reminders.enabled ? (
              <div className="mt-4 space-y-3">
                <div className={itemCard}>
                  <p className={sectionKicker}>
                    Timezone
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className={`text-sm break-all ${subTextColor}`}>
                      {settings.reminders.timezone}
                    </p>
                    <button
                      onClick={applyDeviceTimezone}
                      className={`rounded-full border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] ${actionRow}`}
                    >
                      Use Device
                    </button>
                  </div>
                </div>

                <div className={itemCard}>
                  <p className={sectionKicker}>
                    Practice Times
                  </p>
                  <div className="mt-3 space-y-3">
                    {reminderRows.map((row) => {
                      const rowSetting =
                        settings.reminders.practiceTimes[row.id]
                      return (
                        <div
                          key={row.id}
                          className={`${itemCard} flex items-center gap-3`}
                        >
                          <button
                            onClick={() =>
                              updatePracticeReminder(row.id, {
                                enabled: !rowSetting.enabled,
                              })
                            }
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                              rowSetting.enabled
                                ? 'bg-amber-500'
                                : 'bg-black/40 border border-amber-500/20'
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                                rowSetting.enabled ? 'left-6' : 'left-1'
                              }`}
                            />
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{row.label}</p>
                          </div>
                          <input
                            type="time"
                            value={rowSetting.time}
                            onChange={(e) =>
                              updatePracticeReminder(row.id, {
                                time: e.target.value,
                              })
                            }
                            disabled={!rowSetting.enabled}
                            className={`rounded-full border px-3 py-2 text-xs ${rowSetting.enabled ? inputBg : 'border-amber-500/10 bg-black/20 text-slate-500'}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={itemCard}>
                  <p className={sectionKicker}>
                    Default Snooze
                  </p>
                  <div className="mt-3 flex gap-2">
                    {[15, 30, 60].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() =>
                          updateSnoozeMinutes(minutes as 15 | 30 | 60)
                        }
                        className={`flex-1 rounded-full border px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] transition-colors ${
                          settings.reminders.snoozeMinutes === minutes
                            ? 'border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 text-slate-950'
                            : `${inputBg} hover:opacity-90`
                        }`}
                      >
                        {minutes}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className={itemCard}>
                  <p className={sectionKicker}>
                    Notification Permission
                  </p>
                  <p className={`mt-2 text-sm ${subTextColor}`}>
                    {settings.reminders.notificationPermission === 'granted' &&
                      'Allowed'}
                    {settings.reminders.notificationPermission === 'default' &&
                      'Not requested yet'}
                    {settings.reminders.notificationPermission === 'denied' &&
                      'Blocked in browser or device settings'}
                    {settings.reminders.notificationPermission ===
                      'unsupported' &&
                      'Not supported on this device or browser'}
                  </p>
                  {settings.reminders.notificationPermission !== 'granted' &&
                  settings.reminders.notificationPermission !==
                    'unsupported' ? (
                    <button
                      onClick={() => {
                        buttonSoundService.play('click')
                        onRequestReminderPermission?.()
                      }}
                      className={`mt-3 rounded-full border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] ${actionRow}`}
                    >
                      Request Permission
                    </button>
                  ) : null}
                  <p className={`mt-3 text-xs ${subTextColor}`}>
                    Reminders stay aligned with your local timezone and each
                    practice schedule.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${itemCard} mt-4`}>
                <p className={`text-sm leading-relaxed ${subTextColor}`}>
                  Turn reminders on when you want the app to gently call you
                  back into practice.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="px-1">
            <h2 className={titlePill}>Actions</h2>
          </div>
          <div
            className={`mt-3 ${surfaceCard} p-5`}
          >
            <div className="space-y-3">
              <button
                onClick={() => {
                  buttonSoundService.play('click')
                  onChangeFocus()
                }}
                className={`flex w-full items-center justify-between rounded-[20px] px-4 py-3 transition-colors ${actionRow}`}
              >
                <span className={`text-sm font-medium ${accentText}`}>
                  Change Focus Area
                </span>
                <RefreshCw size={16} className={accentText} />
              </button>

              <button
                onClick={() => {
                  buttonSoundService.play('click')
                  onReplayWelcomeInvocation()
                }}
                className={`flex w-full items-center justify-between rounded-[20px] px-4 py-3 transition-colors ${actionRow}`}
              >
                <span className="text-sm font-medium">
                  Replay Welcome Invocation
                </span>
                <Music size={16} />
              </button>

              <button
                onClick={() => {
                  buttonSoundService.play('click')
                  onReplayTutorial()
                }}
                className={`flex w-full items-center justify-between rounded-[20px] px-4 py-3 transition-colors ${actionRow}`}
              >
                <span className="text-sm font-medium">Replay Tutorial</span>
                <RefreshCw size={16} />
              </button>

              <button
                onClick={() => {
                  buttonSoundService.play('back')
                  onSignOut()
                }}
                className="flex w-full items-center justify-between rounded-[20px] border border-red-500/25 bg-red-500/10 px-4 py-3 transition-colors hover:bg-red-500/18"
              >
                <span className="text-sm font-medium text-red-300">
                  Sign Out
                </span>
                <LogOut size={16} className="text-red-300" />
              </button>
            </div>
          </div>
        </div>

        <div className={sectionFrame}>
          <div
            className={`${surfaceCard} p-5 text-center`}
          >
            <p className={`text-xs leading-relaxed ${subTextColor}`}>
              Abundance Alchemy v1.0.0
              <br />
              Based on "I Am Practice" by Michael Soaries
              <br />© 2024 Abundant Thought - Michael Soaries
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
