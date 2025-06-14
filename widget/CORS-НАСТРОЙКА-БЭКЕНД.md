# 🔧 Настройка CORS на бэкенде для Diogen Chat Widget

## Проблема
Виджет работает на разных доменах (например, на Surge.sh, Netlify, или других хостингах), но API сервер блокирует запросы из-за CORS политики.

## Решение
Необходимо настроить CORS заголовки на API сервере `https://knowledge.slovo-soft.ru`

## Требуемые CORS заголовки

### Для preflight запросов (OPTIONS):
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Для основных запросов:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: false
```

## Примеры настройки

### Nginx
```nginx
location /api/v1/mentorium {
    # Добавляем CORS заголовки
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Max-Age' '86400' always;
    
    # Обрабатываем preflight запросы
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    # Проксируем к бэкенду
    proxy_pass http://backend;
}
```

### Apache
```apache
<Location "/api/v1/mentorium">
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header always set Access-Control-Max-Age "86400"
    
    # Обработка preflight запросов
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=204,L]
</Location>
```

### Node.js/Express
```javascript
app.use('/api/v1/mentorium', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
    } else {
        next();
    }
});
```

### PHP
```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}
?>
```

## Безопасность

### Для продакшена рекомендуется ограничить домены:
```
Access-Control-Allow-Origin: https://your-widget-domain.com
```

### Или список доменов:
```javascript
const allowedOrigins = [
    'https://your-site.surge.sh',
    'https://your-site.netlify.app',
    'https://your-domain.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
}
```

## Тестирование CORS

### Проверка через curl:
```bash
# Preflight запрос
curl -X OPTIONS \
  -H "Origin: https://your-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v https://knowledge.slovo-soft.ru/api/v1/mentorium

# Основной запрос
curl -X POST \
  -H "Origin: https://your-domain.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic cGZraTpwZmtp" \
  -d '[{"component_name":"meta_data","parent_block_id":"block-0-1","action_mode":"dialog","action_params":[{"variable":"input_text","data":"тест"},{"variable":"reference_id","data":"000.3654823.1234567890"}]}]' \
  -v https://knowledge.slovo-soft.ru/api/v1/mentorium
```

### Проверка в браузере:
```javascript
// Откройте консоль браузера на вашем сайте и выполните:
fetch('https://knowledge.slovo-soft.ru/api/v1/mentorium', {
    method: 'OPTIONS'
}).then(response => {
    console.log('CORS Headers:', response.headers);
    console.log('Status:', response.status);
});
```

## Альтернативные решения

### 1. JSONP (если API поддерживает)
```javascript
// Добавить поддержку callback параметра в API
// GET https://knowledge.slovo-soft.ru/api/v1/mentorium?callback=myCallback
```

### 2. Серверный прокси
- Создать прокси на том же домене что и виджет
- Прокси будет перенаправлять запросы к API

### 3. Использование публичных CORS прокси (не рекомендуется для продакшена)
```javascript
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const targetUrl = 'https://knowledge.slovo-soft.ru/api/v1/mentorium';
fetch(proxyUrl + targetUrl, options);
```

## Проверка текущего состояния

Виджет автоматически определяет проблемы с CORS и выводит соответствующие сообщения:
- ✅ **localhost** - использует dev прокси
- ❌ **production** - требует настройки CORS на бэкенде

## Контакты для настройки

Передайте эту инструкцию команде бэкенда для настройки CORS на сервере `https://knowledge.slovo-soft.ru` 