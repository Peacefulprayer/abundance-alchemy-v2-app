import { useCallback, useRef, useState } from 'react'

type SignOutStatus = 'idle' | 'pending' | 'failed'

export function useConfirmedSignOut(
  logout: (signal?: AbortSignal) => Promise<{ success: boolean }>,
  onConfirmed: () => void,
) {
  const [status, setStatus] = useState<SignOutStatus>('idle')
  const inFlight = useRef(false)
  const signOut = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setStatus('pending')
    const controller = new AbortController()
    let timeout: number | undefined
    const deadline = new Promise<never>((_resolve, reject) => {
      timeout = window.setTimeout(() => {
        controller.abort()
        reject(new Error('Sign-out confirmation timed out'))
      }, 15000)
    })
    try {
      const result = await Promise.race([logout(controller.signal), deadline])
      if (!result?.success) throw new Error('Sign-out was not confirmed')
      onConfirmed()
      setStatus('idle')
    } catch {
      setStatus('failed')
    } finally {
      window.clearTimeout(timeout)
      inFlight.current = false
    }
  }, [logout, onConfirmed])
  return { status, signOut }
}
