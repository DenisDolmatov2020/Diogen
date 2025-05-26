<template>
  <div class="progress-block" :class="blockClasses">
    <div class="progress-header" v-if="hasHeader">
      <h4 v-if="block.title" class="progress-title">
        {{ block.title }}
      </h4>
      <div class="progress-value">
        {{ formattedValue }}
      </div>
    </div>
    
    <div class="progress-container">
      <div class="progress-bar-wrapper" :class="wrapperClasses">
        <div 
          class="progress-bar-fill" 
          :class="fillClasses"
          :style="{ width: `${progressPercent}%` }"
        >
          <div v-if="showAnimation" class="progress-shine"></div>
        </div>
        
        <!-- Значение внутри прогресс-бара -->
        <div v-if="showInnerValue" class="progress-inner-value">
          {{ formattedValue }}
        </div>
      </div>
      
      <!-- Дополнительные метки -->
      <div v-if="showMarks" class="progress-marks">
        <span class="progress-mark start">{{ minValue }}</span>
        <span class="progress-mark end">{{ maxValue }}</span>
      </div>
    </div>
    
    <div class="progress-content">
      <p v-if="block.description" class="progress-description">
        {{ block.description }}
      </p>
      
      <div v-if="block.content" class="progress-body" v-html="block.content" />
      
      <!-- Дополнительная информация -->
      <div v-if="block.action_params?.steps" class="progress-steps">
        <div 
          v-for="(step, index) in block.action_params.steps" 
          :key="index"
          class="progress-step"
          :class="{ 'step-completed': index < currentStep }"
        >
          <div class="step-indicator">
            <span v-if="index < currentStep">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step }}</span>
        </div>
      </div>
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

const blockClasses = computed(() => [
  `progress-block-${props.block.action_mode || 'default'}`,
  {
    'has-steps': !!props.block.action_params?.steps,
    'is-animated': showAnimation.value,
  }
])

const wrapperClasses = computed(() => [
  `progress-${props.block.action_params?.variant || 'default'}`,
  `progress-size-${props.block.action_params?.size || 'normal'}`,
])

const fillClasses = computed(() => [
  `progress-color-${props.block.action_params?.color || 'blue'}`,
])

const hasHeader = computed(() => {
  return !!(props.block.title)
})

const currentValue = computed(() => {
  return parseFloat(props.block.action_params?.value || '0')
})

const minValue = computed(() => {
  return parseFloat(props.block.action_params?.min || '0')
})

const maxValue = computed(() => {
  return parseFloat(props.block.action_params?.max || '100')
})

const progressPercent = computed(() => {
  const range = maxValue.value - minValue.value
  const adjustedValue = currentValue.value - minValue.value
  return Math.min(Math.max((adjustedValue / range) * 100, 0), 100)
})

const formattedValue = computed(() => {
  const format = props.block.action_params?.format || 'percent'
  
  switch (format) {
    case 'percent':
      return `${Math.round(progressPercent.value)}%`
    case 'value':
      return `${currentValue.value}/${maxValue.value}`
    case 'decimal':
      return currentValue.value.toFixed(1)
    default:
      return `${currentValue.value}`
  }
})

const showAnimation = computed(() => {
  return props.block.action_params?.animated === true
})

const showInnerValue = computed(() => {
  return props.block.action_params?.showInnerValue === true
})

const showMarks = computed(() => {
  return props.block.action_params?.showMarks === true
})

const currentStep = computed(() => {
  const steps = props.block.action_params?.steps
  if (!steps) return 0
  
  const stepProgress = progressPercent.value / 100
  return Math.floor(stepProgress * steps.length)
})
</script>

<style scoped>
.progress-block {
  @apply p-6;
}

/* Заголовок */
.progress-header {
  @apply flex items-center justify-between mb-4;
}

.progress-title {
  @apply text-lg font-semibold text-gray-900;
}

.progress-value {
  @apply text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full;
}

/* Контейнер прогресс-бара */
.progress-container {
  @apply mb-4;
}

.progress-bar-wrapper {
  @apply relative bg-gray-200 rounded-full overflow-hidden;
  position: relative;
}

/* Размеры */
.progress-size-small {
  @apply h-2;
}

.progress-size-normal {
  @apply h-4;
}

.progress-size-large {
  @apply h-6;
}

/* Заполнение */
.progress-bar-fill {
  @apply h-full rounded-full transition-all duration-1000 ease-out;
  position: relative;
}

/* Цвета заполнения */
.progress-color-blue {
  @apply bg-blue-500;
}

.progress-color-green {
  @apply bg-green-500;
}

.progress-color-yellow {
  @apply bg-yellow-500;
}

.progress-color-red {
  @apply bg-red-500;
}

.progress-color-purple {
  @apply bg-purple-500;
}

.progress-color-indigo {
  @apply bg-indigo-500;
}

.progress-color-gradient {
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ef4444 100%);
}

/* Анимация блеска */
.progress-shine {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent;
  opacity: 0.3;
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Значение внутри бара */
.progress-inner-value {
  @apply absolute inset-0 flex items-center justify-center text-xs font-medium text-white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Метки */
.progress-marks {
  @apply flex justify-between mt-2 text-xs text-gray-500;
}

/* Содержимое */
.progress-content {
  @apply space-y-3;
}

.progress-description {
  @apply text-sm text-gray-600;
}

.progress-body {
  @apply text-gray-700;
}

/* Шаги */
.progress-steps {
  @apply space-y-3 mt-4;
}

.progress-step {
  @apply flex items-center gap-3;
}

.step-indicator {
  @apply w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium transition-all duration-300;
}

.progress-step.step-completed .step-indicator {
  @apply bg-green-500 border-green-500 text-white;
}

.step-label {
  @apply text-sm text-gray-700;
}

.progress-step.step-completed .step-label {
  @apply text-green-700 font-medium;
}

/* Варианты стилей */
.progress-rounded {
  @apply rounded-full;
}

.progress-square {
  @apply rounded-none;
}

.progress-default {
  @apply rounded;
}

/* Стили для разных режимов блока */
.progress-block-success {
  @apply border-l-4 border-green-500 bg-green-50;
}

.progress-block-warning {
  @apply border-l-4 border-yellow-500 bg-yellow-50;
}

.progress-block-danger {
  @apply border-l-4 border-red-500 bg-red-50;
}

.progress-block-info {
  @apply border-l-4 border-blue-500 bg-blue-50;
}
</style> 