import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

export function MenuUsuario() {
  const { usuario, cargando, logout } = useAuth()
  const navigate = useNavigate()

  if (cargando) return null

  if (!usuario) {
    return (
      <Link to="/login" className="btn btn-sm btn-custom shadow-sm">
        <i className="bi bi-person-circle me-1" /> Ingresar
      </Link>
    )
  }

  async function salir() {
    await logout()
    navigate('/')
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
      <span className="small text-muted">
        <i className="bi bi-person-check-fill text-success me-1" />
        {usuario.nombre}
      </span>
      {usuario.rol === 'admin' && (
        <Link to="/admin" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-speedometer2 me-1" /> Panel
        </Link>
      )}
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={salir}>
        <i className="bi bi-box-arrow-right me-1" /> Salir
      </button>
    </div>
  )
}
