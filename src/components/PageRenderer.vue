<template>
  <div class="page-renderer">
    <!-- Debug информация -->
    <div v-if="showDebug && !skeleton" class="debug-info">
      <h4>🔧 PageRenderer Debug</h4>
      <p>Блоков получено: {{ blocks.length }}</p>
      <p>Skeleton режим: {{ skeleton }}</p>
    </div>

    <!-- Если нет блоков -->
    <div v-if="!blocks.length && !skeleton" class="empty-state">
      <div class="empty-card">
        <div class="empty-icon">📄</div>
        <h3 class="empty-title">Страница пуста</h3>
        <p class="empty-text">Конфигурация не содержит блоков для отображения</p>
      </div>
    </div>

    <!-- Skeleton загрузка -->
    <div v-else-if="skeleton" class="skeleton-container">
      <div v-for="i in 3" :key="i" class="skeleton-block">
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div v-else class="blocks-container">
      <div
        v-for="(block, index) in blocks"
        :key="block.components_id || block.block_id || index"
        class="block-wrapper"
        :class="`block-${block.component_name}`"
      >
        <!-- Debug для каждого блока -->
        <div v-if="showDebug" class="block-debug">
          <small>{{ block.component_name }} #
            {{ block.components_id || block.block_id || index }}
          </small>
        </div>

        <!-- Рендер блока по типу -->
        <component
          :is="getBlockComponent(block.component_name)"
          :block="block"
          @action="$emit('action', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlockConfig } from '@/api/pageApi'

// Импорты компонентов блоков
import TextBlock from './blocks/TextBlock.vue'
import InfoPanel from './blocks/InfoPanel.vue'
import ProgressBar from './blocks/ProgressBar.vue'
import ActionButton from './blocks/ActionButton.vue'

interface Props {
  blocks: BlockConfig[]
  skeleton?: boolean
}

withDefaults(defineProps<Props>(), {
  skeleton: false
})

defineEmits<{
  action: [data: any]
}>()

const showDebug = computed(() => import.meta.env.DEV)

// Маппинг типов блоков на компоненты
const blockComponents = {
  text_block: TextBlock,
  info_panel: InfoPanel,
  progress_bar: ProgressBar,
  action_button: ActionButton,
}

function getBlockComponent(type: string) {
  const component = blockComponents[type as keyof typeof blockComponents]
  if (!component) {
    console.warn(`⚠️ Неизвестный тип блока: ${type}`)
    return 'div' // Fallback
  }
  return component
}
</script>

<style scoped>
.page-renderer {
  @apply w-full;
}

/* Debug информация */
.debug-info {
  @apply mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700;
}

.debug-info h4 {
  @apply font-semibold mb-1;
}

.block-debug {
  @apply mb-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600;
}

/* Пустое состояние */
.empty-state {
  @apply flex items-center justify-center min-h-[40vh];
}

.empty-card {
  @apply text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100;
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.05) 0%, rgba(107, 114, 128, 0.05) 100%);
}

.empty-icon {
  @apply text-6xl mb-4 opacity-50;
}

.empty-title {
  @apply text-xl font-semibold text-gray-700 mb-2;
}

.empty-text {
  @apply text-gray-500;
}

/* Skeleton загрузка */
.skeleton-container {
  @apply space-y-6;
}

.skeleton-block {
  @apply bg-white rounded-xl p-6 shadow-sm border border-gray-100;
}

.skeleton-header {
  @apply h-6 bg-gray-200 rounded-lg mb-4;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  @apply space-y-3;
}

.skeleton-line {
  @apply h-4 bg-gray-200 rounded;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line.short {
  @apply w-2/3;
}

/* Контейнер блоков */
.blocks-container {
  @apply space-y-6;
}

.block-wrapper {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden;
  @apply transition-all duration-300 hover:shadow-md;
}

/* Специфичные стили для типов блоков */
.block-text_block {
  @apply border-l-4 border-blue-400;
}

.block-info_panel {
  @apply border-l-4 border-green-400;
}

.block-progress_bar {
  @apply border-l-4 border-purple-400;
}

.block-action_button {
  @apply border-l-4 border-orange-400;
}

/* Анимации */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style> 