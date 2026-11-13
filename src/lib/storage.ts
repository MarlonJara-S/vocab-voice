type PersistApi = Pick<StorageManager, "persist" | "persisted">

/**
 * Asks the browser not to evict our IndexedDB data (iOS can clear storage of
 * sites not used for weeks). Returns true if storage is persistent.
 */
export async function requestPersistentStorage(
  storage: Partial<PersistApi> | undefined = globalThis.navigator?.storage
): Promise<boolean> {
  if (!storage?.persist) return false
  try {
    if (await storage.persisted?.()) return true
    return await storage.persist()
  } catch {
    return false
  }
}
