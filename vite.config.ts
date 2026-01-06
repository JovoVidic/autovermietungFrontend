// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // dein Backend
        changeOrigin: true,
        secure: false, // falls https später mal genutzt wird
        // rewrite nicht nötig, da Backend /api/ erwartet
      },
    },
  },
});
