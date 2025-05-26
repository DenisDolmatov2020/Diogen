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

const infoData = computed(() => {
  if (isBackendData.value && backendData.value) {
    // Используем реальные данные от бэкенда
    return {
      title: backendData.value.title || 'Информационная панель',
      content: backendData.value.content || backendData.value.hidden_data || 'Данные загружены',
      status: backendData.value.status || 'normal',
      editable: backendData.value.fate === 'editable'
    }
  }
  
  // Fallback на mock данные
  const mockParam = props.block.action_params?.find(p => p.variable === 'mock_info')
  if (mockParam?.data) {
    const mockData = mockParam.data
    return {
      title: 'Информация',
      items: mockData.items || [],
      layout: mockData.layout || 'default'
    }
  }
  
  return {
    title: 'Информационная панель',
    content: 'Нет данных для отображения',
    status: 'normal',
    editable: false
  }
}) 