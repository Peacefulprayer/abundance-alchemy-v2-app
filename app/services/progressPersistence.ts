import { CycleType, type GratitudeLog, type UserProfile } from '../types'

export type ProgressSnapshot = Pick<UserProfile,
  'focusAreas' | 'streak' | 'level' | 'affirmationsCompleted' | 'lastPracticeDate'
> & { name?: string; expectedUserId: string; cyclePreference?: CycleType; cycleStartedAt?: string | null; gratitudeLogs?: GratitudeLog[]; practiceCompletions?: {id: string; date: string}[] }
export type SaveStatus = 'saved' | 'saving' | 'pending' | 'storage-error'

const keyFor = (id: string) => `abundance_pending_progress_v1:${id}`

export function mergeOnboardingProfile(user: UserProfile | null, choices: UserProfile): UserProfile {
  return {
    ...choices,
    ...user,
    name: choices.name,
    focusAreas: choices.focusAreas,
    cyclePreference: choices.cyclePreference,
    cycleStartedAt: new Date().toISOString(),
  }
}

export function readPendingProgress(id: string, storage: Storage = localStorage): ProgressSnapshot | null {
  try {
    const value = JSON.parse(storage.getItem(keyFor(id)) || 'null')
    if (!value || value.expectedUserId !== id || !Array.isArray(value.focusAreas) ||
      !value.focusAreas.every((area: unknown) => typeof area === 'string') ||
      !['streak', 'level', 'affirmationsCompleted'].every(field =>
        Number.isSafeInteger(value[field]) && value[field] >= 0) ||
      !(value.lastPracticeDate === null || typeof value.lastPracticeDate === 'string') ||
      !(value.name === undefined || typeof value.name === 'string') ||
      !(value.cyclePreference === undefined || Object.values(CycleType).includes(value.cyclePreference)) ||
      !(value.cycleStartedAt === undefined || value.cycleStartedAt === null ||
        (typeof value.cycleStartedAt === 'string' && Number.isFinite(Date.parse(value.cycleStartedAt))))) return null
    if (value.gratitudeLogs !== undefined && (!Array.isArray(value.gratitudeLogs) ||
      !value.gratitudeLogs.every((log: GratitudeLog) => log &&
        typeof log.id === 'string' && typeof log.text === 'string' &&
        typeof log.focusArea === 'string' && typeof log.sessionType === 'string' &&
        typeof log.date === 'string' && Number.isFinite(Date.parse(log.date))))) return null
    if (value.practiceCompletions !== undefined && (!Array.isArray(value.practiceCompletions) ||
      !value.practiceCompletions.every((event: {id: string; date: string}) => event &&
        typeof event.id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(event.id) &&
        typeof event.date === 'string' && Number.isFinite(Date.parse(event.date))))) return null
    return value as ProgressSnapshot
  } catch { return null }
}

// Serialize absolute snapshots. Retrying a response lost in transit never increments again.
export class ProgressPersistence {
  private pending: ProgressSnapshot | null
  private running = false
  private stopped = false
  constructor(
    private id: string,
    private send: (snapshot: ProgressSnapshot) => Promise<void>,
    private report: (status: SaveStatus) => void,
    private storage: Storage = localStorage,
  ) { this.pending = readPendingProgress(id, storage) }

  stop() { this.stopped = true }

  enqueue(profile: UserProfile, saveName = false) {
    this.pending = {
      expectedUserId: this.id,
      practiceCompletions: [...new Map([
        ...(this.pending?.practiceCompletions ?? []), ...(profile.practiceCompletions ?? []),
      ].map(event => [event.id, event])).values()],
      focusAreas: profile.focusAreas,
      streak: profile.streak,
      level: profile.level,
      affirmationsCompleted: profile.affirmationsCompleted,
      lastPracticeDate: profile.lastPracticeDate,
      cyclePreference: profile.cyclePreference,
      cycleStartedAt: profile.cycleStartedAt,
      gratitudeLogs: [...new Map([
        ...(this.pending?.gratitudeLogs ?? []), ...(profile.gratitudeLogs ?? []),
      ].map(log => [log.id, log])).values()],
      ...(this.pending?.name !== undefined ? { name: this.pending.name } : {}),
      ...(saveName ? { name: profile.name } : {}),
    }
    try { this.storage.setItem(keyFor(this.id), JSON.stringify(this.pending)) }
    catch { this.report('storage-error'); return }
    void this.retry()
  }

  async retry() {
    if (this.running || this.stopped || !this.pending) return
    try { this.storage.setItem(keyFor(this.id), JSON.stringify(this.pending)) }
    catch { this.report('storage-error'); return }
    this.running = true
    this.report('saving')
    try {
      while (this.pending && !this.stopped) {
        const snapshot: ProgressSnapshot = this.pending
        await this.send(snapshot)
        if (this.stopped) return
        if (this.pending === snapshot) {
          this.storage.removeItem(keyFor(this.id))
          this.pending = null
        }
      }
      if (!this.stopped) this.report('saved')
    } catch { if (!this.stopped) this.report('pending') }
    finally { this.running = false }
  }
}
