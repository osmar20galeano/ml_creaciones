// Versión estática de la página del Modelo Canvas, para GitHub Pages (sin backend ni login).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './styles/variables.css'
import './styles/global.css'
import { ModeloCanvas } from './pages/ModeloCanvas.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter>
      <ModeloCanvas />
    </MemoryRouter>
  </StrictMode>,
)
