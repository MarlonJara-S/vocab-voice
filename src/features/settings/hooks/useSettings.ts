import { useLiveQuery } from "dexie-react-hooks"
import { useCallback, useMemo } from "react"

import { db as defaultDb, type VocabDB } from "@/lib/db/db"

import { parseSettings, type SettingKey, type Settings } from "../settings"
import { saveSetting } from "../settings-store"

type UseSettings = {
  /** undefined while IndexedDB is loading */
  settings: Settings | undefined
  update: <K extends SettingKey>(key: K, value: Settings[K]) => Promise<Settings[K]>
}

/** Live settings: re-renders when any setting changes (also in other tabs). */
export function useSettings(database: VocabDB = defaultDb): UseSettings {
  const records = useLiveQuery(() => database.settings.toArray(), [database])
  const settings = useMemo(
    () => (records ? parseSettings(records) : undefined),
    [records]
  )
  const update = useCallback(
    <K extends SettingKey>(key: K, value: Settings[K]) =>
      saveSetting(key, value, database),
    [database]
  )
  return { settings, update }
}
