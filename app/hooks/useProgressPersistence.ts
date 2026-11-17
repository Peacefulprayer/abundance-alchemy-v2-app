import { useCallback, useEffect, useRef, useState } from 'react'
import type { UserProfile } from '../types'
import { api } from '../services/api'
import { ProgressPersistence, type SaveStatus } from '../services/progressPersistence'

export function useProgressPersistence(accountId: string | null) {
  const [status, setStatus] = useState<SaveStatus>('saved')
  const queue = useRef<ProgressPersistence | null>(null)
  useEffect(() => {
    setStatus('saved')
    if (!accountId) { queue.current = null; return }
    const persistence = new ProgressPersistence(accountId, async snapshot => {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 15000)
      try {
        const response = await api.syncProgress(snapshot, controller.signal)
        if (!response?.success) throw new Error('Save was not confirmed')
      } finally { window.clearTimeout(timeout) }
    }, setStatus)
    queue.current = persistence
    const retry = () => { void persistence.retry() }
    retry()
    window.addEventListener('online', retry)
    window.addEventListener('focus', retry)
    return () => {
      persistence.stop()
      queue.current = null
      window.removeEventListener('online', retry)
      window.removeEventListener('focus', retry)
    }
  }, [accountId])
  return {
    status,
    save: useCallback((profile: UserProfile, saveName = false) => {
      queue.current?.enqueue(profile, saveName)
    }, []),
    retry: useCallback(() => { void queue.current?.retry() }, []),
  }
}
