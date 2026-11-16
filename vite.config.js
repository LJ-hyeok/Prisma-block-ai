import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    open: '/main.html'
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.html')
      }
    }
  }
});

