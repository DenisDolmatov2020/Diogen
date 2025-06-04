<template>
  <div class="text-block-wrapper" :class="{ editable: isEditable, modified: isModified }">
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
      {{ getContent() }}
    </div>
    
    <!-- Слот для дочерних элементов -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { TreeBlock } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const emit = defineEmits<{
  action: [data: any]
}>()

// Значение для редактирования
const editableValue = ref('')
// Оригинальное значение (для сравнения изменений)
const originalValue = ref('')
// Флаг, указывающий, было ли поле изменено
const isModified = ref(false)

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

// Обработчик изменения значения
function handleInput() {
  // Теперь только отмечаем, что поле изменилось, но не отправляем событие
  isModified.value = editableValue.value !== originalValue.value
}

// Публичный метод для получения изменений (будет вызываться ActionButton)
function getFieldChanges() {
  if (isModified.value) {
    return {
      field: fieldKey.value,
      value: editableValue.value,
      originalValue: originalValue.value,
      isModified: true
    }
  }
  return null
}

// Сброс изменений к исходному значению
function resetChanges() {
  editableValue.value = originalValue.value
  isModified.value = false
}

// Инициализация значения при монтировании
onMounted(() => {
  const content = getContent()
  editableValue.value = content
  originalValue.value = content
})

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
  resetChanges,
  isModified: computed(() => isModified.value)
})
</script>

<style scoped>
.text-block-wrapper {
  @apply w-full max-w-3xl mb-4 ml-2;
}

.text-block-title {
  @apply text-lg font-medium mb-2 text-gray-700;
  @apply flex items-center gap-2;
}

.modified-indicator {
  @apply text-blue-500 font-bold text-xl;
  animation: pulse 1.5s infinite;
}

.text-content {
  @apply text-gray-600 whitespace-pre-line;
}

/* Стили для редактируемого режима */
.editable {
  @apply border border-gray-300 rounded-lg p-4 bg-white;
  @apply transition-shadow duration-300;
  @apply hover:shadow-md;
}

.editable.modified {
  @apply border-blue-400 bg-blue-50;
}

.edit-field {
  @apply relative;
}

.editable-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors duration-200;
}

.editable.modified .editable-input {
  @apply border-blue-400;
}

.editable-input.multiline {
  @apply min-h-[100px] resize-y;
}

.input-label {
  @apply mt-1 text-xs text-gray-500;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>