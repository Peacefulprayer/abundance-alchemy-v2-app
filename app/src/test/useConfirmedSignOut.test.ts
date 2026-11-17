import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useConfirmedSignOut } from '../../hooks/useConfirmedSignOut'

afterEach(() => vi.useRealTimers())

describe('confirmed server sign-out', () => {
  it('keeps the account until confirmation and ignores duplicate clicks', async () => {
    let resolve!: (value: { success: boolean }) => void
    const logout = vi.fn(() => new Promise<{ success: boolean }>(done => { resolve = done }))
    const clearAccount = vi.fn()
    const { result } = renderHook(() => useConfirmedSignOut(logout, clearAccount))
    let pending!: Promise<void>
    act(() => { pending = result.current.signOut() })
    expect(result.current.status).toBe('pending')
    expect(clearAccount).not.toHaveBeenCalled()
    await act(async () => { await result.current.signOut() })
    expect(logout).toHaveBeenCalledTimes(1)
    await act(async () => { resolve({ success: true }); await pending })
    expect(clearAccount).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('idle')
  })

  it('retains the account after a network failure and permits retry', async () => {
    const logout = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ success: true })
    const clearAccount = vi.fn()
    const { result } = renderHook(() => useConfirmedSignOut(logout, clearAccount))
    await act(async () => { await result.current.signOut() })
    expect(result.current.status).toBe('failed')
    expect(clearAccount).not.toHaveBeenCalled()
    await act(async () => { await result.current.signOut() })
    expect(clearAccount).toHaveBeenCalledTimes(1)
  })

  it('does not treat an unconfirmed response as successful logout', async () => {
    const clearAccount = vi.fn()
    const { result } = renderHook(() => useConfirmedSignOut(async () => ({ success: false }), clearAccount))
    await act(async () => { await result.current.signOut() })
    expect(result.current.status).toBe('failed')
    expect(clearAccount).not.toHaveBeenCalled()
  })

  it('aborts a stalled request after fifteen seconds without clearing the account', async () => {
    vi.useFakeTimers()
    const logout = (signal?: AbortSignal) => new Promise<{ success: boolean }>((_resolve, reject) => {
      signal?.addEventListener('abort', () => reject(new Error('aborted')))
    })
    const clearAccount = vi.fn()
    const { result } = renderHook(() => useConfirmedSignOut(logout, clearAccount))
    let pending!: Promise<void>
    act(() => { pending = result.current.signOut() })
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); await pending })
    expect(result.current.status).toBe('failed')
    expect(clearAccount).not.toHaveBeenCalled()
  })

  it('offers retry even when an underlying request ignores cancellation', async () => {
    vi.useFakeTimers()
    const logout = () => new Promise<{ success: boolean }>(() => {})
    const clearAccount = vi.fn()
    const { result } = renderHook(() => useConfirmedSignOut(logout, clearAccount))
    let pending!: Promise<void>
    act(() => { pending = result.current.signOut() })
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); await pending })
    expect(result.current.status).toBe('failed')
    expect(clearAccount).not.toHaveBeenCalled()
  })
})
