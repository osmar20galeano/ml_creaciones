import { z } from 'zod'

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Ingresa un correo válido'))

const password = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña es demasiado larga')

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, 'Ingresa tu nombre').max(60),
    email,
    password,
    confirmarPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

export const verificarSchema = z.object({
  email,
  codigo: z.string().trim().regex(/^\d{6}$/, 'El código tiene 6 dígitos'),
})

export const emailSchema = z.object({ email })

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
