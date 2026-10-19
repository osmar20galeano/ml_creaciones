import { useCallback, useEffect, useState } from 'react'
import { mensajeDeError } from '../api/http'

const ERROR_CARGA = 'No se pudieron cargar los datos.'

/**
 * Carga datos de la API y los vuelve a pedir cuando cambia `cargar`
 * (envolverla en useCallback) o al llamar a `recargar`.
 */
export function useCarga<T>(cargar: () => Promise<T>, inicial: T) {
  const [datos, setDatos] = useState<T>(inicial)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si `cargar` cambia antes de que llegue la respuesta (p. ej. otro filtro), se descarta la vieja.
    let vigente = true
    cargar()
      .then((resultado) => {
        if (!vigente) return
        setDatos(resultado)
        setError(null)
      })
      .catch((err) => vigente && setError(mensajeDeError(err, ERROR_CARGA)))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [cargar])

  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setDatos(await cargar())
      setError(null)
    } catch (err) {
      setError(mensajeDeError(err, ERROR_CARGA))
    } finally {
      setCargando(false)
    }
  }, [cargar])

  return { datos, cargando, error, recargar }
}
