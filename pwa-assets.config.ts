import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config"

// Generates the PWA icons from public/icon.svg. Run `npm run icons` after
// changing the SVG and commit the PNGs (they are static, not built on deploy).
const background = "#1E1E21"

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background } },
  },
  images: ["public/icon.svg"],
})
