import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { installSpeechUnlock, type SpeechEngine } from "./engine"
import { FakeEngine, FakeUtterance } from "./fake-engine"
import { useAutoPlay } from "./useAutoPlay"
import { MIN_TURN_MS, useSpeech } from "./useSpeech"
import { useVoices } from "./useVoices"

const samantha = { name: "Samantha", lang: "en-US", voiceURI: "compact.en-US.Samantha", localService: true }
const daniel = { name: "Daniel (Enhanced)", lang: "en-GB", voiceURI: "enhanced.en-GB.Daniel", localService: true }

let engine: FakeEngine
const asEngine = (e: FakeEngine) => e as unknown as SpeechEngine

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance)
  engine = new FakeEngine([samantha, daniel])
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const setup = (settings = { voiceURI: null as string | null, rate: 0.9 }) =>
  renderHook((props) => useSpeech(props, asEngine(engine)), { initialProps: settings })

describe("useSpeech", () => {
  it("speaks with the best English voice, the user's rate and an English lang", async () => {
    const { result } = setup()
    let done: Promise<{ completed: boolean }> | undefined
    act(() => {
      done = result.current.speak("achieve")
    })

    expect(engine.last).toMatchObject({ text: "achieve", lang: "en-GB", rate: 0.9 })
    expect(engine.last?.voice).toMatchObject({ name: "Daniel (Enhanced)" })
    expect(result.current.phase).toBe("speaking")

    act(() => engine.end())
    await expect(done).resolves.toMatchObject({ completed: true })
    expect(result.current.phase).toBe("idle")
    expect(result.current.progress).toBe(1)
  })

  it("uses the saved voice and the slow rate (0.7×)", () => {
    const { result } = setup({ voiceURI: samantha.voiceURI, rate: 0.9 })
    act(() => void result.current.speak("achieve", { slow: true }))
    expect(engine.last).toMatchObject({ lang: "en-US", rate: 0.63 })
  })

  it("cuts the previous speech when a new one starts", async () => {
    const { result } = setup()
    let first: Promise<{ completed: boolean }> | undefined
    act(() => {
      first = result.current.speak("achieve")
    })
    act(() => void result.current.speak("You can achieve your goals."))

    await expect(first).resolves.toMatchObject({ completed: false })
    expect(result.current.phase).toBe("speaking")
    expect(engine.spoken.map((u) => u.text)).toEqual(["achieve", "You can achieve your goals."])
  })

  it("stop() goes back to idle", () => {
    const { result } = setup()
    act(() => void result.current.speak("achieve"))
    act(() => result.current.stop())
    expect(result.current.phase).toBe("idle")
    expect(result.current.progress).toBe(0)
  })

  it("moves the progress bar with word boundaries", () => {
    const { result } = setup()
    const text = "You can achieve your goals."
    act(() => void result.current.speak(text))
    act(() => engine.boundary(text.indexOf("achieve")))
    expect(result.current.progress).toBeCloseTo(8 / text.length)
  })

  it("does not hang when iOS never fires the end event", async () => {
    const { result } = setup()
    let done: Promise<{ completed: boolean }> | undefined
    act(() => {
      done = result.current.speak("achieve")
    })
    await act(() => vi.advanceTimersByTimeAsync(10_000))
    await expect(done).resolves.toMatchObject({ completed: true })
    expect(result.current.phase).toBe("idle")
  })

  it("shadow(): plays the sentence, then gives a 'your turn' pause", async () => {
    const { result } = setup()
    act(() => void result.current.shadow("You can achieve your goals."))
    await act(() => vi.advanceTimersByTimeAsync(2000))
    act(() => engine.end())
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.phase).toBe("yourTurn")

    await act(() => vi.advanceTimersByTimeAsync(Math.max(MIN_TURN_MS, 2000)))
    expect(result.current.phase).toBe("idle")
  })

  it("reports when speech is not supported", async () => {
    const { result } = renderHook(() => useSpeech({ voiceURI: null, rate: 1 }, undefined))
    expect(result.current.supported).toBe(false)
    await expect(result.current.speak("hi")).resolves.toEqual({ completed: false, durationMs: 0 })
  })
})

describe("useVoices", () => {
  it("updates when voices arrive late (voiceschanged)", () => {
    const late = new FakeEngine([])
    const { result } = renderHook(() => useVoices(asEngine(late)))
    expect(result.current).toEqual([])
    act(() => late.setVoices([samantha]))
    expect(result.current).toHaveLength(1)
  })

  it("polls when iOS never fires voiceschanged", async () => {
    const silent = new FakeEngine([])
    const { result } = renderHook(() => useVoices(asEngine(silent)))
    silent.setVoices([samantha], false)
    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(result.current).toHaveLength(1)
  })
})

describe("installSpeechUnlock", () => {
  it("speaks one silent utterance on the first tap only", () => {
    const target = new EventTarget()
    installSpeechUnlock(asEngine(engine), target)
    target.dispatchEvent(new Event("touchend"))
    target.dispatchEvent(new Event("click"))
    expect(engine.spoken).toHaveLength(1)
    expect(engine.spoken[0].volume).toBe(0)
  })
})

describe("useAutoPlay", () => {
  it("plays once per new card, only when enabled", () => {
    const speak = vi.fn()
    const { rerender } = renderHook((p) => useAutoPlay(p.key, p.text, p.enabled, p.speak), {
      initialProps: { key: "a", text: "achieve", enabled: true, speak },
    })
    rerender({ key: "a", text: "achieve", enabled: true, speak: vi.fn() }) // same card
    rerender({ key: "b", text: "although", enabled: false, speak }) // auto-play off
    rerender({ key: "c", text: "enough", enabled: true, speak })
    expect(speak.mock.calls).toEqual([["achieve"], ["enough"]])
  })
})
