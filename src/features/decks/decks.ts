import { db as defaultDb, type VocabDB } from "@/lib/db/db"
import type { CustomDeck } from "@/lib/db/types"

import { fetchDeckCards } from "./api"
import type { DeckCard, DeckIndexEntry } from "./types"

/** A custom deck as it appears in the deck list. */
export function customDeckEntry(deck: CustomDeck): DeckIndexEntry {
  return { id: deck.id, name: deck.name, count: deck.cards.length, builtIn: false }
}

/** Built-in decks first (file order), then custom decks, oldest first. */
export function mergeDecks(
  builtIn: DeckIndexEntry[],
  custom: CustomDeck[]
): DeckIndexEntry[] {
  const sorted = [...custom].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  return [...builtIn, ...sorted.map(customDeckEntry)]
}

type LoadOptions = {
  database?: VocabDB
  fetchCards?: (deckId: string) => Promise<DeckCard[]>
}

// Built-in decks never change while the app runs, so fetch each one once.
const builtInCache = new Map<string, Promise<DeckCard[]>>()

export function clearDeckCache(): void {
  builtInCache.clear()
}

/** Cards of any deck: custom decks from IndexedDB, built-in decks from JSON. */
export async function loadDeckCards(
  deckId: string,
  { database = defaultDb, fetchCards = fetchDeckCards }: LoadOptions = {}
): Promise<DeckCard[]> {
  const custom = await database.customDecks.get(deckId)
  if (custom) return custom.cards

  let cards = builtInCache.get(deckId)
  if (!cards) {
    cards = fetchCards(deckId)
    builtInCache.set(deckId, cards)
    // Don't keep a failed request: the next call retries (e.g. back online).
    cards.catch(() => builtInCache.delete(deckId))
  }
  return cards
}
