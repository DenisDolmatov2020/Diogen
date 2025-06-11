<template>
  <div class="text-block-wrapper" :class="{ editable: isEditable, modified: isModified }">
    <!-- Если есть items, показываем их -->
    <div v-if="data.items && data.items.length > 0" class="items-container">
      <div v-for="(item, index) in data.items" :key="index" :class="getItemClass">
        <!-- Заголовок элемента -->
        <div v-if="item.title" class="item-title">
          {{ item.title }}
          <span v-if="isItemModified(item)" class="modified-indicator">•</span>
        </div>
        
        <!-- Редактируемое поле для editable элементов -->
        <div v-if="item.fate === 'editable'" class="edit-field">
          <!-- Многострочное поле -->
          <textarea 
            v-if="isItemMultiline(item)"
            v-model="editableValues[item.variable!]"
            :placeholder="getItemPlaceholder(item)"
            class="editable-input multiline"
            @input="handleItemInput"
          ></textarea>
          
          <!-- Однострочное поле -->
          <input 
            v-else
            type="text"
            v-model="editableValues[item.variable!]"
            :placeholder="getItemPlaceholder(item)"
            class="editable-input"
            @input="handleItemInput"
          />
        </div>
        
        <!-- Режим просмотра для readonly элементов -->
        <div v-else class="text-content">
          <div v-html="formatText(item.data)"></div>
        </div>
        
        <!-- Скрытые данные -->
        <div v-if="item.hidden_data" class="item-hidden">
          💡 {{ item.hidden_data }}
        </div>
        
        <!-- Метаинформация -->
        <!-- <div class="item-meta">
          <span v-if="item.status" class="item-status" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </span>
          <span class="item-fate" :class="getFateClass(item.fate || '')">
            {{ getFateText(item.fate || '') }}
          </span>
        </div> -->
      </div>
    </div>
    
    <!-- Fallback на старую логику, если items нет -->
    <div v-else>
      <!-- Заголовок блока, если есть -->
      <div v-if="getTitle()" class="text-block-title">
        {{ getTitle() }}
        <span v-if="isModified" class="modified-indicator">•</span>
      </div>
      
      <!-- Редактируемое поле -->
      <div v-if="isEditable" class="edit-field">
        <!-- Многострочное поле -->
        <textarea 
          v-if="isMultiline"
          v-model="editableValue"
          :placeholder="getPlaceholder()"
          class="editable-input multiline"
          @input="handleInput"
        ></textarea>
        
        <!-- Однострочное поле -->
        <input 
          v-else
          type="text"
          v-model="editableValue"
          :placeholder="getPlaceholder()"
          class="editable-input"
          @input="handleInput"
        />
        
        <!-- Лейбл поля, если есть -->
        <div v-if="getLabel()" class="input-label">
          {{ getLabel() }}
        </div>
      </div>
      
      <!-- Режим просмотра (не редактирования) -->
      <div v-else class="text-content">
        <div v-html="formatText(getContent())"></div>
      </div>
    </div>
    
    <!-- Слот для дочерних элементов -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import type { TreeBlock, Item, ItemData } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

// Значение для редактирования (старая логика)
const editableValue = ref('')
// Оригинальное значение (для сравнения изменений)
const originalValue = ref('')
// Флаг, указывающий, было ли поле изменено
const isModified = ref(false)

// Значения для редактирования items
const editableValues = reactive<Record<string, string>>({})
const originalValues = reactive<Record<string, string>>({})

// Признак того, что это редактируемое поле
const isEditable = computed(() => {
  return props.data.action_mode === 'editable_layout'
})

// Получение имени поля (ключа)
const fieldKey = computed(() => {
  const keysParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'keys')
  return keysParam?.data?.[0] || 'text'
})

// Многострочное ли поле
const isMultiline = computed(() => {
  // Если поле описания или комментария, то многострочное
  const key = fieldKey.value.toLowerCase()
  return key.includes('description') || 
         key.includes('comment') || 
         key.includes('justification') ||
         key.includes('aim') ||
         key.includes('task') ||
         key.includes('relevance')
})

// Получение заголовка поля
function getTitle() {
  // Пытаемся найти title в параметрах
  const titleParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'title')
  
  if (titleParam?.data) {
    return titleParam.data
  }
  
  // Иначе преобразуем имя поля в человекочитаемый заголовок
  return formatFieldName(fieldKey.value)
}

// Получение метки поля
function getLabel() {
  // Пытаемся найти label в параметрах
  const labelParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'label')
  
  if (labelParam?.data) {
    return labelParam.data
  }
  
  return null
}

// Получение плейсхолдера
function getPlaceholder() {
  // Пытаемся найти placeholder в параметрах
  const placeholderParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'placeholder')
  
  if (placeholderParam?.data) {
    return placeholderParam.data
  }
  
  return `Введите ${getTitle().toLowerCase()}`
}

// Получение содержимого
function getContent() {
  // Ищем параметр с именем поля
  const valueParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === fieldKey.value)
  
  if (valueParam?.data) {
    return valueParam.data
  }
  
  // Ищем в data параметре если он есть
  const dataParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'data')
  
  if (dataParam?.data) {
    return dataParam.data
  }
  
  // Возвращаем пустую строку вместо текста "не задано"
  return ''
}

// Форматирование имени поля
function formatFieldName(name: string) {
  if (!name) return 'Текст'
  
  // Разбиваем snake_case или camelCase на слова
  const words = name
    .replace(/([A-Z])/g, ' $1') // Разбиваем camelCase
    .replace(/_/g, ' ') // Разбиваем snake_case
    .toLowerCase()
    .split(' ')
  
  // Делаем первую букву заглавной для каждого слова
  const formattedWords = words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  )
  
  return formattedWords.join(' ')
}

// Функция для форматирования текста
function formatText(text: string | undefined | null | ItemData): string {
  if (!text) return ''
  
  let formatted = text.toString()
  
  // Обрабатываем переносы строк
  formatted = formatted
    .replace(/\\r\\n/g, '\n') // \r\n -> \n
    .replace(/\\n/g, '\n')   // \n -> \n
    .replace(/\r\n/g, '\n')  // реальные \r\n -> \n
    .replace(/\r/g, '\n')    // одиночные \r -> \n
  
  // Обрабатываем ссылки
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-link">$1</a>')
  
  // Обрабатываем переносы строк для HTML
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

// Обработчик изменения значения
function handleInput() {
  // Теперь только отмечаем, что поле изменилось, но не отправляем событие
  isModified.value = editableValue.value !== originalValue.value
}

// Инициализация значений для items
onMounted(() => {
  if (props.data.items) {
    props.data.items.forEach(item => {
      const value = item.data?.toString() || ''
      editableValues[item.variable!] = value
      originalValues[item.variable!] = value
    })
  }
})

// Получение класса для элемента
function getItemClass(): string[] {
  const classes = ['text-item']
  
  // if (item.fate === 'editable') {
  //   classes.push('item-editable')
  // }
  
  // if (item.status === 'missed') {
  //   classes.push('item-missed')
  // } else if (item.status === 'normal') {
  //   classes.push('item-normal')
  // }
  
  return classes
}

// Проверка, изменен ли элемент
function isItemModified(item: Item): boolean {
  return editableValues[item.variable!] !== originalValues[item.variable!]
}

// Проверка, многострочное ли поле для элемента
function isItemMultiline(item: Item): boolean {
  const variable = item.variable!.toLowerCase()
  return variable.includes('description') || 
         variable.includes('comment') || 
         variable.includes('justification') ||
         variable.includes('aim') ||
         variable.includes('task') ||
         variable.includes('relevance')
}

// Получение плейсхолдера для элемента
function getItemPlaceholder(item: Item): string {
  return `Введите ${(item.title || 'значение').toLowerCase()}`
}

// Обработчик изменения значения элемента
function handleItemInput() {
  // Просто отмечаем изменение, не отправляем событие
}

// Публичный метод для получения изменений (обновленный для поддержки items)
function getFieldChanges() {
  let hasChanges = false
  const changes: Record<string, any> = {}
  
  // Проверяем изменения в items
  if (props.data.items) {
    props.data.items.forEach(item => {
      if (item.fate === 'editable' && isItemModified(item)) {
        changes[item.variable!] = editableValues[item.variable!]
        hasChanges = true
      }
    })
  }
  
  // Проверяем изменения в старой логике
  if (isModified.value) {
    changes[fieldKey.value] = editableValue.value
    hasChanges = true
  }
  
  return hasChanges ? changes : null
}

// Обновляем редактируемое значение при изменении данных
watch(() => props.data, () => {
  const content = getContent()
  editableValue.value = content
  originalValue.value = content
  isModified.value = false
}, { deep: true })

// Экспортируем методы, чтобы к ним могли обращаться родительские компоненты
defineExpose({
  getFieldChanges,
  isModified: computed(() => isModified.value)
})
</script>

<style scoped>
.text-block-wrapper {
  @apply bg-white border border-gray-200 rounded-lg p-3;
}

.text-block-wrapper.editable {
  @apply border-blue-300;
}

.text-block-wrapper.modified {
  @apply border-orange-400 bg-orange-50;
}

/* Стили для items */
.items-container {
  @apply space-y-3;
}

/* .text-item {
  @apply p-3 border border-gray-200 rounded bg-gray-50;
} */

.text-item.item-editable {
  @apply border-blue-300 bg-blue-50;
}

.text-item.item-missed {
  @apply border-red-300 bg-red-50;
}

.text-item.item-normal {
  @apply border-green-300 bg-green-50;
}

.item-title {
  @apply font-medium text-gray-900 mb-2 flex items-center gap-2;
}

.modified-indicator {
  @apply text-orange-500 font-bold;
}

.edit-field {
  @apply mb-2;
}

.editable-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.editable-input.multiline {
  @apply min-h-[100px] resize-y;
}

.text-content {
  @apply text-gray-900 mb-2;
}

.item-hidden {
  @apply text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded mb-2;
}

.item-meta {
  @apply flex gap-2 text-xs;
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

/* Старые стили */
.text-block-title {
  @apply font-medium text-gray-900 mb-2 flex items-center gap-2;
}

.input-label {
  @apply text-sm text-gray-600 mt-1;
}

/* Стили для ссылок */
.text-content :deep(.text-link) {
  color: #0053DA;
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.text-content :deep(.text-link:hover) {
  opacity: 0.8;
  text-decoration: underline;
}
</style>