import { useLiveQuery } from "dexie-react-hooks"
import { useMemo } from "react"

import { db as defaultDb, type VocabDB } from "@/lib/db/db"

import { mergeDecks } from "../decks"
import type { DeckIndexEntry } from "../types"
import { useDeckIndex } from "./useDeckIndex"

export type DecksState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; decks: DeckIndexEntry[] }

/** All decks: built-in (index.json) + custom (IndexedDB, live). */
export function useDecks(database: VocabDB = defaultDb): DecksState {
  const builtIn = useDeckIndex()
  const custom = useLiveQuery(() => database.customDecks.toArray(), [database])

  return useMemo<DecksState>(() => {
    if (builtIn.status !== "ready") return builtIn
    if (!custom) return { status: "loading" }
    return { status: "ready", decks: mergeDecks(builtIn.decks, custom) }
  }, [builtIn, custom])
}
