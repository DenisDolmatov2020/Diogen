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
      // Динамический прокси для виджета
      '/api/widget-proxy': {
        target: 'https://knowledge.slovo-soft.ru', // Fallback
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Читаем реальный target из заголовка
            const targetUrl = req.headers['x-target-url'] as string;
            
            if (targetUrl) {
              try {
                const url = new URL(targetUrl);
                console.log('🔄 Dynamic proxy:', req.url, '→', targetUrl);
                
                // Обновляем target динамически
                proxyReq.setHeader('Host', url.host);
                proxyReq.path = url.pathname + (url.search || '');
                
                // Удаляем наш служебный заголовок
                proxyReq.removeHeader('x-target-url');
                
              } catch (error) {
                console.error('❌ Invalid target URL:', targetUrl);
                // Используем fallback
                proxyReq.path = '/api/v1/mentorium';
              }
            } else {
              // Fallback для случаев без заголовка
              console.log('🔄 Fallback proxy:', req.url, '→ /api/v1/mentorium');
              proxyReq.path = '/api/v1/mentorium';
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, 'for', req.url);
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', err.message);
          });
        }
      },
      
      // Прямой прокси для обратной совместимости
      '/api/v1/mentorium': {
        target: 'https://knowledge.slovo-soft.ru',
        changeOrigin: true,
        secure: false
      },
      
      // Общий прокси для других API
      '/api': {
        target: 'https://knowledge.slovo-soft.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
