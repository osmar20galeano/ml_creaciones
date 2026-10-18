import 'dotenv/config'
import { z } from 'zod'

const esquema = z.object({
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  NODE_ENV: z.string().default('development'),
  DATABASE_PATH: z.string().default('./data/ml.db'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  GMAIL_USER: z.email(),
  GMAIL_APP_PASSWORD: z.string().min(1),
})

const resultado = esquema.safeParse(process.env)
if (!resultado.success) {
  console.error('❌ Faltan o son inválidas variables en backend/.env:')
  console.error(z.prettifyError(resultado.error))
  process.exit(1)
}

export const config = {
  ...resultado.data,
  esProduccion: resultado.data.NODE_ENV === 'production',
}
