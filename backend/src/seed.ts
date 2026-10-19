import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from './db.js'

const { ADMIN_EMAIL, ADMIN_NOMBRE, ADMIN_PASSWORD } = z
  .object({
    ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
    ADMIN_NOMBRE: z.string().trim().min(1).default('Administración'),
    ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD debe tener al menos 8 caracteres'),
  })
  .parse(process.env)

const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)

db.prepare(
  `INSERT INTO usuarios (nombre, email, password_hash, rol, verificado)
   VALUES (?, ?, ?, 'admin', 1)
   ON CONFLICT(email) DO UPDATE SET
     nombre = excluded.nombre,
     password_hash = excluded.password_hash,
     rol = 'admin',
     verificado = 1`,
).run(ADMIN_NOMBRE, ADMIN_EMAIL, hash)

console.log(`✅ Administrador listo: ${ADMIN_EMAIL}`)
