import { ChevronLeft } from "lucide-react"

import { useSettings } from "@/features/settings/hooks/useSettings"
import { DEFAULT_SETTINGS, SETTING_LIMITS } from "@/features/settings/settings"
import { useSpeech } from "@/lib/speech/useSpeech"

import { VoiceList } from "./VoiceList"

const WORD = "achieve"
const EXAMPLE = "You can achieve your goals."
const PHASE_TEXT = { idle: "Ready", speaking: "Speaking…", yourTurn: "Your turn — say it out loud" }

const chip = "h-11 rounded-full border px-4 text-[13px] text-muted-foreground active:bg-muted"

/**
 * DEV ONLY (open /#voice): try the iPhone voices before the study screens
 * exist. Not included in production builds.
 */
export default function VoiceCheck() {
  const { settings = DEFAULT_SETTINGS, update } = useSettings()
  const speech = useSpeech(settings)
  const { min, max } = SETTING_LIMITS.rate

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-2 px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <header className="flex h-11 items-center gap-2">
        <a href="#" aria-label="Back" className="flex h-11 w-8 items-center text-muted-foreground">
          <ChevronLeft aria-hidden strokeWidth={1.8} className="size-[18px]" />
        </a>
        <h1 className="text-base font-medium">Voice check</h1>
        <span className="ml-auto text-xs text-muted-foreground">dev only</span>
      </header>

      {!speech.supported && <p role="alert" className="text-danger">This browser has no speech.</p>}

      <section className="flex flex-col items-center gap-4 rounded-lg border bg-card px-5 py-8 text-center">
        <span className="text-[40px] font-medium tracking-[-0.8px]">{WORD}</span>
        <div className="h-[3px] w-40 rounded-full bg-border">
          <div className="h-[3px] rounded-full bg-primary" style={{ width: `${speech.progress * 100}%` }} />
        </div>
        <span className="text-[13px] text-muted-foreground">{PHASE_TEXT[speech.phase]}</span>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className={chip} onClick={() => speech.speak(WORD)}>Play</button>
          <button type="button" className={chip} onClick={() => speech.speak(WORD, { slow: true })}>0.7×</button>
          <button type="button" className={chip} onClick={() => speech.speak(EXAMPLE)}>Example</button>
          <button type="button" className={chip} onClick={() => speech.shadow(EXAMPLE)}>Repeat after it</button>
          <button type="button" className={chip} onClick={speech.stop}>Stop</button>
        </div>
      </section>

      <label className="mt-3 flex h-11 items-center justify-between gap-4 rounded-lg border bg-card px-3.5">
        <span>Speed</span>
        <span className="flex items-center gap-2.5">
          <input
            type="range" min={min} max={max} step={0.1} value={settings.rate}
            onChange={(e) => update("rate", Number(e.target.value))}
            className="w-32 accent-primary"
          />
          <span className="w-9 text-right text-sm text-muted-foreground">{settings.rate.toFixed(1)}×</span>
        </span>
      </label>

      <h2 className="px-1 pt-3 text-xs font-medium tracking-[0.3px] text-muted-foreground">
        ENGLISH VOICES
      </h2>
      <VoiceList
        voices={speech.voices}
        selectedURI={speech.voice?.voiceURI}
        onSelect={(uri) => update("voiceURI", uri)}
      />
      <p className="px-1 text-xs text-muted-foreground">
        Tip: download “Enhanced” voices in iPhone Settings › Accessibility › Spoken Content.
      </p>
    </main>
  )
}
