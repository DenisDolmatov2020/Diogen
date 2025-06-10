<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getGeneratedRoutes } from '@/router/generatedRoutes'
import { 
  getCurrentReferenceId 
} from '@/utils/referenceIdManager'

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

// Получаем список всех доступных маршрутов для навигации
const routes = getGeneratedRoutes()

// Состояние для reference_id
const currentRefId = ref<string>('')
const isHeaderVisible = ref(false)

// Загрузка текущего reference_id
function loadCurrentReferenceId() {
  const refId = getCurrentReferenceId()
  currentRefId.value = refId || 'Не установлен'
}

// Получаем текущий маршрут
const route = useRoute()

// Проверяем, нужно ли скрывать кнопку меню
const shouldShowMenuButton = computed(() => {
  return !route.query.hideMenuIcon
})

// Показать header
function showHeader() {
  isHeaderVisible.value = true
}

// Скрыть header
function hideHeader() {
  isHeaderVisible.value = false
}

function getRouteLabel(routePath: string): string {
  const predefinedLabels: Record<string, string> = {
    '/test/backend_integration': '🔧  Тест API',
    '/demo/settings': 'Настройки',
    '/chat': '💬  Чат-бот',
    '/demo/input': '📝  Интерактивный ввод',
    '/reference-id': '🆔  ID Manager'
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


    <!-- Кнопка показа меню -->
    <div
      v-if="shouldShowMenuButton"
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
          </div>
        </div>
      </nav>
    </header>
  </div>
</template>

<style scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  max-width: 100%;
}

/* Кнопка показа меню */
.menu-trigger {
  position: absolute;
  left: -20px;
  transform: translateX(50%);
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
  transform: translateX(-50%);
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
  min-width: 360px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.96) 100%);
  backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  transform: translateY(-100%);
  transform-origin: top right;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  border-radius: 0 0 24px 24px;
  margin: 0 16px;
  overflow: hidden;
  
  /* Добавляем max-height для предотвращения перекрытия элементов */
  max-height: 0;
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
  max-height: 200px; /* Устанавливаем достаточную высоту для видимого хеадера */
}

.nav-container {
  max-width: 100%;
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
  font-size: 1.5rem;
  font-weight: 650;
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
  font-size: 8px;
  color: #94a3b8;
  font-weight: 400;
  letter-spacing: .8px;
  margin-top: 1px;
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

/* Адаптивность */
@media (max-width: 768px) {
  .header {
    margin: 0 8px;
    border-radius: 0 0 16px 16px;
  }
  
  .header-visible {
    max-height: 250px; /* Увеличиваем высоту для мобильных устройств */
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
  
  .header-visible {
    max-height: 280px; /* Ещё больше высоты для маленьких экранов */
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