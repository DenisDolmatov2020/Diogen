const props = defineProps<{
  block: BlockConfig
  skeleton?: boolean
}>()

// Получаем данные из backend или fallback на mock
const backendData = computed(() => {
  const backendParam = props.block.action_params?.find(p => p.variable.startsWith('backend_'))
  if (backendParam && typeof backendParam.data === 'object') {
    return backendParam.data
  }
  return null
})

const isBackendData = computed(() => {
  const statusParam = props.block.action_params?.find(p => p.variable === 'backend_status')
  return statusParam?.data === 'loaded'
})

const buttonData = computed(() => {
  if (isBackendData.value && backendData.value) {
    // Используем реальные данные от бэкенда
    return {
      title: backendData.value.title || 'Действие',
      enabled: backendData.value.fate !== 'readonly',
      variant: getVariantFromStatus(backendData.value.status),
      showValue: backendData.value.hidden_data !== undefined,
      value: backendData.value.hidden_data || backendData.value.content
    }
  }
  
  // Fallback на mock данные
  const mockParam = props.block.action_params?.find(p => p.variable === 'mock_button')
  if (mockParam?.data) {
    return {
      title: 'Кнопка действия',
      enabled: mockParam.data.enabled !== false,
      variant: 'primary',
      showValue: false,
      value: null
    }
  }
  
  return {
    title: 'Кнопка действия',
    enabled: true,
    variant: 'primary',
    showValue: false,
    value: null
  }
})

function getVariantFromStatus(status: string): string {
  switch (status) {
    case 'nice': return 'success'
    case 'warning': return 'warning'
    case 'alert': return 'danger'
    case 'missed': return 'secondary'
    default: return 'primary'
  }
} 