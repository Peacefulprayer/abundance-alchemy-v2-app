// App.tsx - PHASE 1: All screens wired with complete flow
// New User: PreSplash → Splash → Welcome → Naming → Auth → Onboarding → Tutorial → Dashboard
// Returning User: PreSplash → Splash → Welcome → Return Portal → Dashboard
import React, { useState, useEffect, useRef } from 'react';
import {
  AppMode,
  UserAccount,
  UserProfile,
  Soundscape,
  AppSettings,
  PracticeSessionConfig,
  PracticeType,
  Affirmation,
  GratitudeLog,
  CycleType,
  ReminderPractice,
  PrayerProfile,
} from './types';
import UniversalLayout from './components/UniversalLayout';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import PreSplash from './components/PreSplash';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PersonalGreeting } from './components/PersonalGreeting';
import { SacredNamingCeremony } from './components/SacredNamingCeremony';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { TutorialOverlay } from './components/TutorialOverlay';
import { PracticeSession } from './components/PracticeSession';
import { Settings } from './components/Settings';
import { Library } from './components/Library';
import { MeditationSetup } from './components/MeditationSetup';
import { PrayerSetup } from './components/PrayerSetup';
import { PrayerGuide } from './components/PrayerGuide';
import { PrayerSession } from './components/PrayerSession';
import { Stats } from './components/Stats';
import { Profile } from './components/Profile';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { playAmbience, stopAmbience } from './services/audioService';
import { href } from './services/base';
import type { PrayerPathId } from './components/prayerContent';

// UPDATED IMPORT: Use 'api' from the unified service
import { api, ApiError } from './services/api';

const REMINDER_LAST_FIRED_KEY = 'abundance_reminder_last_fired';
const REMINDER_SNOOZE_KEY = 'abundance_reminder_snooze';
const PRAYER_PROFILE_STORAGE_KEY = 'abundance_prayer_profile';

const REMINDER_ORDER: ReminderPractice[] = [
  'MORNING_IAM',
  'EVENING_ILOVE',
  'MEDITATION',
  'PRAYER',
];

const REMINDER_META: Record<ReminderPractice, { title: string; body: string }> = {
  MORNING_IAM: {
    title: 'I Am Practice',
    body: 'Center yourself and begin your I Am practice now.',
  },
  EVENING_ILOVE: {
    title: 'I Love Practice',
    body: 'Close your day with your I Love practice.',
  },
  MEDITATION: {
    title: 'Meditation',
    body: 'Take a quiet moment and begin meditation.',
  },
  PRAYER: {
    title: 'Omba (Prayer)',
    body: 'Pause and enter your prayer practice.',
  },
};

const detectTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const getNotificationPermissionSnapshot = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  return Notification.permission;
};

const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

const parseStoredRecord = (key: string): Record<string, any> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

const writeStoredRecord = (key: string, value: Record<string, any>) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

const getClockInTimezone = (timezone: string): { dateKey: string; hhmm: string } => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = part.value;
      }
    }
    const year = map.year || '0000';
    const month = map.month || '00';
    const day = map.day || '00';
    const hour = map.hour || '00';
    const minute = map.minute || '00';

    return {
      dateKey: `${year}-${month}-${day}`,
      hhmm: `${hour}:${minute}`,
    };
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    return {
      dateKey: `${year}-${month}-${day}`,
      hhmm: `${hour}:${minute}`,
    };
  }
};

const createDefaultSettings = (): AppSettings => ({
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
    intervalMinutes: 60, // legacy fallback
    specificTimes: ['08:00', '20:00'], // legacy fallback
    timezone: detectTimezone(),
    snoozeMinutes: 15,
    notificationPermission: getNotificationPermissionSnapshot(),
    practiceTimes: {
      MORNING_IAM: { enabled: true, time: '07:00' },
      EVENING_ILOVE: { enabled: true, time: '20:30' },
      MEDITATION: { enabled: false, time: '12:30' },
      PRAYER: { enabled: false, time: '06:30' },
    },
  },
});

const sanitizeTime = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  return /^\d{2}:\d{2}$/.test(value) ? value : fallback;
};

const normalizeSettings = (raw: any): AppSettings => {
  const base = createDefaultSettings();
  if (!raw || typeof raw !== 'object') return base;

  const reminderRaw = raw.reminders && typeof raw.reminders === 'object' ? raw.reminders : {};
  const practiceRaw = reminderRaw.practiceTimes && typeof reminderRaw.practiceTimes === 'object'
    ? reminderRaw.practiceTimes
    : {};

  const basePractice = base.reminders.practiceTimes;
  const mergedPractice = {
    MORNING_IAM: {
      enabled:
        typeof practiceRaw.MORNING_IAM?.enabled === 'boolean'
          ? practiceRaw.MORNING_IAM.enabled
          : basePractice.MORNING_IAM.enabled,
      time: sanitizeTime(practiceRaw.MORNING_IAM?.time, basePractice.MORNING_IAM.time),
    },
    EVENING_ILOVE: {
      enabled:
        typeof practiceRaw.EVENING_ILOVE?.enabled === 'boolean'
          ? practiceRaw.EVENING_ILOVE.enabled
          : basePractice.EVENING_ILOVE.enabled,
      time: sanitizeTime(practiceRaw.EVENING_ILOVE?.time, basePractice.EVENING_ILOVE.time),
    },
    MEDITATION: {
      enabled:
        typeof practiceRaw.MEDITATION?.enabled === 'boolean'
          ? practiceRaw.MEDITATION.enabled
          : basePractice.MEDITATION.enabled,
      time: sanitizeTime(practiceRaw.MEDITATION?.time, basePractice.MEDITATION.time),
    },
    PRAYER: {
      enabled:
        typeof practiceRaw.PRAYER?.enabled === 'boolean'
          ? practiceRaw.PRAYER.enabled
          : basePractice.PRAYER.enabled,
      time: sanitizeTime(practiceRaw.PRAYER?.time, basePractice.PRAYER.time),
    },
  };

  const snoozeRaw = Number(reminderRaw.snoozeMinutes);
  const snoozeMinutes = snoozeRaw === 30 || snoozeRaw === 60 ? snoozeRaw : 15;
  const permissionNow = getNotificationPermissionSnapshot();
  const storedPermission = reminderRaw.notificationPermission;
  const normalizedPermission =
    permissionNow === 'unsupported'
      ? 'unsupported'
      : storedPermission === 'granted' || storedPermission === 'denied' || storedPermission === 'default'
      ? storedPermission
      : permissionNow;

  return {
    ...base,
    ...raw,
    reminders: {
      ...base.reminders,
      ...reminderRaw,
      mode:
        reminderRaw.mode === 'INTERVAL' || reminderRaw.mode === 'SPECIFIC_TIMES'
          ? reminderRaw.mode
          : base.reminders.mode,
      intervalMinutes: Number.isFinite(Number(reminderRaw.intervalMinutes))
        ? Number(reminderRaw.intervalMinutes)
        : base.reminders.intervalMinutes,
      specificTimes: Array.isArray(reminderRaw.specificTimes)
        ? reminderRaw.specificTimes.filter((v: unknown): v is string => typeof v === 'string')
        : base.reminders.specificTimes,
      timezone:
        typeof reminderRaw.timezone === 'string' && reminderRaw.timezone.trim()
          ? reminderRaw.timezone
          : detectTimezone(),
      snoozeMinutes,
      notificationPermission: normalizedPermission,
      practiceTimes: mergedPractice,
    },
  };
};

const loadStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem('abundance_settings');
    if (!raw) return createDefaultSettings();
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return createDefaultSettings();
  }
};

const DEFAULT_PRAYER_PROFILE: PrayerProfile = {
  intent: 'guidance',
  tone: 'gentle',
  language: 'english',
  style: 'standard',
};

const normalizePrayerProfile = (raw: any): PrayerProfile => {
  const next = { ...DEFAULT_PRAYER_PROFILE };
  if (!raw || typeof raw !== 'object') return next;

  if (
    raw.intent === 'gratitude' ||
    raw.intent === 'guidance' ||
    raw.intent === 'healing' ||
    raw.intent === 'protection' ||
    raw.intent === 'provision' ||
    raw.intent === 'forgiveness'
  ) {
    next.intent = raw.intent;
  }
  if (
    raw.tone === 'gentle' ||
    raw.tone === 'bold' ||
    raw.tone === 'contemplative' ||
    raw.tone === 'joyful'
  ) {
    next.tone = raw.tone;
  }
  if (raw.language === 'english' || raw.language === 'swahili' || raw.language === 'bilingual') {
    next.language = raw.language;
  }
  if (raw.style === 'short' || raw.style === 'standard' || raw.style === 'extended') {
    next.style = raw.style;
  }

  return next;
};

const loadStoredPrayerProfile = (): PrayerProfile => {
  try {
    const raw = localStorage.getItem(PRAYER_PROFILE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PRAYER_PROFILE };
    return normalizePrayerProfile(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PRAYER_PROFILE };
  }
};

function App() {
  // START WITH PRE_SPLASH (not SPLASH)
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.PRE_SPLASH);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadStoredSettings().theme);


  // Dashboard expects UserProfile
  const [user, setUser] = useState<UserProfile | null>(null);


  const [sacredName, setSacredName] = useState<string>('');


  // ✅ Backend-validated session check
  const [authChecked, setAuthChecked] = useState(false);


  // ✅ Phase 1: Additional state for missing screens
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [sessionAmbienceUnlocked, setSessionAmbienceUnlocked] = useState(false);
  const [practiceConfig, setPracticeConfig] = useState<PracticeSessionConfig | null>(null);
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  const [activeReminder, setActiveReminder] = useState<ReminderPractice | null>(null);
  const [prayerSoundscapeId, setPrayerSoundscapeId] = useState<string>(() => {
    try {
      return localStorage.getItem('abundance_prayer_soundscape_id') || 'default';
    } catch {
      return 'default';
    }
  });
  const [prayerVolume, setPrayerVolume] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('abundance_prayer_volume');
      const parsed = raw ? Number(raw) : NaN;
      return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 45;
    } catch {
      return 45;
    }
  });
  const [prayerPathId, setPrayerPathId] = useState<PrayerPathId | null>(() => {
    try {
      const value = localStorage.getItem('abundance_prayer_path');
      if (value === 'christian' || value === 'muslim' || value === 'traditional' || value === 'universal') {
        return value;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [prayerProfile, setPrayerProfile] = useState<PrayerProfile>(() => loadStoredPrayerProfile());


  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL ?? '/abundance-alchemy-api';


  // Convert what Auth returns (UserAccount) into what Dashboard expects (UserProfile).
  const toUserProfile = (account: any): UserProfile => {
    const anyAcc = (account ?? {}) as Record<string, any>;


    const profile: UserProfile = {
      ...(anyAcc as any),


      // Identity fields
      id: anyAcc.id ?? anyAcc.user_id ?? anyAcc.email ?? 'local',
      email: anyAcc.email ?? '',
      name: anyAcc.name ?? anyAcc.username ?? anyAcc.displayName ?? '',


      // Required fields (safe defaults)
      focusAreas: anyAcc.focusAreas ?? [],
      cyclePreference: anyAcc.cyclePreference ?? CycleType.DAILY,
      streak: anyAcc.streak ?? 0,
      level: anyAcc.level ?? 1,
      affirmationsCompleted: anyAcc.affirmationsCompleted ?? 0,
      lastPracticeDate: anyAcc.lastPracticeDate ?? null,
      customAffirmations: anyAcc.customAffirmations ?? [],
      gratitudeLogs: anyAcc.gratitudeLogs ?? [],


      createdAt: anyAcc.createdAt ?? anyAcc.created_at ?? undefined,
      updatedAt: anyAcc.updatedAt ?? anyAcc.updated_at ?? undefined,
      lastActiveAt: anyAcc.lastActiveAt ?? anyAcc.last_active_at ?? undefined,
      settings: anyAcc.settings ?? undefined,
    } as UserProfile;


    return profile;
  };


  // ✅ Boot validation: server session is the source of truth.
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await api.me();
        if (!isMounted) return;

        setUser(toUserProfile(res));

        try {
          localStorage.setItem(
            'abundance_auth',
            JSON.stringify({ id: res.id, email: res.email, name: res.name })
          );
        } catch {
          // ignore storage errors
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('me.php validation failed:', e);
        localStorage.removeItem('abundance_auth');
        setUser(null);
      } finally {
        if (isMounted) setAuthChecked(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [API_BASE]);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setCurrentMode(AppMode.AUTH);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  // Keep user affirmations synced from DB after session/user is known.
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    (async () => {
      try {
        const dbAffirmations = await api.getUserAffirmations();
        if (!isMounted) return;
        setUser((prev) => (prev ? { ...prev, customAffirmations: dbAffirmations } : prev));
      } catch (e) {
        console.error('Failed to load user affirmations:', e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);


  const normalizeSoundscapes = (raw: any): Soundscape[] => {
    const rows = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];

    return rows.map((row: any, index: number) => ({
      id: String(row?.id ?? row?.soundscape_id ?? row?.name ?? index),
      label: row?.label ?? row?.name ?? row?.title ?? 'Soundscape',
      url: row?.audio_url ?? row?.url,
      category: row?.category ?? row?.usage_purpose,
    }));
  };

  // ✅ Load soundscapes from backend
  useEffect(() => {
    const loadSoundscapes = async () => {
      try {
        const raw = await api.getSoundscapes(user?.email);
        const normalized = normalizeSoundscapes(raw);
        if (normalized.length > 0) {
          setSoundscapes(normalized);
        } else {
          // Fallback default soundscape
          setSoundscapes([defaultSoundscape]);
        }
      } catch (e) {
        console.error('Failed to load soundscapes:', e);
        setSoundscapes([defaultSoundscape]);
      }
    };
    loadSoundscapes();
  }, [user?.email]);


  // ✅ Sync theme from settings
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme]);

  // Keep stored notification permission synced with browser state.
  useEffect(() => {
    const permission = getNotificationPermissionSnapshot();
    setSettings((prev) => {
      if (prev.reminders.notificationPermission === permission) return prev;
      const next = {
        ...prev,
        reminders: {
          ...prev.reminders,
          notificationPermission: permission,
        },
      };
      try {
        localStorage.setItem('abundance_settings', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const handleRequestReminderPermission = async () => {
    const permission = await requestNotificationPermission();
    setSettings((prev) => {
      if (prev.reminders.notificationPermission === permission) return prev;
      const next = {
        ...prev,
        reminders: {
          ...prev.reminders,
          notificationPermission: permission,
        },
      };
      try {
        localStorage.setItem('abundance_settings', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const triggerReminder = (practice: ReminderPractice) => {
    const reminderMeta = REMINDER_META[practice];
    setActiveReminder((current) => current ?? practice);

    if (settings.reminders.notificationPermission !== 'granted') return;
    if (typeof Notification === 'undefined') return;

    try {
      const notification = new Notification(`Abundance Alchemy: ${reminderMeta.title}`, {
        body: reminderMeta.body,
        tag: `aa-reminder-${practice}`,
      });
      notification.onclick = () => {
        window.focus();
        setActiveReminder(practice);
        notification.close();
      };
    } catch {
      // silently fail and rely on in-app reminder card
    }
  };

  useEffect(() => {
    if (!settings.reminders.enabled || !user) return;

    const runReminderCheck = () => {
      const nowMs = Date.now();
      const snoozeMap = parseStoredRecord(REMINDER_SNOOZE_KEY);
      let changedSnooze = false;

      // Snoozed reminders take priority and fire when their snooze expires.
      for (const practice of REMINDER_ORDER) {
        const snoozeUntil = Number(snoozeMap[practice] ?? 0);
        if (!Number.isFinite(snoozeUntil) || snoozeUntil <= 0) continue;
        if (snoozeUntil > nowMs) continue;

        delete snoozeMap[practice];
        changedSnooze = true;
        triggerReminder(practice);
        break;
      }

      if (changedSnooze) {
        writeStoredRecord(REMINDER_SNOOZE_KEY, snoozeMap);
        return;
      }

      const { dateKey, hhmm } = getClockInTimezone(settings.reminders.timezone);
      const lastFired = parseStoredRecord(REMINDER_LAST_FIRED_KEY);
      let changedLastFired = false;

      for (const practice of REMINDER_ORDER) {
        const schedule = settings.reminders.practiceTimes[practice];
        if (!schedule?.enabled) continue;
        if (schedule.time !== hhmm) continue;

        const snoozeUntil = Number(snoozeMap[practice] ?? 0);
        if (Number.isFinite(snoozeUntil) && snoozeUntil > nowMs) continue;

        const fireKey = `${dateKey}|${schedule.time}`;
        if (lastFired[practice] === fireKey) continue;

        lastFired[practice] = fireKey;
        changedLastFired = true;
        triggerReminder(practice);
      }

      if (changedLastFired) {
        writeStoredRecord(REMINDER_LAST_FIRED_KEY, lastFired);
      }
    };

    runReminderCheck();
    const intervalId = window.setInterval(runReminderCheck, 20000);
    return () => window.clearInterval(intervalId);
  }, [
    settings.reminders.enabled,
    settings.reminders.practiceTimes,
    settings.reminders.timezone,
    settings.reminders.notificationPermission,
    user?.email,
  ]);


  // PreSplash → SplashScreen
  const handlePreSplashComplete = () => {
    console.log('PreSplash complete → going to SplashScreen');
    setCurrentMode(AppMode.SPLASH);
  };


  // SplashScreen → WelcomeScreen
  const handleSplashComplete = () => {
    console.log('SplashScreen complete → going to WelcomeScreen');
    setCurrentMode(AppMode.WELCOME);
  };


  // ✅ WelcomeScreen → next step
  // WelcomeScreen stays sacred/unchanged; it may return DASHBOARD for returning users.
  // We only route to RETURN_PORTAL if the user has been backend-validated.
  const handleWelcomeComplete = (nextMode: AppMode) => {
    console.log('WelcomeScreen complete → going to:', nextMode);


    if (nextMode === AppMode.DASHBOARD) {
      if (user) {
        setCurrentMode(AppMode.RETURN_PORTAL);
        return;
      }
      // If somehow unvalidated, route to AUTH (safe)
      setCurrentMode(AppMode.AUTH);
      return;
    }


    setCurrentMode(nextMode);
  };


  // SacredNamingCeremony → Auth
  const handleSacredNamingComplete = (userData: { name: string }) => {
    console.log('SacredNamingCeremony complete → going to Auth');
    setSacredName(userData.name);
    setCurrentMode(AppMode.AUTH);
  };


  // ✅ FIXED: Auth register → Onboarding (not Dashboard)
  const handleAuthRegister = (account: UserAccount) => {
    console.log('Auth register → going to Onboarding');
    const profile = toUserProfile(account);
    setUser(profile);
    localStorage.setItem('abundance_auth', JSON.stringify(account));
    setAuthChecked(true);
    // NEW USER FLOW: Auth → Onboarding → Tutorial → Dashboard
    setCurrentMode(AppMode.ONBOARDING);
  };


  // ✅ After login, go to Return Portal (not Dashboard)
  const handleAuthLogin = (account: UserAccount) => {
    console.log('Auth login → going to Return Portal');
    const profile = toUserProfile(account);
    setUser(profile);


    // IMPORTANT: store session so refresh survives
    localStorage.setItem('abundance_auth', JSON.stringify(account));


    // We consider this a validated session because backend already authenticated it
    setAuthChecked(true);


    setCurrentMode(AppMode.RETURN_PORTAL);
  };


  // ✅ Onboarding complete → Tutorial
  const handleOnboardingComplete = (profile: UserProfile) => {
    console.log('Onboarding complete → going to Tutorial');
    const mergedProfile: UserProfile = {
      ...(user ?? {}),
      ...profile,
    };
    setUser(mergedProfile);
    // Save updated profile to localStorage
    localStorage.setItem('abundance_user', JSON.stringify(mergedProfile));
    // Sync focus to backend
    const email = user?.email ?? (profile as any)?.email;
    if (email) {
      api.syncProgress({ ...profile, email });
    }
    setCurrentMode(AppMode.TUTORIAL);
  };


  // ✅ Tutorial complete → Dashboard
  const handleTutorialComplete = () => {
    console.log('Tutorial complete → going to Dashboard');
    setCurrentMode(AppMode.DASHBOARD);
  };


  // ✅ Practice session complete
  const handlePracticeComplete = (log?: GratitudeLog) => {
    console.log('Practice complete → returning to Dashboard');
    stopAmbience();


    if (log && user) {
      // Add gratitude log to user profile
      const updatedUser = {
        ...user,
        gratitudeLogs: [...(user.gratitudeLogs || []), log],
        affirmationsCompleted: (user.affirmationsCompleted || 0) + 1,
      };
      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    }


    setPracticeConfig(null);
    setCurrentMode(AppMode.DASHBOARD);
  };


  // ✅ Practice session exit (without completing)
  const handlePracticeExit = () => {
    console.log('Practice exit → returning to Dashboard');
    stopAmbience();
    setPracticeConfig(null);
    setCurrentMode(AppMode.DASHBOARD);
  };


  // ✅ Settings handlers
  const handleSettingsChange = (newSettings: AppSettings) => {
    const normalized = normalizeSettings(newSettings);
    const becameEnabled = !settings.reminders.enabled && normalized.reminders.enabled;
    const baseAmbienceChanged = normalized.soundscapeId !== settings.soundscapeId;

    if (baseAmbienceChanged) {
      // Keep default ambience stable until user explicitly changes it in this session.
      setSessionAmbienceUnlocked(true);
    }

    setSettings(normalized);
    localStorage.setItem('abundance_settings', JSON.stringify(normalized));

    // Ask only when user intentionally enables reminders.
    if (becameEnabled) {
      handleRequestReminderPermission();
    }
  };


  const handleSettingsBack = () => {
    console.log('Settings back → returning to Dashboard');
    setCurrentMode(AppMode.DASHBOARD);
  };


  const handleReplayTutorial = () => {
    console.log('Replay tutorial');
    setCurrentMode(AppMode.TUTORIAL);
  };


  const handleAudioUpload = async (file: File, category: string) => {
    setUserAudioFile(file);
    if (user?.email) {
      await api.uploadUserAudio(file, category, user.email);
      // Refresh soundscapes
      const data = await api.getSoundscapes(user.email);
      if (data) setSoundscapes(data);
    }
  };


  // ✅ Library handlers
  const handleAddAffirmation = async (
    text: string,
    type: PracticeType,
    category?: string
  ): Promise<{ ok: boolean; message?: string }> => {
    if (!user?.email) {
      return { ok: false, message: 'Please sign in again before saving.' };
    }

    try {
      const result = await api.addUserAffirmation(user.email, text, type, category);
      if (!result?.success || !user) {
        return { ok: false, message: result?.message || 'Unable to save affirmation right now.' };
      }

      const dbAffirmations = await api.getUserAffirmations().catch(() => []);
      const nextAffirmations = dbAffirmations.length
        ? dbAffirmations
        : [
            ...(user.customAffirmations || []),
            {
              id: String(result.id),
              text,
              type,
              category: category || 'Personal',
              isFavorite: true,
              dateAdded: new Date().toISOString(),
            },
          ];

      const updatedUser = {
        ...user,
        customAffirmations: nextAffirmations,
      };
      setUser(updatedUser);
      return { ok: true };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setUser(null);
          setCurrentMode(AppMode.AUTH);
          return { ok: false, message: 'Your session expired. Please sign in again.' };
        }
        return { ok: false, message: error.message || 'Unable to save affirmation right now.' };
      }
      if (error instanceof Error) {
        return { ok: false, message: error.message || 'Unable to save affirmation right now.' };
      }
      return { ok: false, message: 'Unable to save affirmation right now.' };
    }
  };


  const handleRemoveAffirmation = async (id: string) => {
    await api.removeUserAffirmation(id);
    if (user) {
      const dbAffirmations = await api.getUserAffirmations().catch(() => []);
      const updatedUser = {
        ...user,
        customAffirmations: dbAffirmations.length ? dbAffirmations : (user.customAffirmations || []).filter(a => a.id !== id),
      };
      setUser(updatedUser);
    }
  };


  // ✅ Meditation setup handler
  const handleMeditationBegin = (config: PracticeSessionConfig) => {
    console.log('Meditation begin → starting practice');
    setPracticeConfig(config);
    setCurrentMode(AppMode.PRACTICE);
  };


  // ✅ Change focus handler
  const handleChangeFocus = () => {
    console.log('Change focus → Onboarding');
    setCurrentMode(AppMode.ONBOARDING);
  };


  // ✅ Open Library handler
  const handleOpenLibrary = () => {
    console.log('Dashboard: open library → LIBRARY');
    setCurrentMode(AppMode.LIBRARY);
  };


  // Keep your reset "backdoor" available
  const handleResetAndStartOver = () => {
    localStorage.clear();
    setUser(null);
    setActiveReminder(null);
    setSessionAmbienceUnlocked(false);
    setPrayerProfile({ ...DEFAULT_PRAYER_PROFILE });
    setAuthChecked(true);
    setPracticeConfig(null);
    setCurrentMode(AppMode.PRE_SPLASH);
  };


  // Dashboard-required handlers
  const handleStartPractice = (type: PracticeType, duration: number) => {
    console.log('Dashboard: start practice →', type, duration);
    const config: PracticeSessionConfig = {
      type,
      duration,
      focusAreas: user?.focusAreas || [],
      soundscape: type === PracticeType.MORNING_IAM 
        ? soundscapes.find(s => s.id === settings.iAmSoundscapeId) || defaultSoundscape
        : type === PracticeType.EVENING_ILOVE
        ? soundscapes.find(s => s.id === settings.iLoveSoundscapeId) || defaultSoundscape
        : soundscapes.find(s => s.id === settings.meditationSoundscapeId) || defaultSoundscape,
    };
    setPracticeConfig(config);
    setCurrentMode(AppMode.PRACTICE);
  };

  const handleReminderSnooze = (practice: ReminderPractice, minutes: 15 | 30 | 60) => {
    const snoozeMap = parseStoredRecord(REMINDER_SNOOZE_KEY);
    snoozeMap[practice] = Date.now() + minutes * 60 * 1000;
    writeStoredRecord(REMINDER_SNOOZE_KEY, snoozeMap);
    setActiveReminder(null);
  };

  const handleReminderStart = (practice: ReminderPractice) => {
    setActiveReminder(null);
    if (!user) {
      setCurrentMode(AppMode.AUTH);
      return;
    }

    if (practice === 'MORNING_IAM') {
      handleStartPractice(PracticeType.MORNING_IAM, 5);
      return;
    }
    if (practice === 'EVENING_ILOVE') {
      handleStartPractice(PracticeType.EVENING_ILOVE, 5);
      return;
    }
    if (practice === 'MEDITATION') {
      setCurrentMode(AppMode.MEDITATION_SETUP);
      return;
    }
    setCurrentMode(AppMode.PRAYER_SETUP);
  };

  const activeReminderMeta = activeReminder ? REMINDER_META[activeReminder] : null;


  const handleOpenMeditation = () => {
    console.log('Dashboard: open meditation setup');
    setCurrentMode(AppMode.MEDITATION_SETUP);
  };

  const handlePrayerPathContinue = (pathId: PrayerPathId, profile: PrayerProfile) => {
    setPrayerPathId(pathId);
    setPrayerProfile(profile);
    try {
      localStorage.setItem(PRAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
    setCurrentMode(AppMode.PRAYER_GUIDE);
  };

  const handlePrayerStart = () => {
    setCurrentMode(AppMode.PRAYER_SESSION);
  };

  const handlePrayerComplete = () => {
    setCurrentMode(AppMode.DASHBOARD);
  };

  const handlePrayerSoundscapeChange = (id: string) => {
    const nextId = id || 'default';
    setPrayerSoundscapeId(nextId);
    try {
      localStorage.setItem('abundance_prayer_soundscape_id', nextId);
    } catch {
      // ignore storage errors
    }
  };

  const handlePrayerVolumeChange = (volume: number) => {
    const nextVolume = Math.max(0, Math.min(100, volume));
    setPrayerVolume(nextVolume);
    try {
      localStorage.setItem('abundance_prayer_volume', String(nextVolume));
    } catch {
      // ignore storage errors
    }
  };


  const handleOpenSettings = () => {
    console.log('Dashboard: open settings → SETTINGS');
    setCurrentMode(AppMode.SETTINGS);
  };

  const handlePreviewSoundscape = (id: string) => {
    const track = soundscapes.find((s) => s.id === id);
    if (!track) return;
    playAmbience(track, settings.ambienceVolume);
  };


  const handleSignOut = () => {
    console.log('Dashboard: sign out');
    api.logout().catch(() => {});
    localStorage.removeItem('abundance_auth');
    localStorage.removeItem('abundance_user');
    localStorage.removeItem(REMINDER_LAST_FIRED_KEY);
    localStorage.removeItem(REMINDER_SNOOZE_KEY);
    setUser(null);
    setActiveReminder(null);
    setSessionAmbienceUnlocked(false);
    setAuthChecked(true);
    setCurrentMode(AppMode.AUTH);
  };


  const defaultSoundscape: Soundscape = {
    id: 'default',
    label: 'Default Ambience',
    url: href('assets/audio/ambient/default.mp3'),
  };


  const isPrayerMode =
    currentMode === AppMode.PRAYER_SETUP ||
    currentMode === AppMode.PRAYER_GUIDE ||
    currentMode === AppMode.PRAYER_SESSION;
  const wasPrayerModeRef = useRef(isPrayerMode);

  // Get active soundscape based on current mode/practice type or default
  const getActiveSoundscape = (): Soundscape => {
    if (practiceConfig?.soundscape) {
      if (typeof practiceConfig.soundscape === 'string') {
        return soundscapes.find(s => s.id === practiceConfig.soundscape) || defaultSoundscape;
      }
      return practiceConfig.soundscape;
    }
    if (isPrayerMode) {
      return (
        soundscapes.find((s) => s.id === prayerSoundscapeId) ||
        soundscapes.find((s) => s.id === settings.meditationSoundscapeId) ||
        defaultSoundscape
      );
    }
    if (!sessionAmbienceUnlocked) {
      return defaultSoundscape;
    }
    return soundscapes.find(s => s.id === settings.soundscapeId) || defaultSoundscape;
  };

  // Safety guard: on prayer exit, force-stop current ambience once before next mode track starts.
  useEffect(() => {
    if (wasPrayerModeRef.current && !isPrayerMode) {
      stopAmbience(180);
    }
    wasPrayerModeRef.current = isPrayerMode;
  }, [isPrayerMode]);

  // Keep ambient music synced with app-level settings.
  useEffect(() => {
    if (currentMode === AppMode.PRACTICE) return;
    if (currentMode === AppMode.SPLASH) return;
    if (currentMode === AppMode.WELCOME) return;

    const ambienceModes = new Set<AppMode>([
      AppMode.NAMING_CEREMONY,
      AppMode.AUTH,
      AppMode.ONBOARDING,
      AppMode.TUTORIAL,
      AppMode.DASHBOARD,
      AppMode.LIBRARY,
      AppMode.SETTINGS,
      AppMode.STATS,
      AppMode.PROFILE,
      AppMode.RETURN_PORTAL,
      AppMode.MEDITATION_SETUP,
      AppMode.PRAYER_SETUP,
      AppMode.PRAYER_GUIDE,
      AppMode.PRAYER_SESSION,
    ]);

    if (settings.musicOn && ambienceModes.has(currentMode)) {
      const volume = isPrayerMode ? prayerVolume : settings.ambienceVolume;
      playAmbience(getActiveSoundscape(), volume);
    } else {
      stopAmbience();
    }
  }, [
    currentMode,
    isPrayerMode,
    prayerSoundscapeId,
    prayerVolume,
    settings.musicOn,
    settings.ambienceVolume,
    settings.meditationSoundscapeId,
    settings.soundscapeId,
    sessionAmbienceUnlocked,
    soundscapes,
  ]);


  // Render current screen based on mode
  const renderScreen = () => {
    switch (currentMode) {
      case AppMode.PRE_SPLASH:
        return (
          <UniversalLayout showBottomMenu={false}>
            <PreSplash onContinue={handlePreSplashComplete} theme="dark" />
          </UniversalLayout>
        );


      case AppMode.SPLASH:
        return (
          <UniversalLayout showBottomMenu={false}>
            <SplashScreen onComplete={handleSplashComplete} theme={theme} />
          </UniversalLayout>
        );


      case AppMode.WELCOME:
        return (
          <UniversalLayout showBottomMenu={false}>
            <WelcomeScreen
              // IMPORTANT: WelcomeScreen should not use localStorage.
              // It should only see a user when validated by backend (this state).
              user={user as any}
              onComplete={handleWelcomeComplete}
              theme={theme}
            />
          </UniversalLayout>
        );


      case AppMode.NAMING_CEREMONY:
        return (
          <UniversalLayout showBottomMenu={false}>
            <SacredNamingCeremony
              onComplete={handleSacredNamingComplete}
              theme={theme}
            />
          </UniversalLayout>
        );


      case AppMode.AUTH:
        return (
          <UniversalLayout showBottomMenu={false}>
            <Auth
              onRegister={handleAuthRegister}
              onLogin={handleAuthLogin}
              initialName={sacredName}
              theme={theme}
            />
          </UniversalLayout>
        );


      // ✅ Return Portal (PersonalGreeting repurposed)
      case AppMode.RETURN_PORTAL:
        return (
          <UniversalLayout showBottomMenu={false}>
            {user ? (
              <PersonalGreeting
                user={user}
                onContinue={() => setCurrentMode(AppMode.DASHBOARD)}
                onChooseNewFocus={() => setCurrentMode(AppMode.ONBOARDING)}
                theme={theme}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
          </UniversalLayout>
        );


      // ✅ ONBOARDING - Focus selection flow
      case AppMode.ONBOARDING:
        return (
          <UniversalLayout showBottomMenu={false}>
            <Onboarding
              onComplete={handleOnboardingComplete}
              initialName={user?.name || sacredName}
            />
          </UniversalLayout>
        );


      // ✅ TUTORIAL - App introduction screens
      case AppMode.TUTORIAL:
        return (
          <UniversalLayout showBottomMenu={false}>
            <TutorialOverlay
              onComplete={handleTutorialComplete}
              onChangeFocus={handleChangeFocus}
              theme={theme}
            />
          </UniversalLayout>
        );


      // ✅ PRACTICE - I Am / I Love / Meditation session
      case AppMode.PRACTICE:
        return (
          <UniversalLayout showBottomMenu={false}>
            {practiceConfig ? (
              <PracticeSession
                config={practiceConfig}
                customAffirmations={user?.customAffirmations || []}
                onComplete={handlePracticeComplete}
                onExit={handlePracticeExit}
                userAudioFile={userAudioFile}
                theme={theme}
                soundscape={getActiveSoundscape()}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">No practice configured</p>
                <button
                  onClick={() => setCurrentMode(AppMode.DASHBOARD)}
                  className="ml-4 px-4 py-2 bg-amber-500 text-black rounded-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </UniversalLayout>
        );


      // ✅ SETTINGS - App settings panel
      case AppMode.SETTINGS:
        return (
          <UniversalLayout showBottomMenu={true}>
            <Settings
              settings={settings}
              onChangeSettings={handleSettingsChange}
              onRequestReminderPermission={handleRequestReminderPermission}
              onPreviewSoundscape={handlePreviewSoundscape}
              onChangeFocus={handleChangeFocus}
              onBack={handleSettingsBack}
              onSignOut={handleSignOut}
              onReplayTutorial={handleReplayTutorial}
              onAudioUpload={handleAudioUpload}
              theme={theme}
              userAudioFile={userAudioFile}
              availableSoundscapes={soundscapes}
            />
            <BottomNav mode={currentMode} onNavigate={setCurrentMode} />
          </UniversalLayout>
        );


      // ✅ LIBRARY (Maktaba) - Affirmations and gratitude logs
      case AppMode.LIBRARY:
        return (
          <UniversalLayout showBottomMenu={true}>
            <Library
              customAffirmations={user?.customAffirmations || []}
              gratitudeLogs={user?.gratitudeLogs || []}
              onAdd={handleAddAffirmation}
              onRemove={handleRemoveAffirmation}
              onAudioUpload={setUserAudioFile}
              userAudioFile={userAudioFile}
              theme={theme}
              soundscapes={soundscapes}
            />
            <BottomNav mode={currentMode} onNavigate={setCurrentMode} />
          </UniversalLayout>
        );

      case AppMode.STATS:
        return (
          <UniversalLayout showBottomMenu={true}>
            {user ? (
              <Stats
                user={user}
                theme={theme}
                onBack={() => setCurrentMode(AppMode.DASHBOARD)}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
            <BottomNav mode={currentMode} onNavigate={setCurrentMode} />
          </UniversalLayout>
        );

      case AppMode.PROFILE:
        return (
          <UniversalLayout showBottomMenu={true}>
            {user ? (
              <Profile
                user={user}
                theme={theme}
                onBack={() => setCurrentMode(AppMode.DASHBOARD)}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
            <BottomNav mode={currentMode} onNavigate={setCurrentMode} />
          </UniversalLayout>
        );


      // ✅ MEDITATION_SETUP - Duration and soundscape selection
      case AppMode.MEDITATION_SETUP:
        return (
          <UniversalLayout showBottomMenu={false}>
            <MeditationSetup
              onBack={() => setCurrentMode(AppMode.DASHBOARD)}
              onBegin={handleMeditationBegin}
              theme={theme}
              availableSoundscapes={soundscapes}
            />
          </UniversalLayout>
        );

      case AppMode.PRAYER_SETUP:
        return (
          <UniversalLayout showBottomMenu={false}>
            <PrayerSetup
              onBack={() => setCurrentMode(AppMode.DASHBOARD)}
              onContinue={handlePrayerPathContinue}
              initialProfile={prayerProfile}
              availableSoundscapes={soundscapes}
              selectedSoundscapeId={prayerSoundscapeId}
              prayerVolume={prayerVolume}
              onChangeSoundscape={handlePrayerSoundscapeChange}
              onChangePrayerVolume={handlePrayerVolumeChange}
              theme={theme}
            />
          </UniversalLayout>
        );

      case AppMode.PRAYER_GUIDE:
        return (
          <UniversalLayout showBottomMenu={false}>
            <PrayerGuide
              prayerPathId={prayerPathId}
              prayerProfile={prayerProfile}
              onBack={() => setCurrentMode(AppMode.PRAYER_SETUP)}
              onStartPrayer={handlePrayerStart}
              onChangePath={() => setCurrentMode(AppMode.PRAYER_SETUP)}
              theme={theme}
            />
          </UniversalLayout>
        );

      case AppMode.PRAYER_SESSION:
        return (
          <UniversalLayout showBottomMenu={false}>
            <PrayerSession
              prayerPathId={prayerPathId}
              prayerProfile={prayerProfile}
              onBack={() => setCurrentMode(AppMode.PRAYER_GUIDE)}
              onComplete={handlePrayerComplete}
              onChangePath={() => setCurrentMode(AppMode.PRAYER_SETUP)}
              theme={theme}
            />
          </UniversalLayout>
        );


      case AppMode.DASHBOARD:
        return (
          <UniversalLayout showBottomMenu={true}>
            {user ? (
              <Dashboard
                user={user}
                theme={theme}
                onStartPractice={handleStartPractice}
                onOpenMeditation={handleOpenMeditation}
                onOpenSettings={handleOpenSettings}
                onOpenProfile={() => setCurrentMode(AppMode.PROFILE)}
                musicOn={settings.musicOn}
                ambienceVolume={settings.ambienceVolume}
                onToggleMusic={() =>
                  handleSettingsChange({ ...settings, musicOn: !settings.musicOn })
                }
                onVolumeChange={(volume) =>
                  handleSettingsChange({ ...settings, ambienceVolume: volume })
                }
                onSignOut={handleSignOut}
                activeSoundscape={getActiveSoundscape()}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}

            <BottomNav mode={currentMode} onNavigate={setCurrentMode} />

            <button
              onClick={handleResetAndStartOver}
              className="fixed bottom-24 right-4 px-3 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90 shadow-lg text-xs"
              aria-label="Reset and start over"
              title="Reset & Start Over"
            >
              Reset
            </button>
          </UniversalLayout>
        );


      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p>Screen not found: {currentMode}</p>
            <button
              onClick={() => setCurrentMode(AppMode.PRE_SPLASH)}
              className="ml-4 px-4 py-2 bg-amber-500 text-black rounded-lg"
            >
              Restart from PreSplash
            </button>
          </div>
        );
    }
  };


  return (
    <div className="App">
      <Layout
        mode={currentMode}
        practiceType={practiceConfig?.type}
        theme={theme}
      >
        {renderScreen()}
      </Layout>

      {activeReminder && activeReminderMeta && (
        <div className="fixed inset-x-4 bottom-24 z-[120] mx-auto w-full max-w-md rounded-2xl border border-amber-400/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-[11px] uppercase tracking-wide text-amber-300">Reminder</p>
          <h3 className="mt-1 text-base font-semibold text-white">{activeReminderMeta.title}</h3>
          <p className="mt-1 text-xs text-slate-300">{activeReminderMeta.body}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleReminderStart(activeReminder)}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:opacity-90"
            >
              Start Now
            </button>
            <button
              onClick={() => handleReminderSnooze(activeReminder, 15)}
              className="rounded-lg border border-slate-500 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
            >
              Snooze 15m
            </button>
            <button
              onClick={() => handleReminderSnooze(activeReminder, 30)}
              className="rounded-lg border border-slate-500 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
            >
              Snooze 30m
            </button>
            <button
              onClick={() => handleReminderSnooze(activeReminder, 60)}
              className="rounded-lg border border-slate-500 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
            >
              Snooze 60m
            </button>
            <button
              onClick={() => setActiveReminder(null)}
              className="rounded-lg border border-transparent px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
