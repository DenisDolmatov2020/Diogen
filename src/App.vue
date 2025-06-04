<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { getGeneratedRoutes } from '@/router/generatedRoutes'
import { 
  getCurrentReferenceId, 
  createNewReferenceId, 
  parseReferenceId,
  clearReferenceId 
} from '@/utils/referenceIdManager'
import { ref, onMounted } from 'vue'

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

// Создание нового reference_id
function createNewRefId() {
  const newRefId = createNewReferenceId()
  currentRefId.value = newRefId
  console.log('🆕 Создан новый reference_id:', newRefId)
  
  // Показываем уведомление
  showNotification('Создан новый reference_id', 'success')
}

// Очистка reference_id
function clearRefId() {
  clearReferenceId()
  currentRefId.value = 'Не установлен'
  console.log('🗑️ reference_id очищен')
  
  // Показываем уведомление
  showNotification('Reference ID очищен', 'success')
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
            
            <!-- Кнопка управления Reference ID -->
            <button 
              @click="showRefIdPanel = !showRefIdPanel"
              class="nav-link ref-id-button"
              :class="{ 'ref-id-active': showRefIdPanel }"
            >
              🆔 ID
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Reference ID панель -->
    <div v-if="showRefIdPanel" class="ref-id-panel">
      <div class="ref-id-content">
        <div class="ref-id-header">
          <h3>🆔 Reference ID Management</h3>
          <button @click="showRefIdPanel = false" class="close-button">×</button>
        </div>
        
        <div class="ref-id-info">
          <div class="current-id">
            <strong>Текущий ID:</strong>
            <code class="id-display">{{ currentRefId }}</code>
          </div>
          
          <div v-if="getParsedRefId()" class="id-breakdown">
            <div class="breakdown-item">
              <span class="label">Проект:</span>
              <span class="value">{{ getParsedRefId()?.projectId }}</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Пользователь:</span>
              <span class="value">{{ getParsedRefId()?.userId }}</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Timestamp:</span>
              <span class="value">{{ getParsedRefId() ? new Date(getParsedRefId()!.timestamp * 1000).toLocaleString() : 'N/A' }}</span>
            </div>
          </div>
          
          <div class="ref-id-actions">
            <button @click="createNewRefId" class="action-button primary">
              🆕 Создать новый ID
            </button>
            <button @click="clearRefId" class="action-button secondary">
              🗑️ Очистить ID
            </button>
            <button @click="loadCurrentReferenceId" class="action-button">
              🔄 Обновить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <main class="main-content">
      <div class="content-wrapper">
        <RouterView :key="$route.fullPath" />
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

/* Reference ID панель */
.ref-id-panel {
  @apply fixed top-20 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-40;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ref-id-content {
  @apply p-4;
}

.ref-id-header {
  @apply flex items-center justify-between mb-4 pb-2 border-b border-gray-200;
}

.ref-id-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.close-button {
  @apply text-gray-500 hover:text-gray-700 text-xl w-6 h-6 flex items-center justify-center rounded;
  @apply hover:bg-gray-100 transition-colors;
}

.ref-id-info {
  @apply space-y-4;
}

.current-id {
  @apply flex flex-col gap-2;
}

.current-id strong {
  @apply text-sm text-gray-700;
}

.id-display {
  @apply bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800 break-all;
}

.id-breakdown {
  @apply bg-blue-50 p-3 rounded-lg space-y-2;
}

.breakdown-item {
  @apply flex justify-between text-sm;
}

.breakdown-item .label {
  @apply text-gray-600 font-medium;
}

.breakdown-item .value {
  @apply text-gray-800 font-mono;
}

.ref-id-actions {
  @apply flex gap-2 flex-wrap;
}

.action-button {
  @apply px-3 py-1.5 rounded text-sm font-medium transition-colors;
  @apply border;
}

.action-button.primary {
  @apply bg-blue-600 text-white border-blue-600 hover:bg-blue-700;
}

.action-button.secondary {
  @apply bg-red-600 text-white border-red-600 hover:bg-red-700;
}

.action-button:not(.primary):not(.secondary) {
  @apply bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200;
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
