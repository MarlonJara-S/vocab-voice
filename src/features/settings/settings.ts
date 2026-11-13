import type { SettingRecord } from "@/lib/db/types"

/** User settings (docs/SPEC.md → Settings). */
export type Settings = {
  /** SpeechSynthesisVoice.voiceURI, or null = best English voice available */
  voiceURI: string | null
  /** Speech rate, 0.5–1.2 */
  rate: number
  /** Speak the word when a question card appears */
  autoPlay: boolean
  /** New cards per day, per deck */
  newPerDay: number
  /** FSRS desired retention ("Target memory"), 0.7–0.99 */
  retention: number
  /** Reverse cards (ES → EN) after 2 successful EN → ES reviews */
  reverseCards: boolean
}

export type SettingKey = keyof Settings

export const DEFAULT_SETTINGS: Settings = {
  voiceURI: null,
  rate: 0.9,
  autoPlay: true,
  newPerDay: 20,
  retention: 0.9,
  reverseCards: true,
}

export const SETTING_LIMITS = {
  rate: { min: 0.5, max: 1.2 },
  newPerDay: { min: 0, max: 200 },
  retention: { min: 0.7, max: 0.99 },
} as const

type Parser<T> = (value: unknown) => T | undefined

const clamp = (n: number, { min, max }: { min: number; max: number }) =>
  Math.min(max, Math.max(min, n))

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

const boolean: Parser<boolean> = (v) => (typeof v === "boolean" ? v : undefined)

const PARSERS: { [K in SettingKey]: Parser<Settings[K]> } = {
  voiceURI: (v) => (v === null || (typeof v === "string" && v !== "") ? v : undefined),
  rate: (v) => (finite(v) ? clamp(Math.round(v * 10) / 10, SETTING_LIMITS.rate) : undefined),
  autoPlay: boolean,
  newPerDay: (v) => (finite(v) ? clamp(Math.round(v), SETTING_LIMITS.newPerDay) : undefined),
  retention: (v) => (finite(v) ? clamp(v, SETTING_LIMITS.retention) : undefined),
  reverseCards: boolean,
}

const isSettingKey = (key: string): key is SettingKey => key in PARSERS

/**
 * Validates one value. Numbers out of range are clamped; wrong types
 * return undefined.
 */
export function parseSetting<K extends SettingKey>(
  key: K,
  value: unknown
): Settings[K] | undefined {
  return PARSERS[key](value) as Settings[K] | undefined
}

/** Builds Settings from stored records: defaults + every valid stored value. */
export function parseSettings(records: SettingRecord[]): Settings {
  const settings: Settings = { ...DEFAULT_SETTINGS }
  for (const { key, value } of records) {
    if (!isSettingKey(key)) continue
    const parsed = parseSetting(key, value)
    if (parsed !== undefined) Object.assign(settings, { [key]: parsed })
  }
  return settings
}
