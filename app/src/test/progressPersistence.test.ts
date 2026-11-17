import { describe, expect, it, vi } from 'vitest'
import { mergeOnboardingProfile, ProgressPersistence, readPendingProgress } from '../../services/progressPersistence'
import { CycleType, PracticeType, type UserProfile } from '../../types'

function storage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) } } as Storage
}
const profile = { name: 'Amani', focusAreas: ['Peace'], streak: 1, level: 1,
  affirmationsCompleted: 4, lastPracticeDate: '2026-10-03T12:00:00.000Z' } as unknown as UserProfile
const settle = async () => { await new Promise(resolve => setTimeout(resolve, 0)) }

describe('recoverable progress saves', () => {
  it('retains completion IDs through an offline retry and coalesces each ID once', async () => {
    const store=storage(), send=vi.fn().mockRejectedValue(new Error('offline'))
    const queue=new ProgressPersistence('12',send,vi.fn(),store)
    const first={id:'completion-one',date:'2026-11-17T12:00:00Z'}
    queue.enqueue({...profile,practiceCompletions:[first]})
    await settle()
    queue.enqueue({...profile,affirmationsCompleted:5,practiceCompletions:[first,{id:'completion-two',date:'2026-11-17T12:05:00Z'}]})
    await settle()
    expect(readPendingProgress('12',store)?.practiceCompletions).toHaveLength(2)
    send.mockResolvedValue(undefined)
    await queue.retry()
    expect(send).toHaveBeenLastCalledWith(expect.objectContaining({practiceCompletions:[first,expect.objectContaining({id:'completion-two'})]}))
    expect(readPendingProgress('12',store)).toBeNull()
  })
  it('keeps gratitude entries through offline retry and a newer snapshot', async () => {
    const store = storage()
    const entry = { id: 'log-1', date: '2026-11-04T12:00:00Z', text: 'A peaceful morning', focusArea: 'Peace', sessionType: PracticeType.MORNING_IAM }
    const send = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const first = new ProgressPersistence('12', send, vi.fn(), store)
    first.enqueue({ ...profile, gratitudeLogs: [entry] })
    await settle()
    expect(readPendingProgress('12', store)?.gratitudeLogs).toEqual([entry])
    first.stop()
    const restored = new ProgressPersistence('12', send, vi.fn(), store)
    restored.enqueue({ ...profile, gratitudeLogs: [] })
    await settle()
    expect(send.mock.calls[1][0].gratitudeLogs).toEqual([entry])
    expect(readPendingProgress('12', store)).toBeNull()
  })

  it('keeps the selected week and its start in the durable account snapshot', async () => {
    const store = storage()
    const send = vi.fn().mockRejectedValue(new Error('offline'))
    const queue = new ProgressPersistence('12', send, vi.fn(), store)
    queue.enqueue({ ...profile, cyclePreference: CycleType.WEEKLY, cycleStartedAt: '2026-10-04T10:00:00Z' })
    await settle()
    expect(readPendingProgress('12', store)).toMatchObject({
      cyclePreference: CycleType.WEEKLY, cycleStartedAt: '2026-10-04T10:00:00Z',
    })
  })
  it('preserves earned progress when an existing user chooses a new focus', () => {
    const choices = { ...profile, focusAreas: ['Purpose'], streak: 0, level: 1,
      affirmationsCompleted: 0, lastPracticeDate: null } as unknown as UserProfile
    expect(mergeOnboardingProfile(profile, choices)).toMatchObject({
      focusAreas: ['Purpose'], streak: 1, affirmationsCompleted: 4,
      lastPracticeDate: profile.lastPracticeDate,
    })
  })
  it('retains a failed save across refresh and retries the same absolute totals', async () => {
    const store = storage()
    const send = vi.fn().mockRejectedValueOnce(new Error('response lost')).mockResolvedValue(undefined)
    const report = vi.fn()
    const first = new ProgressPersistence('12', send, report, store)
    first.enqueue(profile, true)
    await settle()
    expect(report).toHaveBeenLastCalledWith('pending')
    expect(readPendingProgress('12', store)?.name).toBe('Amani')
    first.stop()
    const restored = new ProgressPersistence('12', send, report, store)
    await restored.retry()
    expect(send.mock.calls[1][0]).toEqual(send.mock.calls[0][0])
    expect(readPendingProgress('12', store)).toBeNull()
    expect(report).toHaveBeenLastCalledWith('saved')
  })

  it('serializes newer snapshots and preserves a pending name through progress updates', async () => {
    const store = storage()
    let release!: () => void
    const send = vi.fn().mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve }))
      .mockResolvedValue(undefined)
    const queue = new ProgressPersistence('12', send, vi.fn(), store)
    queue.enqueue(profile, true)
    queue.enqueue({ ...profile, affirmationsCompleted: 5 })
    expect(send).toHaveBeenCalledTimes(1)
    release()
    await settle()
    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[1][0]).toMatchObject({ name: 'Amani', affirmationsCompleted: 5 })
    expect(readPendingProgress('12', store)).toBeNull()
  })

  it('never restores another account’s snapshot', async () => {
    const store = storage()
    const queue = new ProgressPersistence('12', vi.fn().mockRejectedValue(new Error()), vi.fn(), store)
    queue.enqueue(profile)
    await settle()
    expect(readPendingProgress('13', store)).toBeNull()
    store.setItem('abundance_pending_progress_v1:13', JSON.stringify(readPendingProgress('12', store)))
    expect(readPendingProgress('13', store)).toBeNull()
  })

  it('reports storage failure and recovers when storage becomes available', async () => {
    const store = storage()
    const write = vi.spyOn(store, 'setItem').mockImplementationOnce(() => { throw new Error('quota') })
    const send = vi.fn().mockResolvedValue(undefined)
    const report = vi.fn()
    const queue = new ProgressPersistence('12', send, report, store)
    queue.enqueue(profile)
    expect(report).toHaveBeenLastCalledWith('storage-error')
    expect(send).not.toHaveBeenCalled()
    await queue.retry()
    expect(write).toHaveBeenCalledTimes(2)
    expect(report).toHaveBeenLastCalledWith('saved')
  })

  it('leaves pending work intact when signed out during a request', async () => {
    const store = storage()
    let release!: () => void
    const report = vi.fn()
    const queue = new ProgressPersistence('12', () => new Promise<void>(resolve => { release = resolve }), report, store)
    queue.enqueue(profile)
    queue.stop()
    release()
    await settle()
    expect(readPendingProgress('12', store)).not.toBeNull()
    expect(report).not.toHaveBeenCalledWith('saved')
  })
})
