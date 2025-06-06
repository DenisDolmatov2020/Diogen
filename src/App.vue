<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { getGeneratedRoutes } from '@/router/generatedRoutes'
import { 
  getCurrentReferenceId, 
  parseReferenceId
} from '@/utils/referenceIdManager'
import { ref, onMounted } from 'vue'
import ReferenceIdPanel from '@/components/core/ReferenceIdPanel.vue'

// Получаем список всех доступных маршрутов для навигации
const routes = getGeneratedRoutes()

// Состояние для reference_id
const currentRefId = ref<string>('')
const showRefIdPanel = ref(false)

// Загрузка текущего reference_id
function loadCurrentReferenceId() {
  const refId = getCurrentReferenceId()
  currentRefId.value = refId || 'Не установлен'
}

// Показ уведомления
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.classList.add('show')
  }, 10)
  
  setTimeout(() => {
    notification.classList.add('fade-out')
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 500)
  }, 3000)
}

// Парсинг reference_id для отображения компонентов
function getParsedRefId() {
  if (currentRefId.value === 'Не установлен') return null
  return parseReferenceId(currentRefId.value)
}

// Обработчик обновления Reference ID из компонента
function handleRefIdUpdated(newRefId: string) {
  currentRefId.value = newRefId || 'Не установлен'
  showNotification('Reference ID обновлен', 'success')
}

// Обработчик закрытия панели
function handlePanelClose() {
  showRefIdPanel.value = false
}

function getRouteLabel(routePath: string): string {
  // Преобразуем путь в человекочитаемое название
  // Сначала проверяем предопределенные метки
  const predefinedLabels: Record<string, string> = {
    '/article/list': '📄 Статьи',
    '/order/detail': '📋 Заказы',
    '/test/backend_integration': '🔧 Тест API'
    // Добавьте другие метки по мере необходимости
  }
  if (predefinedLabels[routePath]) {
    return predefinedLabels[routePath]
  }

  // Если нет предопределенной метки, пытаемся сгенерировать из пути
  const parts = routePath.split('/').filter(part => part && !part.startsWith(':'))
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1]
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, ' ')
  }
  return routePath // Возвращаем сам путь, если ничего не подошло
}

const route = useRoute()

onMounted(() => {
  loadCurrentReferenceId()
})
</script>

<template>
  <div class="app">
    <!-- Современная навигация с градиентом -->
    <header class="header">
      <nav class="nav-container">
        <div class="nav-content">
          <!-- Логотип и название -->
          <div class="logo-section">
            <div class="logo-icon">🚀</div>
            <div class="logo-text-container">
              <h1 class="logo-text">Диоген</h1>
              <span class="logo-subtitle">новый движок</span>
            </div>
          </div>
          
          <!-- Навигационные ссылки -->
          <div class="ml-4 w-full flex justify-between">
            <div class="nav-links">
              <RouterLink
                v-for="routeItem in routes"
                :key="routeItem.route"
                :to="routeItem.route"
                class="nav-link"
                active-class="nav-link-active"
              >
                <span class="nav-link-text">{{ getRouteLabel(routeItem.route) }}</span>
              </RouterLink>
            </div>

            
            <!-- Кнопка управления Reference ID -->
            <button 
              @click="showRefIdPanel = !showRefIdPanel"
              class="nav-link ref-id-button"
              :class="{ 'ref-id-active': showRefIdPanel }"
            >
              🆔 <span class="ml-1">
                  ID Form
                  </span>
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Reference ID панель как компонент -->
    <ReferenceIdPanel
      v-model="showRefIdPanel"
      @close="handlePanelClose"
      @ref-id-updated="handleRefIdUpdated"
    />

    <!-- Основной контент -->
    <main class="main-content">
      <div class="content-wrapper">
        <RouterView :key="route.fullPath" />
      </div>
    </main>
    
    <!-- Декоративные элементы -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
  </div>
</template>

<style scoped>
.app {
  @apply min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100;
  position: relative;
  overflow-x: hidden;
}

/* Навигационная панель */
.header {
  @apply fixed top-0 left-0 right-0 z-50;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.nav-container {
  @apply max-w-7xl mx-auto px-6 py-2;
}

.nav-content {
  @apply flex items-center justify-between;
}

/* Логотип */
.logo-section {
  @apply flex items-center gap-3;
}

.logo-icon {
  @apply text-3xl;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}

.logo-text-container {
  @apply flex flex-col;
}

.logo-text {
  @apply text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent;
  border-bottom: 2px solid rgba(59, 130, 246, 0.6);
  padding-bottom: 2px;
  line-height: 1.2;
}

.logo-subtitle {
  @apply text-xs text-slate-400 mt-1;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* Навигационные ссылки */
.nav-links {
  @apply flex items-center gap-2;
}

.nav-link {
  @apply relative px-4 py-2 rounded-lg font-medium transition-all duration-300;
  @apply text-slate-300 hover:text-white;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-link:hover {
  @apply transform -translate-y-0.5;
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.nav-link-active {
  @apply text-white;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
}

.nav-link-text {
  @apply relative z-10;
}

/* Reference ID кнопка */
.ref-id-button {
  @apply cursor-pointer;
}

.ref-id-active {
  @apply text-white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: rgba(16, 185, 129, 0.5) !important;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4) !important;
}

/* Основной контент */
.main-content {
  @apply min-h-screen relative z-10;
  padding-top: 100px; /* Отступ для фиксированной шапки */
}

.content-wrapper {
  @apply max-w-7xl mx-auto px-6 pb-12;
}

/* Декоративные элементы фона */
.background-decoration {
  @apply fixed inset-0 pointer-events-none overflow-hidden;
  z-index: 1;
}

.bg-circle {
  @apply absolute rounded-full opacity-20;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  filter: blur(60px);
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  top: -300px;
  right: -300px;
  animation: float 20s ease-in-out infinite;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  left: -200px;
  animation: float 25s ease-in-out infinite reverse;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 15s ease-in-out infinite;
}

/* Анимации */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(15px) rotate(240deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
}

/* Уведомления */
:global(.notification) {
  @apply fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-[100];
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

:global(.notification.show) {
  transform: translateX(0);
  opacity: 1;
}

:global(.notification.success) {
  @apply bg-green-600;
}

:global(.notification.error) {
  @apply bg-red-600;
}

:global(.notification.fade-out) {
  opacity: 0;
  transform: translateX(100%);
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-content {
    @apply flex-col gap-4;
  }
  
  .nav-links {
    @apply flex-wrap justify-center;
  }
  
  .nav-link {
    @apply text-sm px-3 py-1.5;
  }
  
  .content-wrapper {
    @apply px-4;
  }
  
  .ref-id-panel {
    @apply w-80 right-2;
  }
}
</style>
