import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// City pages (/hair-forecast/<slug>/) are pre-rendered by scripts/city-pages.mjs.
// Keep their static info section before React takes over #root.
const rootEl = document.getElementById('root')
const cityInfoHtml = rootEl.querySelector('#city-info')?.outerHTML || null
const city = window.__HF_CITY__ || null

createRoot(rootEl).render(
  <StrictMode>
    <App city={city} cityInfoHtml={cityInfoHtml} />
  </StrictMode>,
)
