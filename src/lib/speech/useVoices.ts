import { useEffect, useState } from "react"

import { defaultEngine, type SpeechEngine } from "./engine"

const POLL_MS = 250
const MAX_POLLS = 20

/**
 * Installed voices. They load asynchronously ("voiceschanged"), and iOS
 * sometimes never fires that event, so we also poll for a few seconds.
 */
export function useVoices(
  engine: SpeechEngine | undefined = defaultEngine()
): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(
    () => engine?.getVoices() ?? []
  )

  useEffect(() => {
    if (!engine) return
    const read = () => {
      const list = engine.getVoices()
      if (list.length > 0) setVoices(list)
      return list.length > 0
    }
    let polls = 0
    const timer = setInterval(() => {
      if (read() || ++polls >= MAX_POLLS) clearInterval(timer)
    }, POLL_MS)
    engine.addEventListener("voiceschanged", read)
    return () => {
      clearInterval(timer)
      engine.removeEventListener("voiceschanged", read)
    }
  }, [engine])

  return voices
}
