import { useEffect, useEffectEvent } from "react"

/**
 * Speaks `text` once each time `key` changes (e.g. a new card appears),
 * when auto-play is on. Changing only the voice or speed does not replay.
 */
export function useAutoPlay(
  key: string,
  text: string,
  enabled: boolean,
  speak: (text: string) => unknown
): void {
  const play = useEffectEvent(() => {
    if (enabled && text) void speak(text)
  })
  useEffect(() => {
    play()
  }, [key])
}
