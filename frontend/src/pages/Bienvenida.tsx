import { Link } from 'react-router'
import { TarjetaAuth } from '../components/auth/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'

export function Bienvenida() {
  const { usuario } = useAuth()
  if (!usuario) return null

  return (
    <TarjetaAuth titulo={`¡Hola, ${usuario.nombre}! ✨`} subtitulo="Tu cuenta está confirmada y funciona correctamente.">
      <div className="alert alert-light border-gold text-center small">
        <i className="bi bi-patch-check-fill text-success me-1" />
        Iniciaste sesión como <strong>{usuario.email}</strong>
      </div>
      <Link to="/" className="btn btn-custom w-100 py-2">
        Ver el catálogo
      </Link>
    </TarjetaAuth>
  )
}
