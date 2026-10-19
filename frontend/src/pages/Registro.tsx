import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ErrorApi } from '../api/auth'
import { CampoPassword } from '../components/auth/CampoPassword'
import { TarjetaAuth } from '../components/auth/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'

const MIN_PASSWORD = 8

export function Registro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [campoError, setCampoError] = useState<string | undefined>()
  const [enviando, setEnviando] = useState(false)

  const noCoinciden = confirmarPassword.length > 0 && password !== confirmarPassword

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setCampoError(undefined)

    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`)
      setCampoError('password')
      return
    }
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      setCampoError('confirmarPassword')
      return
    }

    setEnviando(true)
    try {
      await registrar({ nombre, email, password, confirmarPassword })
      navigate(`/verificar?email=${encodeURIComponent(email.trim().toLowerCase())}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.')
      if (err instanceof ErrorApi) setCampoError(err.campo)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TarjetaAuth titulo="Crear cuenta" subtitulo="Te enviaremos un código a tu Gmail para confirmarla">
      {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <div className="input-group">
            <span className="input-group-text auth-icono"><i className="bi bi-person-fill" /></span>
            <input
              id="nombre"
              type="text"
              className={`form-control auth-input ${campoError === 'nombre' ? 'is-invalid' : ''}`}
              placeholder="Tu nombre"
              required
              minLength={2}
              maxLength={60}
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo (Gmail)</label>
          <div className="input-group">
            <span className="input-group-text auth-icono"><i className="bi bi-envelope-fill" /></span>
            <input
              id="email"
              type="email"
              className={`form-control auth-input ${campoError === 'email' ? 'is-invalid' : ''}`}
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
          label={`Contraseña (mínimo ${MIN_PASSWORD} caracteres)`}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          invalido={campoError === 'password'}
        />

        <CampoPassword
          id="confirmar-password"
          label="Repetir contraseña"
          autoComplete="new-password"
          value={confirmarPassword}
          onChange={setConfirmarPassword}
          invalido={noCoinciden || campoError === 'confirmarPassword'}
        />
        {noCoinciden && <div className="text-danger small mt-n2 mb-3">Las contraseñas no coinciden.</div>}

        <button type="submit" className="btn btn-custom w-100 py-2 mt-2" disabled={enviando}>
          {enviando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Enviando código…
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <p className="text-center small mt-4 mb-0">
        ¿Ya tienes cuenta? <Link to="/login" className="link-local">Inicia sesión</Link>
      </p>
    </TarjetaAuth>
  )
}
