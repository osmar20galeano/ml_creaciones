import { Router } from 'express'
import { requireRol } from '../middleware/requireAuth.js'
import { recibirImagen } from './imagenes.js'
import {
  ajustarStockSchema,
  crearProductoSchema,
  editarProductoSchema,
  productoIdSchema,
} from './productos.schemas.js'
import * as servicio from './productos.service.js'

export const productosRouter = Router()

productosRouter.get('/', (_req, res) => {
  res.json({ productos: servicio.listarProductos() })
})

// --- Solo admin ---

productosRouter.get('/todos', requireRol('admin'), (_req, res) => {
  res.json({ productos: servicio.listarProductos(true) })
})

productosRouter.post('/', requireRol('admin'), (req, res) => {
  const producto = servicio.crearProducto(crearProductoSchema.parse(req.body))
  res.status(201).json({ producto })
})

productosRouter.patch('/:id', requireRol('admin'), (req, res) => {
  const producto = servicio.editarProducto(productoIdSchema.parse(req.params.id), editarProductoSchema.parse(req.body))
  res.json({ producto })
})

productosRouter.post('/:id/stock', requireRol('admin'), (req, res) => {
  const { cambio } = ajustarStockSchema.parse(req.body)
  res.json({ producto: servicio.ajustarStock(productoIdSchema.parse(req.params.id), cambio) })
})

// requireRol va antes de recibirImagen: nadie sin permiso llega a subir un archivo.
productosRouter.put('/:id/imagen', requireRol('admin'), recibirImagen, async (req, res) => {
  const producto = await servicio.cambiarImagen(productoIdSchema.parse(req.params.id), req.file)
  res.json({ producto })
})

productosRouter.delete('/:id/imagen', requireRol('admin'), async (req, res) => {
  const producto = await servicio.quitarImagen(productoIdSchema.parse(req.params.id))
  res.json({ producto })
})
