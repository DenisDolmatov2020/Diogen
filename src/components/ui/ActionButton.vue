<template>
  <div class="action-button-container" :class="buttonId">
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
import type { TreeBlock } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
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
    // Получаем ключ действия
    const keysParam = props.data.action_params?.find(
      (p: { variable: string }) => p.variable === 'keys')
    const actionKey = keysParam?.data?.[0]
    
    // Генерируем тип действия в зависимости от режима
    let actionType = 'button_click'
    let fieldChanges: Record<string, any> | null = null
    
    // Если это кнопка сохранения, собираем изменения с соседних текстовых полей
    if (actionKey === '11071' || props.data.action_mode === 'submit') {
      actionType = 'save_changes'
      
      // Собираем изменения с соседних текстовых полей
      fieldChanges = collectTextFieldChanges()
      
      // Если нет изменений, выводим сообщение и выходим
      if (!fieldChanges || Object.keys(fieldChanges).length === 0) {
        console.log('⚠️ Нет изменений для сохранения')
        // Для целей отладки - показываем сообщение в консоли
        return
      }
      
      console.log('💾 Кнопка сохранения: найдены изменения:', fieldChanges)
    }
    
    // Эмитим событие с данными действия
    emit('action', {
      type: actionType,
      payload: {
        component_name: props.data.component_name,
        action_mode: props.data.action_mode,
        action_params: props.data.action_params,
        key: actionKey,
        fieldChanges // Добавляем изменения полей, если есть
      }
    })
    
    // Имитируем задержку для демонстрации
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

// Функция для сбора изменений с текстовых полей
function collectTextFieldChanges(): Record<string, any> | null {
  // Найдем родительский блок
  const parentBlock = findParentBlock()
  if (!parentBlock) return null
  
  // Ищем все текстовые поля внутри блока
  const textBlocks = findTextBlocks(parentBlock)
  if (!textBlocks.length) return null
  
  // Собираем изменения со всех текстовых полей
  const changes: Record<string, any> = {}
  let hasChanges = false
  
  textBlocks.forEach(textBlock => {
    // Вызываем метод getFieldChanges для получения изменений
    if (textBlock && textBlock.exposed) {
      const fieldChanges = textBlock.exposed.getFieldChanges?.()
      if (fieldChanges) {
        changes[fieldChanges.field] = fieldChanges.value
        hasChanges = true
      }
    }
  })
  
  return hasChanges ? changes : null
}

// Функция для поиска родительского блока
function findParentBlock(): HTMLElement | null {
  // Получаем DOM элемент кнопки
  const buttonEl = document.querySelector(`.${buttonId}`)
  if (!buttonEl) return null
  
  // Ищем ближайший родительский block-wrapper
  return buttonEl.closest('.block-wrapper')
}

// Функция для поиска текстовых полей внутри блока
function findTextBlocks(parentBlock: HTMLElement | null): any[] {
  if (!parentBlock) return []
  
  // Получаем все Vue компоненты текстовых блоков
  // Это сложно сделать точно без Vue refs, но можем попробовать найти через DOM
  const textBlockEls = parentBlock.querySelectorAll('.text-block-wrapper')
  
  // Собираем Vue компоненты
  const textBlocks: any[] = []
  textBlockEls.forEach((el: Element) => {
    // Получаем Vue компонент из DOM элемента
    const textBlock = getVueComponent(el)
    if (textBlock) {
      textBlocks.push(textBlock)
    }
  })
  
  return textBlocks
}

// Функция для получения Vue компонента из DOM элемента
function getVueComponent(el: Element): any {
  // Vue 3 хранит компонент в __vnode свойстве
  return (el as any).__vnode || (el as any).__vue__ || (el as any)._vnode
}

// Добавляем уникальный класс компоненту для легкого поиска
const buttonId = `action-button-${props.data.component_name || Math.random().toString(36).substring(2, 9)}`
</script>

<style scoped>
.action-button-container {
  @apply flex flex-col gap-2 p-2 w-[250px];
}

.skeleton-button {
  @apply h-10 bg-gray-300 rounded-lg animate-pulse;
  width: 120px;
}
</style> 