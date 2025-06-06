import { createRouter, createWebHistory } from 'vue-router'
import { buildRoutes } from './generatedRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Главная страница - редирект на список статей
    {
      path: '/',
      redirect: '/test/backend_integration'
    },
    // Автоматически сгенерированные маршруты из JSON-конфигов
    ...buildRoutes()
  ]
})

export default router 