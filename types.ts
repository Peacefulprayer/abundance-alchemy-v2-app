// src/types.ts

export type ThemeMode = 'light' | 'dark';

// Focus can be either a simple string (legacy) OR an object (new Swahili-ready)
export type FocusArea =
  | string
  | {
      id: string;
      label: string;
      swahili?: string;
      description?: string;
      swahiliAffirmation?: string;
      icon?: string;
    };

export enum AppMode {
  SPLASH = 'SPLASH',
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  TUTORIAL = 'TUTORIAL',
  DASHBOARD = 'DASHBOARD',
  PRACTICE = 'PRACTICE',
  SETTINGS = 'SETTINGS',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS',
  MEDITATION_SETUP = 'MEDITATION_SETUP',
  PROFILE = 'PROFILE'
}

export enum PracticeType {
  MORNING_IAM = 'MORNING_IAM',
  EVENING_ILOVE = 'EVENING_ILOVE',
  GRATITUDE = 'GRATITUDE',
  MEDITATION = 'MEDITATION'
}

export enum CycleType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'  // ADDED
}

export type ReminderMode = 'INTERVAL' | 'SPECIFIC' | 'SPECIFIC_TIMES';  // ADDED SPECIFIC_TIMES

export interface RemindersSettings {
  enabled: boolean;
  mode: ReminderMode;
  intervalMinutes: number;
  specificTimes: string[]; // ["08:00","20:00"]
}

export interface AppSettings {
  theme: ThemeMode;
  soundEffectsOn: boolean;
  musicOn: boolean;

  // Soundscape IDs for different practice types
  soundscapeId: string;  // CHANGED: Made required (removed ?)
  iAmSoundscapeId: string;  // ADDED
  iLoveSoundscapeId: string;  // ADDED
  meditationSoundscapeId: string;  // ADDED
  
  ambienceVolume: number; // 0–100
  voiceId: string;

  reminders: RemindersSettings;
}

export interface UserAccount {
  email: string;
  // keep optional because some flows store just email/token
  password?: string;
  name?: string;
}

export interface Soundscape {
  id: string | number; // normalize in components as String(id)
  label: string;
  category?: string;
  url?: string; // if you have real URLs
}

export interface Affirmation {
  id: string;
  text: string;
  category?: string;
  isFavorite?: boolean;
  type: PracticeType;
  dateAdded?: string;
}

export interface GratitudeLog {
  id: string;
  date: string; // ISO
  text: string;
  focusArea: string; // store label string to keep logs stable
  sessionType: PracticeType;
}

export interface UserProfile {
  name: string;

  // keep optional; your onboarding currently sets it
  preferredName?: string;

  focusAreas: FocusArea[];

  cyclePreference: CycleType;  // CHANGED: from cycleType to cyclePreference

  streak: number;
  level: number;
  affirmationsCompleted: number;
  lastPracticeDate: string | null;

  customAffirmations: Affirmation[];
  gratitudeLogs: GratitudeLog[];

  // optional fields some code tries to read
  email?: string;
}

export interface PracticeSessionConfig {
  type: PracticeType;
  duration: number; // minutes
  focusAreas?: FocusArea[];
  soundscape?: Soundscape | string; // allow legacy string id or object
}

// ADDED: LibraryProps interface for Library component
export interface LibraryProps {
  affirmations?: Affirmation[];
  customAffirmations?: Affirmation[];
  gratitudeLogs: GratitudeLog[];
  onAdd: (text: string, type: PracticeType) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onAudioUpload: React.Dispatch<React.SetStateAction<File | null>>;
  userAudioFile: File | null;
  theme: 'light' | 'dark';
}