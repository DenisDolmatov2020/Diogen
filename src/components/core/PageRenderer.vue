<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { BlockConfig } from '@/api/pageApi.ts'

// Импортируем UI компоненты динамически для лучшей организации и возможного code splitting
const ActionButton = defineAsyncComponent(() => import('../ui/ActionButton.vue'))
const InfoPanel = defineAsyncComponent(() => import('../ui/InfoPanel.vue'))
const ProgressBar = defineAsyncComponent(() => import('../ui/ProgressBar.vue'))
const TextBlock = defineAsyncComponent(() => import('../ui/TextBlock.vue'))
const UnknownComponent = defineAsyncComponent(() => import('../ui/UnknownComponent.vue'))

// Карта компонентов для сопоставления имен с импортированными компонентами
const componentMap: Record<string, any> = {
  action_button: ActionButton,
  info_panel: InfoPanel,
  progress_bar: ProgressBar,
  text_block: TextBlock,
  // Добавьте другие компоненты по мере необходимости
}

const props = defineProps<{
  blocks: BlockConfig[] // Этот проп будет содержать ВСЕ блоки для текущей страницы
  currentParentId?: string | null // ID родительского блока для текущего уровня рендеринга
  skeleton?: boolean
}>()

const emit = defineEmits(['action'])

// Сохраняем ссылку на полный список блоков для передачи в рекурсивные вызовы
const allBlocks = computed(() => props.blocks)

// Фильтруем блоки для рендеринга на текущем уровне иерархии
const blocksToRender = computed(() => {
  // Определяем, ищем ли мы корневые блоки
  const lookingForRootBlocks = props.currentParentId === undefined || props.currentParentId === null || props.currentParentId === ''
  
  return props.blocks.filter(block => {
    if (lookingForRootBlocks) {
      // Если ищем корневые, то parent_block_id должен быть undefined, null или ""
      return block.parent_block_id === undefined || block.parent_block_id === null || block.parent_block_id === ''
    } else {
      // Иначе, parent_block_id должен строго совпадать с currentParentId
      return block.parent_block_id === props.currentParentId
    }
  })
})

// Функция для разрешения имени компонента в фактический компонент
function resolveComponent(componentName: string): any {
  return componentMap[componentName.toLowerCase()] || UnknownComponent
}

const showDebug = computed(() => import.meta.env.DEV)
</script>

<template>
  <div class="page-renderer">
    <!-- Debug информация -->
    <div v-if="showDebug && !skeleton" class="debug-info">
      <h4>🔧 PageRenderer Debug</h4>
      <p>Блоков получено: {{ blocks.length }}</p>
      <p>Skeleton режим: {{ skeleton }}</p>
    </div>



    <div class="text-black">
      ++++++++++++
      HERE ALL COMPONENTS RENDER COMPONENTS {{ blocks.length }}/{{ skeleton }}
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
      <div v-for="block in blocks" :key="block.block_id || block.component_name + block.parent_block_id" class="skeleton-block">
        <div class="skeleton-title"></div>
        <div class="skeleton-content"></div>
      </div>
    </div>


    <!-- Основной контент -->
    <div v-else class="blocks-container">
      YES {{ blocksToRender }}
      <div
        v-for="(block, index) in blocksToRender"
        :key="block.block_id || block.components_id || 'block-' + index"
        class="component-wrapper"
        :data-component-name="block.component_name"
        :data-block-id="block.block_id"
        :data-parent-id="block.parent_block_id"
      >
        <component
          :is="resolveComponent(block.component_name)"
          :data="block"
          :skeleton="false"
          @action="$emit('action', $event)"
        >
          <!-- Рекурсивный вызов для дочерних блоков -->
          <PageRenderer
            :blocks="allBlocks"
            :current-parent-id="block.block_id"
            :skeleton="false"
            @action="$emit('action', $event)"
          />
        </component>
      </div>
    </div>
  </div>
</template>

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

.skeleton-title {
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

.component-wrapper {
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