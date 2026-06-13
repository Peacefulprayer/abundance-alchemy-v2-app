import type {
  PracticeType,
} from '../types'
import type { BackgroundConfig } from '../services/backgrounds'

export type { BackgroundEntry, BackgroundMode, BackgroundSlot } from '../services/backgrounds'

export type BackgroundMap = BackgroundConfig

export interface MeUser {
  id: number
  name: string
  email: string
  streak: number
  level: number
  focusAreas: string[]
  affirmationsCompleted: number
  lastPracticeDate: string | null
}

export interface LoginResponse {
  id: number
  name: string
  email: string
  streak: number
  level: number
  focusAreas: string[]
  affirmationsCompleted: number
  lastPracticeDate: string | null
}

export interface RegisterResponse {
  id: number
  name: string
  email: string
  streak: number
  level: number
  focusAreas: string[]
  affirmationsCompleted: number
  lastPracticeDate: string | null
}

export interface Affirmation {
  id: string
  text: string
  category?: string
  isFavorite?: boolean
  type: PracticeType
  dateAdded?: string
}

export interface Soundscape {
  id: string
  label: string
  category?: string
  url?: string
}

export interface UserPrayer {
  id: string
  path_key: string
  title: string
  body: string
  created_at?: string | null
  updated_at?: string | null
}

export interface MeditationTrack {
  [key: string]: unknown
}

export interface AddAffirmationResponse {
  success: boolean
  id: string | number
  message?: string
}

export interface DeleteAffirmationResponse {
  success: boolean
  deleted?: boolean
}

export interface RandomAffirmationResponse {
  text?: string
}

export interface AddPrayerResponse {
  success: boolean
  id: string | number
  message?: string
}

export interface DeletePrayerResponse {
  success: boolean
  deleted?: boolean
}

export interface AiCopyResponse {
  text?: string
}

export interface RequestPasswordResetResponse {
  message?: string
}

export interface UpdateProgressResponse {
  ok: boolean
}

export interface UploadUserAudioResponse {
  url?: string
}

export interface LogoutResponse {
  success: boolean
}

export interface GetPrayerContentResponse {
  pathKey: string
  guideSteps: string[]
  sessionPrayers: string[]
}

export interface UserPrayerRow {
  id: string | number
  path_key?: string
  title?: string
  body?: string
  created_at?: string | null
  updated_at?: string | null
}

export interface UserAffirmationRow {
  id: string | number
  text?: string
  type: PracticeType
  category?: string
  created_at?: string | null
}
