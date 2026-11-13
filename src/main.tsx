import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { installSpeechUnlock } from "./lib/speech/engine"
import { requestPersistentStorage } from "./lib/storage"

// Keep progress safe from iOS storage eviction (best effort, no UI needed).
void requestPersistentStorage()
// iOS only allows speech after a user gesture: unlock it on the first tap.
installSpeechUnlock()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
