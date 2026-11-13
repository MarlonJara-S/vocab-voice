import type { Voice } from "./voices"

type Handler = ((e: { charIndex: number; error?: string }) => void) | null

/** Minimal SpeechSynthesisUtterance for jsdom (install with vi.stubGlobal). */
export class FakeUtterance {
  lang = ""
  rate = 1
  volume = 1
  voice: Voice | null = null
  onend: Handler = null
  onerror: Handler = null
  onboundary: Handler = null
  text: string
  constructor(text: string) {
    this.text = text
  }
}

/** Behaves like Safari: cancel() interrupts the queued utterances. */
export class FakeEngine extends EventTarget {
  paused = false
  spoken: FakeUtterance[] = []
  private pending: FakeUtterance[] = []
  private voices: Voice[]

  constructor(voices: Voice[] = []) {
    super()
    this.voices = voices
  }

  getVoices = () => this.voices as SpeechSynthesisVoice[]

  /** Voices arriving late, as on iOS. */
  setVoices(voices: Voice[], fireEvent = true) {
    this.voices = voices
    if (fireEvent) this.dispatchEvent(new Event("voiceschanged"))
  }

  speak = (u: SpeechSynthesisUtterance) => {
    const fake = u as unknown as FakeUtterance
    this.spoken.push(fake)
    this.pending.push(fake)
  }

  cancel = () => {
    const interrupted = this.pending
    this.pending = []
    interrupted.forEach((u) => u.onerror?.({ charIndex: 0, error: "interrupted" }))
  }

  resume = () => {
    this.paused = false
  }

  get last(): FakeUtterance | undefined {
    return this.spoken.at(-1)
  }

  boundary(charIndex: number) {
    this.pending[0]?.onboundary?.({ charIndex })
  }

  /** The current utterance finishes normally. */
  end() {
    const u = this.pending.shift()
    u?.onend?.({ charIndex: u.text.length })
  }
}
