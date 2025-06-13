# 🚀 Развертывание Diogen Chat Widget

Руководство по развертыванию виджета чат-бота для клиентов.

## 📋 Быстрая проверка

Перед развертыванием убедитесь, что у вас есть:

- ✅ `diogen-chat-widget.js` - основной JavaScript файл
- ✅ `diogen-chat-widget.css` - стили виджета  
- ✅ `example.html` - демонстрационная страница
- ✅ `README.md` - документация для клиентов

## 🔧 Подготовка к развертыванию

### 1. Минификация файлов

Для продакшена рекомендуется минифицировать файлы:

```bash
node build.js
```

Это создаст файлы:
- `diogen-chat-widget.min.js` (сжатый JavaScript)
- `diogen-chat-widget.min.css` (сжатый CSS)

### 2. Настройка base URL

В `diogen-chat-widget.js` измените `baseUrl` на ваш домен:

```javascript
const DEFAULT_CONFIG = {
    baseUrl: 'https://diogen.netlify.app/chat', // Замените на ваш URL
    // ... остальные настройки
};
```

## 🌐 Варианты развертывания

### Вариант 1: CDN (Рекомендуется)

**Преимущества:**
- Быстрая загрузка
- Кеширование
- Простота обновления

**Настройка:**

1. Загрузите файлы в CDN (jsDelivr, Unpkg, или собственный CDN)
2. Клиенты используют прямые ссылки:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/username/repo@latest/widget/diogen-chat-widget.min.css">
<script src="https://cdn.jsdelivr.net/gh/username/repo@latest/widget/diogen-chat-widget.min.js" data-diogen-project="CLIENT_PROJECT_ID"></script>
```

### Вариант 2: Собственный сервер

**Настройка Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /widget/ {
        root /var/www/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # CORS для кросс-доменных запросов
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept";
    }
}
```

**Структура файлов:**
```
/var/www/widget/
├── diogen-chat-widget.min.js
├── diogen-chat-widget.min.css
├── example.html
└── README.md
```

### Вариант 3: GitHub Pages

1. Создайте репозиторий с файлами виджета
2. Включите GitHub Pages
3. Клиенты используют:

```html
<link rel="stylesheet" href="https://username.github.io/repo-name/widget/diogen-chat-widget.min.css">
<script src="https://username.github.io/repo-name/widget/diogen-chat-widget.min.js" data-diogen-project="CLIENT_PROJECT_ID"></script>
```

## 📦 Пакетные файлы для клиентов

Создайте zip-архив с файлами для самостоятельного хостинга:

```bash
# Создать пакет для клиентов
zip -r diogen-chat-widget-v1.0.zip \
    diogen-chat-widget.min.js \
    diogen-chat-widget.min.css \
    example.html \
    README.md
```

## 🎯 Инструкция для клиентов

### Базовая интеграция

Клиенты должны:

1. Скачать файлы виджета
2. Загрузить на свой сервер
3. Добавить две строки в HTML:

```html
<link rel="stylesheet" href="/path/to/diogen-chat-widget.min.css">
<script src="/path/to/diogen-chat-widget.min.js" data-diogen-project="THEIR_PROJECT_ID"></script>
```

### Получение Project ID

Клиенты получают `project ID` при регистрации в системе Diogen:

1. Регистрация на diogen.netlify.app
2. Создание нового проекта
3. Копирование Project ID из настроек

## 🔍 Тестирование

### Локальное тестирование

```bash
# Запуск простого HTTP сервера
python -m http.server 8000
# или
npx serve .

# Открыть http://localhost:8000/example.html
```

### Чек-лист тестирования

- ✅ Кнопка чата появляется в правом углу
- ✅ Клик открывает модальное окно
- ✅ Iframe загружается с правильным project ID
- ✅ Полноэкранный режим работает
- ✅ Закрытие по ESC и клику вне области
- ✅ Адаптивность на мобильных устройствах
- ✅ Работа в различных браузерах

## 📊 Мониторинг

### Логирование ошибок

Добавьте в виджет отправку ошибок:

```javascript
window.addEventListener('error', (event) => {
    if (event.filename.includes('diogen-chat-widget')) {
        // Отправить ошибку в аналитику
        console.error('Diogen Widget Error:', event.error);
    }
});
```

### Аналитика использования

Трекинг основных событий:

```javascript
// В виджете можно добавить
function trackEvent(eventName, data = {}) {
    if (window.gtag) {
        gtag('event', eventName, {
            event_category: 'diogen_widget',
            ...data
        });
    }
}

// Использование
trackEvent('widget_loaded');
trackEvent('chat_opened', { project_id: this.config.project });
```

## 🔄 Обновления

### Версионирование

Используйте семантическое версионирование:

- `1.0.0` - первая стабильная версия
- `1.0.1` - исправления багов
- `1.1.0` - новые функции
- `2.0.0` - breaking changes

### Миграции

При обновлениях создавайте миграционные гайды:

```markdown
# Миграция с v1.0 на v1.1

## Изменения
- Добавлен параметр `data-diogen-theme`
- Улучшена адаптивность

## Действия
1. Обновите файлы виджета
2. Очистите кеш браузера
3. Протестируйте функциональность
```

## 🚨 Устранение проблем

### Частые проблемы

1. **CORS ошибки**
   ```
   Решение: Настройте правильные CORS заголовки на сервере
   ```

2. **Виджет не появляется**
   ```
   Проверьте:
   - Правильность подключения CSS
   - Отсутствие JavaScript ошибок в консоли
   - Правильность project ID
   ```

3. **Конфликты стилей**
   ```
   Решение: Используйте более специфичные селекторы или !important
   ```

## 📞 Поддержка клиентов

### Шаблоны ответов

**Проблема с интеграцией:**
```
Здравствуйте!

Для решения проблемы с интеграцией виджета, пожалуйста:

1. Проверьте правильность project ID
2. Убедитесь что файлы загружены корректно
3. Откройте консоль браузера для проверки ошибок

Если проблема не решена, пришлите:
- Ссылку на страницу с виджетом
- Скриншот консоли браузера
- Ваш project ID

С уважением,
Команда Diogen
```

### FAQ для клиентов

**В:** Можно ли изменить цвет кнопки?  
**О:** Да, используйте CSS переменную `--diogen-primary-color`

**В:** Виджет работает на всех браузерах?  
**О:** Да, поддерживаются все современные браузеры (IE11+)

**В:** Можно ли отключить виджет для мобильных?  
**О:** Да, используйте CSS медиа-запросы

## 📈 Дальнейшее развитие

### Roadmap

- [ ] Поддержка тем оформления
- [ ] Интеграция с Google Analytics
- [ ] Поддержка A/B тестирования
- [ ] Многоязычность
- [ ] Офлайн режим

### Обратная связь

Собирайте обратную связь от клиентов:

- Опросы об удобстве интеграции
- Запросы новых функций
- Отчеты о багах
- Предложения по улучшению

---

**Обновлено:** 2024  
**Версия документа:** 1.0 