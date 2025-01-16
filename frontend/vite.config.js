import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://realtimeeditor-c36r.onrender.com',
        ws: true, 
        changeOrigin: true,
      },
    },
  },
});
