<template>
  <div class="info-panel">
    <div v-if="!skeleton" class="info-content">
      <div class="info-header">
        <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
      </div>
      
      <!-- Показываем items, если есть -->
      <div v-if="data.items && data.items.length > 0" class="info-body">
        <div v-for="(item, index) in data.items" :key="index" class="info-item">
          <span class="info-label">{{ item.title || getKeyLabel(item.variable) }}:</span>
          <span class="info-value" :class="getItemStatusClass(item)">
            {{ item.data || 'Не определено' }}
            <span v-if="item.hidden_data" class="hidden-data" :title="item.hidden_data">💡</span>
          </span>
        </div>
      </div>
      
      <!-- Fallback на старую логику, если items нет -->
      <div v-else class="info-body">
        <div v-for="(item, index) in infoItems" :key="index" class="info-item">
          <span class="info-label">{{ item.label }}:</span>
          <span class="info-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
    
    <!-- Skeleton состояние -->
    <div v-else class="skeleton-panel">
      <div class="skeleton-header"></div>
      <div class="skeleton-body">
        <div v-for="i in 3" :key="i" class="skeleton-item"></div>
      </div>
    </div>
    
    <!-- Дочерние элементы -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeBlock, Item } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const title = computed(() => {
  if (props.data.action_mode === 'deep_layout') {
    return 'Подробная информация'
  }
  return 'Информация'
})

const infoItems = computed(() => {
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  const referenceParam = props.data.action_params?.find(p => p.variable === 'reference_id')
  
  const items = []
  
  if (keysParam?.data) {
    keysParam.data.forEach((key: string) => {
      items.push({
        label: getKeyLabel(key),
        value: getKeyValue(key, referenceParam?.data)
      })
    })
  }
  
  if (referenceParam?.data) {
    items.push({
      label: 'ID ссылки',
      value: referenceParam.data
    })
  }
  
  return items
})

// Получение класса для статуса элемента
function getItemStatusClass(item: Item): string[] {
  const classes = []
  
  if (item.status) {
    switch (item.status) {
      case 'normal':
        classes.push('status-normal')
        break
      case 'missed':
        classes.push('status-missed')
        break
      case 'unprocessed':
        classes.push('status-unprocessed')
        break
    }
  }
  
  if (item.fate === 'editable') {
    classes.push('fate-editable')
  }
  
  return classes
}

function getKeyLabel(key: string): string {
  const labels: Record<string, string> = {
    '19003': 'Статус',
    '19004': 'Приоритет',
    '19005': 'Категория',
    '19006': 'Автор',
    '19007': 'Дата создания',
    '19008': 'Последнее обновление'
  }
  
  return labels[key] || `Поле ${key}`
}

function getKeyValue(key: string, referenceId?: string): string {
  // Имитируем получение значений на основе ключей
  const values: Record<string, string> = {
    '19003': 'Активный',
    '19004': 'Высокий',
    '19005': 'Новости',
    '19006': 'Иван Иванов',
    '19007': '2024-01-15',
    '19008': '2024-01-20'
  }
  
  let value = values[key] || 'Не определено'
  
  // Если есть reference_id, показываем, что данные загружены
  if (referenceId) {
    value += ' ✓'
  }
  
  return value
}
</script>

<style scoped>
.info-panel {
  @apply bg-white border border-gray-200 rounded-lg shadow-sm;
}

.info-content {
  @apply p-4;
}

.info-header {
  @apply mb-3 pb-2 border-b border-gray-100;
}

.info-body {
  @apply space-y-2;
}

.info-item {
  @apply flex justify-between items-center;
}

.info-label {
  @apply text-sm font-medium text-gray-600;
}

.info-value {
  @apply text-sm text-gray-900 flex items-center gap-1;
}

/* Стили для статусов */
.info-value.status-normal {
  @apply text-green-700;
}

.info-value.status-missed {
  @apply text-red-700;
}

.info-value.status-unprocessed {
  @apply text-gray-500;
}

.info-value.fate-editable {
  @apply font-medium;
}

.hidden-data {
  @apply cursor-help text-blue-500;
}

/* Skeleton стили */
.skeleton-panel {
  @apply p-4;
}

.skeleton-header {
  @apply h-6 bg-gray-300 rounded animate-pulse mb-3;
  width: 60%;
}

.skeleton-body {
  @apply space-y-2;
}

.skeleton-item {
  @apply h-4 bg-gray-300 rounded animate-pulse;
}

.skeleton-item:nth-child(1) { width: 80%; }
.skeleton-item:nth-child(2) { width: 70%; }
.skeleton-item:nth-child(3) { width: 90%; }
</style> 