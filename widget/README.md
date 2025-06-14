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

# 🎨 Diogen Chat Widget - Кастомизация стилей

## 📋 Обзор

Виджет Diogen Chat теперь поддерживает приоритетную настройку стилей через `data-` атрибуты скрипта. Стили, заданные через атрибуты, имеют более высокий приоритет, чем CSS файл.

## 🚀 Быстрый старт

### Базовая интеграция
```html
<link rel="stylesheet" href="diogen-chat-widget.css">
<script src="diogen-chat-widget.js" data-diogen-project="my-project"></script>
```

### С кастомизацией
```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-project="my-project"
    data-diogen-primary-color="#ff6b35"
    data-diogen-width="600px"
    data-diogen-height="700px">
</script>
```

## 🎨 Атрибуты стилизации

### Основные цвета (светлая тема)
| Атрибут | Описание | Пример |
|---------|----------|---------|
| `data-diogen-primary-color` | Основной цвет кнопок | `#ff6b35` |
| `data-diogen-primary-hover-color` | Цвет при наведении | `#e55a2b` |
| `data-diogen-text-color` | Цвет текста | `#2c3e50` |
| `data-diogen-bg-color` | Фон виджета | `#ffffff` |
| `data-diogen-surface-bg-color` | Фон сообщений бота | `#f8f9fa` |
| `data-diogen-user-bg-color` | Фон сообщений пользователя | `#e3f2fd` |
| `data-diogen-border-color` | Цвет границ | `#dee2e6` |

### Темная тема
| Атрибут | Описание | Пример |
|---------|----------|---------|
| `data-diogen-dark-primary-color` | Основной цвет (темная тема) | `#4dabf7` |
| `data-diogen-dark-text-color` | Цвет текста (темная тема) | `#ffffff` |
| `data-diogen-dark-bg-color` | Фон виджета (темная тема) | `#1a1a1a` |
| `data-diogen-dark-surface-bg-color` | Фон сообщений бота (темная тема) | `#2d2d2d` |
| `data-diogen-dark-user-bg-color` | Фон сообщений пользователя (темная тема) | `#3a3a3a` |
| `data-diogen-dark-border-color` | Цвет границ (темная тема) | `#404040` |

### Размеры и оформление
| Атрибут | Описание | Пример |
|---------|----------|---------|
| `data-diogen-width` | Ширина виджета | `600px` |
| `data-diogen-height` | Высота виджета | `700px` |
| `data-diogen-button-size` | Размер кнопки чата | `70px` |
| `data-diogen-border-radius` | Радиус скругления | `16px` |
| `data-diogen-input-radius` | Радиус поля ввода | `25px` |
| `data-diogen-font-family` | Шрифт | `'Inter', sans-serif` |
| `data-diogen-title` | Заголовок виджета | `Чат-бот` |

### Позиционирование
| Атрибут | Описание | Значения |
|---------|----------|----------|
| `data-diogen-position` | Позиция кнопки | `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `data-diogen-bottom-offset` | Отступ снизу | `30px` |
| `data-diogen-right-offset` | Отступ справа | `30px` |
| `data-diogen-left-offset` | Отступ слева | `30px` |
| `data-diogen-top-offset` | Отступ сверху | `30px` |

## 📱 Полный пример

```html
<script 
    src="diogen-chat-widget.js"
    data-diogen-project="my-project"
    data-diogen-api-url="https://api.example.com"
    
    <!-- Основные цвета -->
    data-diogen-primary-color="#ff6b35"
    data-diogen-primary-hover-color="#e55a2b"
    data-diogen-text-color="#2c3e50"
    data-diogen-bg-color="#ffffff"
    data-diogen-surface-bg-color="#f8f9fa"
    data-diogen-user-bg-color="#e3f2fd"
    data-diogen-border-color="#dee2e6"
    
    <!-- Размеры -->
    data-diogen-width="600px"
    data-diogen-height="700px"
    data-diogen-button-size="70px"
    data-diogen-border-radius="20px"
    data-diogen-font-family="'Inter', sans-serif"
    
    <!-- Позиционирование -->
    data-diogen-position="bottom-left"
    data-diogen-bottom-offset="30px"
    data-diogen-left-offset="30px"
    
    <!-- Темная тема -->
    data-diogen-theme="auto"
    data-diogen-dark-primary-color="#4dabf7"
    data-diogen-dark-text-color="#ffffff"
    data-diogen-dark-bg-color="#1a1a1a"
    data-diogen-dark-surface-bg-color="#2d2d2d"
    data-diogen-dark-user-bg-color="#3a3a3a"
    data-diogen-dark-border-color="#404040">
</script>
```

## 💻 JavaScript API

### Программное изменение стилей
```javascript
// Изменить отдельные стили
DiogenChat.updateStyles({
    primaryColor: '#ff6b35',
    buttonSize: '80px',
    width: '650px'
});

// Обновить полную конфигурацию
DiogenChat.updateConfig({
    primaryColor: '#4CAF50',
    darkPrimaryColor: '#81C784',
    position: 'top-right',
    theme: 'dark'
});

// Получить текущую конфигурацию
const config = DiogenChat.getConfig();
console.log(config);

// Получить текущую тему
const theme = DiogenChat.getCurrentTheme();
console.log(theme); // 'light', 'dark', 'auto'
```

### Управление темами
```javascript
// Установить тему
DiogenChat.setTheme('dark');

// Переключить на следующую тему
DiogenChat.toggleTheme();
```

## ⚡ Преимущества нового подхода

✅ **Высокий приоритет** - Стили через атрибуты переопределяют CSS  
✅ **Простота** - Нет необходимости редактировать CSS файлы  
✅ **Гибкость** - Разные настройки для светлой и темной тем  
✅ **Централизация** - Все настройки в одном месте  
✅ **Динамичность** - Можно программно изменять через JavaScript  

## 🎯 Примеры использования

### Корпоративные цвета
```html
<script src="diogen-chat-widget.js"
    data-diogen-project="company"
    data-diogen-primary-color="#1976d2"
    data-diogen-primary-hover-color="#1565c0"
    data-diogen-dark-primary-color="#42a5f5">
</script>
```

### Минималистичный дизайн
```html
<script src="diogen-chat-widget.js"
    data-diogen-project="minimal"
    data-diogen-border-radius="4px"
    data-diogen-primary-color="#000000"
    data-diogen-bg-color="#ffffff"
    data-diogen-font-family="'Helvetica Neue', sans-serif"
    data-diogen-button-size="70px"
    data-diogen-input-radius="25px"
    data-diogen-title="Чат-бот">
</script>
```

### Позиционирование сверху
```html
<script src="diogen-chat-widget.js"
    data-diogen-project="top-chat"
    data-diogen-position="top-right"
    data-diogen-top-offset="20px"
    data-diogen-right-offset="20px">
</script>
```

## 🔧 Миграция с CSS

### Старый способ (CSS)
```css
:root {
    --diogen-primary-color: #ff6b35;
    --diogen-width: 600px;
}
```

### Новый способ (атрибуты)
```html
<script src="diogen-chat-widget.js"
    data-diogen-primary-color="#ff6b35"
    data-diogen-width="600px">
</script>
```

## 📚 Дополнительные возможности

### Условная стилизация
```javascript
// Пример: изменение стилей в зависимости от времени суток
const hour = new Date().getHours();
const isNight = hour < 6 || hour > 22;

DiogenChat.updateStyles({
    theme: isNight ? 'dark' : 'light',
    primaryColor: isNight ? '#4CAF50' : '#2196F3'
});
```

### Адаптивные размеры
```javascript
// Пример: адаптация под размер экрана
const isMobile = window.innerWidth < 768;

DiogenChat.updateStyles({
    width: isMobile ? '100vw' : '600px',
    height: isMobile ? '100vh' : '700px',
    buttonSize: isMobile ? '50px' : '70px'
});
```

## ❗ Важные замечания

- Атрибуты имеют приоритет над CSS переменными
- Если атрибут не указан, используется значение из CSS
- Все изменения применяются мгновенно
- Настройки тем сохраняются в localStorage
- Поддерживается горячая замена стилей через JavaScript API 