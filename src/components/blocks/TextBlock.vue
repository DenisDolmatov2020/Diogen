<template>
  <div class="text-block" :class="blockClasses">
    <div class="text-content">
      <h3 v-if="block.title" class="text-title">
        {{ block.title }}
      </h3>
      
      <div 
        v-if="block.content" 
        class="text-body"
        :class="contentClasses"
        v-html="block.content"
      />
      
      <p v-if="block.description" class="text-description">
        {{ block.description }}
      </p>
      
      <!-- Дополнительные поля из action_params -->
      <div v-if="block.action_params?.subtitle" class="text-subtitle">
        {{ block.action_params.subtitle }}
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
  `text-block-${props.block.action_mode || 'default'}`,
  {
    'has-title': !!props.block.title,
    'has-description': !!props.block.description,
  }
])

const contentClasses = computed(() => [
  `content-${props.block.action_params?.style || 'normal'}`,
  {
    'content-large': props.block.action_params?.size === 'large',
    'content-centered': props.block.action_params?.align === 'center',
  }
])
</script>

<style scoped>
.text-block {
  @apply p-6;
}

.text-content {
  @apply space-y-4;
}

.text-title {
  @apply text-2xl font-bold text-gray-900;
  line-height: 1.3;
}

.text-body {
  @apply text-gray-700 leading-relaxed;
}

.text-body.content-large {
  @apply text-lg;
}

.text-body.content-centered {
  @apply text-center;
}

.text-description {
  @apply text-sm text-gray-600 italic;
}

.text-subtitle {
  @apply text-lg font-medium text-gray-800;
}

/* Стили для разных режимов */
.text-block-primary {
  @apply bg-blue-50 border-l-4 border-blue-500;
}

.text-block-secondary {
  @apply bg-gray-50 border-l-4 border-gray-400;
}

.text-block-success {
  @apply bg-green-50 border-l-4 border-green-500;
}

.text-block-warning {
  @apply bg-yellow-50 border-l-4 border-yellow-500;
}

.text-block-danger {
  @apply bg-red-50 border-l-4 border-red-500;
}

/* HTML контент внутри text-body */
.text-body :deep(h1) {
  @apply text-xl font-bold mb-2;
}

.text-body :deep(h2) {
  @apply text-lg font-semibold mb-2;
}

.text-body :deep(h3) {
  @apply text-base font-medium mb-2;
}

.text-body :deep(p) {
  @apply mb-2;
}

.text-body :deep(ul) {
  @apply list-disc list-inside mb-2;
}

.text-body :deep(ol) {
  @apply list-decimal list-inside mb-2;
}

.text-body :deep(li) {
  @apply mb-1;
}

.text-body :deep(strong) {
  @apply font-semibold;
}

.text-body :deep(em) {
  @apply italic;
}

.text-body :deep(code) {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.text-body :deep(a) {
  @apply text-blue-600 hover:text-blue-800 underline;
}
</style> 