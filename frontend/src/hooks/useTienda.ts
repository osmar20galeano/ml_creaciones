import { useContext } from 'react'
import { TiendaContext } from '../context/tienda'

export function useTienda() {
  const contexto = useContext(TiendaContext)
  if (!contexto) throw new Error('useTienda debe usarse dentro de <TiendaProvider>')
  return contexto
}
