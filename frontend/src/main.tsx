import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './styles/variables.css'
import './styles/global.css'
import './styles/auth.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { TiendaProvider } from './context/TiendaContext.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TiendaProvider>
          <App />
        </TiendaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
