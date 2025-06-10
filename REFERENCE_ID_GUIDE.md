# Руководство по работе с Reference ID

## Обзор

Система динамических `reference_id` позволяет автоматически генерировать уникальные идентификаторы запросов на основе переменных окружения и текущего времени, вместо статических значений, прописанных в конфигах.

## Формат Reference ID

```
PROJECT_ID.USER_ID.TIMESTAMP
```

- **PROJECT_ID** - ID проекта из `VITE_PROJECT_ID` (по умолчанию: 000)
- **USER_ID** - ID пользователя из `VITE_USER_ID` (по умолчанию: 3654823)  
- **TIMESTAMP** - Unix timestamp в секундах

Пример: `000.3654823.1745947893`

## Настройка переменных окружения

Добавьте в файл `.env`:

```env
# Reference ID Configuration
VITE_PROJECT_ID=000
VITE_USER_ID=3654823
```

## Как это работает

### 1. Удаление статических reference_id из конфигов

Старый формат (больше не используется):
```json
{
  "component_name": "info_panel",
  "action_params": [
    {
      "variable": "reference_id",
      "data": "000.3654823.1745947893"
    }
  ]
}
```

Новый формат (без статического reference_id):
```json
{
  "component_name": "info_panel", 
  "action_params": [
    {
      "variable": "keys",
      "data": ["19003", "19004"]
    }
  ]
}
```

### 2. Автоматическое внедрение reference_id

При загрузке конфига система автоматически:
- Генерирует новый `reference_id` или использует существующий из localStorage
- Добавляет `reference_id` ко всем блокам в конфиге
- Сохраняет `reference_id` в localStorage для повторного использования

### 3. Управление Reference ID

В интерфейсе приложения добавлена кнопка "🆔 ID" в навигации, которая открывает панель управления:

- **Просмотр** текущего reference_id
- **Создание** нового reference_id
- **Очистка** сохраненного reference_id
- **Обновление** информации

## API функции

### `generateReferenceId()`
Генерирует новый уникальный reference_id.

### `getOrCreateReferenceId()`
Возвращает существующий reference_id или создает новый.

### `saveReferenceId(id: string)`
Сохраняет reference_id в localStorage.

### `getCurrentReferenceId()`
Получает текущий reference_id из localStorage.

### `clearReferenceId()`
Удаляет сохраненный reference_id.

### `injectReferenceId(treeBlocks: TreeBlock[])`
Автоматически внедряет reference_id во все блоки конфига.

## Преимущества

1. **Уникальность** - каждый запрос имеет уникальный идентификатор
2. **Отслеживаемость** - можно отследить историю запросов по timestamp
3. **Гибкость** - легко изменять PROJECT_ID и USER_ID через переменные окружения
4. **Персистентность** - reference_id сохраняется между сессиями
5. **Отсутствие конфликтов** - нет статических значений в конфигах

## Миграция существующих конфигов

Для миграции существующих конфигов:

1. Удалите все параметры `reference_id` из JSON конфигов
2. Система автоматически добавит динамические reference_id при загрузке
3. Настройте переменные окружения `VITE_PROJECT_ID` и `VITE_USER_ID`

## Отладка

Система выводит подробные логи в консоль:
- Генерация новых reference_id
- Внедрение в конфиги
- Сохранение/загрузка из localStorage
- Обработка каждого блока конфига

Пример логов:
```
🆔 [generateReferenceId] Генерируем новый reference_id: {...}
🔧 [injectReferenceId] Внедряем reference_id: 000.3654823.1745947893
  🔍 Обрабатываем блок: info_panel
    ➕ Добавляем reference_id: 000.3654823.1745947893
✅ [injectReferenceId] reference_id успешно внедрен во все блоки
``` 