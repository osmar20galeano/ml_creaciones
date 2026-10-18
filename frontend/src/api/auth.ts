export type Rol = 'admin' | 'cliente'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
}

export interface DatosRegistro {
  nombre: string
  email: string
  password: string
  confirmarPassword: string
}

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

async function pedir<T>(ruta: string, cuerpo?: unknown): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(`/api/auth${ruta}`, {
      method: cuerpo === undefined ? 'GET' : 'POST',
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

export const authApi = {
  yo: () => pedir<{ usuario: Usuario }>('/yo').then((d) => d.usuario),
  registrar: (datos: DatosRegistro) => pedir<{ email: string }>('/registro', datos),
  verificar: (email: string, codigo: string) =>
    pedir<{ usuario: Usuario }>('/verificar', { email, codigo }).then((d) => d.usuario),
  reenviarCodigo: (email: string) => pedir<{ ok: true }>('/reenviar-codigo', { email }),
  login: (email: string, password: string) =>
    pedir<{ usuario: Usuario }>('/login', { email, password }).then((d) => d.usuario),
  logout: () => pedir<{ ok: true }>('/logout', {}),
}
