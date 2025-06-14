# �� Diogen Chat Widget - Standalone Version

Автономный чат-виджет с встроенными стилями для легкой интеграции на любой сайт.

## ✨ Особенности

- **Один файл** - никаких дополнительных CSS файлов
- **Автоматическая стилизация** - стили встраиваются автоматически
- **Адаптивный дизайн** - отлично работает на мобильных устройствах
- **Поддержка тем** - светлая, темная и автоматическая темы
- **Полноэкранный режим** - для удобства на мобильных устройствах
- **Автоматический прокси** - определение необходимости прокси для dev-режима

## 🚀 Быстрый старт

Добавьте всего одну строчку кода перед закрывающим тегом `</body>`:

```html
<!-- Diogen Chat Widget -->
<script 
    src="https://your-cdn.com/diogen-chat-widget.js"
    data-diogen-api-url="https://knowledge.slovo-soft.ru/api/v1/mentorium"
    data-diogen-project="your-project"
    data-diogen-project-id="000"
    data-diogen-user-id="123456"
    data-diogen-title="Помощник"
    data-diogen-theme="auto">
</script>
```

**Готово!** 🎉 Виджет автоматически появится на вашем сайте.

## 📖 Параметры конфигурации

### Основные параметры

| Параметр | Описание | Пример | По умолчанию |
|----------|----------|---------|--------------|
| `data-diogen-api-url` | URL API для чата | `https://api.example.com` | - |
| `data-diogen-project` | Название проекта | `my-project` | `pfki` |
| `data-diogen-project-id` | ID проекта для reference_id | `001` | `000` |
| `data-diogen-user-id` | ID пользователя | `123456` | `3654823` |
| `data-diogen-title` | Заголовок чата | `Помощник` | `Чат-бот` |

### Внешний вид

| Параметр | Описание | Варианты | По умолчанию |
|----------|----------|----------|--------------|
| `data-diogen-theme` | Тема виджета | `auto`, `light`, `dark` | `auto` |
| `data-diogen-position` | Позиция кнопки | `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right` |
| `data-diogen-width` | Ширина окна чата | `400px` | `508px` |
| `data-diogen-height` | Высота окна чата | `600px` | `552px` |
| `data-diogen-button-size` | Размер кнопки | `50px` | `60px` |

## 🎨 Темы

### Автоматическая тема (по умолчанию)
```html
data-diogen-theme="auto"
```
Следует системным настройкам пользователя.

### Светлая тема
```html
data-diogen-theme="light"
```

### Темная тема
```html
data-diogen-theme="dark"
```

## 📋 Примеры интеграции

### Базовая интеграция
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://api.example.com"
    data-diogen-project-id="001"
    data-diogen-user-id="12345">
</script>
```

### Кастомизированный виджет
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-api-url="https://api.example.com"
    data-diogen-project="support"
    data-diogen-project-id="001"
    data-diogen-user-id="12345"
    data-diogen-title="Поддержка"
    data-diogen-theme="dark"
    data-diogen-width="600px"
    data-diogen-height="700px">
</script>
```

## 📦 Размер файла

- **JavaScript**: ~45KB (с встроенным CSS)
- **Зависимости**: отсутствуют

## 📄 Лицензия

MIT License - используйте свободно в коммерческих и некоммерческих проектах. 