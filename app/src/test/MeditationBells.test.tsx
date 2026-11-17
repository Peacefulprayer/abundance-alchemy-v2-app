import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PracticeSession } from '../../components/PracticeSession'
import PrePracticeInvocation from '../../components/PrePracticeInvocation'
import { MeditationSetup } from '../../components/MeditationSetup'
import { buttonSoundService } from '../../services/buttonSoundService'
import { playBell, playCompletionSound } from '../../services/audioService'
import { PracticeType } from '../../types'
import { playMeditationBell } from '../../services/meditationBell'

vi.mock('../../components/BreathingOrb', () => ({default: () => <div />}))
vi.mock('../../services/audioService', () => ({playBell:vi.fn(),playCompletionSound:vi.fn(),startAmbience:vi.fn(),stopAmbience:vi.fn(),updateVolume:vi.fn()}))
vi.mock('../../services/api', () => ({api:{getSystemAffirmations:vi.fn().mockResolvedValue([]),getRandomAffirmation:vi.fn().mockResolvedValue('I am here.')}}))
vi.mock('../../services/geminiService', () => ({getMeditationWisdom:vi.fn().mockResolvedValue('Stillness')}))
vi.mock('../../services/buttonSoundService',()=>({buttonSoundService:{play:vi.fn()}}))
vi.mock('../../services/audioManager',()=>({audioManager:{previewSoundscape:vi.fn()}}))
vi.mock('../../services/apiService',()=>({apiService:{getMeditationTracks:vi.fn().mockResolvedValue([{id:'default',label:'Default'}])}}))
vi.mock('../../services/meditationBell',()=>({playMeditationBell:vi.fn().mockResolvedValue(true),preloadMeditationBell:vi.fn()}))

beforeEach(()=>{vi.clearAllMocks();vi.mocked(playMeditationBell).mockResolvedValue(true);vi.useFakeTimers()})
afterEach(()=>{vi.useRealTimers()})

describe('meditation timer bells',()=>{
  it('opens the meditation timer without ringing from the setup button',async()=>{
    const begin=vi.fn()
    render(<MeditationSetup onBack={vi.fn()} onBegin={begin} availableSoundscapes={[]} initialDuration={1} />)
    await act(async()=>{await Promise.resolve()})
    const button=screen.getByRole('button',{name:'Begin 1 Minute Meditation'})
    expect(button).toHaveAttribute('data-no-sound','true')
    fireEvent.click(button)
    expect(begin).toHaveBeenCalledTimes(1)
    expect(buttonSoundService.play).not.toHaveBeenCalled()
  })

  it('selects a duration without playing a bell',async()=>{
    render(<MeditationSetup onBack={vi.fn()} onBegin={vi.fn()} availableSoundscapes={[]} initialDuration={1} />)
    await act(async()=>{await Promise.resolve()})
    const duration=screen.getByRole('button',{name:'5m'})
    expect(duration.closest('[data-no-sound="true"]')).not.toBeNull()
    fireEvent.click(duration)
    expect(buttonSoundService.play).not.toHaveBeenCalled()
  })

  it('rings at timer start and once at expiry, without repeating on pause/resume',async()=>{
    const phase=vi.fn()
    render(<PracticeSession config={{type:PracticeType.MEDITATION,duration:1}} customAffirmations={[]} soundscape={{id:'default',label:'Default'}} onComplete={vi.fn()} onExit={vi.fn()} onAudioPhaseChange={phase} />)
    await act(async()=>{await Promise.resolve()})
    expect(playCompletionSound).not.toHaveBeenCalled()
    expect(playBell).not.toHaveBeenCalled()
    const start=screen.getByRole('button',{name:'Start'})
    expect(start).toHaveAttribute('data-no-sound','true')
    fireEvent.click(start)
    expect(playMeditationBell).toHaveBeenCalledTimes(1)
    expect(phase).toHaveBeenLastCalledWith('running')
    fireEvent.click(screen.getByRole('button',{name:'Pause'}))
    fireEvent.click(screen.getByRole('button',{name:'Start'}))
    expect(playMeditationBell).toHaveBeenCalledTimes(1)
    await act(async()=>{await vi.advanceTimersByTimeAsync(60000)})
    expect(playMeditationBell).toHaveBeenCalledTimes(2)
    expect(phase).toHaveBeenLastCalledWith('ending')
    await act(async()=>{await vi.advanceTimersByTimeAsync(3000)})
    expect(playMeditationBell).toHaveBeenCalledTimes(2)
    expect(phase).toHaveBeenLastCalledWith('reflection')
    expect(playBell).not.toHaveBeenCalled()
    expect(playCompletionSound).not.toHaveBeenCalled()
    expect(screen.getByRole('heading',{name:'Session Complete'})).toBeInTheDocument()
  })

  it('reports a blocked bell instead of silently pretending it played',async()=>{
    vi.mocked(playMeditationBell).mockResolvedValue(false)
    render(<MeditationSetup onBack={vi.fn()} onBegin={vi.fn()} availableSoundscapes={[]} />)
    await act(async()=>{await Promise.resolve()})
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Test meditation bell'}))})
    expect(screen.getByRole('alert')).toHaveTextContent('bell could not play')
  })

  it('does not ring a meditation start bell on the preparation Begin button',()=>{
    const begin=vi.fn()
    render(<PrePracticeInvocation variant="meditation" onBegin={begin} theme="dark" />)
    const button=screen.getByRole('button',{name:/Begin/i})
    expect(button).toHaveAttribute('data-no-sound','true')
    fireEvent.click(button)
    expect(begin).toHaveBeenCalledTimes(1)
    expect(playBell).not.toHaveBeenCalled()
    expect(playCompletionSound).not.toHaveBeenCalled()
  })

  it('preserves the bell on other practice preparation buttons',()=>{
    render(<PrePracticeInvocation variant="iam" onBegin={vi.fn()} theme="dark" />)
    fireEvent.click(screen.getByRole('button',{name:/Begin/i}))
    expect(playBell).toHaveBeenCalledTimes(1)
  })
})
