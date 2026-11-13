import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type FSRS,
} from "ts-fsrs"

/** Only two buttons on purpose (Mochi-like): Forgot and Remembered. */
export type Grade = "forgot" | "remembered"

export const GRADE_TO_RATING = {
  forgot: Rating.Again,
  remembered: Rating.Good,
} as const

export function createScheduler(retention: number): FSRS {
  return fsrs({ enable_fuzz: true, request_retention: retention })
}

export type ReviewResult = {
  card: Card
  rating: Rating
  /** The card had never been reviewed (counts against the daily new limit). */
  wasNew: boolean
}

/** Applies one answer. `card` is undefined for a card never studied. */
export function reviewCard(
  scheduler: FSRS,
  card: Card | undefined,
  grade: Grade,
  now: Date
): ReviewResult {
  const current = card ?? createEmptyCard(now)
  const rating = GRADE_TO_RATING[grade]
  const { card: next } = scheduler.next(current, now, rating)
  return { card: next, rating, wasNew: current.state === State.New }
}

/**
 * When the card would be due for each answer (shown under the buttons).
 * Matches reviewCard exactly: ts-fsrs fuzz is deterministic per card and time.
 */
export function previewDue(
  scheduler: FSRS,
  card: Card | undefined,
  now: Date
): Record<Grade, Date> {
  const preview = scheduler.repeat(card ?? createEmptyCard(now), now)
  return {
    forgot: preview[GRADE_TO_RATING.forgot].card.due,
    remembered: preview[GRADE_TO_RATING.remembered].card.due,
  }
}
