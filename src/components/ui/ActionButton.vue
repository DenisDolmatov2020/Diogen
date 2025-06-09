<template>
  <div class="action-button-container" :class="buttonId">
    <!-- Для чата: отображаем все items как отдельные кнопки -->
    <div v-if="!skeleton && data.items && data.items.length > 0" class="chat-buttons">
      <button
        v-for="(item, index) in data.items"
        :key="index"
        @click="handleItemClick(item)"
        :disabled="loading"
        class="chat-action-button"
      >
        <span v-if="loading" class="animate-spin mr-2">⟳</span>
        {{ item.title }}
      </button>
    </div>
    
    <!-- Fallback: основная кнопка для других случаев -->
    <button
      v-else-if="!skeleton"
      @click="handleClick"
      :disabled="loading"
      :class="buttonClasses"
    >
      <span v-if="loading" class="animate-spin mr-2">⟳</span>
      {{ buttonText }}
    </button>
    
    <!-- Skeleton состояние -->
    <div v-else class="skeleton-button"></div>
    
    <!-- Дочерние элементы -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import type { TreeBlock, Item } from '@/types/block'
import { useChangesStore } from '@/stores/changesStore'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const emit = defineEmits<{
  action: [data: { type: string; payload: any; blockData?: any }]
}>()

const loading = ref(false)
const changesStore = useChangesStore()

// Состояние редактирования для каждого элемента
const editingStates = reactive<Record<string, boolean>>({})
// Временные значения для редактирования
const editingValues = reactive<Record<string, string>>({})

const buttonText = computed(() => {
  // Если есть items, берем заголовок первого элемента
  if (props.data.items && props.data.items.length > 0) {
    const firstItem = props.data.items[0]
    return firstItem.title || 'Действие'
  }
  
  // Извлекаем текст кнопки из action_params
  const keysParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'keys')
  if (keysParam?.data?.[0]) {
    return getButtonLabel(keysParam.data[0])
  }
  return 'Действие'
})

const buttonClasses = computed(() => {
  const baseClasses = [
    'px-4', 'py-2', 'rounded-lg', 'font-medium', 'transition-colors',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2'
  ]
  
  if (props.data.action_mode === 'editable_layout') {
    baseClasses.push(
      'bg-blue-600', 'text-white', 'hover:bg-blue-700',
      'focus:ring-blue-500', 'disabled:bg-blue-300'
    )
  } else {
    baseClasses.push(
      'bg-gray-600', 'text-white', 'hover:bg-gray-700',
      'focus:ring-gray-500', 'disabled:bg-gray-300'
    )
  }
  
  return baseClasses
})

const getItemTitleClass = computed(() => (item: Item) => {
  const classes = ['item-title']
  
  if (item.status === 'processed') {
    classes.push('title-processed')
  } else if (item.status === 'missed') {
    classes.push('title-missed')
  } else if (item.status === 'unprocessed') {
    classes.push('title-unprocessed')
  }
  
  return classes.join(' ')
})

// Получение класса для статуса
function getStatusClass(status: string): string {
  return status === 'missed' ? 'status-missed' : 
         status === 'normal' ? 'status-normal' : 
         status === 'unprocessed' ? 'status-unprocessed' : ''
}

// Получение класса для fate
function getFateClass(fate: string): string {
  return fate === 'active' ? 'fate-active' : 
         fate === 'completed' ? 'fate-completed' : 
         fate === 'pending' ? 'fate-pending' : ''
}

// Получение текста статуса  
function getStatusText(status: string): string {
  switch (status) {
    case 'missed': return 'Пропущено'
    case 'normal': return 'Готово'
    case 'unprocessed': return 'В процессе'
    default: return status
  }
}

// Получение текста fate
function getFateText(fate: string): string {
  switch (fate) {
    case 'active': return 'Активно'
    case 'completed': return 'Завершено'
    case 'pending': return 'Ожидает'
    default: return fate
  }
}

function getButtonLabel(key: string): string {
  // Маппинг ключей на человекочитаемые названия
  const labels: Record<string, string> = {
    '11071': 'Сохранить',
    'create_order': 'Создать заказ',
    'edit_article': 'Редактировать статью',
    'project_value': 'Сохранить проект'
  }
  
  return labels[key] || key
}

// Проверка, редактируется ли элемент
function isEditing(item: Item): boolean {
  return !!item.variable && editingStates[item.variable]
}

// Начать редактирование элемента
function startEditing(item: Item) {
  if (item.variable) {
    editingStates[item.variable] = true
    editingValues[item.variable] = item.hidden_data || ''
  }
}

// Отменить редактирование
function cancelEditing(item: Item) {
  if (item.variable) {
    editingStates[item.variable] = false
    delete editingValues[item.variable]
  }
}

// Сохранить изменения элемента
function saveItemChange(item: Item) {
  if (!item.variable) return
  
  const newValue = editingValues[item.variable]
  const originalValue = item.hidden_data
  
  if (newValue !== originalValue) {
    // Добавляем изменение в store с новой структурой
    changesStore.addChange({
      blockId: props.data.components_id || props.data.component_name || 'unknown',
      itemIndex: props.data.items?.indexOf(item) || 0,
      field: item.variable,
      oldValue: originalValue,
      newValue: newValue
    })
  }
  
  // Завершаем редактирование
  editingStates[item.variable] = false
  delete editingValues[item.variable]
}

// Получение отображаемого значения
function getDisplayValue(item: Item): string {
  if (typeof item.data === 'string') {
    return item.data
  } else if (typeof item.data === 'object' && item.data !== null) {
    // Безопасное обращение к свойствам
    const dataObj = item.data as any
    return dataObj.text || dataObj.title || String(item.data)
  }
  return String(item.data || '')
}

// Проверка, изменен ли элемент
function isItemChanged(item: Item): boolean {
  if (!item.variable) return false
  
  const blockId = props.data.components_id || props.data.component_name || 'unknown'
  const itemIndex = props.data.items?.indexOf(item) || 0
  
  const changes = changesStore.getChangesByBlock(blockId)
  return changes.some(c => c.itemIndex === itemIndex && c.field === item.variable)
}

async function handleClick() {
  loading.value = true
  
  try {
    // Получаем ключ действия
    const keysParam = props.data.action_params?.find(
      (p: { variable: string }) => p.variable === 'keys')
    const actionKey = keysParam?.data?.[0]
    
    // Генерируем тип действия в зависимости от режима
    let actionType = 'button_click'
    let fieldChanges: Record<string, any> | null = null
    
    // Если это кнопка сохранения, собираем изменения с соседних текстовых полей
    if (actionKey === '11071' || props.data.action_mode === 'submit') {
      actionType = 'save_changes'
      
      // Собираем изменения с соседних текстовых полей
      fieldChanges = collectTextFieldChanges()
      
      // Если нет изменений, выводим сообщение и выходим
      if (!fieldChanges || Object.keys(fieldChanges).length === 0) {
        console.log('⚠️ Нет изменений для сохранения')
        // Для целей отладки - показываем сообщение в консоли
        return
      }
      
      console.log('💾 Кнопка сохранения: найдены изменения:', fieldChanges)
    }
    
    // Эмитим событие с данными действия
    emit('action', {
      type: actionType,
      payload: {
        component_name: props.data.component_name,
        action_mode: props.data.action_mode,
        action_params: props.data.action_params,
        key: actionKey,
        fieldChanges // Добавляем изменения полей, если есть
      }
    })
    
    // Имитируем задержку для демонстрации
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

// Функция для сбора изменений с текстовых полей
function collectTextFieldChanges(): Record<string, any> | null {
  // Найдем родительский блок
  const parentBlock = findParentBlock()
  if (!parentBlock) return null
  
  // Ищем все текстовые поля внутри блока
  const textBlocks = findTextBlocks(parentBlock)
  if (!textBlocks.length) return null
  
  // Собираем изменения со всех текстовых полей
  const changes: Record<string, any> = {}
  let hasChanges = false
  
  textBlocks.forEach(textBlock => {
    // Вызываем метод getFieldChanges для получения изменений
    if (textBlock && textBlock.exposed) {
      const fieldChanges = textBlock.exposed.getFieldChanges?.()
      if (fieldChanges) {
        changes[fieldChanges.field] = fieldChanges.value
        hasChanges = true
      }
    }
  })
  
  return hasChanges ? changes : null
}

// Функция для поиска родительского блока
function findParentBlock(): HTMLElement | null {
  // Получаем DOM элемент кнопки
  const buttonEl = document.querySelector(`.${buttonId}`)
  if (!buttonEl) return null
  
  // Ищем ближайший родительский block-wrapper
  return buttonEl.closest('.block-wrapper')
}

// Функция для поиска текстовых полей внутри блока
function findTextBlocks(parentBlock: HTMLElement | null): any[] {
  if (!parentBlock) return []
  
  // Получаем все Vue компоненты текстовых блоков
  // Это сложно сделать точно без Vue refs, но можем попробовать найти через DOM
  const textBlockEls = parentBlock.querySelectorAll('.text-block-wrapper')
  
  // Собираем Vue компоненты
  const textBlocks: any[] = []
  textBlockEls.forEach((el: Element) => {
    // Получаем Vue компонент из DOM элемента
    const textBlock = getVueComponent(el)
    if (textBlock) {
      textBlocks.push(textBlock)
    }
  })
  
  return textBlocks
}

// Функция для получения Vue компонента из DOM элемента
function getVueComponent(el: Element): any {
  // Vue 3 хранит компонент в __vnode свойстве
  return (el as any).__vnode || (el as any).__vue__ || (el as any)._vnode
}

// Добавляем уникальный класс компоненту для легкого поиска
const buttonId = `action-button-${props.data.component_name || Math.random().toString(36).substring(2, 9)}`

// Новый метод для обработки кликов по кнопкам из items
function handleItemClick(item: Item) {
  console.log('🎯 Клик по кнопке из items:', item)
  
  emit('action', {
    type: 'button_click',
    payload: {
      title: item.title,
      data: item.data,
      status: item.status,
      ...(item.variable && { variable: item.variable })
    },
    blockData: {
      items: [item],
      component_name: props.data.component_name
    }
  })
}
</script>

<style scoped>
.action-button-container {
  @apply flex flex-col gap-2 w-full;
}

/* Стили для кнопок чата */
.chat-buttons {
  @apply flex flex-wrap gap-3;
}

.chat-action-button {
  @apply w-full text-sm font-medium transition-colors border-0;
  min-width: 67px;
  gap: 12px;
  border-radius: 50px;
  padding: 14px 22px;
  background: var(--desktop-surface-background-blue, #33AFE1);
  color: white;
  font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: 0;
}

.chat-action-button:hover {
  background: #2A9BC7;
}

.chat-action-button:focus {
  @apply outline-none;
  box-shadow: 0 0 0 2px rgba(51, 175, 225, 0.3);
}

.chat-action-button:active {
  @apply transform scale-95;
}

.chat-action-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.skeleton-button {
  @apply h-10 bg-gray-300 rounded-lg animate-pulse;
  width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-buttons {
    @apply flex-col;
    gap: 8px;
  }
  
  .chat-action-button {
    @apply w-full justify-center;
    padding: 12px 18px;
    font-size: 14px;
  }
}

/* Стили для списка элементов */
.items-list {
  @apply mt-3 space-y-2;
}

.item-row {
  @apply p-3 border border-gray-200 rounded-lg bg-gray-50;
}

.item-row.item-missed {
  @apply border-red-300 bg-red-50;
}

.item-row.item-normal {
  @apply border-green-300 bg-green-50;
}

.item-row.item-unprocessed {
  @apply border-gray-300 bg-gray-50;
}

.item-content {
  @apply space-y-1;
}

.item-title {
  @apply font-medium text-gray-900;
}

.item-data {
  @apply text-sm text-gray-700 font-mono;
}

.item-hidden {
  @apply text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded;
}

.item-meta {
  @apply mt-2 flex gap-2 text-xs;
}

.item-status {
  @apply px-2 py-1 rounded;
}

.status-normal {
  @apply bg-green-100 text-green-800;
}

.status-missed {
  @apply bg-red-100 text-red-800;
}

.status-unprocessed {
  @apply bg-gray-100 text-gray-800;
}

.item-fate {
  @apply px-2 py-1 rounded;
}

.fate-editable {
  @apply bg-blue-100 text-blue-800;
}

.fate-readonly {
  @apply bg-gray-100 text-gray-600;
}

/* Стили для редактирования */
.changed-indicator {
  @apply text-orange-500 font-bold ml-2;
}

.item-editable {
  @apply mt-2;
}

.view-mode {
  @apply space-y-2;
}

.edit-mode {
  @apply space-y-3;
}

.edit-button {
  @apply text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors;
}

.edit-textarea {
  @apply w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y;
}

.edit-buttons {
  @apply flex gap-2;
}

.save-button {
  @apply text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors;
}

.cancel-button {
  @apply text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors;
}

.item-hidden.readonly {
  @apply opacity-75 cursor-default;
}
</style> 