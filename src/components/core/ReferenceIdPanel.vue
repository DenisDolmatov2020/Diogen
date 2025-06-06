<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getCurrentReferenceId, createNewReferenceIdFromServer, clearReferenceId } from '@/utils/referenceIdManager'

const emit = defineEmits(['close', 'ref-id-updated'])

const showRefIdPanel = defineModel<boolean>({ default: false })
const currentRefId = ref<string>('')
const isCreatingRefId = ref(false)

// Поля для создания нового Reference ID
const inputTitle = ref<string>('')
const inputText = ref<string>('')
const inputAudio = ref<string>('')
const inputFile = ref<string>('')

// Следим за открытием панели и автоматически загружаем Reference ID
watch(showRefIdPanel, (newValue) => {
  if (newValue) {
    loadCurrentReferenceId()
  }
})

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
    emit('ref-id-updated', newRefId)
    
    // Очищаем поля после успешного создания
    clearInputFields()
  } catch (error) {
    console.error('❌ Ошибка при создании Reference ID:', error)
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
  emit('ref-id-updated', '')
}

// Закрываем панель
function closePanel() {
  showRefIdPanel.value = false
  emit('close')
}

// Загружаем текущий ID при открытии панели
function onPanelOpen() {
  loadCurrentReferenceId()
}

// Следим за открытием панели
defineExpose({
  loadCurrentReferenceId,
  onPanelOpen
})
</script>

<template>
  <!-- Reference ID панель -->
  <div v-if="showRefIdPanel" class="ref-id-panel" @click.self="closePanel">
    <div class="ref-id-content">
      <div class="ref-id-header">
        <h3>🆔 Reference ID Management</h3>
        <button @click="closePanel" class="close-button">×</button>
      </div>

      <!-- Поля для создания нового Reference ID -->
      <div class="flex gap-4">
        <div class="input-fields">
          <h4>📝 Данные для нового ID</h4>

          <div class="input-group">
            <label for="input-title">Заголовок:</label>
            <input
              id="input-title"
              v-model="inputTitle"
              type="text"
              class="input-field"
              placeholder="Введите заголовок"
            />
          </div>

          <div class="input-group">
            <label for="input-text">Текст:</label>
            <textarea
              id="input-text"
              v-model="inputText"
              class="input-field textarea-field"
              placeholder="Введите текст"
              rows="3"
            ></textarea>
          </div>

          <div class="input-group">
            <label for="input-audio">Аудио:</label>
            <input
              id="input-audio"
              v-model="inputAudio"
              type="text"
              class="input-field"
              placeholder="Ссылка на аудио файл (опционально)"
            />
          </div>

          <div class="input-group">
            <label for="input-file">Файл:</label>
            <input
              id="input-file"
              v-model="inputFile"
              type="text"
              class="input-field"
              placeholder="Ссылка на файл (опционально)"
            />
          </div>
        </div>


        <div class="ref-id-info">
          <div class="current-id">
            <strong>Текущий ID:</strong>
            <code class="id-display">{{ currentRefId || 'Не установлен' }}</code>
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
            <button @click="loadCurrentReferenceId" class="action-button">
              🔄 Обновить
            </button>
            <button
              @click="createNewRefId"
              class="action-button primary"
              :disabled="isCreatingRefId"
            >
              <span v-if="isCreatingRefId">⏳ Создается...</span>
              <span v-else>🆕 Создать новый ID</span>
            </button>
            <button @click="clearRefId" class="action-button secondary">
              🗑️ Очистить ID
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.ref-id-panel {
  @apply fixed min-w-[640px] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.ref-id-content {
  @apply bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ref-id-header {
  @apply flex items-center justify-between mb-6 pb-4 border-b border-gray-200;
}

.ref-id-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.close-button {
  @apply text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors;
}

.ref-id-info {
  @apply space-y-4;
  flex: 3
}

.current-id {
  @apply flex flex-col gap-2;
}

.current-id strong {
  @apply text-gray-700;
}

.id-display {
  @apply bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono text-gray-800 break-all;
}

.id-breakdown {
  @apply bg-blue-50 p-4 rounded-lg border border-blue-100;
}

.breakdown-item {
  @apply flex justify-between items-center py-1;
}

.breakdown-item .label {
  @apply text-sm font-medium text-gray-600;
}

.breakdown-item .value {
  @apply text-sm text-gray-800 font-mono;
}

/* Стили для полей ввода */
.input-fields {
  @apply bg-gray-50 p-4 rounded-lg border border-gray-200;
  flex: 2
}

.input-fields h4 {
  @apply text-base font-semibold text-gray-700 mb-4;
}

.input-group {
  @apply mb-3;
}

.input-group label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors duration-200;
}

.textarea-field {
  @apply resize-none;
}

.input-field:focus {
  @apply outline-none;
}

.ref-id-actions {
  @apply flex gap-2 flex-wrap;
}

.action-button {
  @apply px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200;
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.action-button.primary {
  @apply bg-blue-600 text-white border-blue-600 hover:bg-blue-700;
  @apply disabled:bg-blue-300 disabled:cursor-not-allowed;
}

.action-button.secondary {
  @apply bg-red-50 text-red-600 border-red-200 hover:bg-red-100;
}

.action-button:hover:not(:disabled) {
  @apply shadow-md transform translate-y-0.5;
}

/* Адаптивность */
@media (max-width: 640px) {
  .ref-id-content {
    @apply mx-2 p-4 max-h-[95vh];
  }
  
  .ref-id-actions {
    @apply flex-col;
  }
  
  .action-button {
    @apply w-full;
  }
}
</style> 