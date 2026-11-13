// Pure helpers for build-decks.mjs (kept separate so they can be unit tested).

/** "Follow up!" -> "follow-up" */
export const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Turns one parsed CSV row into a DeckCard (see docs/SPEC.md).
 * Supports the vocab format (Word, Meaning, Example) and the irregular
 * verbs format (Verb, Meaning, Forms, Other forms, Past/Participle example).
 */
export function rowToCard(row) {
  if ('Verb' in row) {
    return {
      front: row.Verb.trim(),
      meaning: row.Meaning.trim(),
      forms: row.Forms.trim(),
      other: row['Other forms']?.trim() || undefined,
      examples: [row['Past example'], row['Participle example']]
        .map((s) => s?.trim())
        .filter(Boolean),
    };
  }
  return {
    front: row.Word.trim(),
    meaning: row.Meaning.trim(),
    examples: [row.Example?.trim()].filter(Boolean),
  };
}

/**
 * Builds the cards of one deck with stable ids `${deckId}:${slug(front)}`.
 * Different words can share a slug ("follow up" verb vs "follow-up" noun);
 * later ones get a numeric suffix ("-2"), which is stable because the CSV
 * order is fixed.
 */
export function buildDeck(deckId, rows) {
  const seen = new Map();
  return rows.map((row) => {
    const card = rowToCard(row);
    const base = `${deckId}:${slug(card.front)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { id: n === 1 ? base : `${base}-${n}`, ...card };
  });
}
