# 🤖 Diogen Chat Widget

Простой и мощный виджет для интеграции чат-бота Diogen на любой сайт. Не требует дополнительных зависимостей и фреймворков.

## ⚡ Быстрая интеграция

Добавьте эти две строки в HTML перед закрывающим тегом `</body>`:

```html
<link rel="stylesheet" href="https://your-domain.com/diogen-chat-widget.css">
<script src="https://your-domain.com/diogen-chat-widget.js" data-diogen-project="YOUR_PROJECT_ID"></script>
```

**Замените `YOUR_PROJECT_ID` на ваш реальный ID проекта!**

## 🎯 Возможности

✅ **Простая интеграция** - одна строка кода  
✅ **Без зависимостей** - работает на любом сайте  
✅ **Адаптивный дизайн** - идеально на мобильных устройствах  
✅ **Доступность** - поддержка клавиатуры и скринридеров  
✅ **Темная тема** - автоматическая поддержка темного режима  
✅ **Кастомизация** - CSS переменные для стилизации  

## 🔧 Настройки

### Data-атрибуты

Конфигурируйте виджет через data-атрибуты:

```html
<script src="diogen-chat-widget.js" 
    data-diogen-project="your-project-id"
    data-diogen-position="bottom-right"
    data-diogen-button-size="60px"
    data-diogen-width="520px"
    data-diogen-height="600px">
</script>
```

#### Доступные параметры:

| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| `data-diogen-project` | ID вашего проекта | `pfki` |
| `data-diogen-position` | Позиция кнопки | `bottom-right` |
| `data-diogen-button-size` | Размер кнопки | `60px` |
| `data-diogen-width` | Ширина чата | `508px` |
| `data-diogen-height` | Высота чата | `552px` |

### CSS кастомизация

Измените цвета и стили через CSS переменные:

```css
:root {
    --diogen-primary-color: #10b981; /* Основной цвет */
    --diogen-primary-hover: #059669; /* Цвет при наведении */
    --diogen-button-size: 70px; /* Размер кнопки */
    --diogen-border-radius: 20px; /* Радиус скругления */
}
```

#### Полный список CSS переменных:

```css
:root {
    --diogen-primary-color: #3b82f6;
    --diogen-primary-hover: #2563eb;
    --diogen-text-color: #1f2937;
    --diogen-background: #ffffff;
    --diogen-border-color: #e5e7eb;
    --diogen-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    --diogen-button-size: 60px;
    --diogen-border-radius: 16px;
    --diogen-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🎮 Программное управление

### JavaScript API

```javascript
// Открыть чат
DiogenChat.openChat();

// Закрыть чат
DiogenChat.closeChat();

// Сменить проект
DiogenChat.setProject('new-project-id');

// Удалить виджет полностью
DiogenChat.destroy();
```

### Ручная инициализация

```javascript
// Создать виджет с настройками
const widget = new DiogenChatWidget({
    project: 'your-project-id',
    position: 'bottom-left',
    buttonSize: '50px',
    width: '600px',
    height: '700px'
});
```

## 🛠 Интеграция с популярными платформами

### WordPress

Добавьте в `functions.php`:

```php
function add_diogen_chat_widget() {
    wp_enqueue_style('diogen-chat', 'https://your-domain.com/diogen-chat-widget.css');
    wp_enqueue_script('diogen-chat', 'https://your-domain.com/diogen-chat-widget.js', array(), '1.0', true);
    wp_script_add_data('diogen-chat', 'data-diogen-project', 'YOUR_PROJECT_ID');
}
add_action('wp_enqueue_scripts', 'add_diogen_chat_widget');
```

### React

```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // Подключаем CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://your-domain.com/diogen-chat-widget.css';
        document.head.appendChild(link);
        
        // Подключаем JS
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/diogen-chat-widget.js';
        script.setAttribute('data-diogen-project', 'YOUR_PROJECT_ID');
        document.body.appendChild(script);
        
        return () => {
            // Очистка при размонтировании
            if (window.DiogenChat) {
                window.DiogenChat.destroy();
            }
        };
    }, []);

    return (
        <div className="App">
            {/* Ваш контент */}
        </div>
    );
}
```

### Vue.js

```vue
<template>
    <div>
        <!-- Ваш контент -->
    </div>
</template>

<script>
export default {
    mounted() {
        // Подключаем CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://your-domain.com/diogen-chat-widget.css';
        document.head.appendChild(link);
        
        // Подключаем JS
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/diogen-chat-widget.js';
        script.setAttribute('data-diogen-project', 'YOUR_PROJECT_ID');
        document.body.appendChild(script);
    },
    
    beforeDestroy() {
        if (window.DiogenChat) {
            window.DiogenChat.destroy();
        }
    }
}
</script>
```

### Shopify

В админке Shopify перейдите в **Online Store → Themes → Actions → Edit code**.

Откройте `theme.liquid` и добавьте перед `</body>`:

```html
<link rel="stylesheet" href="https://your-domain.com/diogen-chat-widget.css">
<script src="https://your-domain.com/diogen-chat-widget.js" data-diogen-project="YOUR_PROJECT_ID"></script>
```

## 🔒 Безопасность

- Виджет не собирает персональные данные
- HTTPS обязателен для production
- Использует iframe для изоляции контента
- Соответствует стандартам GDPR

## 📱 Адаптивность

Виджет автоматически адаптируется под размер экрана:

- **Desktop**: стандартный размер и позиционирование
- **Tablet**: уменьшенные размеры модального окна
- **Mobile**: полноэкранный режим на небольших экранах

## 🎨 Кастомные стили

### Брендинг

```css
/* Пример брендинга под вашу компанию */
:root {
    --diogen-primary-color: #8B5CF6; /* Фиолетовый */
    --diogen-primary-hover: #7C3AED;
    --diogen-button-size: 65px;
    --diogen-border-radius: 24px;
}

/* Кастомная иконка чата */
.diogen-chat-button svg {
    display: none;
}

.diogen-chat-button::before {
    content: "💬";
    font-size: 24px;
}
```

### Позиционирование

```css
/* Левый нижний угол */
.diogen-chat-button {
    left: 20px;
    right: auto;
}

/* Верхний правый угол */
.diogen-chat-button {
    top: 20px;
    bottom: auto;
}
```

## 🚀 CDN интеграция

Для быстрой загрузки используйте CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-repo/widget/diogen-chat-widget.css">
<script src="https://cdn.jsdelivr.net/gh/your-repo/widget/diogen-chat-widget.js" data-diogen-project="YOUR_PROJECT_ID"></script>
```

## 🐛 Отладка

### Проверка интеграции

```javascript
// Проверить статус виджета
console.log(window.DiogenChat);

// Проверить конфигурацию
console.log(window.DiogenChat.config);
```

### Частые проблемы

1. **Виджет не появляется**: Проверьте ID проекта
2. **Стили не применяются**: Убедитесь что CSS подключен
3. **Не работает на мобильных**: Проверьте viewport мета-тег

## 📊 Аналитика

Виджет отправляет базовые события для аналитики:

```javascript
// Слушать события виджета
window.addEventListener('diogen-chat-open', () => {
    // Чат открыт
    gtag('event', 'chat_opened');
});

window.addEventListener('diogen-chat-close', () => {
    // Чат закрыт
    gtag('event', 'chat_closed');
});
```

## 💡 Советы по оптимизации

1. **Ленивая загрузка**: Загружайте виджет после основного контента
2. **Предзагрузка**: Используйте `<link rel="preload">` для критических ресурсов
3. **Кеширование**: Настройте долгое кеширование для статических файлов

## 📞 Поддержка

Если у вас возникли вопросы:

- 📧 Email: support@diogen.ai
- 💬 Telegram: @diogen_support
- 📝 GitHub Issues: [создать issue](https://github.com/your-repo/issues)

## 📄 Лицензия

MIT License - используйте свободно в коммерческих проектах.

---

**Версия**: 1.0.0  
**Последнее обновление**: 2024 