// Утилиты для работы с переменными окружения
export const env = {
  
  // API конфигурация
  api: {
    authUrl: import.meta.env.VITE_API_AUTH_URL || 'http://194.87.143.218:8901',
    frontToken: import.meta.env.VITE_APP_FRONT_TOKEN || '123456',
    basicLogin: import.meta.env.VITE_API_BASIC_LOGIN || 'slsuser',
    basicPassword: import.meta.env.VITE_API_BASIC_PASSWORD || '20241001',
    loginEndpoint: import.meta.env.VITE_API_LOGIN_ENDPOINT || 'api/auth/token',
    chatUrl: import.meta.env.VITE_CHAT_API_URL || 'http://194.87.143.218:8901/api/v1/mentorium'
  },
  
  // Проект конфигурация
  project: {
    id: import.meta.env.VITE_PROJECT_ID || '001',
    userId: import.meta.env.VITE_USER_ID || '3654823'
  },
  
  // Дополнительные флаги разработки
  devMode: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
}

// Функции для проверки режима
export const isDevelopment = () => env.devMode

// Логгер с проверкой режима разработки
export const devLog = (...args: any[]) => {
  if (env.devMode) {
    console.log(...args)
  }
}

export const devWarn = (...args: any[]) => {
  if (env.devMode) {
    console.warn(...args)
  }
}

export const devError = (...args: any[]) => {
  if (env.devMode) {
    console.error(...args)
  }
}

// Группированный лог для разработки
export const devGroup = (title: string, callback: () => void) => {
  if (env.devMode) {
    console.group(title)
    callback()
    console.groupEnd()
  }
} 