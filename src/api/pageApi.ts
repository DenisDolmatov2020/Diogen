import apiService from '@/services/apiService'

export interface BlockConfig {
  component_name: string
  parent_block_id: string
  components_id?: string
  action_mode: string
  is_need_meta?: boolean
  block_id?: string
  action_params: Array<{
    variable: string
    data: any
  }>
}

// Интерфейс для ответа от бэкенда
export interface BackendResponse {
  component_name: string
  parent_block_id: string
  items?: Array<{
    title: string
    data?: any
    hidden_data?: string
    status?: string
    variable: string
    fate: string
  }>
}

export async function fetchFilledConfig(rawConfig: BlockConfig[]): Promise<BlockConfig[]> {
  try {
    console.log('🚀 Отправляем конфиг на реальный бэкенд:', rawConfig)
    
    // Отправляем запрос на реальный бэкенд с правильными заголовками
    const response = await fetch('https://di.slovo-soft.ru:6443/create_answer_for_front_api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TOKEN': 'wYZj8hN91r7ggb33PDzGMPnOEZxEfQDRKDYuFG-JLwG0Dot8lZAhfHbXXg-C51wimX2oOd_s3JGYCCwN_FrjstjMNr_2uYLoYRfF8uY8rJWXFnI8SFUKx3lrTXOGLUnc'
      },
      body: JSON.stringify(rawConfig)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const backendData: BackendResponse[] = await response.json()
    console.log('✅ Получен ответ от реального бэкенда:', backendData)
    
    // Преобразуем ответ бэкенда в формат нашего интерфейса
    const transformedData = transformBackendResponse(backendData, rawConfig)
    console.log('🔄 Данные преобразованы для фронтенда:', transformedData)
    
    return transformedData
    
  } catch (error) {
    console.warn('⚠️ Бэкенд недоступен, используем mock данные:', error)
    console.info('💡 Это нормальное поведение в режиме разработки')
    console.info('🔧 Проверьте подключение к интернету и доступность API')
    
    // Fallback на mock данные если бэкенд недоступен
    const mockData = generateMockData(rawConfig)
    console.log('🎭 Сгенерированы mock данные:', mockData)
    return mockData
  }
}

// Функция для преобразования ответа бэкенда в формат фронтенда
function transformBackendResponse(backendData: BackendResponse[], originalConfig: BlockConfig[]): BlockConfig[] {
  return originalConfig.map(originalBlock => {
    // Находим соответствующий блок в ответе бэкенда
    const backendBlock = backendData.find(
      block => block.component_name === originalBlock.component_name && 
               block.parent_block_id === originalBlock.parent_block_id
    )
    
    if (!backendBlock || !backendBlock.items) {
      // Если данных нет, возвращаем оригинальный блок с пометкой
      return {
        ...originalBlock,
        action_params: [
          ...originalBlock.action_params,
          {
            variable: 'backend_status',
            data: 'no_data'
          }
        ]
      }
    }
    
    // Преобразуем данные бэкенда в action_params
    const backendParams = backendBlock.items.map(item => ({
      variable: `backend_${item.variable}`,
      data: {
        title: item.title,
        content: item.data,
        hidden_data: item.hidden_data,
        status: item.status,
        fate: item.fate,
        original_variable: item.variable
      }
    }))
    
    return {
      ...originalBlock,
      action_params: [
        ...originalBlock.action_params,
        {
          variable: 'backend_status',
          data: 'loaded'
        },
        ...backendParams
      ]
    }
  })
}

// Функция для генерации mock данных
function generateMockData(rawConfig: BlockConfig[]): BlockConfig[] {
  return rawConfig.map(block => {
    const mockData = {
      ...block,
      action_params: [
        ...block.action_params,
        {
          variable: 'reference_id',
          data: `mock.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
        }
      ]
    }

    // Добавляем специфичные mock данные в зависимости от типа компонента
    switch (block.component_name) {
      case 'text_block':
        mockData.action_params.push({
          variable: 'mock_content',
          data: getMockTextContent(block)
        })
        break
        
      case 'info_panel':
        mockData.action_params.push({
          variable: 'mock_info',
          data: getMockInfoData(block)
        })
        break
        
      case 'progress_bar':
        mockData.action_params.push({
          variable: 'mock_progress',
          data: {
            value: Math.floor(Math.random() * 100),
            max: 100,
            status: 'active'
          }
        })
        break
        
      case 'action_button':
        mockData.action_params.push({
          variable: 'mock_button',
          data: {
            enabled: true,
            loading: false
          }
        })
        break
    }

    return mockData
  })
}

function getMockTextContent(block: BlockConfig): any {
  const keysParam = block.action_params?.find(p => p.variable === 'keys')
  const key = keysParam?.data?.[0]
  
  const mockTexts: Record<string, string> = {
    'article_title': 'Заголовок статьи из бэкенда',
    'article_content': 'Содержание статьи, загруженное с сервера. Это демонстрация работы с реальными данными.',
    'project_name': 'Проект "Диоген" - Система управления контентом',
    'order_title': 'Заказ #12345 - Разработка веб-приложения',
    'order_description': 'Подробное описание заказа, полученное от бэкенда'
  }
  
  return {
    content: mockTexts[key] || 'Текст загружен с сервера',
    editable: block.action_mode === 'editable_layout'
  }
}

function getMockInfoData(block: BlockConfig): any {
  const keysParam = block.action_params?.find(p => p.variable === 'keys')
  const keys = keysParam?.data || []
  
  const mockInfo: Record<string, any> = {
    '19003': { label: 'Статус', value: 'Активный', type: 'status' },
    '19004': { label: 'Приоритет', value: 'Высокий', type: 'priority' },
    '19005': { label: 'Категория', value: 'Разработка', type: 'category' },
    '19006': { label: 'Автор', value: 'Иван Петров', type: 'user' },
    '19007': { label: 'Дата создания', value: '2024-01-15', type: 'date' },
    '19008': { label: 'Последнее обновление', value: '2024-01-20', type: 'date' }
  }
  
  return {
    items: keys.map((key: string) => mockInfo[key] || { label: `Поле ${key}`, value: 'Не определено', type: 'text' }),
    layout: block.action_mode
  }
}

// Дополнительные API методы для работы с бэкендом
export async function fetchPageMeta(pageId: string): Promise<any> {
  try {
    return await apiService.get(`/api/page/${pageId}/meta`)
  } catch (error) {
    console.warn('⚠️ Не удалось загрузить мета-данные страницы:', error)
    return { title: 'Страница', description: 'Описание недоступно' }
  }
}

export async function savePageConfig(pageId: string, config: BlockConfig[]): Promise<boolean> {
  try {
    await apiService.put(`/api/page/${pageId}/config`, config)
    console.log('✅ Конфигурация страницы сохранена')
    return true
  } catch (error) {
    console.error('❌ Ошибка сохранения конфигурации:', error)
    return false
  }
}

export async function executeAction(actionData: any): Promise<any> {
  try {
    return await apiService.post('/api/action/execute', actionData)
  } catch (error) {
    console.warn('⚠️ Ошибка выполнения действия:', error)
    throw error
  }
} 