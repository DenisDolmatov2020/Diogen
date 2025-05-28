<template>
  <div class="text-block-container p-2">
    <div v-if="!skeleton" class="text-content">
      <!-- Редактируемый режим -->
      <div v-if="isEditable" class="editable-content">
        <label v-if="label" class="text-label">{{ label }}</label>
        <textarea
          v-if="isMultiline"
          v-model="editableValue"
          @input="handleInput"
          :placeholder="placeholder"
          class="text-textarea"
          rows="4"
        />
        <input
          v-else
          v-model="editableValue"
          @input="handleInput"
          :placeholder="placeholder"
          class="text-input"
          type="text"
        />
      </div>
      
      <!-- Режим только для чтения -->
      <div v-else class="readonly-content">
        <h3 v-if="isTitle" class="text-title">{{ displayValue }}</h3>
        <p v-else class="text-paragraph">{{ displayValue }}</p>
      </div>
    </div>
    
    <!-- Skeleton состояние -->
    <div v-else class="skeleton-text">
      <div v-if="isEditable" class="skeleton-input"></div>
      <div v-else-if="isTitle" class="skeleton-title"></div>
      <div v-else class="skeleton-paragraph"></div>
    </div>
    
    <!-- Дочерние элементы -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BlockConfig } from '@/api/pageApi'

const props = defineProps<{
  data: BlockConfig
  skeleton: boolean
}>()

const emit = defineEmits<{
  action: [data: { type: string; payload: any }]
}>()

const editableValue = ref('')

const isEditable = computed(() => {
  return props.data.action_mode === 'editable_layout'
})

const isTitle = computed(() => {
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  const key = keysParam?.data?.[0]
  return key === 'article_title' || key === 'project_name' || key === 'order_title'
})

const isMultiline = computed(() => {
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  const key = keysParam?.data?.[0]
  return key === 'article_content' || key === 'justification' || key === 'aim'
})

const label = computed(() => {
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  if (keysParam?.data?.[0]) {
    return getFieldLabel(keysParam.data[0])
  }
  return ''
})

const placeholder = computed(() => {
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  if (keysParam?.data?.[0]) {
    return getFieldPlaceholder(keysParam.data[0])
  }
  return 'Введите текст...'
})

const displayValue = computed(() => {
  if (isEditable.value) {
    return editableValue.value
  }
  
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  const referenceParam = props.data.action_params?.find(p => p.variable === 'reference_id')
  
  if (keysParam?.data?.[0]) {
    const value = getFieldValue(keysParam.data[0], referenceParam?.data)
    return value
  }
  
  return 'Текст не загружен'
})

function getFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    'article_title': 'Заголовок статьи',
    'article_content': 'Содержание статьи',
    'project_name': 'Название проекта',
    'order_title': 'Название заказа',
    '19010': 'Описание',
    'justification': 'Обоснование',
    'aim': 'Цель',
    'task': 'Задачи'
  }
  
  return labels[key] || 'Поле'
}

function getFieldPlaceholder(key: string): string {
  const placeholders: Record<string, string> = {
    'article_title': 'Введите заголовок статьи...',
    'article_content': 'Введите содержание статьи...',
    'project_name': 'Введите название проекта...',
    'order_title': 'Введите название заказа...',
    'justification': 'Введите обоснование...',
    'aim': 'Введите цель...',
    'task': 'Введите задачи...'
  }
  
  return placeholders[key] || 'Введите текст...'
}

function getFieldValue(key: string, referenceId?: string): string {
  const values: Record<string, string> = {
    'article_title': 'Новая статья о Vue.js',
    'article_content': 'Vue.js - это прогрессивный JavaScript фреймворк для создания пользовательских интерфейсов...',
    'project_name': 'Проект "Диоген"',
    'order_title': 'Новый заказ на разработку',
    '19010': 'Подробное описание элемента',
    'justification': 'Обоснование необходимости проекта...',
    'aim': 'Основная цель проекта...',
    'task': 'Список задач для выполнения...'
  }
  
  let value = values[key] || 'Значение не найдено'
  
  // Если есть reference_id, показываем, что данные загружены
  if (referenceId) {
    value += ' ✓'
  }
  
  return value
}

function handleInput() {
  emit('action', {
    type: 'text_change',
    payload: {
      component_id: props.data.components_id,
      field_key: props.data.action_params?.find(p => p.variable === 'keys')?.data?.[0],
      value: editableValue.value
    }
  })
}

// Инициализируем значение для редактируемых полей
watch(() => props.data, () => {
  if (isEditable.value && !editableValue.value) {
    editableValue.value = displayValue.value.replace(' ✓', '')
  }
}, { immediate: true })
</script>

<style scoped>
.text-block-container {
  @apply w-full;
}

.text-content {
  @apply w-full;
}

.editable-content {
  @apply space-y-2;
}

.text-label {
  @apply block text-sm font-medium text-gray-700;
}

.text-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.text-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply resize-y;
}

.readonly-content {
  @apply w-full;
}

.text-title {
  @apply text-2xl font-bold text-gray-900 mb-4;
}

.text-paragraph {
  @apply text-gray-700 leading-relaxed;
}

/* Skeleton стили */
.skeleton-text {
  @apply w-full;
}

.skeleton-input {
  @apply h-10 bg-gray-300 rounded animate-pulse;
}

.skeleton-title {
  @apply h-8 bg-gray-300 rounded animate-pulse;
  width: 60%;
}

.skeleton-paragraph {
  @apply h-4 bg-gray-300 rounded animate-pulse;
  width: 80%;
}
</style>