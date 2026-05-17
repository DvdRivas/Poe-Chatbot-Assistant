import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/poe-api': {
        target: 'https://api.poe.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poe-api/, '/v1'),
        configure: (proxy,) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying:', req.method, req.url, 'to:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Proxy response:', proxyRes.statusCode);
          });
        },
      },
    },
  },
});