import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Compila solo la página del Modelo Canvas para publicarla en GitHub Pages
// (https://osmar20galeano.github.io/ml_creaciones/). Ver scripts/publicar-canvas.sh.
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'import.meta.env.VITE_SOLO_CANVAS': JSON.stringify('true'),
  },
  build: {
    outDir: 'dist-canvas',
    emptyOutDir: true,
    rollupOptions: { input: 'canvas.html' },
  },
})
