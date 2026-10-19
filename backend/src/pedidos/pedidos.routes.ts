import { Router } from 'express'
import { requireAuth, requireRol } from '../middleware/requireAuth.js'
import {
  cambiarEstadoSchema,
  crearPedidoSchema,
  crearPresupuestoSchema,
  filtroPedidosSchema,
  idSchema,
} from './pedidos.schemas.js'
import * as servicio from './pedidos.service.js'

export const pedidosRouter = Router()

pedidosRouter.post('/', requireAuth, (req, res) => {
  const pedido = servicio.crearPedido(req.sesion!, crearPedidoSchema.parse(req.body))
  res.status(201).json({ pedido })
})

pedidosRouter.get('/mios', requireAuth, (req, res) => {
  const { estado } = filtroPedidosSchema.parse(req.query)
  res.json({ pedidos: servicio.listarPedidos({ usuarioId: Number(req.sesion!.sub), estado }) })
})

pedidosRouter.post('/:id/cancelar', requireAuth, (req, res) => {
  const pedido = servicio.cancelarPedidoPropio(req.sesion!, idSchema.parse(req.params.id))
  res.json({ pedido })
})

pedidosRouter.get('/', requireRol('admin'), (req, res) => {
  const { estado } = filtroPedidosSchema.parse(req.query)
  res.json({ pedidos: servicio.listarPedidos({ estado }) })
})

pedidosRouter.patch('/:id/estado', requireRol('admin'), (req, res) => {
  const { estado } = cambiarEstadoSchema.parse(req.body)
  const pedido = servicio.cambiarEstado(idSchema.parse(req.params.id), estado)
  res.json({ pedido })
})

export const presupuestosRouter = Router()

presupuestosRouter.post('/', requireAuth, (req, res) => {
  const presupuesto = servicio.crearPresupuesto(req.sesion!, crearPresupuestoSchema.parse(req.body))
  res.status(201).json({ presupuesto })
})

presupuestosRouter.get('/mios', requireAuth, (req, res) => {
  res.json({ presupuestos: servicio.listarPresupuestos(Number(req.sesion!.sub)) })
})

presupuestosRouter.get('/', requireRol('admin'), (_req, res) => {
  res.json({ presupuestos: servicio.listarPresupuestos() })
})

presupuestosRouter.delete('/:id', requireRol('admin'), (req, res) => {
  servicio.borrarPresupuesto(idSchema.parse(req.params.id))
  res.json({ ok: true })
})
