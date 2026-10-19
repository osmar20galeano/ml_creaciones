import cookieParser from 'cookie-parser'
import express from 'express'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
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

// En producción el mismo servidor entrega la web compilada (frontend/dist).
// En desarrollo la sirve Vite, que reenvía /api a este servidor.
if (config.esProduccion) {
  const carpetaWeb = fileURLToPath(new URL('../../frontend/dist', import.meta.url))
  // Los archivos de assets/ llevan un hash en el nombre: se pueden cachear para siempre.
  app.use('/assets', express.static(join(carpetaWeb, 'assets'), { immutable: true, maxAge: '1y', index: false }))
  app.use(express.static(carpetaWeb, { index: false }))
  // Cualquier otra ruta (/login, /admin, /canvas…) la resuelve React Router.
  app.get('/{*ruta}', (_req, res) => {
    res.sendFile(join(carpetaWeb, 'index.html'))
  })
}

// En producción solo se escucha dentro del servidor: desde afuera se entra por Nginx (HTTPS).
const host = config.esProduccion ? '127.0.0.1' : undefined
app.listen(config.PORT, host ?? '::', () => {
  console.log(`✅ API de M.L. Creaciones en http://localhost:${config.PORT}`)
})
