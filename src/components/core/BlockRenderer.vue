<template>
  <div 
    class="block-wrapper"
    :class="getWrapperClasses()"
    :style="getWrapperStyles()"
  >
    <!-- Индикатор уровня вложенности -->
    <div v-if="level > 0" class="level-indicator">
      <div class="level-line"></div>
      <div class="level-number">{{ level }}</div>
    </div>
    
    <!-- Основной компонент (без слотов для детей) -->
    <component 
      :is="getComponent(props.block.component_name)"
      :data="props.block"
      :skeleton="props.skeleton"
      :class="getBlockClasses(props.block)"
      @action="handleAction"
    />
    
    <!-- Дочерние блоки рендерятся отдельно, после родителя -->
    <div v-if="props.block.children?.length" class="children-container">
      <BlockRenderer 
        v-for="(child, index) in props.block.children" 
        :block="child"
        :key="`child-${index}`"
        :skeleton="props.skeleton"
        :level="level + 1"
        @action="handleAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue'
import InfoPanel from '@/components/ui/InfoPanel.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import TextBlock from '@/components/ui/TextBlock.vue'
import MetaData from '@/components/ui/MetaData.vue'
import PictureBlock from '@/components/ui/PictureBlock.vue'
import UnknownComponent from '@/components/ui/UnknownComponent.vue'
import type { TreeBlock } from '@/types/block'

const props = defineProps<{
  block: TreeBlock
  skeleton: boolean
  level?: number
}>()

const emit = defineEmits<{
  action: [data: any]
}>()

// Уровень вложенности по умолчанию
const level = props.level || 0

const componentMap: Record<string, any> = {
  action_button: ActionButton,
  info_panel: InfoPanel,
  progress_bar: ProgressBar,
  text_block: TextBlock,
  meta_data: MetaData,
  picture_block: PictureBlock
}

function getComponent(componentName: string) {
  return componentMap[componentName] || UnknownComponent
}

function getBlockClasses(block: TreeBlock) {
  const classes = ['block-container']
  
  // Добавляем класс на основе action_mode
  if (block.action_mode) {
    classes.push(`action-mode-${block.action_mode.replace('_', '-')}`)
  }
  
  // Добавляем класс на основе наличия детей
  if (block.children && block.children.length > 0) {
    classes.push('has-children')
  }
  
  return classes
}

function getWrapperClasses() {
  const classes = ['block-wrapper']
  
  if (level === 0) {
    classes.push('root-level')
  } else {
    classes.push('nested-level')
    classes.push(`level-${Math.min(level, 5)}`) // Ограничиваем до 5 уровней для стилей
  }
  
  if (props.block.children && props.block.children.length > 0) {
    classes.push('has-children')
  }
  
  return classes
}

function getWrapperStyles() {
  return {
    '--nesting-level': level,
    '--indent': `${level * 20}px`
  }
}

function handleAction(actionData: any) {
  const enrichedAction = {
    ...actionData,
    source_component: props.block.component_name,
    source_mode: props.block.action_mode,
    nesting_level: level
  }
  emit('action', enrichedAction)
}
</script>

<style scoped>
.block-wrapper {
  @apply relative;
  margin-left: var(--indent);
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

.block-wrapper.root-level {
  @apply border-l-0 ml-0;
}

.block-wrapper.nested-level {
  @apply pl-4 my-2;
}

/* Цвета для разных уровней вложенности */
.block-wrapper.level-1 {
  @apply border-l-blue-300;
}

.block-wrapper.level-2 {
  @apply border-l-green-300;
}

.block-wrapper.level-3 {
  @apply border-l-yellow-300;
}

.block-wrapper.level-4 {
  @apply border-l-purple-300;
}

.block-wrapper.level-5 {
  @apply border-l-red-300;
}

/* Индикатор уровня */
.level-indicator {
  @apply absolute -left-4 top-2 flex items-center gap-1;
}

.level-line {
  @apply w-3 h-0.5 bg-gray-300;
}

.level-number {
  @apply text-xs bg-gray-200 text-gray-600 ml-0.5 px-1 rounded;
  font-size: 10px;
  line-height: 14px;
}

/* Эффекты при наведении */
.block-wrapper:hover {
  @apply bg-gray-50 rounded;
}

.block-wrapper.has-children:hover {
  @apply bg-blue-50;
}

.block-wrapper.has-children {
  @apply border-l-2;
}

/* Дополнительная визуализация для блоков с детьми */
.block-wrapper.has-children > .block-container {
  @apply border border-gray-200 rounded-lg p-3 bg-white shadow-sm;
}

.block-wrapper.root-level.has-children > .block-container {
  @apply border-2 border-blue-200;
}

/* Контейнер для дочерних блоков */
.children-container {
  @apply mt-2;
}
</style> 