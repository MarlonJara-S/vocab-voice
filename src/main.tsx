import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { requestPersistentStorage } from "./lib/storage"

// Keep progress safe from iOS storage eviction (best effort, no UI needed).
void requestPersistentStorage()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
