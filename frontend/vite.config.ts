import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El backend corre en :3000; así el navegador ve todo en el mismo origen y la cookie de sesión funciona.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
