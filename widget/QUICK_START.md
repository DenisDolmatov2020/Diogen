# 🚀 Diogen Chat Widget - Быстрый старт

## ⚡ Интеграция за 2 минуты

Добавьте эти строки в ваш HTML перед закрывающим тегом `</body>`:

```html
<!-- Стили виджета -->
<link rel="stylesheet" href="https://your-domain.com/diogen-chat-widget.min.css">

<!-- Скрипт виджета -->
<script src="https://your-domain.com/diogen-chat-widget.min.js" 
        data-diogen-project="YOUR_PROJECT_ID"></script>
```

**Замените `YOUR_PROJECT_ID` на ваш ID проекта!**

## 🆔 Получение Project ID

1. Перейдите на сайт Diogen
2. Войдите в личный кабинет
3. Скопируйте Project ID из настроек проекта

## ⚙️ Быстрая настройка

```html
<script src="https://your-domain.com/diogen-chat-widget.min.js" 
        data-diogen-project="pfki"
        data-diogen-position="bottom-right"
        data-diogen-button-size="60px"
        data-diogen-width="520px"
        data-diogen-height="600px"></script>
```

## 🎨 Изменение цветов

```css
<style>
:root {
    --diogen-primary-color: #28a745;
    --diogen-primary-hover: #218838;
    --diogen-button-size: 70px;
}
</style>
```

## 🔧 JavaScript API

```javascript
// Открыть чат программно
DiogenChat.openChat();

// Закрыть чат
DiogenChat.closeChat();

// Сменить проект
DiogenChat.setProject('new_project_id');

// Полноэкранный режим
DiogenChat.toggleFullscreen();
```

## 🌟 Новые возможности v2.0

- ✅ **Встроенный чат** - без iframe, прямое взаимодействие с API
- ✅ **Быстрая загрузка** - оптимизированный код (~20KB)
- ✅ **Красивый интерфейс** - современный дизайн с анимациями
- ✅ **Адаптивность** - отлично работает на мобильных устройствах
- ✅ **Полная кастомизация** - CSS переменные для стилизации
- ✅ **Безопасность** - нет внешних iframe
- ✅ **Производительность** - время загрузки < 100ms

## 🧪 Тестирование

Откройте `example.html` в браузере для тестирования всех функций.

## 📊 Технические характеристики

- **Размер JS:** ~13 KB (минифицированный)
- **Размер CSS:** ~7 KB (минифицированный)
- **Поддержка браузеров:** Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Мобильные устройства:** iOS 12+, Android 7+

## 📞 Поддержка

- **Email:** support@diogen.com
- **Telegram:** @diogen_support

---

**Время интеграции:** < 2 минуты | **Поддержка всех современных браузеров** | **Размер:** JS 13KB + CSS 7KB (gzip ~8KB) 