import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ErrorApi } from '../api/auth'
import { mensajeDeError } from '../api/http'
import { CampoCodigo } from '../components/auth/CampoCodigo'
import { CampoPassword } from '../components/auth/CampoPassword'
import { codigoVacio, LARGO_CODIGO } from '../components/auth/codigo'
import { TarjetaAuth } from '../components/auth/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva'
import { useTienda } from '../hooks/useTienda'

const ESPERA_REENVIO_S = 60
const MIN_PASSWORD = 8

export function Recuperar() {
  const { solicitarRecuperacion, restablecerPassword } = useAuth()
  const { mostrarAlerta } = useTienda()
  const navigate = useNavigate()
  const location = useLocation()

  const [paso, setPaso] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '')
  const [digitos, setDigitos] = useState(codigoVacio)
  const [intento, setIntento] = useState(0)
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [campoError, setCampoError] = useState<string | undefined>()
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useCuentaRegresiva(0)

  const noCoinciden = confirmarPassword.length > 0 && password !== confirmarPassword

  function reiniciarCodigo() {
    setDigitos(codigoVacio())
    setIntento((n) => n + 1)
  }

  async function pedirCodigo() {
    setError('')
    setAviso('')
    setEnviando(true)
    try {
      await solicitarRecuperacion(email)
      setPaso('codigo')
      reiniciarCodigo()
      setEspera(ESPERA_REENVIO_S)
      setAviso('Si hay una cuenta con ese correo, te llegará un código en unos segundos. Revisa también la carpeta de spam.')
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar el código.'))
    } finally {
      setEnviando(false)
    }
  }

  function handlePedirCodigo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void pedirCodigo()
  }

  async function handleRestablecer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setCampoError(undefined)

    const codigo = digitos.join('')
    if (codigo.length !== LARGO_CODIGO) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }
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
      const usuario = await restablecerPassword(email, codigo, password, confirmarPassword)
      mostrarAlerta('¡Listo! Tu contraseña fue cambiada y ya iniciaste sesión. 🔒', 'success')
      navigate(usuario.rol === 'admin' ? '/admin' : '/bienvenida', {
        replace: true,
        state: { mensaje: 'Tu contraseña fue cambiada correctamente.' },
      })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cambiar la contraseña.'))
      if (err instanceof ErrorApi) {
        setCampoError(err.campo)
        // Si el problema fue el código, se limpian las casillas para escribirlo de nuevo.
        if (err.codigo?.startsWith('CODIGO') || err.codigo === 'SIN_CODIGO' || err.codigo === 'DEMASIADOS_INTENTOS') {
          reiniciarCodigo()
        }
      }
    } finally {
      setEnviando(false)
    }
  }

  const alertas = (
    <>
      {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
      {aviso && <div className="alert alert-success py-2 small" role="status">{aviso}</div>}
    </>
  )

  if (paso === 'email') {
    return (
      <TarjetaAuth titulo="¿Olvidaste tu contraseña?" subtitulo="Te enviaremos un código a tu Gmail para crear una nueva">
        {alertas}
        <form onSubmit={handlePedirCodigo}>
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
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-custom w-100 py-2" disabled={enviando}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Enviando código…
              </>
            ) : (
              'Enviarme el código'
            )}
          </button>
        </form>
        <p className="text-center small mt-4 mb-0">
          <Link to="/login" className="link-local">← Volver a iniciar sesión</Link>
        </p>
      </TarjetaAuth>
    )
  }

  return (
    <TarjetaAuth
      titulo="Crea tu nueva contraseña"
      subtitulo={
        <>
          Ingresa el código que enviamos a <strong>{email}</strong>
        </>
      }
    >
      {alertas}
      <form onSubmit={handleRestablecer}>
        <CampoCodigo key={intento} digitos={digitos} onChange={setDigitos} />

        <CampoPassword
          id="password"
          label={`Nueva contraseña (mínimo ${MIN_PASSWORD} caracteres)`}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          invalido={campoError === 'password'}
        />
        <CampoPassword
          id="confirmar-password"
          label="Repetir nueva contraseña"
          autoComplete="new-password"
          value={confirmarPassword}
          onChange={setConfirmarPassword}
          invalido={noCoinciden || campoError === 'confirmarPassword'}
        />
        {noCoinciden && <div className="text-danger small mt-n2 mb-3">Las contraseñas no coinciden.</div>}

        <button type="submit" className="btn btn-custom w-100 py-2 mt-2" disabled={enviando}>
          {enviando ? <span className="spinner-border spinner-border-sm" /> : 'Cambiar contraseña'}
        </button>
      </form>

      <div className="text-center small mt-4">
        ¿No te llegó?{' '}
        {espera > 0 ? (
          <span className="text-muted">Puedes pedir otro en {espera} s</span>
        ) : (
          <button type="button" className="btn btn-link link-local p-0 align-baseline" onClick={() => void pedirCodigo()}>
            Reenviar código
          </button>
        )}
        <div className="mt-2">
          <button
            type="button"
            className="btn btn-link text-muted p-0 small"
            onClick={() => {
              setPaso('email')
              setError('')
              setAviso('')
            }}
          >
            Usar otro correo
          </button>
        </div>
      </div>
    </TarjetaAuth>
  )
}
