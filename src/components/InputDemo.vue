<script setup lang="ts">
import { ref } from 'vue'
import InteractiveInput from '@/components/ui/InteractiveInput.vue'

const inputRef = ref()
const isTyping = ref(false)
const messages = ref<string[]>([])

function handleSubmit(value: string) {
  messages.value.unshift(value)
  console.log('✅ Получено сообщение в родительском компоненте:', value)
}

function handleTyping() {
  isTyping.value = true
  console.log('⌨️ Пользователь начал печатать')
}

function handleStopTyping() {
  isTyping.value = false
  console.log('⏸️ Пользователь перестал печатать')
}

function handleFocus() {
  console.log('🎯 Поле ввода получило фокус')
}

function handleBlur() {
  console.log('👋 Поле ввода потеряло фокус')
}

function insertEmoji(emoji: string) {
  inputRef.value?.insertText(emoji)
}

function clearInput() {
  inputRef.value?.clear()
}

function focusInput() {
  inputRef.value?.focus()
}
</script>

<template>
  <div class="demo-page">
    <div class="demo-container">
      <!-- Заголовок -->
      <div class="demo-header">
        <h1 class="demo-title">📝 Интерактивная строка ввода</h1>
        <p class="demo-subtitle">
          Протестируйте все возможности компонента
        </p>
      </div>

      <!-- Статус -->
      <div class="status-panel">
        <div class="status-item">
          <span class="status-label">Статус:</span>
          <span class="status-value" :class="{ 'typing': isTyping }">
            {{ isTyping ? '⌨️ Печатает' : '⏸️ Ожидание' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Сообщений:</span>
          <span class="status-value">{{ messages.length }}</span>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="quick-actions">
        <h3 class="actions-title">Быстрые действия:</h3>
        <div class="actions-grid">
          <button @click="focusInput()" class="action-btn">
            🎯 Фокус
          </button>
          <button @click="clearInput()" class="action-btn">
            🧹 Очистить
          </button>
          <button @click="insertEmoji('👋')" class="action-btn">
            👋 Привет
          </button>
          <button @click="insertEmoji('🚀')" class="action-btn">
            🚀 Ракета
          </button>
          <button @click="insertEmoji('💡')" class="action-btn">
            💡 Идея
          </button>
          <button @click="insertEmoji('❤️')" class="action-btn">
            ❤️ Сердце
          </button>
        </div>
      </div>

      <!-- Основной компонент -->
      <div class="input-section">
        <h3 class="section-title">Строка ввода:</h3>
        <InteractiveInput
          ref="inputRef"
          placeholder="Попробуйте все возможности: Enter, Shift+Enter, команды /, стрелки ↑↓..."
          :max-length="500"
          :show-char-count="true"
          :autofocus="true"
          @submit="handleSubmit"
          @typing="handleTyping"
          @stop-typing="handleStopTyping"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>

      <!-- Инструкции -->
      <div class="instructions">
        <h3 class="instructions-title">🎮 Как пользоваться:</h3>
        <div class="instructions-grid">
          <div class="instruction-item">
            <div class="instruction-key">Enter</div>
            <div class="instruction-desc">Отправить сообщение</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-key">Shift + Enter</div>
            <div class="instruction-desc">Новая строка</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-key">Ctrl/Cmd + Enter</div>
            <div class="instruction-desc">Принудительная отправка</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-key">Escape</div>
            <div class="instruction-desc">Очистить поле</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-key">↑ / ↓</div>
            <div class="instruction-desc">История сообщений</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-key">/команда</div>
            <div class="instruction-desc">Режим команд + Tab для автодополнения</div>
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

      <!-- Отладочная информация -->
      <div class="debug-info">
        <details>
          <summary class="debug-summary">🐛 Отладочная информация</summary>
          <div class="debug-content">
            <p><strong>Открыть консоль браузера</strong> (F12) чтобы увидеть все логи</p>
            <p>Каждое действие логируется с подробной информацией</p>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-page {
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
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
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

/* Быстрые действия */
.quick-actions {
  @apply mb-6;
}

.actions-title {
  @apply text-lg font-semibold mb-3 text-gray-700;
}

.actions-grid {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2;
}

.action-btn {
  @apply px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium text-sm;
  @apply hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700;
  @apply transform hover:scale-105 transition-all duration-200;
  @apply active:scale-95;
}

/* Секция ввода */
.input-section {
  @apply mb-8;
}

.section-title {
  @apply text-lg font-semibold mb-4 text-gray-700;
}

/* Инструкции */
.instructions {
  @apply mb-8;
}

.instructions-title {
  @apply text-lg font-semibold mb-4 text-gray-700;
}

.instructions-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3;
}

.instruction-item {
  @apply p-3 bg-white rounded-lg border border-gray-200;
}

.instruction-key {
  @apply text-sm font-mono font-semibold text-blue-600 mb-1;
  @apply px-2 py-1 bg-blue-50 rounded border;
}

.instruction-desc {
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

.message-content {
  @apply text-sm text-gray-800 mb-2;
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

/* Отладочная информация */
.debug-info {
  @apply mt-8;
}

.debug-summary {
  @apply cursor-pointer text-sm text-gray-600 hover:text-gray-800;
  @apply p-3 bg-gray-50 rounded-lg border border-gray-200;
}

.debug-content {
  @apply mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600;
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
    @apply grid-cols-2;
  }
  
  .instructions-grid {
    @apply grid-cols-1;
  }
}
</style> 