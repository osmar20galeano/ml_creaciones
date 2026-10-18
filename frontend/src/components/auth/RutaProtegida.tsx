import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import type { Rol } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: ReactNode
  rol?: Rol
}

export function RutaProtegida({ children, rol }: Props) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />

  return children
}
