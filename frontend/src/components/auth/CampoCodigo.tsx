import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { LARGO_CODIGO } from './codigo'

interface Props {
  digitos: string[]
  onChange: (digitos: string[]) => void
}

/**
 * Las 6 casillas del código. Enfoca la primera al montarse: para limpiar y
 * volver a empezar, el padre cambia la `key` del componente.
 */
export function CampoCodigo({ digitos, onChange }: Props) {
  const casillas = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    casillas.current[0]?.focus()
  }, [])

  function escribir(indice: number, valor: string) {
    const limpio = valor.replace(/\D/g, '')
    if (!limpio) {
      onChange(digitos.map((x, i) => (i === indice ? '' : x)))
      return
    }
    // Si escriben o autocompletan varios dígitos de una, se reparten en las casillas.
    const nuevos = [...digitos]
    for (let i = 0; i < limpio.length && indice + i < LARGO_CODIGO; i++) nuevos[indice + i] = limpio[i]
    onChange(nuevos)
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

  return (
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
  )
}
