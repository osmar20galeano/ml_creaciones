import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ErrorApi } from '../api/auth'
import { TarjetaAuth } from '../components/auth/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'

const LARGO_CODIGO = 6
const ESPERA_REENVIO_S = 60

export function Verificar() {
  const { verificar, reenviarCodigo } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''

  const [digitos, setDigitos] = useState<string[]>(Array(LARGO_CODIGO).fill(''))
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useState(ESPERA_REENVIO_S)
  const casillas = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (espera <= 0) return
    const t = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [espera])

  useEffect(() => {
    casillas.current[0]?.focus()
  }, [])

  if (!email) return <Navigate to="/registro" replace />

  function escribir(indice: number, valor: string) {
    const limpio = valor.replace(/\D/g, '')
    if (!limpio) {
      setDigitos((d) => d.map((x, i) => (i === indice ? '' : x)))
      return
    }
    // Si escriben o autocompletan varios dígitos de una, se reparten en las casillas.
    setDigitos((d) => {
      const nuevos = [...d]
      for (let i = 0; i < limpio.length && indice + i < LARGO_CODIGO; i++) nuevos[indice + i] = limpio[i]
      return nuevos
    })
    casillas.current[Math.min(indice + limpio.length, LARGO_CODIGO - 1)]?.focus()
  }

  function teclaAbajo(indice: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digitos[indice] && indice > 0) casillas.current[indice - 1]?.focus()
    if (e.key === 'ArrowLeft' && indice > 0) casillas.current[indice - 1]?.focus()
    if (e.key === 'ArrowRight' && indice < LARGO_CODIGO - 1) casillas.current[indice + 1]?.focus()
  }

  function pegar(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    escribir(0, e.clipboardData.getData('text').slice(0, LARGO_CODIGO))
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
      setError(err instanceof Error ? err.message : 'No se pudo verificar el código.')
      if (err instanceof ErrorApi && err.codigo === 'YA_VERIFICADO') return
      setDigitos(Array(LARGO_CODIGO).fill(''))
      casillas.current[0]?.focus()
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
      setDigitos(Array(LARGO_CODIGO).fill(''))
      setEspera(ESPERA_REENVIO_S)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el código.')
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
        <div className="d-flex justify-content-center gap-2 mb-4">
          {digitos.map((digito, i) => (
            <input
              key={i}
              ref={(el) => {
                casillas.current[i] = el
              }}
              className="form-control auth-input codigo-casilla"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={LARGO_CODIGO}
              aria-label={`Dígito ${i + 1}`}
              value={digito}
              onChange={(e) => escribir(i, e.target.value)}
              onKeyDown={(e) => teclaAbajo(i, e)}
              onPaste={pegar}
            />
          ))}
        </div>

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
