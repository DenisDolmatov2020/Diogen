<template>
  <div class="unknown-component">
    <div class="unknown-content">
      <div class="unknown-icon">❓</div>
      <div class="unknown-text">
        <h4 class="unknown-title">Неизвестный компонент</h4>
        <p class="unknown-description">
          Компонент типа "{{ data.component_name }}" не найден
        </p>
        <details class="unknown-details">
          <summary class="unknown-summary">Показать данные</summary>
          <pre class="unknown-data">{{ JSON.stringify(data, null, 2) }}</pre>
        </details>
      </div>
    </div>
    
    <!-- Дочерние элементы -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { BlockConfig } from '@/api/pageApi'

defineProps<{
  data: BlockConfig
  skeleton?: boolean
}>()
</script>

<style scoped>
.unknown-component {
  @apply border-2 border-dashed border-red-300 bg-red-50 rounded-lg p-4;
}

.unknown-content {
  @apply flex items-start gap-3;
}

.unknown-icon {
  @apply text-2xl text-red-500 flex-shrink-0;
}

.unknown-text {
  @apply flex-1;
}

.unknown-title {
  @apply text-lg font-semibold text-red-700 mb-1;
}

.unknown-description {
  @apply text-sm text-red-600 mb-2;
}

.unknown-details {
  @apply mt-2;
}

.unknown-summary {
  @apply text-sm text-red-600 cursor-pointer hover:text-red-800;
}

.unknown-data {
  @apply mt-2 p-2 bg-red-100 rounded text-xs text-red-800 overflow-auto;
  max-height: 200px;
}
</style> 