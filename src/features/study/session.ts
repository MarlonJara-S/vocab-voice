import type { ProgressRecord } from "@/lib/db/types"

import { isLearning, LEARN_AHEAD_MS } from "./queue"
import type { QueueItem } from "./types"

const dueTime = (item: QueueItem) => item.progress?.fsrs.due.getTime() ?? 0

/**
 * Index of the next card to show, or -1 when the session is over:
 * 1. a learning card whose step has ended (earliest first);
 * 2. otherwise the next card in queue order that is not waiting on a step;
 * 3. otherwise the waiting learning card that comes due first (learn ahead).
 */
export function pickNextIndex(queue: QueueItem[], now: Date): number {
  const t = now.getTime()
  let readyLearning = -1
  let firstOther = -1
  let waitingLearning = -1

  queue.forEach((item, i) => {
    if (isLearning(item.progress)) {
      if (dueTime(item) <= t) {
        if (readyLearning < 0 || dueTime(item) < dueTime(queue[readyLearning])) readyLearning = i
      } else if (waitingLearning < 0 || dueTime(item) < dueTime(queue[waitingLearning])) {
        waitingLearning = i
      }
    } else if (firstOther < 0) {
      firstOther = i
    }
  })

  if (readyLearning >= 0) return readyLearning
  if (firstOther >= 0) return firstOther
  return waitingLearning
}

/**
 * Removes the answered card. If it is still learning and comes due within
 * the learn-ahead window, it goes back into the session with its new state.
 */
export function afterReview(
  queue: QueueItem[],
  index: number,
  updated: ProgressRecord,
  now: Date
): QueueItem[] {
  const rest = queue.filter((_, i) => i !== index)
  const comesBack =
    isLearning(updated) && updated.fsrs.due.getTime() <= now.getTime() + LEARN_AHEAD_MS
  return comesBack ? [...rest, { ...queue[index], progress: updated }] : rest
}
