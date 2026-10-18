import type { ReactNode } from 'react'
import { negocio } from '../../data/negocio'

interface Props {
  titulo: string
  subtitulo?: ReactNode
  children: ReactNode
}

/** Marco común de las pantallas de login, registro y verificación. */
export function TarjetaAuth({ titulo, subtitulo, children }: Props) {
  return (
    <div className="auth-fondo d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card card-custom auth-card w-100">
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <img src={negocio.logo} alt={negocio.nombre} className="auth-logo mb-3" />
            <h1 className="h4 text-gold mb-1">{titulo}</h1>
            {subtitulo && <p className="text-muted small mb-0">{subtitulo}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
