// Продвинутая конфигурация прокси для Diogen Chat Widget
// Поддерживает множественные API URL для разных клиентов

import { defineConfig } from 'vite'

// Карта известных API серверов (можно расширять)
const API_TARGETS = {
  // Хеш от base64(url) -> реальный URL
  'aHR0cHM6Ly9rbm93bGVkZ2Uuc2xvdm8tc29mdC5ydS9hcGkvdjEvbWVudG9yaXVt': 'https://knowledge.slovo-soft.ru',
  'aHR0cHM6Ly9hcGkxLmV4YW1wbGUuY29tL2NoYXQ': 'https://api1.example.com',
  'aHR0cHM6Ly9hcGkyLmV4YW1wbGUuY29tL2NoYXQ': 'https://api2.example.com',
  // Добавляйте новые API по мере необходимости
}

// Функция для извлечения target URL из прокси пути
function getTargetFromProxyPath(path) {
  // Извлекаем хеш из пути вида /api/proxy-HASH
  const match = path.match(/\/api\/proxy-([a-zA-Z0-9]+)/);
  if (!match) return null;
  
  const hash = match[1];
  
  // Ищем в карте известных API
  for (const [knownHash, target] of Object.entries(API_TARGETS)) {
    if (knownHash.startsWith(hash)) {
      return target;
    }
  }
  
  return null;
}

export const proxyConfig = {
  // Универсальный прокси для всех виджетов
  '^/api/proxy-.*': {
    target: 'https://knowledge.slovo-soft.ru', // Fallback
    changeOrigin: true,
    secure: false,
    configure: (proxy, options) => {
      proxy.on('proxyReq', (proxyReq, req, res) => {
        // Пытаемся определить реальный target
        const realTarget = getTargetFromProxyPath(req.url);
        
        if (realTarget) {
          console.log(`🔄 Proxy: ${req.url} → ${realTarget}${req.url.replace(/\/api\/proxy-[^\/]+/, '')}`);
          
          // Обновляем заголовки для нового target
          const targetUrl = new URL(realTarget);
          proxyReq.setHeader('Host', targetUrl.host);
          
          // Перенаправляем на правильный путь
          const originalPath = req.url.replace(/\/api\/proxy-[^\/]+/, '');
          proxyReq.path = originalPath || '/';
        } else {
          console.log(`⚠️  Unknown proxy target for: ${req.url}`);
        }
      });
      
      proxy.on('proxyRes', (proxyRes, req, res) => {
        console.log(`📥 Response: ${proxyRes.statusCode} for ${req.url}`);
      });
      
      proxy.on('error', (err, req, res) => {
        console.error(`❌ Proxy error for ${req.url}:`, err.message);
        
        // Отправляем информативную ошибку
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Proxy configuration error',
            message: `Unable to proxy ${req.url}. Check your API configuration.`,
            instructions: 'Add your API URL to the API_TARGETS map in vite-proxy-config.js'
          }));
        }
      });
    }
  },
  
  // Специфичные прокси для известных API
  '/api/v1/mentorium': {
    target: 'https://knowledge.slovo-soft.ru',
    changeOrigin: true,
    secure: false
  }
}

// Пример использования в vite.config.js:
/*
import { proxyConfig } from './widget/vite-proxy-config.js'

export default defineConfig({
  server: {
    proxy: proxyConfig
  }
})
*/ 