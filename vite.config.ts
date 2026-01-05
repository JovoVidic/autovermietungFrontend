
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // optional: Standard ist 5173
    proxy: {
      // Alle Requests, die mit /api beginnen, gehen an dein Backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // kein rewrite nötig, da dein Backend bereits unter /api/... mapped ist
        // wenn dein Backend NICHT /api prefix hätte, könntest du so umschreiben:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
