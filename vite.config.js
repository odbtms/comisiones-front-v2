import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, Vite sirve en :5173 y redirige /api al backend Spring (:8080).
// En producción NO se usa este proxy: nginx sirve el build y hace proxy_pass /api.
// Por eso el front siempre llama a rutas relativas (/api/...): mismo origen, sin CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
