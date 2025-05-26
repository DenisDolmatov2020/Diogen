<template>
  <div class="action-button-container">
    <button
      v-if="!skeleton"
      @click="handleClick"
      :disabled="loading"
      :class="buttonClasses"
    >
      <span v-if="loading" class="animate-spin mr-2">⟳</span>
      {{ buttonText }}
    </button>
    
    <!-- Skeleton состояние -->
    <div v-else class="skeleton-button"></div>
    
    <!-- Дочерние элементы -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BlockConfig } from '@/api/pageApi'

const props = defineProps<{
  data: BlockConfig
  skeleton: boolean
}>()

const emit = defineEmits<{
  action: [data: { type: string; payload: any }]
}>()

const loading = ref(false)

const buttonText = computed(() => {
  // Извлекаем текст кнопки из action_params
  const keysParam = props.data.action_params?.find(
    (p: { variable: string }) => p.variable === 'keys')
  if (keysParam?.data?.[0]) {
    return getButtonLabel(keysParam.data[0])
  }
  return 'Действие'
})

const buttonClasses = computed(() => {
  const baseClasses = [
    'px-4', 'py-2', 'rounded-lg', 'font-medium', 'transition-colors',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2'
  ]
  
  if (props.data.action_mode === 'editable_layout') {
    baseClasses.push(
      'bg-blue-600', 'text-white', 'hover:bg-blue-700',
      'focus:ring-blue-500', 'disabled:bg-blue-300'
    )
  } else {
    baseClasses.push(
      'bg-gray-600', 'text-white', 'hover:bg-gray-700',
      'focus:ring-gray-500', 'disabled:bg-gray-300'
    )
  }
  
  return baseClasses
})

function getButtonLabel(key: string): string {
  // Маппинг ключей на человекочитаемые названия
  const labels: Record<string, string> = {
    '11071': 'Сохранить',
    'create_order': 'Создать заказ',
    'edit_article': 'Редактировать статью',
    'project_value': 'Сохранить проект'
  }
  
  return labels[key] || key
}

async function handleClick() {
  loading.value = true
  
  try {
    // Эмитим событие с данными действия
    emit('action', {
      type: 'button_click',
      payload: {
        component_id: props.data.components_id,
        action_mode: props.data.action_mode,
        action_params: props.data.action_params
      }
    })
    
    // Имитируем задержку для демонстрации
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.action-button-container {
  @apply flex flex-col gap-2;
}

.skeleton-button {
  @apply h-10 bg-gray-300 rounded-lg animate-pulse;
  width: 120px;
}
</style> 