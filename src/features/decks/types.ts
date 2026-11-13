export type { DeckCard } from "@/lib/db/types"

/** One entry of public/decks/index.json, or a custom deck from IndexedDB. */
export type DeckIndexEntry = {
  id: string
  name: string
  count: number
  builtIn: boolean
}
