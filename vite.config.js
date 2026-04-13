import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VITE_MISTRAL_KEY } from './aiConfig.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api/chat': {
        target: 'https://api.mistral.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/chat/completions'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (VITE_MISTRAL_KEY) {
              proxyReq.setHeader('Authorization', `Bearer ${VITE_MISTRAL_KEY}`)
            }
          })
        }
      }
    }
  }
})
