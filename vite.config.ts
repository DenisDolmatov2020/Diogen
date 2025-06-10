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
      '/api/v1/mentorium': {
        target: 'http://194.87.143.218:8901',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://194.87.143.218:8901',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
