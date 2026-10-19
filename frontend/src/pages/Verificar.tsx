import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ErrorApi } from '../api/auth'
import { mensajeDeError } from '../api/http'
import { CampoCodigo } from '../components/auth/CampoCodigo'
import { codigoVacio, LARGO_CODIGO } from '../components/auth/codigo'
import { TarjetaAuth } from '../components/auth/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva'

const ESPERA_REENVIO_S = 60

export function Verificar() {
  const { verificar, reenviarCodigo } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''

  const [digitos, setDigitos] = useState(codigoVacio)
  const [intento, setIntento] = useState(0)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useCuentaRegresiva(ESPERA_REENVIO_S)

  if (!email) return <Navigate to="/registro" replace />

  function reiniciarCodigo() {
    setDigitos(codigoVacio())
    setIntento((n) => n + 1)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const codigo = digitos.join('')
    if (codigo.length !== LARGO_CODIGO) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }

    setError('')
    setAviso('')
    setEnviando(true)
    try {
      const usuario = await verificar(email, codigo)
      navigate(usuario.rol === 'admin' ? '/admin' : '/bienvenida', { replace: true })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo verificar el código.'))
      if (!(err instanceof ErrorApi && err.codigo === 'YA_VERIFICADO')) reiniciarCodigo()
    } finally {
      setEnviando(false)
    }
  }

  async function handleReenviar() {
    setError('')
    setAviso('')
    try {
      await reenviarCodigo(email)
      setAviso('Te enviamos un código nuevo. Revisa tu bandeja (y la carpeta de spam).')
      reiniciarCodigo()
      setEspera(ESPERA_REENVIO_S)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo reenviar el código.'))
    }
  }

  return (
    <TarjetaAuth
      titulo="Confirma tu correo"
      subtitulo={
        <>
          Enviamos un código de 6 dígitos a <strong>{email}</strong>
        </>
      }
    >
      {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
      {aviso && <div className="alert alert-success py-2 small" role="status">{aviso}</div>}

      <form onSubmit={handleSubmit}>
        <CampoCodigo key={intento} digitos={digitos} onChange={setDigitos} />

        <button type="submit" className="btn btn-custom w-100 py-2" disabled={enviando}>
          {enviando ? <span className="spinner-border spinner-border-sm" /> : 'Confirmar cuenta'}
        </button>
      </form>

      <div className="text-center small mt-4">
        ¿No te llegó?{' '}
        {espera > 0 ? (
          <span className="text-muted">Puedes pedir otro en {espera} s</span>
        ) : (
          <button type="button" className="btn btn-link link-local p-0 align-baseline" onClick={handleReenviar}>
            Reenviar código
          </button>
        )}
        <div className="mt-2">
          <Link to="/registro" className="text-muted">Usar otro correo</Link>
        </div>
      </div>
    </TarjetaAuth>
  )
}
