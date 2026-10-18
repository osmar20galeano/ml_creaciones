import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './styles/variables.css'
import './styles/global.css'
import { TiendaProvider } from './context/TiendaContext.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TiendaProvider>
      <App />
    </TiendaProvider>
  </StrictMode>,
)
