import { env, devLog, devError } from '@/utils/env'

export interface ApiHealthStatus {
  isOnline: boolean
  responseTime: number
  error?: string
  timestamp: string
}

export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()
  
  try {
    devLog('🏥 Проверка состояния API...')
    
    // Простой health check запрос
    const healthCheckUrl = env.devMode 
      ? '/api' 
      : '/api'
    
    await fetch(healthCheckUrl, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const responseTime = performance.now() - startTime
    
    devLog(`✅ API доступен (${Math.round(responseTime)}ms)`)
    
    return {
      isOnline: true,
      responseTime: Math.round(responseTime),
      timestamp
    }
    
  } catch (error) {
    const responseTime = performance.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    
    devError('❌ API недоступен:', errorMessage)
    
    return {
      isOnline: false,
      responseTime: Math.round(responseTime),
      error: errorMessage,
      timestamp
    }
  }
}

export async function diagnoseApiConnection(): Promise<void> {
  devLog('🔍 Диагностика API подключения:')
  
  const health = await checkApiHealth()
  
  console.group('📊 Результаты диагностики API:')
  console.log('🌐 URL:', window.location.href)
  console.log('🔧 Режим разработки:', env.devMode)
  console.log('📡 API статус:', health.isOnline ? '✅ Доступен' : '❌ Недоступен')
  console.log('⏱️ Время отклика:', `${health.responseTime}ms`)
  console.log('🕒 Время проверки:', health.timestamp)
  
  if (!health.isOnline && health.error) {
    console.error('❌ Ошибка:', health.error)
  }
  
  // Дополнительная информация для отладки
  console.log('🌍 User Agent:', navigator.userAgent)
  console.log('🔗 Базовый URL:', import.meta.env.BASE_URL)
  console.log('🔑 API конфигурация:', {
    authUrl: env.api.authUrl,
    loginEndpoint: env.api.loginEndpoint
  })
  
  console.groupEnd()
}

// Автоматическая диагностика при загрузке в режиме разработки
if (env.devMode) {
  // Запускаем через небольшую задержку, чтобы не блокировать загрузку
  setTimeout(() => {
    diagnoseApiConnection().catch(console.error)
  }, 1000)
} 