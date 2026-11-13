import { describe, expect, it } from 'vitest';
import { buildDeck, rowToCard, slug } from './deck-utils.mjs';

describe('slug', () => {
  it('lowercases and joins words with dashes', () => {
    expect(slug('  Follow Up! ')).toBe('follow-up');
    expect(slug("o'clock")).toBe('o-clock');
  });
});

describe('rowToCard', () => {
  it('maps a vocab row and ignores the audio columns', () => {
    const card = rowToCard({
      Word: 'achieve ',
      Meaning: 'lograr',
      Example: 'You can achieve your goals.',
      'Audio palabra': 'achieve',
      'Audio ejemplo': 'You can achieve your goals.',
    });
    expect(card).toEqual({
      front: 'achieve',
      meaning: 'lograr',
      examples: ['You can achieve your goals.'],
    });
  });

  it('maps an irregular verb row with two examples', () => {
    const card = rowToCard({
      Verb: 'catch',
      Meaning: 'atrapar',
      Forms: 'catch – caught – caught',
      'Other forms': 'catches · catching',
      'Past example': 'I caught the bus.',
      'Participle example': 'I have caught a cold.',
    });
    expect(card.forms).toBe('catch – caught – caught');
    expect(card.other).toBe('catches · catching');
    expect(card.examples).toHaveLength(2);
  });
});

describe('buildDeck', () => {
  it('gives unique, stable ids when two words share a slug', () => {
    const rows = [
      { Word: 'follow up', Meaning: 'hacer seguimiento', Example: 'a' },
      { Word: 'follow-up', Meaning: 'seguimiento', Example: 'b' },
      { Word: 'deploy', Meaning: 'desplegar', Example: 'c' },
    ];
    expect(buildDeck('08', rows).map((c) => c.id)).toEqual([
      '08:follow-up',
      '08:follow-up-2',
      '08:deploy',
    ]);
  });
});
