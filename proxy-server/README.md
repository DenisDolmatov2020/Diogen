# 🌐 Diogen CORS Proxy Server

Простой прокси-сервер для решения проблем CORS при тестировании Diogen Chat Widget на удаленных доменах.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd proxy-server
npm install
```

### 2. Запуск сервера
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3001`

### 3. Для разработки (с автоперезагрузкой)
```bash
npm run dev
```

## 📡 Деплой в интернет

### Вариант 1: Railway (рекомендуется)
1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Выберите папку `proxy-server`
4. Railway автоматически развернет сервер
5. Получите публичный URL (например: `https://your-app.railway.app`)

### Вариант 2: Render
1. Зарегистрируйтесь на [Render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Укажите:
   - Build Command: `cd proxy-server && npm install`
   - Start Command: `cd proxy-server && npm start`
5. Получите публичный URL

### Вариант 3: Heroku
1. Установите Heroku CLI
2. Создайте приложение:
```bash
cd proxy-server
heroku create your-diogen-proxy
git subtree push --prefix proxy-server heroku main
```

## 🔧 Использование

### API Endpoint
```
POST /proxy
```

### Заголовки
- `Content-Type: application/json`
- `X-Target-URL: https://knowledge.slovo-soft.ru/api/v1/mentorium`
- `X-TOKEN: base64(login:password)`

### Пример запроса
```javascript
const response = await fetch('https://your-proxy-server.com/proxy', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Target-URL': 'https://knowledge.slovo-soft.ru/api/v1/mentorium',
        'X-TOKEN': btoa('login:password')
    },
    body: JSON.stringify([{
        component_name: "meta_data",
        parent_block_id: "block-0-1",
        action_mode: "dialog",
        action_params: [
            {
                variable: "input_text",
                data: "тест сообщения"
            },
            {
                variable: "reference_id",
                data: "000.3654823.1234567890"
            }
        ]
    }])
});
```

## 🛠️ Настройка виджета

После деплоя прокси-сервера, обновите конфигурацию виджета:

```javascript
// В widget/diogen-chat-widget.js найдите функцию generateProxyUrl()
generateProxyUrl() {
    // Замените на URL вашего прокси-сервера
    return 'https://your-proxy-server.com/proxy';
}
```

Или добавьте в конфигурацию:
```javascript
const config = {
    proxyUrl: 'https://your-proxy-server.com/proxy'
};
```

## 📊 Мониторинг

### Проверка работоспособности
```bash
curl https://your-proxy-server.com/health
```

### Просмотр документации
Откройте в браузере: `https://your-proxy-server.com`

## 🔒 Безопасность

⚠️ **Внимание**: Этот прокси-сервер предназначен только для тестирования!

Для продакшена рекомендуется:
1. Настроить CORS на основном API сервере
2. Добавить аутентификацию к прокси
3. Ограничить список разрешенных доменов
4. Добавить rate limiting

## 🐛 Отладка

### Логи сервера
Все запросы логируются в консоль:
```
2024-01-01T12:00:00.000Z - POST /proxy
Headers: { 'x-target-url': '...', 'x-token': '...' }
🔄 Проксируем запрос к: https://knowledge.slovo-soft.ru/api/v1/mentorium
📥 Ответ от API: 200 [{"component_name":"text_block"...
```

### Тестирование локально
```bash
npm test
```

## 📝 Переменные окружения

- `PORT` - порт сервера (по умолчанию: 3001)
- `NODE_ENV` - окружение (development/production)

## 🤝 Поддержка

Если возникли проблемы:
1. Проверьте логи сервера
2. Убедитесь что API доступен
3. Проверьте правильность заголовков
4. Откройте issue в репозитории 