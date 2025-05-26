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
      authUrl: import.meta.env.VITE_API_AUTH_URL,
      frontToken: import.meta.env.VITE_APP_FRONT_TOKEN,
      basicLogin: import.meta.env.VITE_API_BASIC_LOGIN,
      basicPassword: import.meta.env.VITE_API_BASIC_PASSWORD,
      loginEndpoint: import.meta.env.VITE_API_LOGIN_ENDPOINT
    }
  }

  private async ensureValidToken(): Promise<void> {
    // Проверяем, нужно ли обновить токен
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return // Токен ещё действителен (с запасом в 1 минуту)
    }

    console.log('🔑 Получаем новый токен...')
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
      
      console.log('✅ Токен получен успешно')
    } catch (error) {
      console.error('❌ Ошибка аутентификации:', error)
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
        console.warn('🔑 Токен истёк, обновляем...')
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
      console.error('❌ Ошибка API запроса:', error)
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

  // Получение текущего токена (для отладки)
  getAccessToken(): string | null {
    return this.accessToken
  }

  // Принудительное обновление токена
  async refreshToken(): Promise<void> {
    this.accessToken = null
    this.tokenExpiry = null
    await this.authenticate()
  }

  // Проверка состояния API
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health')
      return true
    } catch {
      return false
    }
  }
}

// Экспортируем единственный экземпляр
export const apiService = new ApiService()
export default apiService 