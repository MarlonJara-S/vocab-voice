import { db as defaultDb, type VocabDB } from "@/lib/db/db"

import { parseSetting, parseSettings, type SettingKey, type Settings } from "./settings"

export async function readSettings(database: VocabDB = defaultDb): Promise<Settings> {
  return parseSettings(await database.settings.toArray())
}

/** Validates and saves one setting. Returns the value actually stored. */
export async function saveSetting<K extends SettingKey>(
  key: K,
  value: Settings[K],
  database: VocabDB = defaultDb
): Promise<Settings[K]> {
  const parsed = parseSetting(key, value)
  if (parsed === undefined) throw new Error(`Invalid value for setting "${key}"`)
  await database.settings.put({ key, value: parsed })
  return parsed
}
