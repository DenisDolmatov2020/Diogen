import { getGeneratedRoutes } from '@/router/generatedRoutes'

export function logGeneratedRoutes() {
  const routes = getGeneratedRoutes()
  
  console.group('🚀 Автоматически сгенерированные маршруты:')
  routes.forEach(route => {
    console.log(`📁 ${route.file} → 🌐 ${route.route}`)
  })
  console.groupEnd()
  
  return routes
}

// Автоматически показываем маршруты в режиме разработки
if (import.meta.env.DEV) {
  logGeneratedRoutes()
} 