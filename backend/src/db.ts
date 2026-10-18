import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { config } from './config.js'
import type { Rol } from './auth/tokens.js'

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
`)

export interface Usuario {
  id: number
  nombre: string
  email: string
  password_hash: string
  rol: Rol
  verificado: number
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

/** Datos del usuario que se pueden mandar al frontend. */
export function usuarioPublico(u: Usuario) {
  return { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }
}
