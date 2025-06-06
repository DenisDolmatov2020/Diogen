# Работа с конфигурационными файлами

## Структура проекта

Конфигурационные файлы хранятся в одном месте:
- **Публичные**: `public/configs/` - конфигурационные файлы для загрузки через HTTP

## Добавление новой страницы

### Автоматически (рекомендуется)

Используйте скрипт для создания нового конфига:

```bash
npm run add-config project-name page-name
```

Пример:
```bash
npm run add-config my-project main
npm run add-config demo settings
```

Скрипт автоматически:
- ✅ Создаст конфигурационный файл с базовым шаблоном
- ✅ Добавит маршрут в `generatedRoutes.ts` 
- ✅ Покажет URL для доступа к странице

### Вручную

### 1. Создайте конфигурационный файл

Создайте новый JSON файл в папке `public/configs/project_pages/`:

```
public/configs/project_pages/
├── test/
│   └── backend_integration.json
├── your-project/
│   ├── main.json        ← новый файл
│   └── settings.json    ← новый файл
```

### 2. Обновите список маршрутов

Добавьте путь к новому конфигу в файл `src/router/generatedRoutes.ts`:

```typescript
const configFiles = [
  '/configs/project_pages/test/backend_integration.json',
  '/configs/project_pages/your-project/main.json',        // ← добавьте новый
  '/configs/project_pages/your-project/settings.json'    // ← добавьте новый
]
```

### 3. Маршруты

Файлы автоматически становятся доступными по путям:
- `/configs/project_pages/your-project/main.json` → `/your-project/main`
- `/configs/project_pages/your-project/settings.json` → `/your-project/settings`

## Динамические маршруты

Поддерживаются параметризованные пути с использованием квадратных скобок:

```
public/configs/project_pages/
├── articles/
│   ├── list.json      → /articles/list
│   └── [id].json      → /articles/:id
├── users/
│   └── [userId]/
│       └── profile.json → /users/:userId/profile
```

## Команды

- `npm run dev` - запуск проекта
- `npm run build` - сборка проекта
- `npm run preview` - предпросмотр собранного проекта
- `npm run add-config <project> <page>` - создание нового конфига

## Важно

- ✅ Редактируйте файлы в `public/configs/`
- ✅ Добавляйте новые пути в `generatedRoutes.ts`
- ✅ Используйте динамические `reference_id` в конфигах
- ✅ Файлы в `public/` папке автоматически доступны через HTTP 