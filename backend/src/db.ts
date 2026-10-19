import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { config } from './config.js'
import type { Rol } from './auth/tokens.js'
import { catalogoInicial } from './productos/catalogo.js'

mkdirSync(dirname(config.DATABASE_PATH), { recursive: true })

export const db = new DatabaseSync(config.DATABASE_PATH)

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    rol           TEXT    NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
    verificado    INTEGER NOT NULL DEFAULT 0,
    creado_en     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS codigos_verificacion (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_hash TEXT    NOT NULL,
    expira_en   INTEGER NOT NULL, -- epoch ms
    intentos    INTEGER NOT NULL DEFAULT 0,
    creado_en   INTEGER NOT NULL  -- epoch ms
  );

  CREATE TABLE IF NOT EXISTS codigos_recuperacion (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_hash TEXT    NOT NULL,
    expira_en   INTEGER NOT NULL, -- epoch ms
    intentos    INTEGER NOT NULL DEFAULT 0,
    creado_en   INTEGER NOT NULL  -- epoch ms
  );

  CREATE TABLE IF NOT EXISTS productos (
    id          TEXT    PRIMARY KEY,
    nombre      TEXT    NOT NULL,
    descripcion TEXT    NOT NULL,
    precio_min  INTEGER NOT NULL,
    precio_max  INTEGER NOT NULL,
    stock       INTEGER NOT NULL CHECK (stock >= 0),
    activo      INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER REFERENCES usuarios(id) ON DELETE SET NULL, -- NULL: cargado por el admin para alguien sin cuenta
    cliente_nombre  TEXT    NOT NULL,
    producto_id     TEXT    NOT NULL REFERENCES productos(id),
    producto_nombre TEXT    NOT NULL, -- copia, por si el producto cambia de nombre
    precio          INTEGER NOT NULL,
    metodo_entrega  TEXT    NOT NULL CHECK (metodo_entrega IN ('retiro', 'delivery')),
    direccion       TEXT,
    metodo_pago     TEXT    NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia')),
    fecha_entrega   TEXT    NOT NULL, -- YYYY-MM-DD
    detalles        TEXT    NOT NULL DEFAULT '',
    estado          TEXT    NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
    creado_en       TEXT    NOT NULL DEFAULT (datetime('now')),
    actualizado_en  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);

  CREATE TABLE IF NOT EXISTS presupuestos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    cliente_nombre  TEXT    NOT NULL,
    producto_id     TEXT    NOT NULL REFERENCES productos(id),
    producto_nombre TEXT    NOT NULL,
    costo           INTEGER NOT NULL,
    detalles        TEXT    NOT NULL DEFAULT '',
    creado_en       TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

// --- Migraciones sobre tablas que ya existían ---

function tieneColumna(tabla: string, columna: string) {
  const columnas = db.prepare(`PRAGMA table_info(${tabla})`).all() as { name: string }[]
  return columnas.some((c) => c.name === columna)
}

// Se incrementa al cambiar la contraseña: invalida las sesiones abiertas en otros dispositivos.
if (!tieneColumna('usuarios', 'sesion_version')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN sesion_version INTEGER NOT NULL DEFAULT 0')
}

const insertarProductoInicial = db.prepare(
  `INSERT OR IGNORE INTO productos (id, nombre, descripcion, precio_min, precio_max, stock)
   VALUES (?, ?, ?, ?, ?, ?)`,
)
for (const p of catalogoInicial) {
  insertarProductoInicial.run(p.id, p.nombre, p.descripcion, p.precioMin, p.precioMax, p.stock)
}

/** Ejecuta `fn` dentro de una transacción (todo o nada). */
export function enTransaccion<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const resultado = fn()
    db.exec('COMMIT')
    return resultado
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  password_hash: string
  rol: Rol
  verificado: number
  sesion_version: number
  creado_en: string
}

export interface CodigoVerificacion {
  id: number
  usuario_id: number
  codigo_hash: string
  expira_en: number
  intentos: number
  creado_en: number
}

export interface ProductoFila {
  id: string
  nombre: string
  descripcion: string
  precio_min: number
  precio_max: number
  stock: number
  activo: number
}

export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'

export interface PedidoFila {
  id: number
  usuario_id: number | null
  cliente_nombre: string
  producto_id: string
  producto_nombre: string
  precio: number
  metodo_entrega: 'retiro' | 'delivery'
  direccion: string | null
  metodo_pago: 'efectivo' | 'transferencia'
  fecha_entrega: string
  detalles: string
  estado: EstadoPedido
  creado_en: string
  actualizado_en: string
}

export interface PresupuestoFila {
  id: number
  usuario_id: number | null
  cliente_nombre: string
  producto_id: string
  producto_nombre: string
  costo: number
  detalles: string
  creado_en: string
}

/** Datos del usuario que se pueden mandar al frontend. */
export function usuarioPublico(u: Usuario) {
  return { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }
}
