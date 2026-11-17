import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PracticeSession } from '../../components/PracticeSession'
import { Library } from '../../components/Library'
import { PracticeType } from '../../types'
import { api } from '../../services/api'

vi.mock('../../components/BreathingOrb', () => ({default: () => <div />}))
vi.mock('../../services/audioService', () => ({playBell:vi.fn(),playCompletionSound:vi.fn(),startAmbience:vi.fn(),stopAmbience:vi.fn(),updateVolume:vi.fn()}))
vi.mock('../../services/audioManager', () => ({audioManager:{playBell:vi.fn(),previewSoundscape:vi.fn()}}))
vi.mock('../../services/api', () => ({api:{getSystemAffirmations:vi.fn().mockResolvedValue([]),getRandomAffirmation:vi.fn().mockResolvedValue('I am here.')}}))
vi.mock('../../services/geminiService', () => ({getMeditationWisdom:vi.fn().mockResolvedValue('Stillness')}))

afterEach(() => { vi.useRealTimers(); vi.mocked(api.getRandomAffirmation).mockResolvedValue('I am here.') })

describe('practice gratitude to Maktaba', () => {
  it('keeps database I Love content usable when the random endpoint fails', async () => {
    vi.mocked(api.getSystemAffirmations).mockResolvedValueOnce([{id: 'db-love',text: 'I love this recovered database affirmation.',type: PracticeType.EVENING_ILOVE,category: 'Peace'}] as any)
    vi.mocked(api.getRandomAffirmation).mockRejectedValue(new Error('temporary network failure'))
    render(<PracticeSession config={{type:PracticeType.EVENING_ILOVE,duration:1,focusAreas:['Peace']}} customAffirmations={[]} soundscape={{id:'default',label:'Default'}} onComplete={vi.fn()} onExit={vi.fn()} />)
    expect(await screen.findByText(/I love this recovered database affirmation\./)).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Start'})).toBeEnabled()
  })
  it('passes the entered reflection to completion and shows it in the library', async () => {
    vi.useFakeTimers()
    const complete=vi.fn()
    const view=render(<PracticeSession config={{type:PracticeType.MORNING_IAM,duration:0,focusAreas:['Peace']}} customAffirmations={[]} soundscape={{id:'default',label:'Default'}} onComplete={complete} onExit={vi.fn()} />)
    await act(async () => { await vi.advanceTimersByTimeAsync(2600) })
    fireEvent.change(screen.getByPlaceholderText('What are you grateful for? (optional)'),{target:{value:'Grateful for this quiet moment.'}})
    fireEvent.click(screen.getByRole('button',{name:'Save & Continue'}))
    expect(complete).toHaveBeenCalledTimes(1)
    const log=complete.mock.calls[0][0]
    expect(log).toMatchObject({text:'Grateful for this quiet moment.',focusArea:'Peace',sessionType:PracticeType.MORNING_IAM})
    view.unmount()
    render(<Library gratitudeLogs={[log]} onAdd={vi.fn()} onRemove={vi.fn()} onAudioUpload={vi.fn()} userAudioFile={null} theme="dark" />)
    const scroll=vi.fn()
    const heading=document.getElementById('gratitude-logs')!
    heading.scrollIntoView=scroll
    const before=window.location.href
    fireEvent.click(screen.getByRole('button',{name:'View Gratitude Logs (1)'}))
    expect(scroll).toHaveBeenCalledWith({behavior:'smooth',block:'start'})
    expect(document.activeElement).toBe(heading)
    expect(window.location.href).toBe(before)
    expect(screen.getByText('"Grateful for this quiet moment."')).toBeInTheDocument()
  })
})
