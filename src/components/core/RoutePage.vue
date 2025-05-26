<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageRenderer from './PageRenderer.vue'
import { fetchFilledConfig, type BlockConfig } from '@/api/pageApi.ts'

const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const rawConfig = ref<BlockConfig[]>([])
const filledConfig = ref<BlockConfig[]>([])

// Показываем debug в dev режиме
const showDebug = computed(() => import.meta.env.DEV)

// Определяем, используются ли mock данные
const isMockMode = computed(() => {
  // Проверяем наличие mock данных
  const hasMockData = filledConfig.value.some(block =>
    block.action_params?.some(param =>
      param.variable === 'reference_id' &&
      param.data?.toString().startsWith('mock.')
    )
  )

  // Проверяем статус бэкенда
  const hasBackendData = filledConfig.value.some(block =>
    block.action_params?.some(param =>
      param.variable === 'backend_status' && param.data === 'loaded'
    )
  )

  // Mock режим активен, если есть mock данные И нет успешно загруженных данных с бэкенда
  return hasMockData && !hasBackendData
})

const currentState = computed(() => {
  if (loading.value) return 'Загрузка'
  if (error.value) return 'Ошибка'
  return 'Загружено'
})

async function loadPage() {
  loading.value = true
  error.value = null

  console.log('🚀 Начинаем загрузку страницы:', route.path)

  try {
    // Загружаем JSON-конфиг из мета-данных роута
    const loadJson = route.meta.loadJson as () => Promise<{ default: BlockConfig[] }>

    if (!loadJson) {
      throw new Error('Не найден загрузчик JSON для данного маршрута')
    }

    console.log('📄 Загружаем JSON конфиг...')
    const { default: config } = await loadJson()

    console.log('✅ JSON конфиг загружен:', config)
    rawConfig.value = config

    if (config.length === 0) {
      // Оставляем возможность отобразить пустую страницу, если это предполагается дизайном
      // Можно добавить специфическую обработку или сообщение для пустых конфигов здесь
      console.warn('⚠️ JSON конфиг пустой для пути:', route.path)
      filledConfig.value = [] // Очищаем filledConfig, если конфиг пуст
    } else {
      // Отправляем конфиг на бэкенд для заполнения данными
      console.log('🔄 Отправляем конфиг на бэкенд...')
      filledConfig.value = await fetchFilledConfig(config)
      console.log('✅ Конфиг заполнен данными:', filledConfig.value)
    }

  } catch (err) {
    console.error('❌ Ошибка загрузки:', err)
    error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
  } finally {
    loading.value = false
  }
}

function handleAction(actionData: any) {
  console.log('🎯 Action received:', actionData)
  // Здесь можно обработать действия от компонентов
}

function retry() {
  console.log('🔄 Повторная попытка загрузки')
  loadPage()
}

// Инициальная загрузка данных при монтировании компонента
onMounted(() => {
  loadPage()
})

// Отслеживаем изменения route.path и перезагружаем данные страницы
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    console.log(`🔄 Маршрут изменился с ${oldPath} на ${newPath}. Перезагрузка данных...`)
    loadPage()
  }
})
</script>

<template>
  <div class="route-page">
    <!-- Debug информация (только в dev режиме) -->
    <div v-if="showDebug" class="debug-panel">
      <h3>🔍 Отладочная информация</h3>
      <div class="debug-content">
        <p><strong>Состояние:</strong> {{ currentState }}</p>
        <p><strong>Путь:</strong> {{ route.path }}</p>
        <p><strong>Конфиг путь:</strong> {{ route.meta.configPath }}</p>
        <p><strong>Raw блоков:</strong> {{ rawConfig.length }}</p>
        <p><strong>Filled блоков:</strong> {{ filledConfig.length }}</p>
        <p v-if="isMockMode" class="mock-indicator">
          <strong>🎭 Режим:</strong> Mock данные (бэкенд недоступен)
        </p>
        <p v-else-if="!loading && filledConfig.length" class="api-indicator">
          <strong>🌐 Режим:</strong> Реальный API
        </p>
        <details v-if="rawConfig.length" class="debug-details">
          <summary>Показать raw конфиг</summary>
          <pre>{{ JSON.stringify(rawConfig, null, 2) }}</pre>
        </details>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-card">
        <div class="loading-icon">⚡</div>
        <h2 class="loading-title">Загружаем страницу...</h2>
        <p class="loading-text">Подготавливаем конфигурацию</p>
      </div>
      <PageRenderer 
        :blocks="rawConfig" 
        :skeleton="true"
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
        :blocks="filledConfig" 
        :current-parent-id="null"
        :skeleton="false"
        @action="handleAction"
      />
    </div>
  </div>
</template>

<style scoped>
.route-page {
  @apply relative z-20;
  min-height: calc(100vh - 100px);
}

/* Debug панель */
.debug-panel {
  @apply mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg;
}

.debug-panel h3 {
  @apply text-lg font-semibold text-yellow-800 mb-2;
}

.debug-content {
  @apply text-sm text-yellow-700 space-y-1;
}

.debug-details {
  @apply mt-2;
}

.debug-details summary {
  @apply cursor-pointer text-yellow-600 hover:text-yellow-800;
}

.debug-details pre {
  @apply mt-2 p-2 bg-yellow-50 rounded text-xs overflow-auto max-h-40;
}

/* Индикаторы режима */
.mock-indicator {
  @apply text-orange-700 bg-orange-100 px-2 py-1 rounded;
}

.api-indicator {
  @apply text-green-700 bg-green-100 px-2 py-1 rounded;
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
</style> 