import type { DeckCard, Direction, ProgressRecord } from "@/lib/db/types"

/** One card shown in a study session. */
export type QueueItem = {
  deckId: string
  card: DeckCard
  direction: Direction
  /** undefined = never studied in this direction (a new card) */
  progress?: ProgressRecord
}

export type DeckInput = {
  deckId: string
  /** In file order (new cards are introduced in this order) */
  cards: DeckCard[]
}
