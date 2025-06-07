<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { getGeneratedRoutes } from '@/router/generatedRoutes'
import { 
  getCurrentReferenceId 
} from '@/utils/referenceIdManager'
import { ref, onMounted } from 'vue'
import ReferenceIdPanel from '@/components/core/ReferenceIdPanel.vue'

// Получаем список всех доступных маршрутов для навигации
const routes = getGeneratedRoutes()

// Состояние для reference_id
const currentRefId = ref<string>('')
const showRefIdPanel = ref(false)
const isHeaderVisible = ref(false)

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

// Обработчик обновления Reference ID из компонента
function handleRefIdUpdated(newRefId: string) {
  currentRefId.value = newRefId || 'Не установлен'
  showNotification('Reference ID обновлен', 'success')
}

// Обработчик закрытия панели
function handlePanelClose() {
  showRefIdPanel.value = false
}

// Показать header
function showHeader() {
  isHeaderVisible.value = true
}

// Скрыть header
function hideHeader() {
  isHeaderVisible.value = false
  showRefIdPanel.value = false
}

function getRouteLabel(routePath: string): string {
  const predefinedLabels: Record<string, string> = {
    '/test/backend_integration': '🔧  Тест API',
    '/demo/settings': 'Настройки',
    '/chat': '💬  Чат-бот',
    '/demo/input': '📝  Интерактивный ввод'
  }
  if (predefinedLabels[routePath]) {
    return predefinedLabels[routePath]
  }

  const parts = routePath.split('/').filter(part => part && !part.startsWith(':'))
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1]
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, ' ')
  }
  return routePath
}

onMounted(() => {
  loadCurrentReferenceId()
})
</script>

<template>
  <div class="header-container">
    <svg width="22" height="20" viewBox="0 0 22 20" fill="b" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.24862 0.249944C1.42319 -0.144342 0.516337 0.609944 0.752051 1.49366L2.48005 7.95051C2.52336 8.11279 2.61338 8.25877 2.73895 8.37032C2.86452 8.48186 3.02009 8.55406 3.18634 8.57794L11.6583 9.78823C11.9035 9.82252 11.9035 10.1774 11.6583 10.2125L3.18719 11.4219C3.02094 11.4458 2.86537 11.518 2.73981 11.6296C2.61424 11.7411 2.52421 11.8871 2.48091 12.0494L0.752051 18.5097C0.516337 19.3925 1.42319 20.1468 2.24862 19.7534L20.6755 10.9685C21.4889 10.5811 21.4889 9.42223 20.6755 9.03394L2.24862 0.249944Z" fill="#9CA3AF"/>
    </svg>

    <!-- Кнопка показа меню -->
    <div 
      class="menu-trigger"
      @mouseenter="showHeader"
      :class="{ 'trigger-active': isHeaderVisible }"
    >
      <div class="trigger-icon">
        <div class="trigger-line"></div>
        <div class="trigger-line"></div>
        <div class="trigger-line"></div>
      </div>
      <div class="trigger-text">меню</div>
    </div>

    <!-- Основной header -->
    <header 
      class="header"
      :class="{ 'header-visible': isHeaderVisible }"
      @mouseenter="showHeader"
      @mouseleave="hideHeader"
    >
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
          <div class="nav-section">
            <div class="nav-links">
              <RouterLink
                v-for="routeItem in routes"
                :key="routeItem.route"
                :to="routeItem.route"
                class="nav-link"
                active-class="nav-link-active"
                @click="hideHeader"
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
              🆔 <span class="ml-1">ID Form</span>
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
  </div>
</template>

<style scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* Кнопка показа меню */
.menu-trigger {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 0 0 16px 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-top: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  opacity: 0.7;
}

.menu-trigger:hover {
  opacity: 1;
  transform: translateX(-50%) translateY(2px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
}

.trigger-active {
  opacity: 1;
  transform: translateX(-50%) translateY(2px);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
}

.trigger-icon {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 18px;
}

.trigger-line {
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0 0%, #94a3b8 100%);
  border-radius: 1px;
  transition: all 0.3s ease;
}

.trigger-line:nth-child(1) {
  width: 100%;
}

.trigger-line:nth-child(2) {
  width: 80%;
  margin-left: auto;
}

.trigger-line:nth-child(3) {
  width: 60%;
  margin-left: auto;
}

.trigger-active .trigger-line {
  background: linear-gradient(90deg, #ffffff 0%, #e2e8f0 100%);
}

.trigger-text {
  font-size: 10px;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.trigger-active .trigger-text {
  color: #ffffff;
}

/* Основной header */
.header {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.96) 100%);
  backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  transform: translateY(-100%);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  border-radius: 0 0 24px 24px;
  margin: 0 16px;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%);
}

.header-visible {
  transform: translateY(0);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* Логотип */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
  animation: logoGlow 3s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  from { filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6)); }
  to { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8)); }
}

.logo-text-container {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #fb7185 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  position: relative;
}

.logo-text::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 100%);
  border-radius: 1px;
}

.logo-subtitle {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 400;
  letter-spacing: 1px;
  margin-top: 2px;
  text-transform: uppercase;
}

/* Навигация */
.nav-section {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  justify-content: flex-end;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  position: relative;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  color: #cbd5e1;
  
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  transition: left 0.5s ease;
}

.nav-link:hover {
  color: #ffffff;
  transform: translateY(-2px);
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link-active {
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.nav-link-text {
  position: relative;
  z-index: 2;
}

/* Reference ID кнопка */
.ref-id-button {
  cursor: pointer;
  background: rgba(16, 185, 129, 0.1) !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
  color: #10b981;
}

.ref-id-button:hover {
  background: rgba(16, 185, 129, 0.2) !important;
  border-color: rgba(16, 185, 129, 0.5) !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3) !important;
}

.ref-id-active {
  color: #ffffff !important;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: rgba(16, 185, 129, 0.6) !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
}

/* Адаптивность */
@media (max-width: 768px) {
  .header {
    margin: 0 8px;
    border-radius: 0 0 16px 16px;
  }
  
  .nav-container {
    padding: 12px 16px;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-section {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  
  .nav-link {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .menu-trigger {
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .header {
    margin: 0 4px;
  }
  
  .nav-container {
    padding: 8px 12px;
  }
  
  .logo-section {
    gap: 8px;
  }
  
  .logo-icon {
    font-size: 1.5rem;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
}
</style> 