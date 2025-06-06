<template>
  <div class="meta-data-container" v-if="!skeleton">
    <div class="meta-header">
      <div class="meta-icon">⚙️</div>
      <h3 class="meta-title">Системная информация</h3>
      <div class="meta-status" :class="getStatusClass()">
        {{ getStatusText() }}
      </div>
    </div>
    
    <!-- Показываем items, если есть -->
    <div v-if="data.items && data.items.length > 0" class="meta-items">
      <div v-for="(item, index) in data.items" :key="index" class="meta-item">
        <div class="item-info">
          <span class="item-title">{{ item.title || item.variable }}</span>
          <span class="item-value">{{ item.data || 'Нет данных' }}</span>
        </div>
        <div v-if="item.hidden_data" class="item-hidden">
          {{ item.hidden_data }}
        </div>
      </div>
    </div>
    
    <!-- Показываем основную информацию -->
    <div class="meta-info">
      <div class="info-item">
        <span class="info-label">Режим:</span>
        <span class="info-value">{{ data.action_mode }}</span>
      </div>
      <div class="info-item" v-if="data.parent_block_id">
        <span class="info-label">Родительский блок:</span>
        <span class="info-value">{{ data.parent_block_id }}</span>
      </div>
    </div>
  </div>
  
  <!-- Skeleton состояние -->
  <div v-else class="skeleton-meta">
    <div class="skeleton-header"></div>
    <div class="skeleton-content"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeBlock } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const getStatusClass = () => {
  switch (props.data.action_mode) {
    case 'processing':
      return 'status-processing'
    case 'completed':
      return 'status-completed'
    case 'error':
      return 'status-error'
    default:
      return 'status-default'
  }
}

const getStatusText = () => {
  switch (props.data.action_mode) {
    case 'processing':
      return 'Обработка'
    case 'completed':
      return 'Завершено'
    case 'error':
      return 'Ошибка'
    default:
      return 'Неизвестно'
  }
}
</script>

<style scoped>
.meta-data-container {
  @apply bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4;
}

.meta-header {
  @apply flex items-center gap-3 mb-3;
}

.meta-icon {
  @apply text-xl;
}

.meta-title {
  @apply text-lg font-semibold text-gray-800 flex-1;
}

.meta-status {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.status-processing {
  @apply bg-yellow-100 text-yellow-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.status-error {
  @apply bg-red-100 text-red-800;
}

.status-default {
  @apply bg-gray-100 text-gray-800;
}

.meta-items {
  @apply space-y-2 mb-3;
}

.meta-item {
  @apply p-2 bg-white rounded border border-gray-200;
}

.item-info {
  @apply flex justify-between items-center;
}

.item-title {
  @apply text-sm font-medium text-gray-700;
}

.item-value {
  @apply text-sm text-gray-900 font-mono;
}

.item-hidden {
  @apply text-xs text-gray-600 mt-1;
}

.meta-info {
  @apply space-y-2;
}

.info-item {
  @apply flex justify-between items-center;
}

.info-label {
  @apply text-sm font-medium text-gray-600;
}

.info-value {
  @apply text-sm text-gray-900 font-mono;
}

/* Skeleton стили */
.skeleton-meta {
  @apply p-4 mb-4;
}

.skeleton-header {
  @apply h-6 bg-gray-300 rounded animate-pulse mb-3;
  width: 40%;
}

.skeleton-content {
  @apply h-16 bg-gray-300 rounded animate-pulse;
}
</style> 