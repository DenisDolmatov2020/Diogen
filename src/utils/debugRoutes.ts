import { getGeneratedRoutes } from '@/router/generatedRoutes'
import { env, devGroup } from '@/utils/env'

export function logGeneratedRoutes() {
  const routes = getGeneratedRoutes()
  
  devGroup('🚀 Автоматически сгенерированные маршруты:', () => {
    routes.forEach(route => {
      console.log(`📁 ${route.file} → 🌐 ${route.route}`)
    })
  })
  
  return routes
}

// Автоматически показываем маршруты в режиме разработки
if (env.devMode) {
  logGeneratedRoutes()
} 