import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/graphql': {
        target: 'https://quiz-app-we05.onrender.com',
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          '^/graphql': '',
        },
      },
      '/api': {
        target: 'https://quiz-app-we05.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
