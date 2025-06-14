# 🔒 Решение проблемы CORS для Diogen Chat Widget

## Проблема
При разработке возникает ошибка CORS:
```
Access to fetch at 'https://your-api.com/api/v1/chat' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## 🚀 Быстрое решение для любого API URL

Виджет теперь поддерживает работу с любым API URL и автоматически определяет, нужен ли прокси.

## ⚡ Простая настройка

```html
<script 
  src="http://localhost:5173/diogen-chat-widget.js"
  data-diogen-api-url="https://ваш-api.com/api/v1/endpoint"
  data-diogen-project="ваш-проект"
  data-diogen-project-id="000"
  data-diogen-user-id="3654823">
</script>
```

## 🆔 Правильный формат Reference ID

Виджет теперь генерирует `reference_id` в правильном формате: `PROJECT_ID.USER_ID.TIMESTAMP`

**Пример:** `000.3654823.1749557663`

- `000` - ID проекта (настраивается через `data-diogen-project-id`)
- `3654823` - ID пользователя (настраивается через `data-diogen-user-id`) 
- `1749557663` - Unix timestamp в секундах (генерируется автоматически)

## 📋 Структура запроса

Виджет отправляет запросы в правильном формате API:

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
      "data": "000.3654823.1749557663"
    }
  ]
}]
```

## 🔧 Универсальная настройка прокси

В `vite.config.ts` добавьте динамический прокси:

```javascript
server: {
  proxy: {
    // Динамический прокси для виджета
    '/api/widget-proxy': {
      target: 'https://fallback-api.com', // Fallback
      changeOrigin: true,
      secure: false,
      configure: (proxy, options) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          // Читаем реальный target из заголовка
          const targetUrl = req.headers['x-target-url'];
          
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
    }
  }
}
```

## 🎯 Примеры для разных клиентов

### Клиент 1: knowledge.slovo-soft.ru
```html
<script 
  src="http://localhost:5173/diogen-chat-widget.js"
  data-diogen-api-url="https://knowledge.slovo-soft.ru/api/v1/mentorium"
  data-diogen-project="pfki"
  data-diogen-project-id="000"
  data-diogen-user-id="3654823">
</script>
```

### Клиент 2: другой API
```html
<script 
  src="http://localhost:5173/diogen-chat-widget.js"
  data-diogen-api-url="https://другой-api.com/api/v1/chat"
  data-diogen-project="другой-проект"
  data-diogen-project-id="001"
  data-diogen-user-id="7891234">
</script>
```

## 🔍 Как работает автоматическое определение

Виджет автоматически определяет режим работы:

- **devMode: "auto"** (по умолчанию) - автоматическое определение
  - Если localhost + dev порт + другой домен API → использует прокси
  - Иначе → прямое подключение

- **devMode: "true"** - принудительно использует прокси
- **devMode: "false"** - принудительно прямое подключение

## 🛠️ Диагностика

В консоли браузера вы увидите:

```
🆔 Генерируем reference_id: 000.3654823.1749557663
📤 Отправляем запрос: [{"component_name": "meta_data", ...}]
🔄 Dynamic proxy: /api/widget-proxy → https://ваш-api.com/api/v1/endpoint
📥 Proxy response: 200 for /api/widget-proxy
📥 Получен ответ: [{"items": [...]}]
```

## ✅ Преимущества решения

- **🌐 Универсальность**: Работает с любым API URL
- **🤖 Автоматизация**: Автоматическое определение нужды в прокси
- **🔒 Безопасность**: Обходит CORS только в dev режиме
- **📊 Диагностика**: Подробные логи для отладки
- **⚙️ Гибкость**: Настройка через HTML атрибуты
- **🆔 Правильный формат**: Корректная генерация reference_id
- **📋 Совместимость**: Правильная структура запросов API

Теперь ваш виджет готов работать с любым клиентом и API! 🎉

## 🎨 Примеры для разных клиентов

### Клиент 1
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://api.client1.com/chat"
    data-diogen-project="client1-project">
</script>
```

### Клиент 2
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://api.client2.com/v2/assistant"
    data-diogen-project="client2-project">
</script>
```

### Клиент 3
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://chat.client3.com/api/bot"
    data-diogen-project="client3-project">
</script>
```

## ⚠️ Важные замечания

1. **Каждый API URL получает уникальный прокси путь**
2. **В production devMode автоматически отключается**
3. **Прокси работает только на dev-сервере**
4. **Для мобильного тестирования используйте ngrok**

## 🆘 Если ничего не помогает

1. Проверьте консоль - виджет покажет точные инструкции
2. Убедитесь, что API URL правильный
3. Перезапустите dev-сервер после изменения конфигурации
4. Попробуйте принудительный режим: `data-diogen-dev-mode="true"` 

## 📋 Reference ID - Постоянное хранение

Виджет автоматически создает и сохраняет `reference_id` в localStorage браузера:

### Формат reference_id
```
PROJECT_ID.USER_ID.TIMESTAMP
```

**Пример:** `123.456789.1749557663`

### Логика работы
- **При первом запуске:** генерируется новый `reference_id` и сохраняется в localStorage
- **При последующих запусках:** используется сохраненный `reference_id` из localStorage
- **Ключ хранения:** `diogen-reference-id-{PROJECT_ID}-{USER_ID}`

### Управление reference_id

```javascript
// Получить текущий reference_id
const currentId = window.DiogenChat.getReferenceId();

// Создать новый reference_id (старый удаляется)
const newId = window.DiogenChat.newReferenceId();

// Очистить reference_id из localStorage
window.DiogenChat.clearReferenceId();
```

## 📤 Структура запроса к API

Виджет отправляет запросы в следующем формате:

```json
[{
    "component_name": "meta_data",
    "parent_block_id": "block-0-1", 
    "action_mode": "dialog",
    "action_params": [
        {
            "variable": "input_text",
            "data": "текст сообщения пользователя"
        },
        {
            "variable": "reference_id", 
            "data": "123.456789.1749557663"
        }
    ]
}]
```

## 🎯 Примеры для разных клиентов

### Клиент 1 - ПФКИ
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://knowledge.slovo-soft.ru/api/v1/mentorium"
    data-diogen-project-id="000"
    data-diogen-user-id="3654823"
    data-diogen-project="pfki"
></script>
```

### Клиент 2 - Другой проект  
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://api.client2.com/chat"
    data-diogen-project-id="001"
    data-diogen-user-id="7891011"
    data-diogen-project="client2"
></script>
```

### Клиент 3 - Тестовый сервер
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="http://localhost:8000/api/chat"
    data-diogen-project-id="999"
    data-diogen-user-id="1234567"
    data-diogen-dev-mode="true"
></script>
```

## 🔍 Автоматическое определение режима

Виджет автоматически определяет нужен ли прокси:

- **Разработка:** `localhost` + порты `5173/3000/8080` + внешний API = прокси
- **Продакшн:** прямое подключение к API
- **Принудительно:** `data-diogen-dev-mode="true/false"`

## 📊 Диагностика

В консоли браузера вы увидите:

```
✅ Diogen Chat Widget инициализирован
🔄 Используем существующий reference_id из localStorage: 123.456789.1749557663
🌐 Прямое подключение к: https://api.example.com
📤 Отправляем запрос с reference_id: 123.456789.1749557663
📥 Получен ответ от сервера: [...]
```

## ✨ Преимущества нового виджета

- **🌍 Универсальность:** работает с любым API
- **🤖 Автоматизация:** сам определяет нужен ли прокси  
- **🔒 Безопасность:** поддержка HTTPS и CORS
- **🛠️ Отладка:** подробные логи в консоли
- **💾 Постоянство:** reference_id сохраняется между сессиями
- **🎛️ Управление:** методы для работы с reference_id

---

Виджет готов к работе с любым клиентом и API! 🎉 