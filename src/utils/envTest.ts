import { env, devGroup, isDevelopment } from '@/utils/env'

export function testEnvironmentVariables() {
  devGroup('🔧 Тест переменных окружения:', () => {
    console.log('📊 Режим разработки (import.meta.env.DEV):', import.meta.env.DEV)
    console.log('📊 Режим разработки (env.isDev):', env.devMode)
    console.log('📊 Режим разработки (isDevelopment()):', isDevelopment())
    console.log('📊 Dev Mode (env.devMode):', env.devMode)

    console.log('🎯 Проект конфигурация:', env.project)
    
    console.log('🔗 BASE_URL:', import.meta.env.BASE_URL)
  })
}

// Автоматически запускаем тест в режиме разработки
if (env.devMode) {
  testEnvironmentVariables()
} 