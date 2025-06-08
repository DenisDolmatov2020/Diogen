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
    // Новая страница чата
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/components/ChatPage.vue')
    },
    // Демо интерактивной строки ввода
    {
      path: '/demo/input',
      name: 'InputDemo',
      component: () => import('@/components/InputDemo.vue')
    },
    // Демо чат-ввода
    {
      path: '/demo/chat-input',
      name: 'ChatInputDemo',
      component: () => import('@/components/ChatInputDemo.vue')
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