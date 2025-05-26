<template>
  <component 
    :is="getComponent(block.component_name)"
    :data="block"
    :skeleton="skeleton"
    @action="$emit('action', $event)"
    :class="getBlockClasses(block)"
  >
    <!-- Рекурсивно рендерим дочерние блоки -->
    <BlockRenderer 
      v-for="child in block.children" 
      :block="child"
      :key="child.block_id || child.components_id || Math.random()"
      :skeleton="skeleton"
      @action="$emit('action', $event)"
    />
  </component>
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue'
import InfoPanel from '@/components/ui/InfoPanel.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import TextBlock from '@/components/ui/TextBlock.vue'
import UnknownComponent from '@/components/ui/UnknownComponent.vue'
import type { BlockConfig } from '@/api/pageApi'

interface BlockWithChildren extends BlockConfig {
  children?: BlockWithChildren[]
}

defineProps<{
  block: BlockWithChildren
  skeleton: boolean
}>()

const emit = defineEmits<{
  action: [data: any]
}>()

// Маппинг component_name на Vue-компоненты
const componentMap: Record<string, any> = {
  action_button: ActionButton,
  info_panel: InfoPanel,
  progress_bar: ProgressBar,
  text_block: TextBlock
}

function getComponent(componentName: string) {
  return componentMap[componentName] || UnknownComponent
}

function getBlockClasses(block: BlockConfig) {
  const classes = ['block-container']
  
  // Добавляем классы на основе уровня вложенности
  const level = getBlockLevel(block.parent_block_id)
  classes.push(`block-level-${level}`)
  
  // Добавляем класс на основе action_mode
  if (block.action_mode) {
    classes.push(`action-mode-${block.action_mode.replace('_', '-')}`)
  }
  
  return classes
}

function getBlockLevel(parentBlockId: string): number {
  // Считаем количество дефисов в parent_block_id
  // block-0 -> уровень 1
  // block-0-1 -> уровень 2
  // block-0-1-1 -> уровень 3
  return (parentBlockId.match(/-/g) || []).length
}
</script>

<style scoped>
.block-container {
  @apply w-full;
}

/* Стили для разных уровней вложенности */
.block-level-1 {
  @apply mb-6;
}

.block-level-2 {
  @apply flex flex-wrap gap-4 mb-4;
}

.block-level-3 {
  @apply flex-1 min-w-0;
}

/* Стили для разных режимов действий */
.action-mode-layout {
  @apply bg-gray-50 p-4 rounded-lg;
}

.action-mode-editable-layout {
  @apply bg-blue-50 p-4 rounded-lg border-2 border-blue-200;
}

.action-mode-deep-layout {
  @apply bg-green-50 p-4 rounded-lg border border-green-200;
}
</style> 