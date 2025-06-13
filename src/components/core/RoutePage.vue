<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageRenderer from './PageRenderer.vue'
import ChangesViewer from '@/components/ui/ChangesViewer.vue'
import type { TreeBlock } from '@/types/block'
import { env, devLog, devError } from '@/utils/env'

const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const loadedData = ref<TreeBlock[] | null>(null)
const lastAction = ref<any>(null)
const isMockData = ref<boolean>(false)
const apiError = ref<string | null>(null)

// Debug панель
const showDebug = ref(false)

// Состояние для iframe
const isIframeOpen = ref(false)

// Состояние для полноэкранного режима
const isFullscreen = ref(false)

// Показываем debug в dev режиме
const isDev = computed(() => env.devMode)

const configPath = computed(() => {
  // Получаем путь к конфигу из мета-данных роута
  return route.meta.configPath as string || ''
})

// Извлекаем ID проекта из пути или из метаданных роута
const projectId = computed(() => {
  return route.meta.projectId as string || route.params.projectId as string || ''
})

const currentState = computed(() => {
  if (loading.value) return 'Загрузка'
  if (error.value) return 'Ошибка'
  return 'Загружено'
})

const dataMode = computed(() => {
  if (loading.value) return 'Загрузка...'
  if (error.value) return 'Ошибка'
  return isMockData.value ? 'Mock данные' : 'Реальный API'
})

const treeInfo = computed(() => {
  if (!loadedData.value) return null
  
  function getMaxDepth(blocks: TreeBlock[], currentDepth = 0): number {
    let maxDepth = currentDepth
    for (const block of blocks) {
      if (block.children && block.children.length > 0) {
        maxDepth = Math.max(maxDepth, getMaxDepth(block.children, currentDepth + 1))
      }
    }
    return maxDepth
  }
  
  function countBlocks(blocks: TreeBlock[]): number {
    let count = blocks.length
    for (const block of blocks) {
      if (block.children) {
        count += countBlocks(block.children)
      }
    }
    return count
  }
  
  const maxDepth = getMaxDepth(loadedData.value)
  const totalBlocks = countBlocks(loadedData.value)
  
  return {
    maxDepth,
    totalBlocks,
    rootBlocks: loadedData.value.length
  }
})

function onDataLoaded(result: { data: TreeBlock[], isMockData: boolean, error?: string }) {
  devLog('📊 Данные загружены в RoutePage:', result)
  loadedData.value = result.data
  isMockData.value = result.isMockData
  apiError.value = result.error || null
  loading.value = false
  error.value = null
}

function onDataError(errorMessage: string) {
  devError('❌ Ошибка загрузки в RoutePage:', errorMessage)
  error.value = errorMessage
  loading.value = false
}

function handleAction(actionData: any) {
  devLog('🎯 Action received in RoutePage:', actionData)
  lastAction.value = {
    timestamp: new Date().toISOString(),
    ...actionData
  }
  // Здесь можно обработать действия от компонентов
}

function retry() {
  devLog('🔄 Повторная попытка загрузки')
  loading.value = true
  error.value = null
}

// Отслеживаем изменения route.path
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    devLog(`🔄 Маршрут изменился с ${oldPath} на ${newPath}. Сбрасываем состояние...`)
    loading.value = true
    error.value = null
    loadedData.value = null
    lastAction.value = null
    isMockData.value = false
    apiError.value = null
  }
})

// Обработчик события сохранения изменений
function onChangesSaved(result: any) {
  lastAction.value = {
    type: 'changes-saved',
    timestamp: Date.now(),
    source_component: 'ChangesTracker',
    source_mode: 'save',
    details: result
  }
  
  // Отображаем данные в debug панели
  if (isDev.value && showDebug.value) {
    devLog('✅ Изменения сохранены:', result)
  }
}

// Функция для переключения iframe
function toggleIframe() {
  isIframeOpen.value = !isIframeOpen.value
}

// Закрытие iframe при клике вне его
function closeIframe() {
  isIframeOpen.value = false
  isFullscreen.value = false
}

// Переключение полноэкранного режима
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

onMounted(() => {
  devLog('🚀 RoutePage монтирован для пути:', route.path)
  devLog('📁 Config path:', configPath.value)
})
</script>

<template>
  <div class="route-page">
    <!-- Debug кнопка (только в dev режиме) -->
    <button
      v-if="isDev && !showDebug"
      class="debug-toggle"
      @click="showDebug = !showDebug"
    >
      👁️ Debug Info
    </button>

    <!-- Кнопка для открытия iframe -->
    <button
      @click="toggleIframe"
      class="iframe-toggle-button"
      :class="{ 'active': isIframeOpen }"
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.99984 24L4.93317 27.0666C4.51095 27.4888 4.0274 27.5835 3.48251 27.3506C2.93762 27.1177 2.66562 26.7008 2.66651 26.1V5.33329C2.66651 4.59996 2.92784 3.9724 3.45051 3.45063C3.97317 2.92885 4.60073 2.66751 5.33317 2.66663H26.6665C27.3998 2.66663 28.0278 2.92796 28.5505 3.45063C29.0732 3.97329 29.3341 4.60085 29.3332 5.33329V21.3333C29.3332 22.0666 29.0723 22.6946 28.5505 23.2173C28.0287 23.74 27.4007 24.0008 26.6665 24H7.99984ZM9.33317 18.6666H17.3332C17.711 18.6666 18.0278 18.5386 18.2838 18.2826C18.5398 18.0266 18.6674 17.7102 18.6665 17.3333C18.6656 16.9564 18.5376 16.64 18.2825 16.384C18.0274 16.128 17.711 16 17.3332 16H9.33317C8.95539 16 8.63895 16.128 8.38384 16.384C8.12873 16.64 8.00073 16.9564 7.99984 17.3333C7.99895 17.7102 8.12695 18.0271 8.38384 18.284C8.64073 18.5408 8.95717 18.6684 9.33317 18.6666ZM9.33317 14.6666H22.6665C23.0443 14.6666 23.3612 14.5386 23.6172 14.2826C23.8732 14.0266 24.0007 13.7102 23.9998 13.3333C23.999 12.9564 23.871 12.64 23.6158 12.384C23.3607 12.128 23.0443 12 22.6665 12H9.33317C8.95539 12 8.63895 12.128 8.38384 12.384C8.12873 12.64 8.00073 12.9564 7.99984 13.3333C7.99895 13.7102 8.12695 14.0271 8.38384 14.284C8.64073 14.5408 8.95717 14.6684 9.33317 14.6666ZM9.33317 10.6666H22.6665C23.0443 10.6666 23.3612 10.5386 23.6172 10.2826C23.8732 10.0266 24.0007 9.71018 23.9998 9.33329C23.999 8.9564 23.871 8.63996 23.6158 8.38396C23.3607 8.12796 23.0443 7.99996 22.6665 7.99996H9.33317C8.95539 7.99996 8.63895 8.12796 8.38384 8.38396C8.12873 8.63996 8.00073 8.9564 7.99984 9.33329C7.99895 9.71018 8.12695 10.0271 8.38384 10.284C8.64073 10.5408 8.95717 10.6684 9.33317 10.6666Z" fill="white"/>
      </svg>
    </button>

    <!-- Debug панель (только в dev режиме) -->
    <div 
      v-if="isDev && showDebug" 
      class="debug-panel"
      @click.self="showDebug = false"
    >
      <div class="debug-content" @click.stop>
        <div class="debug-header">
          <h3>🔧 Debug Info</h3>
          <button @click="showDebug = false" class="debug-close">×</button>
        </div>

        <div class="debug-sections">
          <div class="debug-section">
            <h4>Отладочная информация</h4>
            <div class="debug-info">
              <p><strong>Состояние:</strong> {{ currentState }}</p>
              <p><strong>Путь:</strong> {{ route.path }}</p>
              <p><strong>Конфиг путь:</strong> {{ route.meta.configPath }}</p>
              <p><strong>Raw блоков:</strong> {{ loadedData?.length || 0 }}</p>
              <div v-if="treeInfo" class="tree-structure">
                <p><strong>📊 Структура дерева:</strong></p>
                <ul class="tree-stats">
                  <li>🌳 Корневых блоков: {{ treeInfo.rootBlocks }}</li>
                  <li>📦 Всего блоков: {{ treeInfo.totalBlocks }}</li>
                  <li>📏 Максимальная глубина: {{ treeInfo.maxDepth }}</li>
                </ul>
              </div>
              <div class="w-full">
                <div
                  v-if="!loading && loadedData?.length"
                  :class="isMockData ? 'mock-indicator' : 'api-indicator'"
                >
                  <strong>🌐 Режим:</strong> {{ dataMode }}
                </div>
              </div>

              <div v-if="apiError" class="error-info">
                <strong>⚠️ Ошибка API:</strong> {{ apiError }}
              </div>
            </div>
          </div>

          <div v-if="loadedData?.length" class="debug-section">
            <details class="debug-details">
              <summary>Показать raw конфиг</summary>
              <pre>{{ JSON.stringify(loadedData, null, 2) }}</pre>
            </details>
          </div>

          <div v-if="lastAction" class="debug-section">
            <h4>Последнее действие:</h4>
            <div class="action-info">
              <p><strong>Компонент:</strong> {{ lastAction.source_component || 'Не указан' }}</p>
              <p><strong>Режим:</strong> {{ lastAction.source_mode || 'Не указан' }}</p>
              <p v-if="lastAction.nesting_level !== undefined">
                <strong>Уровень вложенности:</strong> {{ lastAction.nesting_level }}
              </p>
              <p><strong>Время:</strong> {{ new Date(lastAction.timestamp).toLocaleTimeString() }}</p>
              <details class="debug-details">
                <summary>Показать детали действия</summary>
                <pre>{{ JSON.stringify(lastAction, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с iframe -->
    <Transition name="iframe-modal">
      <div v-if="isIframeOpen" class="iframe-modal-overlay" @click="closeIframe">
        <div class="iframe-modal" @click.stop :class="{ 'fullscreen': isFullscreen }">
          <div class="iframe-header">
            <h3 class="iframe-title">Чат-бот</h3>
            <div class="iframe-controls">
              <button @click="toggleFullscreen" class="iframe-fullscreen-button" :title="isFullscreen ? 'Свернуть' : 'На весь экран'">
                <svg v-if="!isFullscreen" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.9733 4.66667C10.9733 4.48986 10.9031 4.32029 10.7781 4.19526C10.653 4.07024 10.4835 4 10.3067 4H4.66667C4.48986 4 4.32029 4.07024 4.19526 4.19526C4.07024 4.32029 4 4.48986 4 4.66667V10.3067C4 10.4835 4.07024 10.653 4.19526 10.7781C4.32029 10.9031 4.48986 10.9733 4.66667 10.9733C4.84348 10.9733 5.01305 10.9031 5.13807 10.7781C5.2631 10.653 5.33333 10.4835 5.33333 10.3067V6.27733L9.836 10.78C9.8975 10.8437 9.97106 10.8945 10.0524 10.9294C10.1337 10.9643 10.2212 10.9827 10.3097 10.9835C10.3983 10.9843 10.486 10.9674 10.568 10.9339C10.6499 10.9004 10.7243 10.8509 10.7869 10.7883C10.8495 10.7257 10.899 10.6512 10.9325 10.5693C10.9661 10.4874 10.9829 10.3996 10.9822 10.3111C10.9814 10.2225 10.963 10.1351 10.9281 10.0537C10.8931 9.97239 10.8423 9.89883 10.7787 9.83733L6.276 5.33333H10.3067C10.4835 5.33333 10.653 5.2631 10.7781 5.13807C10.9031 5.01305 10.9733 4.84348 10.9733 4.66667ZM16.6667 5.33333C17.1971 5.33333 17.7058 5.54405 18.0809 5.91912C18.456 6.29419 18.6667 6.8029 18.6667 7.33333V12H14.3587C13.7328 12 13.1325 12.2486 12.6899 12.6912C12.2473 13.1338 11.9987 13.7341 11.9987 14.36V18.6667H7.33333C6.8029 18.6667 6.29419 18.456 5.91912 18.0809C5.54405 17.7058 5.33333 17.1971 5.33333 16.6667V13.6933C5.33333 13.5165 5.2631 13.347 5.13807 13.2219C5.01305 13.0969 4.84348 13.0267 4.66667 13.0267C4.48986 13.0267 4.32029 13.0969 4.19526 13.2219C4.07024 13.347 4 13.5165 4 13.6933V16.6667C4 17.5507 4.35119 18.3986 4.97631 19.0237C5.60143 19.6488 6.44928 20 7.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667V7.33333C20 6.44928 19.6488 5.60143 19.0237 4.97631C18.3986 4.35119 17.5507 4 16.6667 4H13.6933C13.5165 4 13.347 4.07024 13.2219 4.19526C13.0969 4.32029 13.0267 4.48986 13.0267 4.66667C13.0267 4.84348 13.0969 5.01305 13.2219 5.13807C13.347 5.2631 13.5165 5.33333 13.6933 5.33333H16.6667Z"/>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.00886 10.3169C4.00886 10.4937 4.0791 10.6632 4.20412 10.7883C4.32915 10.9133 4.49871 10.9835 4.67553 10.9835H10.3155C10.4923 10.9835 10.6619 10.9133 10.7869 10.7883C10.912 10.6632 10.9822 10.4937 10.9822 10.3169V4.67686C10.9822 4.50005 10.912 4.33048 10.7869 4.20545C10.6619 4.08043 10.4923 4.01019 10.3155 4.01019C10.1387 4.01019 9.96915 4.08043 9.84412 4.20545C9.7191 4.33048 9.64886 4.50005 9.64886 4.67686V8.70619L5.14619 4.20353C5.08469 4.13985 5.01113 4.08906 4.9298 4.05412C4.84846 4.01919 4.76098 4.00079 4.67246 4.00003C4.58394 3.99926 4.49615 4.01612 4.41422 4.04964C4.33229 4.08316 4.25786 4.13267 4.19526 4.19526C4.13267 4.25786 4.08316 4.33229 4.04964 4.41422C4.01612 4.49615 3.99926 4.58394 4.00003 4.67246C4.00079 4.76098 4.01919 4.84846 4.05412 4.92979C4.08906 5.01113 4.13985 5.08469 4.20353 5.14619L8.70619 9.65019H4.67553C4.49871 9.65019 4.32915 9.72043 4.20412 9.84545C4.0791 9.97048 4.00886 10.14 4.00886 10.3169ZM16.6667 5.33333C17.1971 5.33333 17.7058 5.54405 18.0809 5.91912C18.456 6.29419 18.6667 6.8029 18.6667 7.33333V12H14.3587C13.7328 12 13.1325 12.2486 12.6899 12.6912C12.2473 13.1338 11.9987 13.7341 11.9987 14.36V18.6667H7.33333C6.8029 18.6667 6.29419 18.456 5.91912 18.0809C5.54405 17.7058 5.33333 17.1971 5.33333 16.6667V13.6933C5.33333 13.5165 5.2631 13.347 5.13807 13.2219C5.01305 13.0969 4.84348 13.0267 4.66667 13.0267C4.48986 13.0267 4.32029 13.0969 4.19526 13.2219C4.07024 13.347 4 13.5165 4 13.6933V16.6667C4 17.5507 4.35119 18.3986 4.97631 19.0237C5.60143 19.6488 6.44928 20 7.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667V7.33333C20 6.44928 19.6488 5.60143 19.0237 4.97631C18.3986 4.35119 17.5507 4 16.6667 4H13.6933C13.5165 4 13.347 4.07024 13.2219 4.19526C13.0969 4.32029 13.0267 4.48986 13.0267 4.66667C13.0267 4.84348 13.0969 5.01305 13.2219 5.13807C13.347 5.2631 13.5165 5.33333 13.6933 5.33333H16.6667Z"/>
                </svg>
              </button>
              <button @click="closeIframe" class="iframe-close-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <iframe 
            src="https://diogen.netlify.app/chat?hideMenuIcon=true&project=pfki"
            width="508"
            height="552"
            frameborder="0"
            class="iframe-content"
            title="Чат-бот"
          />
        </div>
      </div>
    </Transition>

    <div v-if="loading" class="loading-state">
      <div class="loading-card">
        <div class="loading-icon">⚡</div>
        <h2 class="loading-title">Загружаем страницу...</h2>
        <p class="loading-text">Подготавливаем конфигурацию</p>
      </div>
      <PageRenderer 
        :config-file="configPath"
        :skeleton="true"
        :project-id="projectId"
        @loaded="onDataLoaded"
        @error="onDataError"
        @action="handleAction"
      />
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-card">
        <div class="error-icon">❌</div>
        <h2 class="error-title">Ошибка загрузки страницы</h2>
        <p class="error-message">{{ error }}</p>
        <button @click="retry" class="retry-button">
          🔄 Попробовать снова
        </button>
      </div>
    </div>
    
    <div v-else class="content-state">
      <PageRenderer 
        :config-file="configPath"
        :skeleton="false"
        :project-id="projectId"
        @loaded="onDataLoaded"
        @error="onDataError"
        @action="handleAction"
        @changes-saved="onChangesSaved"
      />
    </div>
    
    <!-- Независимый компонент изменений -->
    <ChangesViewer />
  </div>
</template>

<style scoped>
.route-page {
  @apply relative z-20;
  min-height: calc(100vh - 100px);
}

/* Debug кнопка */
.debug-toggle {
  @apply fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-xl;
  @apply hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50;
  z-index: 1000;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
}

/* Кнопка для iframe */
.iframe-toggle-button {
  @apply fixed bottom-20 right-4 w-14 h-14 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center;
  background-color: #33AFE1; /* Голубой цвет */
  z-index: 1000;
}

.iframe-toggle-button:hover {
  background-color: #2A9BC7; /* Немного темнее для hover */
}

.iframe-toggle-button:focus {
  @apply outline-none ring-2 ring-offset-2;
  ring-color: #33AFE1;
}

.iframe-toggle-button.active {
  @apply bg-gray-500;
}

.iframe-toggle-button.active:hover {
  @apply bg-gray-600;
}

.iframe-toggle-button:hover {
  @apply transform scale-105;
}

/* Модальное окно с iframe */
.iframe-modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end;
  z-index: 1001;
  padding: 20px; /* Отступ от краёв экрана */
}

.iframe-modal {
  @apply bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300;
  width: 528px; /* 508px + padding */
  height: 592px; /* 552px + header */
  margin-top: 80px; /* Отступ снизу чтобы не перекрывать кнопки */
  transform-origin: bottom right; /* Анимация начинается от правого нижнего угла */
}

.iframe-modal.fullscreen {
  @apply inset-4 z-[1000];
  width: calc(100vw - 32px);
  height: calc(100vh - 32px);
  margin: 0;
  border-radius: 12px;
  transform-origin: bottom right; /* Сохраняем точку трансформации */
}

.iframe-header {
  @apply flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200;
}

.iframe-title {
  @apply font-semibold text-gray-800 m-0;
  font-size: 18px;
  font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
}

.iframe-controls {
  @apply flex items-center gap-2;
}

.iframe-fullscreen-button {
  @apply text-gray-400 hover:text-gray-700 transition-colors p-1 rounded;
}

.iframe-fullscreen-button svg {
  fill: #9CA3AF; /* серенький по умолчанию */
  transition: fill 0.2s ease;
}

.iframe-fullscreen-button:hover svg {
  fill: #374151; /* темный при hover */
}

.iframe-fullscreen-button:focus {
  @apply outline-none ring-2 ring-blue-300;
}

.iframe-close-button {
  @apply text-gray-400 hover:text-gray-700 transition-colors p-1 rounded;
}

.iframe-close-button svg {
  stroke: #9CA3AF; /* серенький по умолчанию */
  transition: stroke 0.2s ease;
}

.iframe-close-button:hover svg {
  stroke: #374151; /* темный при hover */
}

.iframe-close-button:focus {
  @apply outline-none ring-2 ring-blue-300;
}

.iframe-content {
  @apply w-full border-0;
  height: 552px;
}

.iframe-modal.fullscreen .iframe-content {
  height: calc(100% - 60px); /* Вычитаем высоту заголовка */
}

/* Анимации для модального окна */
.iframe-modal-enter-active,
.iframe-modal-leave-active {
  @apply transition-all duration-300;
}

.iframe-modal-enter-from,
.iframe-modal-leave-to {
  @apply opacity-0;
}

.iframe-modal-enter-from .iframe-modal,
.iframe-modal-leave-to .iframe-modal {
  @apply transform scale-95;
}

.iframe-modal-enter-to,
.iframe-modal-leave-from {
  @apply opacity-100;
}

.iframe-modal-enter-to .iframe-modal,
.iframe-modal-leave-from .iframe-modal {
  @apply transform scale-100;
}

/* Адаптивность для модального окна */
@media (max-width: 640px) {
  .iframe-modal-overlay {
    @apply items-center justify-center;
    padding: 16px;
  }
  
  .iframe-modal {
    @apply mx-0;
    width: calc(100vw - 32px);
    max-width: 528px;
    height: 80vh;
    max-height: 592px;
    margin-bottom: 0;
  }
  
  .iframe-content {
    height: calc(80vh - 60px);
    max-height: 552px;
  }
  
  .iframe-toggle-button {
    @apply bottom-24 right-4;
  }
}

/* Debug панель - модальное окно */
.debug-panel {
  @apply pb-4 fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center;
  z-index: 1001;
}

.debug-content {
  @apply bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden;
  @apply border border-gray-200;
}

.debug-header {
  @apply flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200;
}

.debug-header h3 {
  @apply text-lg font-semibold text-blue-600;
}

.debug-close {
  @apply text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded;
  @apply hover:bg-gray-200 transition-colors;
}

.debug-sections {
  @apply p-4 overflow-auto max-h-[calc(90vh-80px)];
}

.debug-section {
  @apply mb-6 last:mb-0;
}

.debug-section h4 {
  @apply font-semibold text-sm text-gray-700 mb-2;
}

.debug-info {
  @apply space-y-1 text-sm;
}

.debug-info p {
  @apply text-gray-600;
}

.debug-info strong {
  @apply text-gray-800;
}

.debug-details {
  @apply border border-gray-200 rounded;
}

.debug-details summary {
  @apply cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 transition-colors;
  @apply font-medium text-gray-700;
}

.debug-details pre {
  @apply p-4 bg-gray-900 text-gray-100 text-xs overflow-auto;
  @apply border-t border-gray-200;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

/* Индикаторы режима */
.api-indicator {
  @apply text-green-700 bg-green-100 px-2 py-1 rounded inline-block;
}

.mock-indicator {
  @apply text-yellow-700 bg-yellow-100 px-2 py-1 rounded inline-block;
}

.error-info {
  @apply text-red-700 bg-red-100 px-2 py-1 rounded inline-block;
}

/* Состояние загрузки */
.loading-state {
  @apply space-y-8;
}

.loading-card {
  @apply text-center p-8 bg-white rounded-2xl shadow-xl border border-blue-100;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.loading-icon {
  @apply text-6xl mb-4;
  animation: bounce 1s ease-in-out infinite;
}

.loading-title {
  @apply text-2xl font-bold text-gray-800 mb-2;
}

.loading-text {
  @apply text-gray-600;
}

/* Состояние ошибки */
.error-state {
  @apply flex items-center justify-center min-h-[60vh];
}

.error-card {
  @apply text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
}

.error-icon {
  @apply text-6xl mb-4;
}

.error-title {
  @apply text-2xl font-bold text-red-800 mb-4;
}

.error-message {
  @apply text-red-600 mb-6 leading-relaxed;
}

.retry-button {
  @apply px-6 py-3 bg-red-600 text-white rounded-lg font-medium;
  @apply hover:bg-red-700 transition-all duration-300;
  @apply transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
}

/* Состояние контента */
.content-state {
  @apply animate-fadeIn;
}

.action-info {
  @apply space-y-1 text-sm;
}

.action-info p {
  @apply text-gray-600;
}

.action-info strong {
  @apply text-gray-800;
}

.tree-structure {
  @apply my-2 p-2 bg-blue-50 rounded border border-blue-200;
}

.tree-stats {
  @apply mt-1 ml-4 space-y-1 text-xs;
}

.tree-stats li {
  @apply text-gray-600;
}

/* Анимации */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}
</style> 