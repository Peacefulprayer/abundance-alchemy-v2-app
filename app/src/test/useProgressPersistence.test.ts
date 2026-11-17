import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgressPersistence } from '../../hooks/useProgressPersistence'
import { api } from '../../services/api'
import type { UserProfile } from '../../types'

vi.mock('../../services/api', () => ({ api: { syncProgress: vi.fn() } }))
const profile = { name: 'Amani', focusAreas: ['Peace'], streak: 1, level: 1,
  affirmationsCompleted: 3, lastPracticeDate: '2026-10-03T12:00:00Z' } as unknown as UserProfile

beforeEach(() => {
  const values = new Map<string, string>()
  vi.mocked(localStorage.getItem).mockImplementation(key => values.get(key) ?? null)
  vi.mocked(localStorage.setItem).mockImplementation((key, value) => { values.set(key, value) })
  vi.mocked(localStorage.removeItem).mockImplementation(key => { values.delete(key) })
  vi.mocked(api.syncProgress).mockReset()
})

describe('progress save lifecycle', () => {
  it('shows failed saves and retries on reconnect without incrementing totals', async () => {
    vi.mocked(api.syncProgress).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ success: true })
    const { result } = renderHook(() => useProgressPersistence('12'))
    act(() => result.current.save(profile, true))
    await waitFor(() => expect(result.current.status).toBe('pending'))
    act(() => window.dispatchEvent(new Event('online')))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    const calls = vi.mocked(api.syncProgress).mock.calls
    expect(calls[1][0]).toEqual(calls[0][0])
    expect(calls[1][0].affirmationsCompleted).toBe(3)
  })

  it('does not acknowledge a save without backend confirmation', async () => {
    vi.mocked(api.syncProgress).mockResolvedValue({ success: false })
    const { result } = renderHook(() => useProgressPersistence('12'))
    act(() => result.current.save(profile))
    await waitFor(() => expect(result.current.status).toBe('pending'))
    expect(localStorage.getItem('abundance_pending_progress_v1:12')).not.toBeNull()
  })

  it('restores pending work only after the original account signs in', async () => {
    vi.mocked(api.syncProgress).mockRejectedValue(new Error('offline'))
    const first = renderHook(() => useProgressPersistence('12'))
    act(() => first.result.current.save(profile, true))
    await waitFor(() => expect(first.result.current.status).toBe('pending'))
    first.unmount()
    vi.mocked(api.syncProgress).mockClear().mockResolvedValue({ success: true })
    const other = renderHook(() => useProgressPersistence('13'))
    expect(api.syncProgress).not.toHaveBeenCalled()
    other.unmount()
    const original = renderHook(() => useProgressPersistence('12'))
    await waitFor(() => expect(api.syncProgress).toHaveBeenCalledTimes(1))
    expect(vi.mocked(api.syncProgress).mock.calls[0][0]).toMatchObject({ expectedUserId: '12', name: 'Amani' })
    await waitFor(() => expect(original.result.current.status).toBe('saved'))
  })
})
