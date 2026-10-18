/** Error devuelto por la API, con el mensaje listo para mostrar. */
export class ErrorApi extends Error {
  status: number
  codigo?: string
  campo?: string

  constructor(message: string, status: number, codigo?: string, campo?: string) {
    super(message)
    this.status = status
    this.codigo = codigo
    this.campo = campo
  }
}

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export async function pedir<T>(ruta: string, metodo: Metodo = 'GET', cuerpo?: unknown): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      credentials: 'same-origin',
    })
  } catch {
    throw new ErrorApi('No hay conexión con el servidor. ¿Está encendido el backend?', 0)
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new ErrorApi(datos.error ?? 'Ocurrió un error inesperado.', respuesta.status, datos.codigo, datos.campo)
  }
  return datos as T
}

export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error inesperado.') {
  return err instanceof Error ? err.message : porDefecto
}
