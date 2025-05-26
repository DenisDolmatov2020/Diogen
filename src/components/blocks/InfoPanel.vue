<template>
  <div class="info-panel" :class="panelClasses">
    <div class="info-header" v-if="hasHeader">
      <div class="info-icon" v-if="iconClass">
        <i :class="iconClass"></i>
      </div>
      <div class="info-title-section">
        <h4 v-if="block.title" class="info-title">
          {{ block.title }}
        </h4>
        <p v-if="block.action_params?.subtitle" class="info-subtitle">
          {{ block.action_params.subtitle }}
        </p>
      </div>
    </div>
    
    <div class="info-content">
      <div 
        v-if="block.content" 
        class="info-body"
        v-html="block.content"
      />
      
      <p v-if="block.description" class="info-description">
        {{ block.description }}
      </p>
      
      <!-- Список элементов если есть в action_params -->
      <ul v-if="block.action_params?.items" class="info-list">
        <li v-for="(item, index) in block.action_params.items" :key="index" class="info-list-item">
          <span class="info-list-bullet">•</span>
          {{ item }}
        </li>
      </ul>
      
      <!-- Дополнительные поля -->
      <div v-if="block.action_params?.status" class="info-status">
        <span class="status-label">Статус:</span>
        <span class="status-value" :class="`status-${block.action_params.status}`">
          {{ getStatusText(block.action_params.status) }}
        </span>
      </div>
    </div>
    
    <div v-if="block.action_params?.footer" class="info-footer">
      {{ block.action_params.footer }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlockConfig } from '@/api/pageApi'

interface Props {
  block: BlockConfig
}

const props = defineProps<Props>()

defineEmits<{
  action: [data: any]
}>()

const panelClasses = computed(() => [
  `info-panel-${props.block.action_mode || 'default'}`,
  {
    'has-icon': !!iconClass.value,
    'is-compact': props.block.action_params?.compact === true,
  }
])

const hasHeader = computed(() => {
  return !!(props.block.title || props.block.action_params?.subtitle)
})

const iconClass = computed(() => {
  const iconMap: Record<string, string> = {
    info: '🛈',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    question: '❓',
    tip: '💡'
  }
  
  const iconType = props.block.action_params?.icon
  return iconType ? iconMap[iconType] || iconType : null
})

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Активно',
    inactive: 'Неактивно',
    pending: 'Ожидание',
    completed: 'Завершено',
    error: 'Ошибка',
    warning: 'Предупреждение'
  }
  
  return statusMap[status] || status
}
</script>

<style scoped>
.info-panel {
  @apply rounded-lg border-2 shadow-sm;
  transition: all 0.3s ease;
}

.info-panel:hover {
  @apply shadow-md;
}

/* Стили для разных типов панелей */
.info-panel-default {
  @apply bg-white border-gray-200;
}

.info-panel-info {
  @apply bg-blue-50 border-blue-200;
}

.info-panel-success {
  @apply bg-green-50 border-green-200;
}

.info-panel-warning {
  @apply bg-yellow-50 border-yellow-200;
}

.info-panel-error,
.info-panel-danger {
  @apply bg-red-50 border-red-200;
}

.info-panel-primary {
  @apply bg-indigo-50 border-indigo-200;
}

/* Компактный режим */
.info-panel.is-compact {
  @apply p-4;
}

.info-panel:not(.is-compact) {
  @apply p-6;
}

/* Заголовок */
.info-header {
  @apply flex items-start gap-3 mb-4;
}

.info-icon {
  @apply text-2xl flex-shrink-0 mt-0.5;
}

.info-title-section {
  @apply flex-1;
}

.info-title {
  @apply text-xl font-semibold text-gray-900 mb-1;
}

.info-subtitle {
  @apply text-sm text-gray-600;
}

/* Содержимое */
.info-content {
  @apply space-y-3;
}

.info-body {
  @apply text-gray-700 leading-relaxed;
}

.info-description {
  @apply text-sm text-gray-600 italic;
}

/* Список */
.info-list {
  @apply space-y-2;
}

.info-list-item {
  @apply flex items-start gap-2 text-gray-700;
}

.info-list-bullet {
  @apply text-blue-500 font-bold flex-shrink-0 mt-0.5;
}

/* Статус */
.info-status {
  @apply flex items-center gap-2 p-3 bg-gray-50 rounded-lg;
}

.status-label {
  @apply text-sm font-medium text-gray-600;
}

.status-value {
  @apply text-sm font-semibold px-2 py-1 rounded;
}

.status-active {
  @apply bg-green-100 text-green-800;
}

.status-inactive {
  @apply bg-gray-100 text-gray-800;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-completed {
  @apply bg-blue-100 text-blue-800;
}

.status-error {
  @apply bg-red-100 text-red-800;
}

.status-warning {
  @apply bg-orange-100 text-orange-800;
}

/* Подвал */
.info-footer {
  @apply mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600;
}

/* HTML контент внутри info-body */
.info-body :deep(p) {
  @apply mb-2;
}

.info-body :deep(strong) {
  @apply font-semibold;
}

.info-body :deep(em) {
  @apply italic;
}

.info-body :deep(ul) {
  @apply list-disc list-inside mb-2 ml-4;
}

.info-body :deep(ol) {
  @apply list-decimal list-inside mb-2 ml-4;
}

.info-body :deep(code) {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}
</style> 