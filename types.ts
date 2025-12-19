// types.ts - The Single Source of Truth

export enum AppMode {
  SPLASH = 'SPLASH',
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  TUTORIAL = 'TUTORIAL',
  DASHBOARD = 'DASHBOARD',
  PRACTICE = 'PRACTICE',
  PROFILE = 'PROFILE',
  LIBRARY = 'LIBRARY',
  SETTINGS = 'SETTINGS',
  MEDITATION_SETUP = 'MEDITATION_SETUP'
}

export enum CycleType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum PracticeType {
  MORNING_IAM = 'MORNING_IAM',
  GRATITUDE = 'GRATITUDE',
  EVENING_ILOVE = 'EVENING_ILOVE',
  MEDITATION = 'MEDITATION'
}

export enum Duration {
  ONE_MIN = 1,
  FIVE_MIN = 5,
  FIFTEEN_MIN = 15
}

export type SoundscapeCategory = 'OM' | 'RAIN' | 'FOREST' | 'CELESTIAL' | 'CUSTOM';

export interface Soundscape {
  id: string;
  label: string;
  category: SoundscapeCategory;
  url?: string;
}

// Fixed: Matches Auth.tsx logic
export interface UserAccount {
  email: string;
  password?: string;
  name: string;
}

export interface ReminderSettings {
  enabled: boolean;
  mode: 'INTERVAL' | 'SPECIFIC' | 'SPECIFIC_TIMES';
  intervalMinutes: number;
  specificTimes: string[];
  lastSent?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  soundEffectsOn: boolean;
  musicOn: boolean;
  soundscapeId: string;
  iAmSoundscapeId: string;
  iLoveSoundscapeId: string;
  meditationSoundscapeId: string;
  ambienceVolume: number;
  voiceId?: string;
  reminders: ReminderSettings;
}

export interface GratitudeLog {
  id: string;
  date: string;
  sessionType: PracticeType;
  focusArea: string;
  text: string;
}

export interface Affirmation {
  id: string;
  text: string;
  category: string;
  isFavorite: boolean;
  type: PracticeType;
  dateAdded: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  focusAreas: string[]; // Handled as string[] in Dashboard
  cyclePreference: CycleType;
  streak: number;
  lastPracticeDate: string | null;
  affirmationsCompleted: number;
  level: number;
  customAffirmations: Affirmation[];
  gratitudeLogs: GratitudeLog[];
}

export interface PracticeSessionConfig {
  type: PracticeType;
  duration: number;
  theme?: string;
  soundscape?: Soundscape;
  focusAreas?: string[];
}

export interface AlchemistResponse {
  message: string;
  content: string[];
}
