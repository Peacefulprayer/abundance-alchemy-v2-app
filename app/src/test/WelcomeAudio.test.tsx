import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WelcomeScreen } from '../../components/WelcomeScreen'

vi.mock('../../components/SacredBackground', () => ({ SacredBackground: ({children}:{children:React.ReactNode}) => <div>{children}</div> }))
vi.mock('../../components/BreathingOrb', () => ({default: () => <div />}))
vi.mock('../../services/buttonSoundService', () => ({buttonSoundService:{play:vi.fn()}}))
vi.mock('../../services/audioService', () => ({stopAmbience:vi.fn()}))

class Narration extends EventTarget {
  static latest: Narration
  currentTime=0
  duration=35
  preload=''
  play=vi.fn(async()=>{this.dispatchEvent(new Event('play'))})
  pause=vi.fn(()=>{this.dispatchEvent(new Event('pause'))})
  constructor(){super();Narration.latest=this}
}
describe('welcome audio focus',()=>{
  it('reports voice start, end and skip so ambience can return immediately',async()=>{
    vi.spyOn(document,'hasFocus').mockReturnValue(true)
    const narration=vi.fn()
    render(<WelcomeScreen user={null} onComplete={vi.fn()} onNarrationChange={narration} />)
    await act(async()=>{await vi.advanceTimersByTimeAsync(600)})
    expect(narration).toHaveBeenLastCalledWith(true)
    act(()=>{Narration.latest.dispatchEvent(new Event('ended'))})
    expect(narration).toHaveBeenLastCalledWith(false)
    fireEvent.click(screen.getByRole('button',{name:'Skip Invocation'}))
    expect(narration).toHaveBeenLastCalledWith(false)
  })

  beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('Audio',Narration)})
  afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks()})
  it('does not start delayed narration in an inactive tab',async()=>{
    vi.spyOn(document,'hasFocus').mockReturnValue(false)
    render(<WelcomeScreen user={null} onComplete={vi.fn()} />)
    await act(async()=>{await vi.advanceTimersByTimeAsync(600)})
    expect(Narration.latest.play).not.toHaveBeenCalled()
    expect(screen.getByRole('button',{name:'Play Invocation'})).toBeInTheDocument()
  })
  it('pauses narration on focus loss and offers explicit replay',async()=>{
    vi.spyOn(document,'hasFocus').mockReturnValue(true)
    render(<WelcomeScreen user={null} onComplete={vi.fn()} />)
    await act(async()=>{await vi.advanceTimersByTimeAsync(600)})
    expect(Narration.latest.play).toHaveBeenCalledTimes(1)
    act(()=>{window.dispatchEvent(new Event('blur'))})
    expect(Narration.latest.pause).toHaveBeenCalled()
    expect(screen.getByRole('button',{name:'Play Invocation'})).toBeInTheDocument()
  })
})
