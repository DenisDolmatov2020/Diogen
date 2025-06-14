import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Плагин для копирования файлов виджета
    {
      name: 'copy-widget-files',
      writeBundle() {
        const widgetDir = 'dist/widget'
        if (!existsSync(widgetDir)) {
          mkdirSync(widgetDir, { recursive: true })
        }
        
        // Копируем файлы виджета
        const filesToCopy = [
          'widget/diogen-chat-widget.js',
          'widget/diogen-chat-widget.css',
          'widget/example.html',
          'widget/README.md'
        ]
        
        filesToCopy.forEach(file => {
          try {
            const fileName = file.split('/').pop()
            copyFileSync(file, `${widgetDir}/${fileName}`)
            console.log(`✅ Скопирован: ${file} → ${widgetDir}/${fileName}`)
          } catch (error) {
            console.warn(`⚠️ Не удалось скопировать ${file}:`, (error as Error).message)
          }
        })
      }
    }
  ],
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
      // Новый прокси для функции Netlify (локальная разработка)
      '/api/proxy': {
        target: 'https://knowledge.slovo-soft.ru',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Читаем реальный target из заголовка
            const targetUrl = req.headers['x-target-url'] as string;
            const token = req.headers['x-token'] as string;
            
            if (targetUrl) {
              try {
                const url = new URL(targetUrl);
                console.log('🔄 Proxy to:', targetUrl);
                
                // Обновляем target динамически
                proxyReq.setHeader('Host', url.host);
                proxyReq.path = url.pathname + (url.search || '');
                
                // Добавляем авторизацию если есть токен
                if (token) {
                  proxyReq.setHeader('Authorization', `Basic ${token}`);
                }
                
                // Удаляем наши служебные заголовки
                proxyReq.removeHeader('x-target-url');
                proxyReq.removeHeader('x-token');
                
              } catch (error) {
                console.error('❌ Invalid target URL:', targetUrl);
                // Используем fallback
                proxyReq.path = '/api/v1/mentorium';
              }
            } else {
              // Fallback для случаев без заголовка
              console.log('🔄 Fallback proxy to /api/v1/mentorium');
              proxyReq.path = '/api/v1/mentorium';
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, 'for', req.url);
          });
          
          proxy.on('error', (err, _req, _res) => {
            console.error('❌ Proxy error:', err.message);
          });
        }
      },
      
      // Динамический прокси для виджета (старый путь для обратной совместимости)
      '/api/widget-proxy': {
        target: 'https://knowledge.slovo-soft.ru', // Fallback
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
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
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, 'for', req.url);
          });
          
          proxy.on('error', (err, _req, _res) => {
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
