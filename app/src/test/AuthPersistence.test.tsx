import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Auth } from '../../components/Auth'
import { api } from '../../services/api'
import { CycleType } from '../../types'

vi.mock('../../services/api', async importOriginal => ({
  ...await importOriginal<object>(), api: { login: vi.fn() },
}))
vi.mock('../../components/SacredBackground', () => ({
  SacredBackground: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('../../components/BreathingOrb', () => ({ default: () => <div /> }))
vi.mock('../../services/buttonSoundService', () => ({ buttonSoundService: { play: vi.fn() } }))

describe('sign-in account persistence handoff', () => {
  it('passes the saved week, cycle start, and practice date through to the app', async () => {
    const saved = {
      id: 12, name: 'Amani Test', email: 'test@example.invalid', focusAreas: ['Peace'],
      streak: 1, level: 1, affirmationsCompleted: 1,
      cyclePreference: CycleType.WEEKLY, cycleStartedAt: '2026-10-04T10:00:00Z',
      lastPracticeDate: '2026-10-04T10:30:00Z',
      gratitudeLogs: [{ id: 'log-1', date: '2026-10-04T10:30:00Z', text: 'A quiet moment', focusArea: 'Peace', sessionType: 'MORNING_IAM' as const }],
    }
    vi.mocked(api.login).mockResolvedValue(saved)
    const onLogin = vi.fn()
    render(<Auth mode="login" onModeChange={vi.fn()} onRegister={vi.fn()} onLogin={onLogin} theme="dark" />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: saved.email } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'test-password-only' } })
    fireEvent.submit(screen.getByPlaceholderText('your@email.com').closest('form')!)
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(expect.objectContaining(saved)))
    expect(sessionStorage.setItem).toHaveBeenCalledWith('abundance_auth', expect.stringContaining('WEEKLY'))
  })
})
