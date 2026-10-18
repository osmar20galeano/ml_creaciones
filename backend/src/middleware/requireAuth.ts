import type { NextFunction, Request, Response } from 'express'
import { COOKIE_SESION, leerSesion, type Rol, type SesionPayload } from '../auth/tokens.js'

declare module 'express-serve-static-core' {
  interface Request {
    sesion?: SesionPayload
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sesion = leerSesion(req.cookies?.[COOKIE_SESION])
  if (!sesion) {
    res.status(401).json({ error: 'Debes iniciar sesión' })
    return
  }
  req.sesion = sesion
  next()
}

export function requireRol(rol: Rol) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (req.sesion?.rol !== rol) {
        res.status(403).json({ error: 'No tienes permiso para esto' })
        return
      }
      next()
    })
  }
}
