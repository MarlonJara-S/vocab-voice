import { createEmptyCard, Rating, State } from "ts-fsrs"

import type { DeckCard, Direction, ProgressRecord, ReviewLogRecord } from "@/lib/db/types"

export const word = (deckId: string, front: string): DeckCard => ({
  id: `${deckId}:${front}`,
  front,
  meaning: `meaning of ${front}`,
  examples: [`An example with ${front}.`],
})

export function progress(
  card: DeckCard,
  state: State,
  due: Date,
  direction: Direction = "en-es"
): ProgressRecord {
  return {
    cardId: card.id,
    deckId: card.id.split(":")[0],
    direction,
    fsrs: { ...createEmptyCard(due), state, due, reps: 1 },
    updatedAt: due,
  }
}

type LogOptions = { wasNew?: boolean; rating?: Rating; direction?: Direction }

export function log(
  card: DeckCard,
  reviewedAt: Date,
  { wasNew = false, rating = Rating.Good, direction = "en-es" }: LogOptions = {}
): ReviewLogRecord {
  return {
    cardId: card.id,
    deckId: card.id.split(":")[0],
    direction,
    rating,
    wasNew,
    reviewedAt,
    durationMs: 3000,
  }
}
