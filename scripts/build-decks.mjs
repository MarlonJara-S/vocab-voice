// Converts the CSV decks in /data into JSON files served from /public/decks.
// Run with `npm run decks` (it also runs automatically before `npm run build`).
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const outDir = join(root, 'public', 'decks');
mkdirSync(outDir, { recursive: true });

const NAMES = {
  '01': 'Words 1–500',
  '02': 'Words 501–1000',
  '03': 'Words 1001–1500',
  '04': 'Words 1501–2000',
  '05': 'Words 2001–2500',
  '06': 'Words 2501–3000',
  '07': 'Words 3001–3490',
  '08': 'Work & tech English',
  '09': 'Irregular verbs',
};

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const index = [];
for (const file of readdirSync(dataDir).filter((f) => f.endsWith('.csv')).sort()) {
  const num = file.slice(0, 2);
  const deckId = file.replace(/-voz\.csv$/, '').replace(/\.csv$/, '');
  const { data } = Papa.parse(readFileSync(join(dataDir, file), 'utf8'), {
    header: true,
    skipEmptyLines: true,
  });

  const cards = data.map((row) => {
    if ('Verb' in row) {
      return {
        id: `${deckId}:${slug(row.Verb)}`,
        front: row.Verb.trim(),
        meaning: row.Meaning.trim(),
        forms: row.Forms.trim(),
        other: row['Other forms']?.trim() || undefined,
        examples: [row['Past example'], row['Participle example']].map((s) => s?.trim()).filter(Boolean),
      };
    }
    return {
      id: `${deckId}:${slug(row.Word)}`,
      front: row.Word.trim(),
      meaning: row.Meaning.trim(),
      examples: [row.Example?.trim()].filter(Boolean),
    };
  });

  writeFileSync(join(outDir, `${deckId}.json`), JSON.stringify(cards));
  index.push({ id: deckId, name: NAMES[num] ?? deckId, count: cards.length, builtIn: true });
  console.log(`${deckId}: ${cards.length} cards`);
}
writeFileSync(join(outDir, 'index.json'), JSON.stringify(index, null, 2));
