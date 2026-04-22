import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.addEventListener('vite:preloadError', (event) => {
  // Recover cleanly when a new deployment invalidates an older dynamic chunk.
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(<App />)
