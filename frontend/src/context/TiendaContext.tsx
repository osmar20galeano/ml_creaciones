import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { productos } from '../data/productos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Alerta, Pedido, Presupuesto, TipoAlerta } from '../types'
import { formatearFecha, ymdAFecha } from '../utils/fechas'
import { TiendaContext, type NuevoPedido, type NuevoPresupuesto, type TiendaContextValue } from './tienda'

// Mismas claves que la versión anterior, así se conservan los datos guardados.
const CLAVE_PEDIDOS = 'tienda_pedidos'
const CLAVE_PRESUPUESTOS = 'tienda_presupuestos'
const CLAVE_STOCK = 'tienda_stock'

const DURACION_ALERTA_MS = 4000

const productosPorId = new Map(productos.map((p) => [p.id, p]))

export function TiendaProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useLocalStorage<Pedido[]>(CLAVE_PEDIDOS, [])
  const [presupuestos, setPresupuestos] = useLocalStorage<Presupuesto[]>(CLAVE_PRESUPUESTOS, [])
  const [stock, setStock] = useLocalStorage<Record<string, number>>(CLAVE_STOCK, {})
  const [alerta, setAlerta] = useState<Alerta | null>(null)

  useEffect(() => {
    if (!alerta) return
    const temporizador = setTimeout(() => setAlerta(null), DURACION_ALERTA_MS)
    return () => clearTimeout(temporizador)
  }, [alerta])

  const stockDe = useCallback(
    (productoId: string) => stock[productoId] ?? productosPorId.get(productoId)?.stockInicial ?? 0,
    [stock],
  )

  const ajustarStock = useCallback(
    (productoId: string, delta: number) =>
      setStock((actual) => ({ ...actual, [productoId]: stockDe(productoId) + delta })),
    [setStock, stockDe],
  )

  const mostrarAlerta = useCallback((mensaje: string, tipo: TipoAlerta) => {
    setAlerta({ id: Date.now(), mensaje, tipo })
  }, [])

  const cerrarAlerta = useCallback(() => setAlerta(null), [])

  const confirmarPedido = useCallback(
    (nuevo: NuevoPedido) => {
      const producto = productosPorId.get(nuevo.productoId)
      if (!producto || stockDe(producto.id) <= 0) return false

      const fechaEntrega = ymdAFecha(nuevo.fechaEntrega)
      const pedido: Pedido = {
        id: crypto.randomUUID(),
        productoId: producto.id,
        cliente: nuevo.cliente,
        producto: producto.nombre,
        precio: nuevo.precio,
        modalidad: nuevo.metodoEntrega === 'delivery' ? `🛵 Envío: ${nuevo.direccion}` : '🏪 Retiro en Local',
        pago: nuevo.metodoPago === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia',
        fechaPedido: formatearFecha(new Date()),
        fechaEntrega: formatearFecha(fechaEntrega),
        detalles: nuevo.detalles || 'Ninguno',
        timestampEntrega: fechaEntrega.getTime(),
      }

      ajustarStock(producto.id, -1)
      setPedidos((actuales) => [...actuales, pedido])
      return true
    },
    [ajustarStock, setPedidos, stockDe],
  )

  const finalizarPedido = useCallback(
    (id: string) => setPedidos((actuales) => actuales.filter((p) => p.id !== id)),
    [setPedidos],
  )

  const cancelarPedido = useCallback(
    (id: string) => {
      const pedido = pedidos.find((p) => p.id === id)
      if (!pedido) return
      if (pedido.productoId) ajustarStock(pedido.productoId, 1)
      setPedidos((actuales) => actuales.filter((p) => p.id !== id))
    },
    [ajustarStock, pedidos, setPedidos],
  )

  const limpiarPedidos = useCallback(() => setPedidos([]), [setPedidos])

  const agregarPresupuesto = useCallback(
    (nuevo: NuevoPresupuesto) => {
      const producto = productosPorId.get(nuevo.productoId)
      if (!producto) return
      setPresupuestos((actuales) => [
        ...actuales,
        { id: crypto.randomUUID(), cliente: nuevo.cliente, producto: producto.nombre, costo: nuevo.costo },
      ])
    },
    [setPresupuestos],
  )

  const borrarPresupuesto = useCallback(
    (id: string) => setPresupuestos((actuales) => actuales.filter((p) => p.id !== id)),
    [setPresupuestos],
  )

  const limpiarPresupuestos = useCallback(() => setPresupuestos([]), [setPresupuestos])

  const valor = useMemo<TiendaContextValue>(
    () => ({
      pedidos,
      presupuestos,
      stockDe,
      alerta,
      mostrarAlerta,
      cerrarAlerta,
      confirmarPedido,
      finalizarPedido,
      cancelarPedido,
      limpiarPedidos,
      agregarPresupuesto,
      borrarPresupuesto,
      limpiarPresupuestos,
    }),
    [
      pedidos,
      presupuestos,
      stockDe,
      alerta,
      mostrarAlerta,
      cerrarAlerta,
      confirmarPedido,
      finalizarPedido,
      cancelarPedido,
      limpiarPedidos,
      agregarPresupuesto,
      borrarPresupuesto,
      limpiarPresupuestos,
    ],
  )

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>
}
