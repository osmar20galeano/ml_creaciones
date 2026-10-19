import cookieParser from 'cookie-parser'
import express from 'express'
import { authRouter } from './auth/auth.routes.js'
import { config } from './config.js'
import { manejadorErrores } from './errores.js'
import { pedidosRouter, presupuestosRouter } from './pedidos/pedidos.routes.js'
import { productosRouter } from './productos/productos.routes.js'
import { CARPETA_IMAGENES } from './productos/imagenes.js'

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 'loopback')
app.use(express.json({ limit: '20kb' }))
app.use(cookieParser())

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true })
})
app.use('/api/auth', authRouter)
app.use('/api/productos', productosRouter)
// Fotos subidas por el admin. Los nombres llevan un sufijo aleatorio, así que se pueden cachear mucho tiempo.
app.use('/api/uploads/productos', express.static(CARPETA_IMAGENES, { maxAge: '30d', immutable: true, index: false }))
app.use('/api/pedidos', pedidosRouter)
app.use('/api/presupuestos', presupuestosRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})
app.use(manejadorErrores)

app.listen(config.PORT, () => {
  console.log(`✅ API de M.L. Creaciones en http://localhost:${config.PORT}`)
})
