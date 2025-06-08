<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchFilledConfig, type LoadResult } from '@/api/pageApi'
import BlockRenderer from './BlockRenderer.vue'
import type { TreeBlock } from '@/types/block'
import { injectReferenceId, treeToFlat } from '@/utils/dataTransform'
import { apiService } from '@/api/apiService.ts'
import { getCurrentReferenceId } from '@/utils/referenceIdManager'
import { useChangesStore, type ChangeEntry } from '@/stores/changesStore'

const props = defineProps<{
  configFile: string
  skeleton?: boolean
  projectId?: string
}>()

const emit = defineEmits(['action', 'loaded', 'error', 'changes-saved'])

const treeBlocks = ref<TreeBlock[]>([])
const originalBlocks = ref<TreeBlock[]>([]) // Исходная конфигурация
const loading = ref(true)
const error = ref<string | null>(null)
const referenceId = ref<string>('')
const hasChanges = ref(false)
const isSaving = ref(false)
const isSendingWithMeta = ref(false)

const storeChangesCount = computed(() => {
  const changesStore = useChangesStore()
  return changesStore.changesCount
})

// Получаем reference_id из конфигурации
function extractReferenceId(blocks: TreeBlock[]) {
  for (const block of blocks) {
    if (block.action_params) {
      for (const param of block.action_params) {
        if (param.variable === 'reference_id' && param.data) {
          referenceId.value = param.data as string
          return
        }
      }
    }
    
    if (block.children && block.children.length > 0) {
      extractReferenceId(block.children)
    }
  }
}

// Глубокое сравнение двух конфигураций
function compareConfigs(current: TreeBlock[], original: TreeBlock[]): boolean {
  // Преобразуем в строки для сравнения
  const originalStr = JSON.stringify(original)
  const currentStr = JSON.stringify(current)
  
  console.log('📊 Сравнение конфигураций:')
  console.log(`Оригинал (${originalStr.length} символов)`)
  console.log(`Текущая (${currentStr.length} символов)`)
  
  const isDifferent = originalStr !== currentStr
  console.log(`📊 Результат сравнения: ${isDifferent ? 'ОТЛИЧАЮТСЯ' : 'ИДЕНТИЧНЫ'}`)
  
  return isDifferent
}

// Проверяем наличие изменений при каждом действии
function checkChanges() {
  const prevHasChanges = hasChanges.value
  hasChanges.value = compareConfigs(treeBlocks.value, originalBlocks.value)
  
  console.log(`🔎 Проверка изменений: ${hasChanges.value ? 'НАЙДЕНЫ изменения' : 'Изменений нет'}`)
  
  // Если статус изменился, выводим сообщение
  if (hasChanges.value !== prevHasChanges) {
    if (hasChanges.value) {
      console.log('🔔 Появились изменения! Отображаем кнопку сохранения.')
    } else {
      console.log('🔕 Изменения сброшены. Скрываем кнопку сохранения.')
    }
  }
}

async function loadPageData() {
  try {
    loading.value = true
    error.value = null
    
    // 1. Загружаем древовидный конфиг из JSON
    // Конфиги всегда загружаются из public папки через fetch
    const configUrl = props.configFile
    
    console.log('📁 Загружаем конфиг из:', configUrl)
    const configResponse = await fetch(configUrl)
    if (!configResponse.ok) {
      throw new Error(`Не удалось загрузить конфиг: ${configResponse.status} ${configResponse.statusText}`)
    }
    
    const treeConfig: TreeBlock[] = await configResponse.json()
    console.log('📁 Загружен конфиг из файла:', treeConfig)
    
    // 2. Заменяем статические reference_id на динамические
    const configWithDynamicRefId = injectReferenceId(treeConfig)
    console.log('🔧 Конфиг с динамическим reference_id:', configWithDynamicRefId)
    
    // 3. Отправляем на бэкенд и получаем заполненные данные
    const result: LoadResult = await fetchFilledConfig(configWithDynamicRefId)
    
    // 4. Устанавливаем заполненные данные
    treeBlocks.value = result.data
    // Сохраняем оригинальную конфигурацию для сравнения
    originalBlocks.value = JSON.parse(JSON.stringify(result.data))
    
    // Извлекаем reference_id
    extractReferenceId(result.data)
    
    // Сбрасываем флаг изменений
    hasChanges.value = false
    
    emit('loaded', {
      data: result.data,
      isMockData: result.isMockData,
      error: result.error
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных'
    error.value = errorMessage
    emit('error', errorMessage)
    console.error('Ошибка загрузки страницы:', err)
  } finally {
    loading.value = false
  }
}

async function handleAction(actionData: any) {
  console.log('🎯 Получено действие:', actionData)
  
  // Обрабатываем сохранение изменений из текстовых полей
  if (actionData.type === 'save_changes' && actionData.payload?.fieldChanges) {
    console.log('💾 Обработка сохранения изменений:', actionData.payload.fieldChanges)
    
    // Обновляем конфигурацию с изменениями полей
    const fieldChanges = actionData.payload.fieldChanges
    updateConfigWithChanges(fieldChanges)
  }
  
  // Стандартная обработка действия
  emit('action', {
    ...actionData,
    currentTree: treeBlocks.value
  })
  
  // Проверяем изменился ли конфиг после любого действия
  checkChanges()
}

// Функция для обновления конфигурации с изменениями из текстовых полей
function updateConfigWithChanges(fieldChanges: Record<string, any>) {
  console.log('🔄 Обновление конфигурации с изменениями полей:', fieldChanges)
  
  if (!fieldChanges || Object.keys(fieldChanges).length === 0) {
    console.log('⚠️ Нет изменений для сохранения')
    return
  }
  
  // Создаем глубокую копию конфигурации
  const newBlocks = JSON.parse(JSON.stringify(treeBlocks.value))
  let updated = false
  
  // Применяем все изменения полей
  for (const [fieldKey, newValue] of Object.entries(fieldChanges)) {
    console.log(`📝 Применение изменения: ${fieldKey} -> ${newValue}`)
    
    // Рекурсивно ищем и обновляем поле в конфигурации
    updated = updateFieldInConfig(newBlocks, fieldKey, newValue) || updated
  }
  
  if (updated) {
    console.log('✅ Конфигурация обновлена с новыми значениями')
    treeBlocks.value = newBlocks
  } else {
    console.warn('⚠️ Не удалось найти некоторые поля в конфигурации')
  }
}

// Рекурсивно ищем и обновляем поле в конфигурации
function updateFieldInConfig(blocks: TreeBlock[], fieldKey: string, newValue: any): boolean {
  for (const block of blocks) {
    // Проверяем action_params
    if (block.action_params) {
      // Проверяем прямое совпадение с variable
      for (const param of block.action_params) {
        if (param.variable === fieldKey) {
          console.log('✅ Найдено прямое совпадение:', param.variable)
          param.data = newValue
          return true
        }
        
        // Проверяем, есть ли ключ в массиве keys
        if (param.variable === 'keys' && Array.isArray(param.data)) {
          if (param.data.includes(fieldKey)) {
            console.log('✅ Найдено в массиве keys:', fieldKey)
            // Добавляем параметр с именем fieldKey и значением newValue
            // Удаляем существующий параметр, если есть
            const existingParamIndex = block.action_params.findIndex(p => p.variable === fieldKey)
            if (existingParamIndex >= 0) {
              block.action_params[existingParamIndex].data = newValue
            } else {
              block.action_params.push({
                variable: fieldKey,
                data: newValue
              })
            }
            return true
          }
        }
      }
    }
    
    // Рекурсивно проверяем дочерние блоки
    if (block.children && block.children.length > 0) {
      if (updateFieldInConfig(block.children, fieldKey, newValue)) {
        return true
      }
    }
  }
  
  return false
}

// Отправка изменений на сервер
async function saveChanges() {
  if (!props.projectId || !referenceId.value || !hasChanges.value) return
  
  try {
    isSaving.value = true
    
    // Формируем мета-данные для отправки
    const metaData = {
      component_name: "meta_data",
      action_mode: "processing",
      action_params: [
        {
          variable: "title",
          data: "1"
        },
        {
          variable: "reference_id",
          data: referenceId.value
        }
      ]
    }
    
    // Отправляем текущую конфигурацию вместе с мета-данными
    const payload = [metaData, ...treeBlocks.value]
    
    // Отправляем на сервер
    const result = await apiService.post(`/projects/${props.projectId}/update`, payload)
    
    // Обновляем оригинальную конфигурацию
    originalBlocks.value = JSON.parse(JSON.stringify(treeBlocks.value))
    hasChanges.value = false
    
    emit('changes-saved', { success: true, data: result })
    
    // Показываем уведомление
    showNotification('Изменения успешно сохранены', 'success')
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
    emit('changes-saved', { success: false, error })
    
    // Показываем уведомление об ошибке
    showNotification('Ошибка при сохранении изменений', 'error')
  } finally {
    isSaving.value = false
  }
}

// Новая функция для отправки с мета-компонентом
async function sendWithMeta() {
  try {
    isSendingWithMeta.value = true
    
    console.log('🎯 Начинаем отправку с мета-компонентом')
    
    // 1. Загружаем оригинальный JSON конфиг
    console.log('📁 Загружаем оригинальный конфиг из:', props.configFile)
    const configResponse = await fetch(props.configFile)
    if (!configResponse.ok) {
      throw new Error(`Не удалось загрузить конфиг: ${configResponse.status} ${configResponse.statusText}`)
    }
    
    const originalTreeConfig: TreeBlock[] = await configResponse.json()
    console.log('📁 Загружен оригинальный конфиг:', originalTreeConfig)
    
    // 2. Получаем все изменения из store
    const changesStore = useChangesStore()
    const changes = changesStore.changes
    console.log('📝 Изменения из store:', changes)
    
    // 3. Получаем текущий reference_id
    const currentRefId = getCurrentReferenceId()
    if (!currentRefId) {
      throw new Error('Не найден reference_id')
    }
    
    // 4. Создаем мета-компонент из изменений
    const metaComponent = {
      component_name: "meta_data",
      parent_block_id: "-",
      action_mode: "processing",
      action_params: [
        // Добавляем все изменения из store
        ...changes.map((change: ChangeEntry) => ({
          variable: change.field,
          data: change.newValue,
          action_mode: "processing"
        })),
        // Добавляем reference_id в конец
        {
          variable: "reference_id",
          data: currentRefId
        }
      ]
    }
    
    console.log('🏷️ Создан мета-компонент:', metaComponent)
    
    // 5. Добавляем reference_id к конфигу
    const configWithRefId = injectReferenceId(originalTreeConfig)
    
    // 6. Преобразуем дерево в плоскую структуру
    const flatConfig = treeToFlat(configWithRefId)
    
    // 7. Фильтруем конфиг - исключаем editable компоненты
    const nonEditableConfig = flatConfig.filter(block => 
      block.action_mode !== "editable_layout"
    )
    
    console.log('🔄 Неизменяемые компоненты:', nonEditableConfig)
    
    // 8. Формируем финальную структуру: мета-компонент + неизменяемые компоненты
    const finalConfig = [metaComponent, ...nonEditableConfig]
    console.log('🎯 Финальная структура для отправки:', finalConfig)
    
    // 9. Отправляем на бэкенд
    console.log('🚀 Отправляем на бэкенд...')
    const response = await fetch('https://di.slovo-soft.ru:6443/create_answer_for_front_api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TOKEN': 'wYZj8hN91r7ggb33PDzGMPnOEZxEfQDRKDYuFG-JLwG0Dot8lZAhfHbXXg-C51wimX2oOd_s3JGYCCwN_FrjstjMNr_2uYLoYRfF8uY8rJWXFnI8SFUKx3lrTXOGLUnc'
      },
      body: JSON.stringify(finalConfig)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const responseData = await response.json()
    console.log('✅ Получен ответ от бэкенда:', responseData)
    
    // Показываем уведомление об успехе
    showNotification('Конфигурация успешно отправлена с мета-данными', 'success')
    
    // Эмитируем событие для отладки
    emit('action', {
      type: 'meta_sent',
      timestamp: Date.now(),
      source_component: 'PageRenderer',
      source_mode: 'send_with_meta',
      payload: {
        metaComponent,
        nonEditableConfig,
        changesCount: changes.length,
        responseData
      }
    })
    
    // После успешной отправки очищаем изменения
    changesStore.clearAllChanges()
    console.log('🧹 Изменения очищены после успешной отправки')
    
  } catch (error) {
    console.error('❌ Ошибка при отправке с мета-компонентом:', error)
    showNotification('Ошибка при отправке с мета-данными', 'error')
    
    emit('error', error instanceof Error ? error.message : 'Неизвестная ошибка')
  } finally {
    isSendingWithMeta.value = false
  }
}

// Функция для показа уведомлений
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  // Анимация появления
  setTimeout(() => {
    notification.classList.add('show')
  }, 10)
  
  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    notification.classList.add('fade-out')
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 500)
  }, 3000)
}

onMounted(() => {
  loadPageData()
})

// Публичный метод для обновления данных
defineExpose({
  reload: loadPageData,
  getData: () => treeBlocks.value
})
</script>

<template>
  <div class="page-renderer">
    <!-- Загрузка -->
    <div v-if="loading || skeleton" class="loading-state">
      <div class="skeleton-container">
        <div v-for="n in 3" :key="n" class="skeleton-block">
          <div class="skeleton-title"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ошибка -->
    <div v-else-if="error" class="error-state">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Ошибка загрузки</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="loadPageData" class="retry-button">
          Попробовать снова
        </button>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else-if="!treeBlocks.length" class="empty-state">
      <div class="empty-card">
        <div class="empty-icon">📄</div>
        <h3 class="empty-title">Страница пуста</h3>
        <p class="empty-text">Конфигурация не содержит блоков</p>
      </div>
    </div>

    <!-- Основной контент -->
    <div v-else class="blocks-container">
      <BlockRenderer 
        v-for="(block, index) in treeBlocks"
        :key="`block-${index}`"
        :block="block"
        :skeleton="false"
        :level="0"
        @action="handleAction"
      />
      
      <!-- Контейнер для кнопок -->
      <div class="action-buttons-container">
        <!-- Кнопка сохранения изменений -->
        <transition name="fade">
          <div v-if="hasChanges" class="save-changes-button">
            <button 
              @click="saveChanges" 
              :disabled="isSaving"
              class="primary-button"
            >
              <span v-if="isSaving">💾 Сохранение...</span>
              <span v-else>💾 Отправить изменения на сервер</span>
            </button>
          </div>
        </transition>
        
        <!-- Кнопка отправки с мета -->
        <transition name="fade">
          <div class="send-meta-button">
            <button 
              @click="sendWithMeta" 
              :disabled="isSendingWithMeta"
              class="meta-button"
            >
              <span v-if="isSendingWithMeta">📤 Отправка...</span>
              <span v-else>📤 Отправить с изменениями ({{ storeChangesCount }})</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-renderer {
  @apply w-full min-h-screen;
}

/* Loading состояние */
.skeleton-container {
  @apply space-y-6 p-6;
}

.skeleton-block {
  @apply bg-white rounded-xl p-6 shadow-sm border border-gray-100;
}

.skeleton-title {
  @apply h-6 bg-gray-200 rounded-lg mb-4 w-1/3;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  @apply space-y-3;
}

.skeleton-line {
  @apply h-4 bg-gray-200 rounded;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line.short {
  @apply w-2/3;
}

/* Error состояние */
.error-state {
  @apply flex items-center justify-center min-h-[50vh] p-6;
}

.error-card {
  @apply text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
}

.error-icon {
  @apply text-6xl mb-4;
}

.error-title {
  @apply text-xl font-semibold text-gray-700 mb-2;
}

.error-message {
  @apply text-gray-600 mb-4;
}

.retry-button {
  @apply px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors;
}

/* Empty состояние */
.empty-state {
  @apply flex items-center justify-center min-h-[50vh] p-6;
}

.empty-card {
  @apply text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100;
}

.empty-icon {
  @apply text-6xl mb-4 opacity-50;
}

.empty-title {
  @apply text-xl font-semibold text-gray-700 mb-2;
}

.empty-text {
  @apply text-gray-500;
}

/* Контент */
.blocks-container {
  @apply space-y-6 p-6;
}

/* Контейнер для кнопок действий */
.action-buttons-container {
  @apply fixed bottom-4 left-4 z-50 flex flex-col gap-3;
}

/* Кнопка сохранения изменений */
.save-changes-button {
  @apply w-full;
}

.primary-button {
  @apply bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all;
  @apply disabled:bg-blue-300 disabled:cursor-not-allowed;
  @apply w-full text-left;
}

/* Кнопка отправки с мета */
.send-meta-button {
  @apply max-w-[320px];
}

.meta-button {
  @apply bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-all;
  @apply disabled:bg-green-300 disabled:cursor-not-allowed;
  @apply w-full text-left;
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Стили для уведомлений */
:global(.notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  z-index: 2000;
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

:global(.notification.show) {
  transform: translateX(0);
    opacity: 1;
  }

:global(.notification.success) {
  background-color: #4CAF50;
}

:global(.notification.error) {
  background-color: #f44336;
}

:global(.notification.fade-out) {
  opacity: 0;
  transform: translateX(100%);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .action-buttons-container {
    @apply bottom-4 left-4 right-4;
  }
  
  .primary-button,
  .meta-button {
    @apply text-sm px-4 py-2;
  }
}
</style> 