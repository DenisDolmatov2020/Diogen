<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageRenderer from './PageRenderer.vue'
import type { TreeBlock } from '@/types/block'

const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const loadedData = ref<TreeBlock[] | null>(null)
const lastAction = ref<any>(null)
const isMockData = ref<boolean>(false)
const apiError = ref<string | null>(null)

// Debug панель
const showDebug = ref(false)

// Показываем debug в dev режиме
const isDev = computed(() => import.meta.env.DEV)

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
  console.log('📊 Данные загружены в RoutePage:', result)
  loadedData.value = result.data
  isMockData.value = result.isMockData
  apiError.value = result.error || null
  loading.value = false
  error.value = null
}

function onDataError(errorMessage: string) {
  console.error('❌ Ошибка загрузки в RoutePage:', errorMessage)
  error.value = errorMessage
  loading.value = false
}

function handleAction(actionData: any) {
  console.log('🎯 Action received in RoutePage:', actionData)
  lastAction.value = {
    timestamp: new Date().toISOString(),
    ...actionData
  }
  // Здесь можно обработать действия от компонентов
}

function retry() {
  console.log('🔄 Повторная попытка загрузки')
  loading.value = true
  error.value = null
}

// Отслеживаем изменения route.path
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    console.log(`🔄 Маршрут изменился с ${oldPath} на ${newPath}. Сбрасываем состояние...`)
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
    console.log('✅ Изменения сохранены:', result)
  }
}

onMounted(() => {
  console.log('🚀 RoutePage монтирован для пути:', route.path)
  console.log('📁 Config path:', configPath.value)
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
  </div>
</template>

<style scoped>
.route-page {
  @apply relative z-20;
  min-height: calc(100vh - 100px);
}

/* Debug кнопка */
.debug-toggle {
  @apply fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors;
  z-index: 1000;
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
</style> 