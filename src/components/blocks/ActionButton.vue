<template>
  <div class="action-block" :class="blockClasses">
    <div class="action-content">
      <div v-if="hasHeader" class="action-header">
        <h4 v-if="block.title" class="action-title">
          {{ block.title }}
        </h4>
        <p v-if="block.description" class="action-description">
          {{ block.description }}
        </p>
      </div>
      
      <div v-if="block.content" class="action-body" v-html="block.content" />
      
      <div class="action-buttons">
        <button 
          v-if="primaryButton"
          @click="handleAction('primary')"
          class="action-button action-button-primary"
          :class="primaryButtonClasses"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="button-spinner">⚪</span>
          <span v-else-if="primaryButton.icon" class="button-icon">{{ primaryButton.icon }}</span>
          <span class="button-text">{{ primaryButton.label }}</span>
        </button>
        
        <button 
          v-if="secondaryButton"
          @click="handleAction('secondary')"
          class="action-button action-button-secondary"
          :class="secondaryButtonClasses"
          :disabled="isLoading"
        >
          <span v-if="secondaryButton.icon" class="button-icon">{{ secondaryButton.icon }}</span>
          <span class="button-text">{{ secondaryButton.label }}</span>
        </button>
        
        <!-- Дополнительные кнопки -->
        <button 
          v-for="(button, index) in additionalButtons" 
          :key="index"
          @click="handleAction('additional', index)"
          class="action-button action-button-additional"
          :class="getAdditionalButtonClasses(button)"
          :disabled="isLoading"
        >
          <span v-if="button.icon" class="button-icon">{{ button.icon }}</span>
          <span class="button-text">{{ button.label }}</span>
        </button>
      </div>
      
      <!-- Дополнительная информация -->
      <div v-if="block.action_params?.hint" class="action-hint">
        💡 {{ block.action_params.hint }}
      </div>
      
      <div v-if="block.action_params?.warning" class="action-warning">
        ⚠️ {{ block.action_params.warning }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BlockConfig } from '@/api/pageApi'

interface Props {
  block: BlockConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [data: any]
}>()

const isLoading = ref(false)

const blockClasses = computed(() => [
  `action-block-${props.block.action_mode || 'default'}`,
  {
    'is-loading': isLoading.value,
    'has-multiple-buttons': additionalButtons.value.length > 0,
  }
])

const hasHeader = computed(() => {
  return !!(props.block.title || props.block.description)
})

const primaryButton = computed(() => {
  const params = props.block.action_params
  if (!params?.primary) return null
  
  return {
    label: params.primary.label || params.primary || 'Действие',
    icon: params.primary.icon,
    variant: params.primary.variant || 'primary',
    size: params.primary.size || 'normal',
  }
})

const secondaryButton = computed(() => {
  const params = props.block.action_params
  if (!params?.secondary) return null
  
  return {
    label: params.secondary.label || params.secondary || 'Отмена',
    icon: params.secondary.icon,
    variant: params.secondary.variant || 'secondary',
    size: params.secondary.size || 'normal',
  }
})

const additionalButtons = computed(() => {
  const params = props.block.action_params
  return params?.additional || []
})

const primaryButtonClasses = computed(() => {
  if (!primaryButton.value) return []
  
  return [
    `button-${primaryButton.value.variant}`,
    `button-size-${primaryButton.value.size}`,
  ]
})

const secondaryButtonClasses = computed(() => {
  if (!secondaryButton.value) return []
  
  return [
    `button-${secondaryButton.value.variant}`,
    `button-size-${secondaryButton.value.size}`,
  ]
})

function getAdditionalButtonClasses(button: any) {
  return [
    `button-${button.variant || 'outline'}`,
    `button-size-${button.size || 'normal'}`,
  ]
}

async function handleAction(type: string, index?: number) {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    const actionData = {
      blockId: props.block.id,
      action: type,
      index,
      params: props.block.action_params,
    }
    
    console.log('🎯 Button action:', actionData)
    emit('action', actionData)
    
    // Имитируем задержку для демонстрации loading состояния
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.action-block {
  @apply p-6;
}

/* Заголовок */
.action-header {
  @apply mb-4;
}

.action-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.action-description {
  @apply text-gray-600 leading-relaxed;
}

/* Содержимое */
.action-body {
  @apply text-gray-700 mb-4;
}

/* Кнопки */
.action-buttons {
  @apply flex flex-wrap gap-3 mb-4;
}

.action-button {
  @apply inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-300;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.action-button:not(:disabled):hover {
  @apply transform -translate-y-0.5 shadow-lg;
}

/* Размеры кнопок */
.button-size-small {
  @apply px-3 py-1.5 text-sm;
}

.button-size-normal {
  @apply px-4 py-2 text-base;
}

.button-size-large {
  @apply px-6 py-3 text-lg;
}

/* Варианты кнопок */
.button-primary {
  @apply bg-blue-600 text-white border border-blue-600;
  @apply hover:bg-blue-700 focus:ring-blue-500;
}

.button-secondary {
  @apply bg-gray-600 text-white border border-gray-600;
  @apply hover:bg-gray-700 focus:ring-gray-500;
}

.button-success {
  @apply bg-green-600 text-white border border-green-600;
  @apply hover:bg-green-700 focus:ring-green-500;
}

.button-warning {
  @apply bg-yellow-600 text-white border border-yellow-600;
  @apply hover:bg-yellow-700 focus:ring-yellow-500;
}

.button-danger {
  @apply bg-red-600 text-white border border-red-600;
  @apply hover:bg-red-700 focus:ring-red-500;
}

.button-outline {
  @apply bg-transparent text-gray-700 border border-gray-300;
  @apply hover:bg-gray-50 focus:ring-gray-500;
}

.button-ghost {
  @apply bg-transparent text-gray-700 border border-transparent;
  @apply hover:bg-gray-100 focus:ring-gray-500;
}

/* Элементы кнопки */
.button-icon {
  @apply text-lg;
}

.button-text {
  @apply font-medium;
}

.button-spinner {
  @apply animate-spin text-lg;
}

/* Дополнительные элементы */
.action-hint {
  @apply p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700;
}

.action-warning {
  @apply p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700;
}

/* Стили для разных режимов блока */
.action-block-primary {
  @apply border-l-4 border-blue-500 bg-blue-50;
}

.action-block-success {
  @apply border-l-4 border-green-500 bg-green-50;
}

.action-block-warning {
  @apply border-l-4 border-yellow-500 bg-yellow-50;
}

.action-block-danger {
  @apply border-l-4 border-red-500 bg-red-50;
}

/* Состояние загрузки */
.action-block.is-loading {
  @apply opacity-75;
}

/* Адаптивность */
@media (max-width: 640px) {
  .action-buttons {
    @apply flex-col;
  }
  
  .action-button {
    @apply w-full justify-center;
  }
}

/* Анимации */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 