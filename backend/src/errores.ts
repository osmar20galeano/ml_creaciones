import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

/** Error esperado que se devuelve tal cual al cliente. */
export class ErrorHttp extends Error {
  constructor(
    public status: number,
    message: string,
    public codigo?: string,
  ) {
    super(message)
  }
}

export function manejadorErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const primero = err.issues[0]
    res.status(400).json({ error: primero?.message ?? 'Datos inválidos', campo: primero?.path.join('.') })
    return
  }
  if (err instanceof ErrorHttp) {
    res.status(err.status).json({ error: err.message, codigo: err.codigo })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo.' })
}
