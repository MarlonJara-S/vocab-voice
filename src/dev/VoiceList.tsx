import { Check } from "lucide-react"

import { listEnglishVoices, voiceLabel, voiceQuality } from "@/lib/speech/voices"

type VoiceListProps = {
  voices: SpeechSynthesisVoice[]
  selectedURI: string | undefined
  onSelect: (voiceURI: string) => void
}

const QUALITY_LABEL = { premium: "Premium", enhanced: "Enhanced", default: "" }

/** English voices installed on this device, best first. */
export function VoiceList({ voices, selectedURI, onSelect }: VoiceListProps) {
  const english = listEnglishVoices(voices)
  if (english.length === 0) {
    return <p className="px-1 text-[13px] text-muted-foreground">No English voices found yet.</p>
  }
  return (
    <ul className="flex flex-col rounded-lg border bg-card">
      {english.map((v) => (
        <li key={v.voiceURI} className="border-b last:border-b-0">
          <button
            type="button"
            onClick={() => onSelect(v.voiceURI)}
            aria-pressed={v.voiceURI === selectedURI}
            className="flex min-h-11 w-full items-center gap-3 px-3.5 text-left"
          >
            <span className="grow">{voiceLabel(v)}</span>
            <span className="text-[13px] text-muted-foreground">
              {QUALITY_LABEL[voiceQuality(v)]}
            </span>
            <Check
              aria-hidden
              strokeWidth={1.8}
              className={v.voiceURI === selectedURI ? "size-4 text-primary" : "size-4 opacity-0"}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
