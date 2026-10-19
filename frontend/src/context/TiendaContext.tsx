import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { mensajeDeError } from '../api/http'
import { tiendaApi } from '../api/tienda'
import type { Alerta, Producto, TipoAlerta } from '../types'
import { TiendaContext, type TiendaContextValue } from './tienda'

const DURACION_ALERTA_MS = 4000

export function TiendaProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [errorProductos, setErrorProductos] = useState<string | null>(null)
  const [alerta, setAlerta] = useState<Alerta | null>(null)

  const recargarProductos = useCallback(async () => {
    try {
      const lista = await tiendaApi.productos()
      setProductos(lista)
      setErrorProductos(null)
    } catch (err) {
      setErrorProductos(mensajeDeError(err, 'No se pudo cargar el catálogo.'))
    } finally {
      setCargandoProductos(false)
    }
  }, [])

  useEffect(() => {
    let vigente = true
    tiendaApi
      .productos()
      .then((lista) => vigente && setProductos(lista))
      .catch((err) => vigente && setErrorProductos(mensajeDeError(err, 'No se pudo cargar el catálogo.')))
      .finally(() => vigente && setCargandoProductos(false))
    return () => {
      vigente = false
    }
  }, [])

  useEffect(() => {
    if (!alerta) return
    const temporizador = setTimeout(() => setAlerta(null), DURACION_ALERTA_MS)
    return () => clearTimeout(temporizador)
  }, [alerta])

  const mostrarAlerta = useCallback((mensaje: string, tipo: TipoAlerta) => {
    setAlerta({ id: Date.now(), mensaje, tipo })
  }, [])

  const cerrarAlerta = useCallback(() => setAlerta(null), [])

  const valor = useMemo<TiendaContextValue>(
    () => ({
      productos,
      cargandoProductos,
      errorProductos,
      recargarProductos,
      alerta,
      mostrarAlerta,
      cerrarAlerta,
    }),
    [productos, cargandoProductos, errorProductos, recargarProductos, alerta, mostrarAlerta, cerrarAlerta],
  )

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>
}
