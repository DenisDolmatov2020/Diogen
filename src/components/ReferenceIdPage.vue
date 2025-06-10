<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getCurrentReferenceId, createNewReferenceIdFromServer, clearReferenceId } from '@/utils/referenceIdManager'

const currentRefId = ref<string>('')
const isCreatingRefId = ref(false)

// Поля для создания нового Reference ID
const inputTitle = ref<string>('')
const inputText = ref<string>('')
const inputAudio = ref<string>('')
const inputFile = ref<string>('')

// Computed properties для переменных окружения
const envVars = computed(() => ({
  projectId: import.meta.env.VITE_PROJECT_ID || 'не установлен',
  userId: import.meta.env.VITE_USER_ID || 'не установлен', 
  devMode: import.meta.env.VITE_DEV_MODE || 'false',
  nodeEnv: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_CHAT_API_URL || 'не установлен',
  basicLogin: import.meta.env.VITE_API_BASIC_LOGIN || 'не установлен'
}))

// Загружаем текущий Reference ID
function loadCurrentReferenceId() {
  const refId = getCurrentReferenceId()
  currentRefId.value = refId || ''
  console.log('📋 Загружен Reference ID:', currentRefId.value)
}

// Парсим Reference ID для отображения деталей
function getParsedRefId() {
  if (!currentRefId.value) return null
  
  try {
    const parts = currentRefId.value.split('.')
    if (parts.length >= 3) {
      return {
        projectId: parts[0],
        userId: parts[1], 
        timestamp: parseInt(parts[2])
      }
    }
  } catch (error) {
    console.warn('Ошибка при парсинге Reference ID:', error)
  }
  
  return null
}

// Создаем новый Reference ID с данными из полей
async function createNewRefId() {
  try {
    isCreatingRefId.value = true
    console.log('🆕 Создание нового Reference ID через сервер с данными...')
    
    // Формируем объект с данными
    const inputData = {
      input_title: inputTitle.value || 'Новый заголовок',
      input_text: inputText.value || 'Новый текст',
      input_audio: inputAudio.value || '',
      input_file: inputFile.value || ''
    }
    
    const newRefId = await createNewReferenceIdFromServer(inputData)
    currentRefId.value = newRefId
    
    console.log('✅ Новый Reference ID создан через сервер:', newRefId)
    showNotification('Reference ID успешно создан!', 'success')
    
    // Очищаем поля после успешного создания
    clearInputFields()
  } catch (error) {
    console.error('❌ Ошибка при создании Reference ID:', error)
    showNotification('Ошибка при создании Reference ID', 'error')
  } finally {
    isCreatingRefId.value = false
  }
}

// Очищаем поля ввода
function clearInputFields() {
  inputTitle.value = ''
  inputText.value = ''
  inputAudio.value = ''
  inputFile.value = ''
}

// Очищаем Reference ID
function clearRefId() {
  clearReferenceId()
  currentRefId.value = ''
  console.log('🗑️ Reference ID очищен')
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

onMounted(() => {
  loadCurrentReferenceId()
})
</script>

<template>
  <div class="reference-id-page">
    <div class="page-container">
      <!-- Заголовок страницы -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">🆔</div>
          <div class="header-text">
            <h1 class="page-title">Reference ID Manager</h1>
            <p class="page-subtitle">Управление идентификаторами сессий и данных</p>
          </div>
        </div>
      </div>

      <!-- Основной контент -->
      <div class="page-content">
        <!-- Текущий Reference ID -->
        <div class="card current-id-card">
          <div class="card-header">
            <h2 class="card-title">📋 Текущий Reference ID</h2>
            <button @click="loadCurrentReferenceId" class="refresh-button">
              🔄 Обновить
            </button>
          </div>
          <div class="card-content">
            <div class="id-display-container">
              <code class="id-display">{{ currentRefId || 'Не установлен' }}</code>
              <button v-if="currentRefId" @click="clearRefId" class="clear-button">
                🗑️ Очистить
              </button>
            </div>
            
            <!-- Разбор ID на части -->
            <div v-if="getParsedRefId()" class="id-breakdown">
              <h3 class="breakdown-title">Детали ID:</h3>
              <div class="breakdown-grid">
                <div class="breakdown-item">
                  <span class="label">Проект:</span>
                  <span class="value">{{ getParsedRefId()?.projectId }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="label">Пользователь:</span>
                  <span class="value">{{ getParsedRefId()?.userId }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="label">Создан:</span>
                  <span class="value">{{ getParsedRefId() ? new Date(getParsedRefId()!.timestamp * 1000).toLocaleString() : 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Создание нового Reference ID -->
        <div class="card create-id-card">
          <div class="card-header">
            <h2 class="card-title">🆕 Создать новый Reference ID</h2>
          </div>
          <div class="card-content">
            <form @submit.prevent="createNewRefId" class="create-form">
              <div class="form-grid">
                <div class="input-group">
                  <label for="input-title" class="input-label">Заголовок</label>
                  <input
                    id="input-title"
                    v-model="inputTitle"
                    type="text"
                    class="input-field"
                    placeholder="Введите заголовок"
                  />
                </div>

                <div class="input-group">
                  <label for="input-text" class="input-label">Описание</label>
                  <textarea
                    id="input-text"
                    v-model="inputText"
                    class="input-field textarea-field"
                    placeholder="Введите описание"
                    rows="4"
                  ></textarea>
                </div>

                <div class="input-group">
                  <label for="input-audio" class="input-label">Аудио (опционально)</label>
                  <input
                    id="input-audio"
                    v-model="inputAudio"
                    type="text"
                    class="input-field"
                    placeholder="Ссылка на аудио файл"
                  />
                </div>

                <div class="input-group">
                  <label for="input-file" class="input-label">Файл (опционально)</label>
                  <input
                    id="input-file"
                    v-model="inputFile"
                    type="text"
                    class="input-field"
                    placeholder="Ссылка на файл"
                  />
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="create-button"
                  :disabled="isCreatingRefId"
                >
                  <span v-if="isCreatingRefId" class="button-loading">
                    ⏳ Создается...
                  </span>
                  <span v-else class="button-text">
                    ✨ Создать новый ID
                  </span>
                </button>
                
                <button
                  type="button"
                  @click="clearInputFields"
                  class="clear-fields-button"
                >
                  🧹 Очистить поля
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Переменные окружения -->
        <div class="card env-vars-card">
          <div class="card-header">
            <h2 class="card-title">⚙️ Переменные окружения</h2>
          </div>
          <div class="card-content">
            <div class="env-grid">
              <div class="env-item">
                <span class="env-label">PROJECT_ID:</span>
                <code class="env-value">{{ envVars.projectId }}</code>
              </div>
              <div class="env-item">
                <span class="env-label">USER_ID:</span>
                <code class="env-value">{{ envVars.userId }}</code>
              </div>
              <div class="env-item">
                <span class="env-label">DEV_MODE:</span>
                <code class="env-value">{{ envVars.devMode }}</code>
              </div>
              <div class="env-item">
                <span class="env-label">NODE_ENV:</span>
                <code class="env-value">{{ envVars.nodeEnv }}</code>
              </div>
              <div class="env-item">
                <span class="env-label">API_URL:</span>
                <code class="env-value">{{ envVars.apiUrl }}</code>
              </div>
              <div class="env-item">
                <span class="env-label">BASIC_LOGIN:</span>
                <code class="env-value">{{ envVars.basicLogin }}</code>
              </div>
            </div>
            
            <div class="env-info">
              <p class="env-notice">
                📝 <strong>Примечание:</strong> Эти значения берутся из переменных окружения. 
                На Netlify нужно настроить их в панели управления: 
                <strong>Site settings → Environment variables</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Основные стили страницы */
.reference-id-page {
  @apply min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100;
  @apply pt-20 pb-12;
}

.page-container {
  @apply max-w-6xl mx-auto px-4;
}

/* Заголовок страницы */
.page-header {
  @apply mb-8;
}

.header-content {
  @apply flex items-center gap-4;
  @apply bg-white/80 backdrop-blur-sm rounded-2xl p-6;
  @apply border border-white/50 shadow-lg;
}

.header-icon {
  @apply text-4xl;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
  animation: headerGlow 3s ease-in-out infinite alternate;
}

@keyframes headerGlow {
  from { filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6)); }
  to { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8)); }
}

.header-text {
  @apply flex-1;
}

.page-title {
  @apply text-3xl font-bold;
  @apply bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600;
  @apply bg-clip-text text-transparent;
  @apply mb-2;
}

.page-subtitle {
  @apply text-gray-600 text-lg;
}

/* Контент страницы */
.page-content {
  @apply grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8;
}

/* Карточки */
.card {
  @apply bg-white/90 backdrop-blur-sm rounded-2xl;
  @apply border border-white/50 shadow-xl;
  @apply transition-all duration-300;
  @apply h-fit;
}

.card:hover {
  @apply shadow-2xl transform translate-y-[-2px];
  @apply border-blue-200/50;
}

.card-header {
  @apply flex items-center justify-between;
  @apply p-4 lg:p-6 border-b border-gray-100;
}

.card-title {
  @apply text-lg lg:text-xl font-semibold text-gray-800;
}

.card-content {
  @apply p-4 lg:p-6;
}

/* Текущий ID */
.current-id-card {
  @apply border-l-4 border-l-green-500;
}

.id-display-container {
  @apply flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 mb-4 lg:mb-6;
}

.id-display {
  @apply flex-1 bg-gray-50 px-3 lg:px-4 py-2 lg:py-3 rounded-lg;
  @apply text-xs lg:text-sm font-mono text-gray-800;
  @apply border border-gray-200;
  word-break: break-all;
}

.refresh-button, .clear-button {
  @apply px-3 lg:px-4 py-2 rounded-lg font-medium text-xs lg:text-sm;
  @apply transition-all duration-200;
  @apply border border-gray-300 text-gray-700 bg-white;
  @apply hover:bg-gray-50 hover:shadow-md;
  @apply w-full sm:w-auto;
}

.clear-button {
  @apply bg-red-50 text-red-600 border-red-200;
  @apply hover:bg-red-100;
}

/* Разбор ID */
.id-breakdown {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50;
  @apply p-3 lg:p-4 rounded-xl border border-blue-100;
}

.breakdown-title {
  @apply text-sm lg:text-base font-semibold text-gray-700 mb-2 lg:mb-3;
}

.breakdown-grid {
  @apply grid grid-cols-1 gap-2 lg:gap-3;
}

.breakdown-item {
  @apply flex flex-col gap-1;
}

.breakdown-item .label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.breakdown-item .value {
  @apply text-xs lg:text-sm text-gray-800 font-mono;
  @apply bg-white/60 px-2 py-1 rounded;
}

/* Создание нового ID */
.create-id-card {
  @apply border-l-4 border-l-blue-500;
}

/* Переменные окружения */
.env-vars-card {
  @apply border-l-4 border-l-purple-500;
}

.env-grid {
  @apply grid grid-cols-1 gap-3 lg:gap-4 mb-4;
}

.env-item {
  @apply flex flex-col sm:flex-row sm:items-center gap-2;
  @apply bg-gray-50 p-3 rounded-lg border border-gray-200;
}

.env-label {
  @apply text-sm font-semibold text-gray-600 uppercase tracking-wide;
  @apply sm:w-32 flex-shrink-0;
}

.env-value {
  @apply text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border;
  @apply flex-1 break-all;
}

.env-info {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-3;
}

.env-notice {
  @apply text-sm text-blue-800 mb-0;
}

.create-form {
  @apply space-y-4 lg:space-y-6;
}

.form-grid {
  @apply grid grid-cols-1 gap-4 lg:gap-6;
}

.input-group {
  @apply space-y-2;
}

.input-label {
  @apply block text-sm font-medium text-gray-700;
}

.input-field {
  @apply w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl;
  @apply border border-gray-200 bg-white/80;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-all duration-200;
  @apply placeholder-gray-400;
  @apply text-sm lg:text-base;
}

.input-field:focus {
  @apply outline-none bg-white;
  @apply shadow-lg;
}

.textarea-field {
  @apply resize-none;
}

/* Кнопки формы */
.form-actions {
  @apply flex flex-col gap-3 lg:gap-4 pt-3 lg:pt-4;
  @apply border-t border-gray-100;
}

.create-button {
  @apply w-full px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white border-0;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply transition-all duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply shadow-lg hover:shadow-xl;
  @apply text-sm lg:text-base;
}

.create-button:hover:not(:disabled) {
  @apply transform translate-y-[-1px];
}

.clear-fields-button {
  @apply w-full px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-medium;
  @apply bg-gray-100 text-gray-700 border border-gray-200;
  @apply hover:bg-gray-200 hover:shadow-md;
  @apply transition-all duration-200;
  @apply text-sm lg:text-base;
}

.button-loading, .button-text {
  @apply flex items-center justify-center gap-2;
}

/* Адаптивность */
@media (max-width: 768px) {
  .reference-id-page {
    @apply pt-16 pb-6;
  }
  
  .page-container {
    @apply px-2;
  }
  
  .header-content {
    @apply p-3;
  }
  
  .page-title {
    @apply text-xl;
  }
  
  .page-subtitle {
    @apply text-sm;
  }
  
  .page-content {
    @apply gap-4;
  }
  
  .card-header, .card-content {
    @apply p-3;
  }
  
  .breakdown-grid {
    @apply grid-cols-1;
  }
  
  .header-icon {
    @apply text-2xl;
  }
}

@media (max-width: 480px) {
  .reference-id-page {
    @apply pt-14 pb-4;
  }
  
  .page-container {
    @apply px-1;
  }
  
  .header-content {
    @apply p-2 gap-2;
  }
  
  .page-title {
    @apply text-lg;
  }
  
  .page-subtitle {
    @apply text-xs;
  }
  
  .page-content {
    @apply gap-3;
  }
  
  .card-header, .card-content {
    @apply p-2;
  }
  
  .card-title {
    @apply text-base;
  }
  
  .breakdown-title {
    @apply text-sm;
  }
  
  .header-icon {
    @apply text-xl;
  }
  
  .id-display-container {
    @apply gap-2 mb-3;
  }
  
  .id-breakdown {
    @apply p-2;
  }
  
  .form-actions {
    @apply gap-2 pt-2;
  }
}
</style> 