// vite.config.js
import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        signup: resolve(__dirname, 'src/pages/signup.html'),
        chat: resolve(__dirname, 'src/pages/chat.html'),
        exercises: resolve(__dirname, 'src/pages/exercises.html'),
        info: resolve(__dirname, 'src/pages/info.html'),
        settings: resolve(__dirname, 'src/pages/settings.html'),
        tetris: resolve(__dirname, 'src/pages/tetris.html'),
      },
    },
  },
  base: './',
});
