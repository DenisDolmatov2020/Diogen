import { env, devLog, devWarn, devError } from '@/utils/env'
import { getOrCreateReferenceId } from '@/utils/referenceIdManager'

interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface ApiConfig {
  authUrl: string
  frontToken: string
  basicLogin: string
  basicPassword: string
  loginEndpoint: string
}

interface RequestConfig {
  method?: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

class ApiService {
  private config: ApiConfig
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    this.config = {
      authUrl: env.api.authUrl,
      frontToken: env.api.frontToken,
      basicLogin: env.api.basicLogin,
      basicPassword: env.api.basicPassword,
      loginEndpoint: env.api.loginEndpoint
    }
  }

  private async ensureValidToken(): Promise<void> {
    // Проверяем, нужно ли обновить токен
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return // Токен ещё действителен (с запасом в 1 минуту)
    }

    devLog('🔑 Получаем новый токен...')
    await this.authenticate()
  }

  private async authenticate(): Promise<void> {
    try {
      const credentials = btoa(`${this.config.basicLogin}:${this.config.basicPassword}`)
      
      const response = await fetch(`${this.config.authUrl}/${this.config.loginEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AuthResponse = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000)
      
      devLog('✅ Токен получен успешно')
    } catch (error) {
      devError('❌ Ошибка аутентификации:', error)
      throw new Error('Не удалось получить токен доступа')
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Основной метод для выполнения запросов
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    await this.ensureValidToken()

    const fullUrl = url.startsWith('http') ? url : `${this.config.authUrl}${url}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    // Добавляем токен авторизации
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    // Добавляем front_token если нужно
    if (this.config.frontToken) {
      headers['X-Front-Token'] = this.config.frontToken
    }

    const requestOptions: RequestInit = {
      method: config.method || 'GET',
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined
    }

    try {
      const response = await this.fetchWithTimeout(fullUrl, requestOptions, config.timeout)

      // Обработка ошибки авторизации
      if (response.status === 401) {
        devWarn('🔑 Токен истёк, обновляем...')
        this.accessToken = null
        this.tokenExpiry = null
        
        // Повторяем запрос с новым токеном
        await this.ensureValidToken()
        if (this.accessToken) {
          headers.Authorization = `Bearer ${this.accessToken}`
          const retryResponse = await this.fetchWithTimeout(fullUrl, {
            ...requestOptions,
            headers
          }, config.timeout)
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }
          
          return await retryResponse.json()
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Проверяем, есть ли контент для парсинга
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return response.text() as any
    } catch (error) {
      devError('❌ Ошибка API запроса:', error)
      throw error
    }
  }

  // Удобные методы для разных типов запросов
  async get<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', body: data })
  }

  async put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', body: data })
  }

  async delete<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }


  // Универсальный метод для отправки запросов на create_answer_for_front_api
  async sendRequest(payload: any): Promise<any> {
    try {
      devLog('📤 Отправка запроса на create_answer_for_front_api:', payload)
      
      // Определяем URL в зависимости от окружения
      const apiUrl = env.devMode 
        ? '/api/create_answer_for_front_api'  // Для разработки - используем прокси
        : '/api/create_answer_for_front_api'  // Для production - используем Netlify редирект
      
      devLog('🌐 Используем API URL:', apiUrl)
      devLog('🔧 Режим разработки:', env.devMode)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TOKEN': 'wYZj8hN91r7ggb33PDzGMPnOEZxEfQDRKDYuFG-JLwG0Dot8lZAhfHbXXg-C51wimX2oOd_s3JGYCCwN_FrjstjMNr_2uYLoYRfF8uY8rJWXFnI8SFUKx3lrTXOGLUnc'
        },
        body: JSON.stringify(payload)
      })
      
      devLog('📊 Статус ответа:', response.status)
      devLog('📊 URL запроса:', response.url)
      
      if (!response.ok) {
        devError('❌ HTTP ошибка:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        })
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const responseData = await response.json()
      devLog('📥 Ответ сервера:', responseData)
      
      return responseData
    } catch (error) {
      devError('❌ Ошибка при отправке запроса:', error)
      
      // Дополнительная диагностика для production
      if (!env.devMode) {
        console.error('🚨 Production API Error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }
      
      throw error
    }
  }

  // Метод для создания полного reference_id на сервере
  async createFullReferenceId(partialReferenceId: string, inputData?: {
    input_title?: string
    input_text?: string
    input_audio?: string
    input_file?: string
  }): Promise<string> {
    try {
      // Формируем action_params с переданными данными или значениями по умолчанию
      const actionParams = [
        {
          variable: "input_title",
          data: inputData?.input_title || ""
        },
        {
          variable: "input_text", 
          data: inputData?.input_text || ""
        },
        {
          variable: "reference_id",
          data: partialReferenceId
        }
      ]

      // Добавляем опциональные поля, если они заполнены
      if (inputData?.input_audio) {
        actionParams.push({
          variable: "input_audio",
          data: inputData.input_audio
        })
      }

      if (inputData?.input_file) {
        actionParams.push({
          variable: "input_file",
          data: inputData.input_file
        })
      }

      const payload = [{
        action_mode: "processing",
        action_params: actionParams,
        component_id: "0",
        component_name: "card_6_fields",
        parent_block_id: "-reference_id-"
      }]
      
      // Используем универсальный метод
      const responseData = await this.sendRequest(payload)
      
      // Извлекаем полный reference_id из ответа
      if (responseData && responseData.length > 0 && responseData[0].items && responseData[0].items.length > 0) {
        const referenceIdItem = responseData[0].items.find((item: any) => 
          item.meta && item.meta.variable === 'reference_id'
        )
        
        if (referenceIdItem && referenceIdItem.meta && referenceIdItem.meta.data) {
          const fullReferenceId = referenceIdItem.meta.data
          devLog('✅ Получен полный reference_id:', fullReferenceId)
          return fullReferenceId
        }
      }
      
      throw new Error('Не удалось извлечь reference_id из ответа сервера')
    } catch (error) {
      devError('❌ Ошибка при создании полного reference_id:', error)
      throw error
    }
  }

  // Отправка обновленных данных компонентов (переписан для использования нового метода)
  async sendUpdatedComponentData(projectId: string, referenceId: string, changedFields: Record<string, any>): Promise<any> {
    // Формируем массив с meta_data компонентом и измененными полями
    const payload = [
      {
        "component_name": "meta_data",
        "action_mode": "processing",
        "action_params": [
          {
            "variable": "reference_id",
            "data": referenceId
          },
          // Добавляем все измененные поля
          ...Object.entries(changedFields).map(([fieldName, value]) => ({
            "variable": fieldName,
            "data": value,
            "action_mode": "processing"
          }))
        ]
      }
    ]
    devLog('# Отправка обновленных данных:', projectId)
    devLog('📤 Отправка обновленных данных:', payload)
    
    // Используем универсальный метод
    return this.sendRequest(payload)
  }

  // Метод для объединения локальных изменений с компонентами
  async saveComponentChanges(projectId: string, referenceId: string, changedFields: Record<string, any>): Promise<any> {
    try {
      // Отправляем только измененные данные
      const result = await this.sendUpdatedComponentData(projectId, referenceId, changedFields)
      
      devLog('✅ Данные успешно сохранены:', result)
      return result
    } catch (error) {
      devError('❌ Ошибка при сохранении данных:', error)
      throw error
    }
  }

  // Специальный метод для чат-бота
  async sendChatMessage(message: string, referenceId?: string, keys?: string[]): Promise<any> {
    try {
      devLog('💬 Отправка сообщения чат-боту:', { message, referenceId, keys })
      
      // Используем переданный reference_id или получаем/создаем сохраненный
      const finalReferenceId = referenceId || getOrCreateReferenceId()
      devLog('🆔 Используемый reference_id:', finalReferenceId)
      
      // Формируем запрос в новом формате
      const payload = [
        {
          "component_name": "meta_data",
          "parent_block_id": "block-0-1",
          "action_mode": "dialog",
          "action_params": [
            {
              "variable": "input_text",
              "data": message
            },
            {
              "variable": "reference_id",
              "data": finalReferenceId
            }
          ]
        }
      ]
      
      // Всегда используем относительный путь (для dev через Vite прокси, для production через Netlify редиректы)
      const apiUrl = '/api/v1/mentorium'
      devLog('🌐 Отправка запроса к чат-боту API:', apiUrl)
      
      // Создаем Basic Auth заголовок
      const credentials = btoa(`${env.api.basicLogin}:${env.api.basicPassword}`)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      devLog('📊 Статус ответа:', response.status)
      devLog('📊 URL запроса:', response.url)
      
      if (!response.ok) {
        devError('❌ HTTP ошибка:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        })
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const responseData = await response.json()
      devLog('📥 Ответ чат-бота:', responseData)
      
      return responseData
    } catch (error) {
      devError('❌ Ошибка при отправке сообщения чат-боту:', error)
      
      // В случае ошибки возвращаем базовый ответ
      return [
        {
          "component_name": "text_block",
          "parent_block_id": "block-0-0",
          "items": [
            {
              "title": "Ошибка",
              "data": "Извините, произошла ошибка при обращении к серверу. Попробуйте еще раз.",
              "status": "missed"
            }
          ]
        }
      ]
    }
  }
}

// Экспортируем единственный экземпляр
export const apiService = new ApiService()
export default apiService 