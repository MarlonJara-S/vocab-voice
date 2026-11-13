import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { defaultEngine, type SpeechEngine } from "./engine"
import { useVoices } from "./useVoices"
import { effectiveRate, estimateSpeechMs, pickVoice } from "./voices"

export type SpeakOptions = { slow?: boolean }
export type SpeakResult = { completed: boolean; durationMs: number }
export type SpeechPhase = "idle" | "speaking" | "yourTurn"

type Active = { id: number; finish: (completed: boolean) => void }

const PROGRESS_TICK_MS = 100
/** Shortest "your turn" pause after "Repeat after it". */
export const MIN_TURN_MS = 1500

/**
 * Text-to-speech with the iPhone's built-in voices (free, offline).
 * - speak(): cancels anything playing, resolves when it ends or is cut.
 * - progress: 0–1, from word boundaries and a time estimate.
 * - shadow(): plays the text, then waits about as long ("your turn").
 */
export function useSpeech(
  { voiceURI, rate }: { voiceURI: string | null; rate: number },
  engine: SpeechEngine | undefined = defaultEngine()
) {
  const voices = useVoices(engine)
  const voice = useMemo(() => pickVoice(voices, voiceURI), [voices, voiceURI])
  const [phase, setPhase] = useState<SpeechPhase>("idle")
  const [progress, setProgress] = useState(0)
  const active = useRef<Active | null>(null)
  const nextId = useRef(0)
  // Keeps the utterance alive: some browsers drop events of collected ones.
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    nextId.current++
    active.current?.finish(false)
    active.current = null
    engine?.cancel()
    setPhase("idle")
    setProgress(0)
  }, [engine])

  const speak = useCallback(
    (text: string, { slow = false }: SpeakOptions = {}) =>
      new Promise<SpeakResult>((resolve) => {
        stop()
        if (!engine || !text.trim()) return resolve({ completed: false, durationMs: 0 })

        const id = ++nextId.current
        const u = new SpeechSynthesisUtterance(text)
        u.lang = voice?.lang ?? "en-US"
        if (voice) u.voice = voice
        u.rate = effectiveRate(rate, slow)
        utterance.current = u

        const estimate = estimateSpeechMs(text, u.rate)
        const started = Date.now()
        const isCurrent = () => id === nextId.current
        const bump = (p: number) => isCurrent() && setProgress((old) => Math.max(old, p))
        const tick = setInterval(() => bump(Math.min(0.95, (Date.now() - started) / estimate)), PROGRESS_TICK_MS)
        // iOS sometimes never fires "end": give up after twice the estimate.
        const safety = setTimeout(() => finish(true), estimate * 2 + 2000)

        let done = false
        function finish(completed: boolean) {
          if (done) return
          done = true
          clearInterval(tick)
          clearTimeout(safety)
          if (isCurrent()) {
            active.current = null
            setPhase("idle")
            setProgress(completed ? 1 : 0)
          }
          resolve({ completed, durationMs: Date.now() - started })
        }

        u.onboundary = (e) => bump(e.charIndex / text.length)
        u.onend = () => finish(true)
        u.onerror = () => finish(false)
        active.current = { id, finish }
        setPhase("speaking")
        setProgress(0)
        // iOS can leave the engine paused after the app was in the background.
        if (engine.paused) engine.resume()
        engine.speak(u)
      }),
    [engine, voice, rate, stop]
  )

  const shadow = useCallback(
    async (text: string, options?: SpeakOptions) => {
      const result = await speak(text, options)
      if (!result.completed) return
      const id = nextId.current
      setPhase("yourTurn")
      await new Promise((r) => setTimeout(r, Math.max(MIN_TURN_MS, result.durationMs)))
      if (id === nextId.current) setPhase("idle")
    },
    [speak]
  )

  useEffect(() => stop, [stop])

  return { supported: !!engine, voices, voice, phase, progress, speak, stop, shadow }
}

export type Speech = ReturnType<typeof useSpeech>
