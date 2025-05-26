# Диоген - Новый движок для фронтенда

Обновленный движок для создания динамических интерфейсов на основе JSON-конфигураций.

## Ключевые особенности

### 🚀 Автоматическая генерация маршрутов
Роуты создаются автоматически на основе структуры JSON-файлов в папке `src/configs/project_pages/`:

```
src/configs/project_pages/
├── article/
│   ├── list.json          → /article/list
│   └── [id].json          → /article/:id
└── order/
    └── new.json           → /order/new
```

### ⚡ Быстрая загрузка с skeleton UI
1. Сначала отображается "каркас" страницы из статического JSON
2. Параллельно отправляется запрос на бэкенд для получения данных
3. UI обновляется реактивно при получении ответа

### 🧩 Компонентная архитектура
- `RoutePage` - контроллер страницы (загрузка JSON, обработка ошибок)
- `PageRenderer` - построение дерева блоков
- `BlockRenderer` - рекурсивный рендеринг компонентов
- UI-компоненты: `ActionButton`, `InfoPanel`, `ProgressBar`, `TextBlock`

### 📋 Структура JSON-конфига

```json
[
  {
    "component_name": "info_panel",
    "parent_block_id": "block-0-1-0",
    "action_mode": "deep_layout",
    "is_need_meta": true,
    "action_params": [
      {
        "variable": "keys",
        "data": ["19003", "19004", "19005"]
      }
    ]
  }
]
```

## Настройка API

### Переменные окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

```env
# API Configuration
VITE_API_AUTH_URL=http://147.45.252.39:8202
VITE_APP_FRONT_TOKEN=123456
VITE_API_BASIC_LOGIN=slsuser
VITE_API_BASIC_PASSWORD=your_password_here
VITE_API_LOGIN_ENDPOINT=api/auth/token

# Development
VITE_DEV_MODE=true
```

### Аутентификация

Система автоматически:
1. Получает токен доступа через Basic Auth
2. Добавляет Bearer токен ко всем запросам
3. Обновляет токен при истечении
4. Использует fallback на mock данные при недоступности API

### API Endpoints

```typescript
// Аутентификация
POST /api/auth/token
Authorization: Basic base64(login:password)

// Заполнение конфигурации данными
POST /api/page/fill
Authorization: Bearer {token}
Body: BlockConfig[]

// Мета-данные страницы
GET /api/page/{pageId}/meta
Authorization: Bearer {token}

// Сохранение конфигурации
PUT /api/page/{pageId}/config
Authorization: Bearer {token}
Body: BlockConfig[]

// Выполнение действий
POST /api/action/execute
Authorization: Bearer {token}
Body: ActionData
```

## Как работает

1. **Переход по роуту** → RoutePage определяет нужный JSON-файл
2. **Парсинг блоков** → PageRenderer строит дерево по `parent_block_id`
3. **Рендеринг** → BlockRenderer отображает каждый блок как Vue-компонент
4. **Загрузка данных** → Параллельный запрос на бэк для заполнения данных

## Отличия от старого движка

| Старый | Новый |
|--------|-------|
| Сложная логика выбора проекта | Автоматические роуты из файлов |
| Статические Vue-компоненты | Динамические JSON-конфиги |
| Громоздкий глобальный store | Локальное состояние страниц |
| Многослойная архитектура | Простой рекурсивный рендер |

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Добавление новой страницы

1. Создайте JSON-файл в `src/configs/project_pages/`
2. Опишите структуру блоков с `component_name` и `parent_block_id`
3. Роут создастся автоматически при следующей сборке

## Создание нового UI-компонента

1. Создайте компонент в `src/components/ui/`
2. Добавьте его в `componentMap` в `BlockRenderer.vue`
3. Компонент должен принимать пропсы `data` и `skeleton`

## Отладка

В режиме разработки доступна отладочная информация:
- Состояние загрузки страницы
- Количество блоков в конфигурации
- Детали каждого блока
- Логи API запросов в консоли

## Fallback режим

При недоступности бэкенда система автоматически переключается на mock данные, что позволяет продолжать разработку интерфейса.
