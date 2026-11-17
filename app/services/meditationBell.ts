import { href } from './base'

let bell: HTMLAudioElement | null = null

export function preloadMeditationBell(): void {
  if (!bell) {
    bell = new Audio(href('assets/audio/cues/meditation-bell.wav'))
    bell.preload = 'auto'
    bell.loop = false
    bell.volume = 0.8
    const notify = (playing: boolean) => window.dispatchEvent(new CustomEvent('meditation-bell', {detail: playing}))
    bell.addEventListener('play', () => notify(true))
    for (const event of ['ended','pause','error']) bell.addEventListener(event, () => notify(false))
  }
}

// Timer cues use their own media channel, never the music or quiet UI-click tone.
export async function playMeditationBell(): Promise<boolean> {
  try {
    preloadMeditationBell()
    bell!.pause()
    bell!.currentTime = 0
    await bell!.play()
    return true
  } catch {
    return false
  }
}
