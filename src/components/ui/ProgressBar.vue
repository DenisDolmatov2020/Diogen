<template>
  <div class="progress-bar-container p-2">
    <div v-if="!skeleton" class="progress-content">
      <div class="progress-header">
        <span class="progress-label">{{ label }}</span>
        <span class="progress-percentage">{{ percentage }}%</span>
      </div>
      
      <div class="progress-track">
        <div 
          class="progress-fill"
          :style="{ width: `${percentage}%` }"
        ></div>
      </div>
      
      <div v-if="showDetails" class="progress-details">
        <span class="text-sm text-gray-600">{{ currentValue }} из {{ maxValue }}</span>
      </div>
    </div>
    
    <!-- Skeleton состояние -->
    <div v-else class="skeleton-progress">
      <div class="skeleton-header">
        <div class="skeleton-label"></div>
        <div class="skeleton-percentage"></div>
      </div>
      <div class="skeleton-track"></div>
    </div>
    
    <!-- Дочерние элементы -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeBlock } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const label = computed(() => {
  const keysParam = props.data.action_params?.find(p => p.variable === 'keys')
  if (keysParam?.data?.[0]) {
    return getProgressLabel(keysParam.data[0])
  }
  return 'Прогресс'
})

const currentValue = computed(() => {
  // Имитируем текущее значение на основе reference_id
  const referenceParam = props.data.action_params?.find(p => p.variable === 'reference_id')
  if (referenceParam?.data) {
    return 75 // Если есть reference_id, показываем прогресс
  }
  return 0
})

const maxValue = computed(() => 100)

const percentage = computed(() => {
  return Math.round((currentValue.value / maxValue.value) * 100)
})

const showDetails = computed(() => {
  return props.data.action_mode === 'layout'
})

function getProgressLabel(key: string): string {
  const labels: Record<string, string> = {
    '19009': 'Выполнение задачи',
    'order_progress': 'Прогресс заказа',
    'project_progress': 'Прогресс проекта'
  }
  
  return labels[key] || 'Прогресс'
}
</script>

<style scoped>
.progress-bar-container {
  @apply w-full;
}

.progress-content {
  @apply space-y-2;
}

.progress-header {
  @apply flex justify-between items-center;
}

.progress-label {
  @apply text-sm font-medium text-gray-700;
}

.progress-percentage {
  @apply text-sm font-semibold text-blue-600;
}

.progress-track {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out;
}

.progress-details {
  @apply text-right;
}

/* Skeleton стили */
.skeleton-progress {
  @apply space-y-2;
}

.skeleton-header {
  @apply flex justify-between items-center;
}

.skeleton-label {
  @apply h-4 bg-gray-300 rounded animate-pulse;
  width: 40%;
}

.skeleton-percentage {
  @apply h-4 bg-gray-300 rounded animate-pulse;
  width: 20%;
}

.skeleton-track {
  @apply h-2 bg-gray-300 rounded-full animate-pulse;
}
</style> 