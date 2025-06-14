import { createRouter, createWebHistory } from 'vue-router'
import { buildRoutes } from './generatedRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Главная страница - редирект на список статей
    {
      path: '/',
      redirect: '/widget/example.html'
    },
    // Новая страница чата
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/components/ChatPage.vue')
    },

    // Reference ID Manager
    {
      path: '/reference-id',
      name: 'ReferenceIdManager',
      component: () => import('@/components/ReferenceIdPage.vue')
    },
    // Автоматически сгенерированные маршруты из JSON-конфигов
    ...buildRoutes()
  ]
})

export default router 