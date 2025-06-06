import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    // Убеждаемся, что переменные окружения правильно доступны
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://di.slovo-soft.ru:6443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
