# 🚀 Diogen Chat Widget - Универсальное решение CORS

Виджет автоматически работает с любым клиентом и API, определяя нужный режим работы и настраивая прокси при необходимости.

## 🔧 Быстрая настройка

Просто добавьте скрипт на любую страницу:

```html
<script 
    src="https://diogen.netlify.app/widget/diogen-chat-widget.js"
    data-diogen-api-url="https://your-api.com/endpoint"
    data-diogen-project-id="123"
    data-diogen-user-id="456789"
></script>
```

## 📋 Reference ID - Постоянное хранение

Виджет автоматически создает и сохраняет `reference_id` в `localStorage` браузера пользователя.

### Формат reference_id:
```
PROJECT_ID.USER_ID.TIMESTAMP
```

**Пример:** `123.456789.1749557663`

### Логика работы:
- **Первый запуск:** Генерируется новый `reference_id` и сохраняется в `localStorage`
- **Повторные запуски:** Используется сохраненный `reference_id` из `localStorage`
- **Уникальность:** Каждая комбинация `PROJECT_ID + USER_ID` имеет свой `reference_id`

### Методы управления:
```javascript
// Получить текущий reference_id
const currentId = window.DiogenChat.getReferenceId();

// Создать новый reference_id (принудительно)
const newId = window.DiogenChat.newReferenceId();

// Очистить reference_id из localStorage
window.DiogenChat.clearReferenceId();
```

## 📤 Структура API запроса

Виджет отправляет запросы в следующем формате:

```json
[{
    "component_name": "meta_data",
    "parent_block_id": "block-0-1",
    "action_mode": "dialog",
    "action_params": [
        {
            "variable": "input_text",
            "data": "Текст сообщения пользователя"
        },
        {
            "variable": "reference_id",
            "data": "123.456789.1749557663"
        }
    ]
}]
```

## 🔄 Автоматическое определение режима работы

Виджет автоматически определяет, нужен ли прокси:

### Режимы работы:
1. **Разработка (localhost):** Использует Vite прокси для внешних API
2. **Продакшен:** Использует серверный прокси (Netlify) для внешних API
3. **Same-origin:** Прямые запросы без прокси

### Логика определения:
```javascript
// Прокси используется если:
// 1. API находится на другом домене
// 2. И мы либо на продакшене, либо в режиме разработки
const shouldUseProxy = isDifferentOrigin && (isProduction || isLocalDev);
```

## ⚙️ Настройка прокси для разработки (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api/widget-proxy': {
        target: 'https://knowledge.slovo-soft.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '/api/v1/mentorium',
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Прокси запрос:', req.method, req.url, '→', options.target);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Прокси ответ:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ Ошибка прокси:', err.message);
          });
        }
      }
    }
  }
});
```

## 🌐 Настройка прокси для продакшена (Netlify)

Для работы на продакшене добавьте в `netlify.toml`:

```toml
# Специальный редирект для виджета чата
[[redirects]]
  from = "/api/widget-proxy"
  to = "https://knowledge.slovo-soft.ru/api/v1/mentorium"
  status = 200
  force = true

# Специальные заголовки для прокси виджета
[[headers]]
  for = "/api/widget-proxy"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, X-Target-URL"
    Access-Control-Max-Age = "86400"
```

### Для других хостингов:
- **Vercel:** Используйте `vercel.json` с rewrites
- **Apache:** Настройте `.htaccess` с mod_rewrite
- **Nginx:** Добавьте proxy_pass в конфигурацию

## 🎯 Примеры для разных клиентов

### Клиент 1 - Основной API
```html
<script 
    src="https://diogen.netlify.app/widget/diogen-chat-widget.js"
    data-diogen-api-url="https://knowledge.slovo-soft.ru/api/v1/mentorium"
    data-diogen-project-id="000"
    data-diogen-user-id="3654823"
></script>
```

### Клиент 2 - Альтернативный API
```html
<script 
    src="https://diogen.netlify.app/widget/diogen-chat-widget.js"
    data-diogen-api-url="https://api2.example.com/chat"
    data-diogen-project-id="001"
    data-diogen-user-id="7891234"
></script>
```

### Клиент 3 - Локальный API (без прокси)
```html
<script 
    src="https://diogen.netlify.app/widget/diogen-chat-widget.js"
    data-diogen-api-url="/api/local-chat"
    data-diogen-project-id="002"
    data-diogen-user-id="5556789"
    data-diogen-dev-mode="false"
></script>
```

## 🔍 Диагностика

В консоли браузера вы увидите:

### При инициализации:
```
✅ Diogen Chat Widget инициализирован
🔄 Определение необходимости прокси: {
  currentOrigin: "https://diogen.netlify.app",
  apiOrigin: "https://knowledge.slovo-soft.ru", 
  isDifferentOrigin: true,
  shouldUse: true
}
🔄 Используем прокси: /api/widget-proxy → https://knowledge.slovo-soft.ru/api/v1/mentorium
🆕 Создан и сохранен новый reference_id: 000.3654823.1749557663
```

### При повторном запуске:
```
🔄 Используем существующий reference_id из localStorage: 000.3654823.1749557663
```

### При отправке сообщения:
```
📤 Отправляем запрос с reference_id: 000.3654823.1749557663
📥 Получен ответ от сервера: [...]
```

## ✨ Преимущества нового виджета

1. **🌍 Универсальность:** Работает с любым API и клиентом
2. **🤖 Автоматизация:** Сам определяет нужный режим работы
3. **🔒 Безопасность:** Решает проблемы CORS автоматически
4. **🐛 Отладка:** Подробные логи для диагностики
5. **💾 Постоянство:** Reference_id сохраняется между сессиями
6. **⚙️ Управляемость:** Публичные методы для управления reference_id
7. **🚀 Продакшен-готовность:** Работает как в разработке, так и на продакшене

Виджет готов к работе с любым клиентом и API! 🎉 