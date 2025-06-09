<script setup lang="ts">
import { ref } from 'vue'
import ChatInput from '@/components/ui/ChatInput.vue'

const chatInputRef = ref()
const isTyping = ref(false)
const isLoading = ref(false)
const messages = ref<string[]>([])

function handleSubmit(value: string) {
  messages.value.unshift(value)
  console.log('✅ Отправлено в чат:', value)
  
  // Эмулируем загрузку
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

function handleTyping() {
  isTyping.value = true
  console.log('⌨️ Пользователь печатает в чате')
}

function handleStopTyping() {
  isTyping.value = false
  console.log('⏸️ Пользователь перестал печатать')
}

function handleFocus() {
  console.log('🎯 ChatInput получил фокус')
}

function handleBlur() {
  console.log('👋 ChatInput потерял фокус')
}

function clearInput() {
  chatInputRef.value?.clear()
}

function focusInput() {
  chatInputRef.value?.focus()
}

function simulateLoading() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 3000)
}
</script>

<template>
  <div class="chat-demo-page">
    <div class="demo-container">
      <!-- Заголовок -->
      <div class="demo-header">
        <h1 class="demo-title">💬 ChatInput Компонент</h1>
        <p class="demo-subtitle">
          Продвинутая строка ввода для чатов с дизайном ChatPage и функциональностью InteractiveInput
        </p>
      </div>

      <!-- Статус -->
      <div class="status-panel">
        <div class="status-item">
          <span class="status-label">Статус:</span>
          <span class="status-value" :class="{ 'typing': isTyping, 'loading': isLoading }">
            {{ isLoading ? '📤 Отправляется' : isTyping ? '⌨️ Печатает' : '⏸️ Ожидание' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Сообщений:</span>
          <span class="status-value">{{ messages.length }}</span>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="quick-actions">
        <h3 class="actions-title">Тестирование:</h3>
        <div class="actions-grid">
          <button @click="focusInput()" class="action-btn">
            🎯 Фокус
          </button>
          <button @click="clearInput()" class="action-btn">
            🧹 Очистить
          </button>
          <button @click="simulateLoading()" class="action-btn" :disabled="isLoading">
            {{ isLoading ? '⏳ Загрузка...' : '📤 Тест загрузки' }}
          </button>
        </div>
      </div>

      <!-- Превью как в настоящем чате -->
      <div class="chat-preview">
        <h3 class="section-title">Предварительный просмотр в чате:</h3>
        
        <!-- Имитация чата -->
        <div class="chat-container">
          <div class="chat-messages">
            <div v-if="messages.length === 0" class="no-messages">
              Отправьте первое сообщение...
            </div>
            <div 
              v-for="(message, index) in messages.slice(0, 5)" 
              :key="index"
              class="message"
            >
              <div class="message-content">{{ message }}</div>
              <div class="message-time">{{ new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}</div>
            </div>
          </div>
          
          <!-- Фиксированный ввод как в реальном чате -->
          <div class="chat-input-area">
            <ChatInput
              ref="chatInputRef"
              placeholder="Введите сообщение в чат..."
              :loading="isLoading"
              :show-char-count="true"
              :max-length="500"
              @submit="handleSubmit"
              @typing="handleTyping"
              @stop-typing="handleStopTyping"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </div>
        </div>
      </div>

      <!-- Возможности -->
      <div class="features">
        <h3 class="features-title">🎮 Возможности компонента:</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">⌨️</div>
            <div class="feature-title">Горячие клавиши</div>
            <div class="feature-desc">Enter, Shift+Enter, Ctrl+Enter, Escape, ↑↓</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <div class="feature-title">История команд</div>
            <div class="feature-desc">Навигация по ранее отправленным сообщениям</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-title">Режим команд</div>
            <div class="feature-desc">Автодополнение команд начинающихся с /</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <div class="feature-title">Динамические состояния</div>
            <div class="feature-desc">Активная/неактивная кнопка с анимацией</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📏</div>
            <div class="feature-title">Автоматический размер</div>
            <div class="feature-desc">Плавное изменение высоты при вводе</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⏳</div>
            <div class="feature-title">Состояние загрузки</div>
            <div class="feature-desc">Спиннер и блокировка при отправке</div>
          </div>
        </div>
      </div>

      <!-- История сообщений -->
      <div v-if="messages.length > 0" class="messages-history">
        <h3 class="history-title">📋 История отправленных сообщений:</h3>
        <div class="messages-list">
          <div
            v-for="(message, index) in messages"
            :key="`msg-${index}`"
            class="message-item"
          >
            <div class="message-index">#{{ messages.length - index }}</div>
            <div class="message-content">{{ message }}</div>
            <div class="message-meta">
              <span class="message-chars">{{ message.length }} символов</span>
              <span class="message-lines">{{ message.split('\n').length }} строк</span>
              <span v-if="message.startsWith('/')" class="message-command">Команда</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-demo-page {
  @apply min-h-screen py-8;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.demo-container {
  @apply max-w-4xl mx-auto px-6;
}

/* Заголовок */
.demo-header {
  @apply text-center mb-8;
}

.demo-title {
  @apply text-4xl font-bold mb-2;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.demo-subtitle {
  @apply text-lg text-gray-600;
}

/* Статус панель */
.status-panel {
  @apply flex items-center justify-center gap-8 mb-6 p-4;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.status-item {
  @apply flex items-center gap-2;
}

.status-label {
  @apply font-medium text-gray-600;
}

.status-value {
  @apply px-2 py-1 rounded-lg text-sm font-semibold;
  background: #f1f5f9;
  color: #475569;
  transition: all 0.3s ease;
}

.status-value.typing {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  animation: pulse 1s infinite;
}

.status-value.loading {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  animation: pulse 1.5s infinite;
}

/* Быстрые действия */
.quick-actions {
  @apply mb-6;
}

.actions-title {
  @apply text-lg font-semibold mb-3 text-gray-700;
}

.actions-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-3;
}

.action-btn {
  @apply px-4 py-3 bg-white border border-gray-200 rounded-lg font-medium text-sm;
  @apply hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700;
  @apply transform hover:scale-105 transition-all duration-200;
  @apply active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Превью чата */
.chat-preview {
  @apply mb-8;
}

.section-title {
  @apply text-lg font-semibold mb-4 text-gray-700;
}

.chat-container {
  @apply relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-3;
}

.no-messages {
  @apply flex items-center justify-center h-full text-gray-400 text-center;
}

.message {
  @apply flex justify-end;
}

.message-content {
  @apply bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs;
  word-break: break-word;
}

.message-time {
  @apply text-xs text-gray-400 mt-1 text-right;
}

.chat-input-area {
  @apply bg-white border-t border-gray-200 p-4;
}

/* Возможности */
.features {
  @apply mb-8;
}

.features-title {
  @apply text-lg font-semibold mb-4 text-gray-700;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.feature-item {
  @apply p-4 bg-white rounded-lg border border-gray-200;
}

.feature-icon {
  @apply text-2xl mb-2;
}

.feature-title {
  @apply font-semibold text-gray-800 mb-1;
}

.feature-desc {
  @apply text-sm text-gray-600;
}

/* История сообщений */
.messages-history {
  @apply mb-6;
}

.history-title {
  @apply text-lg font-semibold mb-4 text-gray-700;
}

.messages-list {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.message-item {
  @apply p-4 bg-white rounded-lg border border-gray-200;
  @apply hover:shadow-md transition-shadow duration-200;
}

.message-index {
  @apply text-xs font-mono text-gray-400 mb-1;
}

.message-item .message-content {
  @apply text-sm text-gray-800 mb-2 bg-transparent text-gray-800 px-0 py-0 rounded-none max-w-none;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta {
  @apply flex items-center gap-3 text-xs text-gray-500;
}

.message-chars, .message-lines {
  @apply px-2 py-1 bg-gray-100 rounded;
}

.message-command {
  @apply px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium;
}

/* Анимации */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .demo-container {
    @apply px-4;
  }
  
  .status-panel {
    @apply flex-col gap-4;
  }
  
  .actions-grid {
    @apply grid-cols-1;
  }
  
  .features-grid {
    @apply grid-cols-1;
  }
}
</style> 