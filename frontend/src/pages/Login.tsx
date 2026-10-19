import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ErrorApi } from '../api/auth'
import { CampoPassword } from '../components/auth/CampoPassword'
import { TarjetaAuth } from '../components/auth/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const desde = (location.state as { desde?: string } | null)?.desde

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const usuario = await login(email, password)
      if (usuario.rol === 'admin') navigate(desde ?? '/admin', { replace: true })
      else navigate(desde ?? '/bienvenida', { replace: true })
    } catch (err) {
      if (err instanceof ErrorApi && err.codigo === 'NO_VERIFICADO') {
        navigate(`/verificar?email=${encodeURIComponent(email.trim().toLowerCase())}`)
        return
      }
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TarjetaAuth titulo="Iniciar sesión" subtitulo="Ingresa con tu Gmail y contraseña">
      {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo (Gmail)</label>
          <div className="input-group">
            <span className="input-group-text auth-icono"><i className="bi bi-envelope-fill" /></span>
            <input
              id="email"
              type="email"
              className="form-control auth-input"
              placeholder="tucorreo@gmail.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <CampoPassword
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        <div className="text-end mt-n2 mb-3">
          <Link to="/recuperar" state={{ email: email.trim() }} className="small link-local">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" className="btn btn-custom w-100 py-2 mt-2" disabled={enviando}>
          {enviando ? <span className="spinner-border spinner-border-sm" /> : 'Ingresar'}
        </button>
      </form>

      <p className="text-center small mt-4 mb-0">
        ¿No tienes cuenta? <Link to="/registro" className="link-local">Regístrate aquí</Link>
      </p>

      <Link to="/canvas" className="enlace-canvas mt-4">
        <i className="bi bi-grid-3x3-gap" />
        <span>
          <strong>Conoce el proyecto</strong>
          <small>Modelo de Negocio Canvas de M.L. Creaciones</small>
        </span>
        <i className="bi bi-arrow-right ms-auto" />
      </Link>
    </TarjetaAuth>
  )
}
