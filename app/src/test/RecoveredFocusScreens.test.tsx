import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Dashboard } from '../../components/Dashboard'
import { PreSplash } from '../../components/PreSplash'
import { PersonalGreeting } from '../../components/PersonalGreeting'
import { CycleType, type UserProfile } from '../../types'

vi.mock('../../components/BreathingOrb', () => ({ default: () => <div /> }))
vi.mock('../../services/buttonSoundService', () => ({ buttonSoundService: { play: vi.fn() } }))
vi.mock('../../services/audioService', () => ({ playBell: vi.fn(), unlockAudio: vi.fn() }))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const account: UserProfile = {
  name: 'Amani', email: 'test@example.invalid', focusAreas: ['Peace'],
  cyclePreference: CycleType.WEEKLY, cycleStartedAt: new Date().toISOString(),
  streak: 1, level: 1, affirmationsCompleted: 1, lastPracticeDate: null,
  customAffirmations: [], gratitudeLogs: [],
}

describe('recovered focus summary and returning sign-in', () => {
  it('hands a dashboard reflection to the account persistence flow without changing practice totals', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:false}))
    const save=vi.fn()
    render(<Dashboard user={account} onSaveReflection={save} onStartPractice={vi.fn()} onOpenMeditation={vi.fn()} onOpenSettings={vi.fn()} musicOn ambienceVolume={50} onToggleMusic={vi.fn()} onVolumeChange={vi.fn()} onSignOut={vi.fn()} theme="dark" activeSoundscape={{id:'default',label:'Default'}} />)
    fireEvent.click(screen.getByRole('button',{name:'How is your Peace journey going?'}))
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'A reflection for my account.'}})
    fireEvent.click(screen.getByRole('button',{name:'Save Reflection'}))
    expect(save).toHaveBeenCalledWith(expect.objectContaining({text:'A reflection for my account.',focusArea:'Peace'}))
    expect(account.affirmationsCompleted).toBe(1)
  })
  it.each([
    [CycleType.DAILY, 'YOUR DAILY FOCUS:', 'This is Day 1 of 1', '0 days left'],
    [CycleType.WEEKLY, 'YOUR WEEKLY FOCUS:', 'This is Day 1 of 7', '6 days left'],
    [CycleType.MONTHLY, 'YOUR MONTHLY FOCUS:', 'This is Day 1 of 30', '29 days left'],
  ])('renders the %s focus period from the account', (cyclePreference, title, day, remaining) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    render(<Dashboard user={{ ...account, cyclePreference }} onStartPractice={vi.fn()}
      onOpenMeditation={vi.fn()} onOpenSettings={vi.fn()} musicOn ambienceVolume={50}
      onToggleMusic={vi.fn()} onVolumeChange={vi.fn()} onSignOut={vi.fn()} theme="dark"
      activeSoundscape={{ id: 'default', label: 'Default Ambience' }} />)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText('Peace')).toBeInTheDocument()
    expect(screen.getByText(day)).toBeInTheDocument()
    expect(screen.getByText(remaining)).toBeInTheDocument()
  })

  it('uses the same saved period in the returning greeting', () => {
    render(<PersonalGreeting user={account} onContinue={vi.fn()} onChooseNewFocus={vi.fn()} />)
    expect(screen.getByText('6 days remaining.')).toBeInTheDocument()
  })

  it('offers direct sign-in without changing the ceremonial entry button', () => {
    const onContinue = vi.fn(), onSignIn = vi.fn()
    render(<PreSplash theme="dark" onContinue={onContinue} onSignIn={onSignIn} />)
    fireEvent.click(screen.getByRole('button', { name: 'Already have an account? Sign in' }))
    expect(onSignIn).toHaveBeenCalledTimes(1)
    expect(onContinue).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Enter When Ready' })).toBeInTheDocument()
  })

  it('waits for session validation before accepting either entry action', () => {
    render(<PreSplash theme="dark" isReady={false} onContinue={vi.fn()} onSignIn={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Already have an account? Sign in' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Preparing Your Entry' })).toBeDisabled()
  })
})
