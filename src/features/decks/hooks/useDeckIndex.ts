import { useEffect, useState } from "react"

import { fetchDeckIndex } from "../api"
import type { DeckIndexEntry } from "../types"

type DeckIndexState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; decks: DeckIndexEntry[] }

export function useDeckIndex(): DeckIndexState {
  const [state, setState] = useState<DeckIndexState>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    fetchDeckIndex()
      .then((decks) => {
        if (!cancelled) setState({ status: "ready", decks })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const err = error instanceof Error ? error : new Error(String(error))
        setState({ status: "error", error: err })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
