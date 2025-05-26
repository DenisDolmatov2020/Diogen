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

const progressData = computed(() => {
  if (isBackendData.value && backendData.value) {
    // Используем реальные данные от бэкенда
    let value = 0
    let max = 1
    
    if (typeof backendData.value.content === 'object' && backendData.value.content !== null) {
      value = Number(backendData.value.content.value) || 0
      max = Number(backendData.value.content.max) || 1
    } else if (typeof backendData.value.content === 'number') {
      value = backendData.value.content
      max = 1
    }
    
    return {
      title: backendData.value.title || 'Прогресс',
      value: value,
      max: max,
      percentage: Math.round((value / max) * 100)
    }
  }
  
  // Fallback на mock данные
  const mockParam = props.block.action_params?.find(p => p.variable === 'mock_progress')
  if (mockParam?.data) {
    const mockData = mockParam.data
    return {
      title: 'Прогресс',
      value: mockData.value || 50,
      max: mockData.max || 100,
      percentage: Math.round(((mockData.value || 50) / (mockData.max || 100)) * 100)
    }
  }
  
  return {
    title: 'Прогресс',
    value: 0,
    max: 100,
    percentage: 0
  }
}) 