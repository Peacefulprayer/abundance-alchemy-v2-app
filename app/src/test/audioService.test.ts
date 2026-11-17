import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../services/buttonTone', () => ({ getAudioContext: vi.fn(), unlockAudio: vi.fn() }))

class TestAudio extends EventTarget {
  static instances: TestAudio[] = []
  src = ''
  volume = 1
  currentTime = 0
  paused = true
  loop = false
  preload = ''
  play = vi.fn(async () => { this.paused = false })
  pause = vi.fn(() => { this.paused = true })
  constructor(src = '') { super(); this.src = src; TestAudio.instances.push(this) }
}

describe('audio transition cancellation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
    TestAudio.instances = []
    vi.stubGlobal('Audio', TestAudio)
  })
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals() })

  const track = (id: string) => ({ id, label: id, url: `/audio/${id}.mp3` })
  it('honors Sound Effects Off for interaction bells', async () => {
    const {getAudioContext}=await import('../../services/buttonTone')
    const {setInteractionSoundsEnabled,playBell}=await import('../../services/audioService')
    setInteractionSoundsEnabled(false)
    playBell()
    expect(getAudioContext).not.toHaveBeenCalled()
    setInteractionSoundsEnabled(true)
    playBell()
    expect(getAudioContext).toHaveBeenCalled()
  })

  it('returns to silence after switching previews when no music was playing', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.previewAmbience(track('a'))
    await vi.advanceTimersByTimeAsync(1000)
    const next = audioService.previewAmbience(track('b'))
    await vi.advanceTimersByTimeAsync(1500)
    await next
    await vi.advanceTimersByTimeAsync(11000)
    expect(TestAudio.instances[0].paused).toBe(true)
  })

  it('treats a music level of 1 as one percent, not full volume', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(TestAudio.instances[0].volume).toBeCloseTo(0.01)
  })

  it('pauses and resumes the same music without resetting playback position', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    TestAudio.instances[0].currentTime = 12
    audioService.pauseAmbience()
    expect(TestAudio.instances[0].paused).toBe(true)
    await audioService.playAmbience(track('a'), 50)
    expect(TestAudio.instances[0].currentTime).toBe(12)
    expect(TestAudio.instances[0].paused).toBe(false)
  })

  it('returns to the original ambience and position after a ten-second preview', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    TestAudio.instances[0].currentTime=12
    const preview=audioService.previewAmbience(track('b'),50)
    await vi.advanceTimersByTimeAsync(400)
    await preview
    expect(TestAudio.instances[0].src).toBe('/audio/b.mp3')
    await vi.advanceTimersByTimeAsync(11500)
    expect(TestAudio.instances[0].src).toBe('/audio/a.mp3')
    expect(TestAudio.instances[0].currentTime).toBe(12)
  })

  it('does not let a canceled preview stop the next screen’s music', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'),50)
    const preview=audioService.previewAmbience(track('b'),50)
    const next=audioService.playAmbience(track('c'),50)
    await vi.advanceTimersByTimeAsync(13000)
    await Promise.all([preview,next])
    expect(TestAudio.instances[0].src).toBe('/audio/c.mp3')
    expect(TestAudio.instances[0].paused).toBe(false)
  })

  it('plays one dedicated bell independently of muted music and reuses its channel', async () => {
    const { audioService } = await import('../../services/audioService')
    audioService.setMasterVolume(0)
    const { playMeditationBell }=await import('../../services/meditationBell')
    expect(await playMeditationBell()).toBe(true)
    expect(await playMeditationBell()).toBe(true)
    const cue=TestAudio.instances[1]
    expect(cue.src).toContain('/audio/cues/meditation-bell.wav')
    expect(cue.volume).toBe(0.8)
    expect(cue.loop).toBe(false)
    expect(cue.play).toHaveBeenCalledTimes(2)
    expect(TestAudio.instances.length).toBe(2)
  })

  it('changes narration ducking volume without restarting the ambience track', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    await vi.advanceTimersByTimeAsync(1000)
    await audioService.playAmbience(track('a'), 10)
    await vi.advanceTimersByTimeAsync(500)
    expect(TestAudio.instances[0].volume).toBeCloseTo(0.1)
    await audioService.playAmbience(track('a'), 50)
    await vi.advanceTimersByTimeAsync(500)
    expect(TestAudio.instances[0].volume).toBeCloseTo(0.5)
    expect(TestAudio.instances[0].play).toHaveBeenCalledTimes(1)
  })

  it('settles a pending track switch when immediate stop cancels it', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    await vi.advanceTimersByTimeAsync(1000)
    let settled = false
    const pending = audioService.playAmbience(track('b'), 50).then(() => { settled = true })
    await audioService.stopAmbience(0)
    await vi.advanceTimersByTimeAsync(1500)
    expect(settled).toBe(true)
    expect(TestAudio.instances[0].paused).toBe(true)
    expect(TestAudio.instances[0].src).toBe('/audio/a.mp3')
    await pending
  })

  it('does not let an older fade-out pause a newly started track', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    await vi.advanceTimersByTimeAsync(1000)
    let stopped = false
    const stopping = audioService.stopAmbience(300).then(() => { stopped = true })
    const starting = audioService.playAmbience(track('b'), 50)
    await vi.advanceTimersByTimeAsync(1500)
    expect(stopped).toBe(true)
    expect(TestAudio.instances[0].src).toBe('/audio/b.mp3')
    expect(TestAudio.instances[0].paused).toBe(false)
    await Promise.all([stopping, starting])
  })

  it('settles rapid preview switches and plays only the latest selection', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    await vi.advanceTimersByTimeAsync(1000)
    let settled = 0
    const first = audioService.playAmbience(track('b'), 50).then(() => { settled++ })
    const second = audioService.playAmbience(track('c'), 50).then(() => { settled++ })
    await vi.advanceTimersByTimeAsync(1500)
    expect(settled).toBe(2)
    expect(TestAudio.instances[0].src).toBe('/audio/c.mp3')
    expect(TestAudio.instances[0].paused).toBe(false)
    await Promise.all([first, second])
  })

  it('finishes repeated requests for the same new track during a crossfade', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    await vi.advanceTimersByTimeAsync(1000)
    const first = audioService.playAmbience(track('b'), 50)
    const second = audioService.playAmbience(track('b'), 50)
    await vi.advanceTimersByTimeAsync(1500)
    await Promise.all([first, second])
    expect(TestAudio.instances[0].src).toBe('/audio/b.mp3')
    expect(TestAudio.instances[0].paused).toBe(false)
  })

  it('stops background playback on blur and refuses new previews until focus', async () => {
    const { audioService } = await import('../../services/audioService')
    await audioService.playAmbience(track('a'), 50)
    window.dispatchEvent(new Event('blur'))
    await vi.advanceTimersByTimeAsync(1000)
    expect(TestAudio.instances[0].paused).toBe(true)
    await audioService.playAmbience(track('b'), 50)
    expect(TestAudio.instances[0].paused).toBe(true)
    window.dispatchEvent(new Event('focus'))
    await audioService.playAmbience(track('b'), 50)
    expect(TestAudio.instances[0].src).toBe('/audio/b.mp3')
    expect(TestAudio.instances[0].paused).toBe(false)
  })
})
