/** The parts of window.speechSynthesis we use (a fake in tests). */
export type SpeechEngine = Pick<
  SpeechSynthesis,
  "speak" | "cancel" | "resume" | "getVoices" | "paused" | "addEventListener" | "removeEventListener"
>

export function defaultEngine(): SpeechEngine | undefined {
  if (typeof globalThis.speechSynthesis === "undefined") return undefined
  if (typeof globalThis.SpeechSynthesisUtterance === "undefined") return undefined
  return globalThis.speechSynthesis
}

/**
 * iOS Safari only lets a page speak after a user gesture. The first tap
 * anywhere speaks a silent utterance, so auto-play works afterwards.
 */
export function installSpeechUnlock(
  engine: SpeechEngine | undefined = defaultEngine(),
  target: EventTarget = globalThis.document
): () => void {
  if (!engine || !target) return () => {}
  const events = ["touchend", "click", "keydown"] as const
  const remove = () => events.forEach((e) => target.removeEventListener(e, unlock))
  function unlock() {
    const silent = new SpeechSynthesisUtterance(" ")
    silent.volume = 0
    engine?.speak(silent)
    remove()
  }
  events.forEach((e) => target.addEventListener(e, unlock))
  return remove
}
