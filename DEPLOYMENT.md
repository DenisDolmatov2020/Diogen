# 🚀 Развертывание Diogen на Netlify

## Проблема с API проксированием

На Netlify конфигурация Vite `server.proxy` не работает. Локально все работает через dev-сервер Vite, но на production нужна дополнительная настройка.

## Решения

### 1. Конфигурация Netlify

Созданы файлы:
- `netlify.toml` - основная конфигурация с редиректами API
- `public/_redirects` - дополнительные правила редиректов
- `.env.production` - переменные окружения для production

### 2. Настройка API редиректов

```toml
# В netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://di.slovo-soft.ru:6443/:splat"
  status = 200
  force = true
```

### 3. CORS заголовки

```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, X-TOKEN, X-Front-Token"
```

## Тестирование

### 1. Локальное тестирование

```bash
npm run dev
# Откройте http://localhost:5173
# API должен работать через прокси
```

### 2. Production тестирование

После развертывания на Netlify:

1. Откройте основное приложение: https://diogen.netlify.app/
2. Для диагностики API: https://diogen.netlify.app/api-test.html
3. Откройте консоль разработчика для просмотра логов

### 3. Проверка в консоли

В консоли браузера должны появиться сообщения:
- `🔧 Тест переменных окружения:` - информация о режиме
- `📊 Результаты диагностики API:` - статус API подключения

## Диагностика проблем

### Если API не работает:

1. **Проверьте Netlify Deploy Log:**
   - Убедитесь, что `netlify.toml` был обработан
   - Проверьте, что редиректы установлены

2. **Проверьте Network Tab в DevTools:**
   - Запросы к `/api/*` должны перенаправляться на `di.slovo-soft.ru:6443`
   - Проверьте статус ответов

3. **Используйте страницу диагностики:**
   - Откройте `/api-test.html`
   - Запустите тесты подключения

### Переменные окружения в Netlify

В настройках Netlify добавьте:
```
VITE_DEV_MODE=false
VITE_API_AUTH_URL=http://194.87.143.218:8901
VITE_APP_FRONT_TOKEN=123456
```

## Файлы конфигурации

- `netlify.toml` - конфигурация Netlify
- `public/_redirects` - правила редиректов  
- `.env.production` - переменные для production
- `src/utils/apiHealth.ts` - диагностика API
- `public/api-test.html` - страница тестирования

## Команды развертывания

```bash
# Сборка для production
npm run build

# Предварительный просмотр production сборки
npm run preview
```

## Логирование и отладка

В режиме разработки (`VITE_DEV_MODE=true`):
- Полные логи API запросов
- Диагностика подключения при загрузке
- Детальная информация об ошибках

В production режиме (`VITE_DEV_MODE=false`):
- Минимальное логирование
- Только критические ошибки в консоль
- Упрощенная диагностика 