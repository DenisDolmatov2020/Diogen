<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  showCharCount?: boolean
  autofocus?: boolean
  allowEmpty?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'submit', value: string): void
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'typing'): void
  (e: 'stopTyping'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Введите запрос...',
  disabled: false,
  maxLength: 2000,
  showCharCount: false,
  autofocus: false,
  allowEmpty: false,
  loading: false
})

const emit = defineEmits<Emits>()

// Реактивные переменные
const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const isTyping = ref(false)
const isFocused = ref(false)
const typingTimer = ref<number>()
const commandMode = ref(false)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)

// Вычисляемые свойства
const charCount = computed(() => inputText.value.length)
const isOverLimit = computed(() => charCount.value > props.maxLength)
const canSubmit = computed(() => {
  if (props.allowEmpty) return true
  return inputText.value.trim().length > 0 && !isOverLimit.value && !props.disabled && !props.loading
})

const charCountColor = computed(() => {
  const percentage = (charCount.value / props.maxLength) * 100
  if (percentage >= 90) return '#ef4444'
  if (percentage >= 75) return '#f59e0b'
  return '#6b7280'
})

// Методы
function adjustTextareaHeight() {
  if (!textareaRef.value) return
  
  const currentHeight = textareaRef.value.offsetHeight
  
  textareaRef.value.style.height = 'auto'
  const scrollHeight = textareaRef.value.scrollHeight
  const maxHeight = 120 // максимальная высота для чата
  const minHeight = 40 // минимальная высота
  
  let newHeight = Math.max(minHeight, scrollHeight)
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight
    textareaRef.value.style.overflowY = 'auto'
  } else {
    textareaRef.value.style.overflowY = 'hidden'
  }
  
  textareaRef.value.style.height = `${newHeight}px`
  
  // Плавная анимация
  if (Math.abs(newHeight - currentHeight) > 20) {
    textareaRef.value.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  } else {
    textareaRef.value.style.transition = 'height 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

function handleInput() {
  adjustTextareaHeight()
  emit('update:modelValue', inputText.value)
  
  // Обработка типинга
  if (!isTyping.value) {
    isTyping.value = true
    emit('typing')
  }
  
  clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(() => {
    isTyping.value = false
    emit('stopTyping')
  }, 1000)
  
  // Проверка на команды
  if (inputText.value.startsWith('/')) {
    commandMode.value = true
  } else {
    commandMode.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  // Enter без Shift - отправка
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
    return
  }
  
  // Shift + Enter - новая строка (по умолчанию)
  if (event.key === 'Enter' && event.shiftKey) {
    return
  }
  
  // Ctrl/Cmd + Enter - принудительная отправка
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    handleSubmit()
    return
  }
  
  // Стрелка вверх для истории команд
  if (event.key === 'ArrowUp' && inputText.value === '' && commandHistory.value.length > 0) {
    event.preventDefault()
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
      inputText.value = commandHistory.value[commandHistory.value.length - 1 - historyIndex.value]
      adjustTextareaHeight()
    }
    return
  }
  
  // Стрелка вниз для истории команд
  if (event.key === 'ArrowDown' && historyIndex.value >= 0) {
    event.preventDefault()
    if (historyIndex.value > 0) {
      historyIndex.value--
      inputText.value = commandHistory.value[commandHistory.value.length - 1 - historyIndex.value]
    } else {
      historyIndex.value = -1
      inputText.value = ''
    }
    adjustTextareaHeight()
    return
  }
  
  // Escape - очистка поля
  if (event.key === 'Escape') {
    event.preventDefault()
    clearInput()
    return
  }
  
  // Tab для автодополнения
  if (event.key === 'Tab' && commandMode.value) {
    event.preventDefault()
    handleTabCompletion()
    return
  }
}

function handleSubmit() {
  if (!canSubmit.value) return
  
  const value = inputText.value.trim()
  
  // Добавляем в историю если это не пустое сообщение
  if (value) {
    commandHistory.value.unshift(value)
    // Ограничиваем историю 50 элементами
    if (commandHistory.value.length > 50) {
      commandHistory.value = commandHistory.value.slice(0, 50)
    }
  }
  
  // Логируем в консоль
  console.log('📤 Отправленное сообщение:', {
    content: value,
    timestamp: new Date().toISOString(),
    charCount: value.length,
    isCommand: value.startsWith('/'),
    lines: value.split('\n').length
  })
  
  emit('submit', value)
  clearInput()
}

function clearInput() {
  inputText.value = ''
  historyIndex.value = -1
  commandMode.value = false
  adjustTextareaHeight()
  textareaRef.value?.focus()
}

function handleTabCompletion() {
  const commands = ['/help', '/clear', '/status', '/info', '/debug']
  const current = inputText.value.toLowerCase()
  
  const matches = commands.filter(cmd => cmd.startsWith(current))
  if (matches.length === 1) {
    inputText.value = matches[0] + ' '
    adjustTextareaHeight()
  } else if (matches.length > 1) {
    console.log('Доступные команды:', matches)
  }
}

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}

// Экспортируем методы для родительского компонента
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  clear: clearInput,
  getValue: () => inputText.value,
  setValue: (value: string) => {
    inputText.value = value
    adjustTextareaHeight()
  }
})

onMounted(() => {
  if (props.autofocus) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
})

onUnmounted(() => {
  clearTimeout(typingTimer.value)
})
</script>

<template>
  <div class="chat-input-container" :class="{ 'input-focused': isFocused, 'input-disabled': disabled }">
    <!-- Индикатор команды -->
    <div v-if="commandMode" class="command-indicator">
      <span class="command-icon">⚡</span>
      <span class="command-text">Режим команды</span>
      <span class="command-hint">Tab для автодополнения</span>
    </div>
    
    <!-- Основной контейнер ввода -->
    <div class="input-wrapper">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :maxlength="maxLength"
        class="input-field"
        rows="1"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>

      <!-- Индикатор загрузки в кнопке -->
      <button
        @click="handleSubmit"
        :disabled="!canSubmit"
        class="send-button"
        :class="{ 'send-ready': canSubmit, 'send-loading': loading }"
        :title="loading ? 'Отправка...' : 'Отправить (Enter)'"
      >
        <span v-if="loading" class="loading-spinner" />
        <svg
          v-else
          width="22"
          height="20"
          viewBox="0 0 22 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.24862 0.249944C1.42319 -0.144342 0.516337 0.609944 0.752051 1.49366L2.48005 7.95051C2.52336 8.11279 2.61338 8.25877 2.73895 8.37032C2.86452 8.48186 3.02009 8.55406 3.18634 8.57794L11.6583 9.78823C11.9035 9.82252 11.9035 10.1774 11.6583 10.2125L3.18719 11.4219C3.02094 11.4458 2.86537 11.518 2.73981 11.6296C2.61424 11.7411 2.52421 11.8871 2.48091 12.0494L0.752051 18.5097C0.516337 19.3925 1.42319 20.1468 2.24862 19.7534L20.6755 10.9685C21.4889 10.5811 21.4889 9.42223 20.6755 9.03394L2.24862 0.249944Z"/>
        </svg>
      </button>
    </div>
    
    <!-- Нижняя панель с подсказками и счетчиком -->
    <div v-if="isFocused || commandMode || showCharCount" class="input-footer">
      <div class="input-hints">
        <span class="hint">
          <kbd>Enter</kbd> отправить
        </span>
        <span class="hint">
          <kbd>Shift+Enter</kbd> новая строка
        </span>
        <span v-if="commandMode" class="hint command-hint">
          <kbd>Tab</kbd> автодополнение
        </span>
        <span class="hint">
          <kbd>↑↓</kbd> история
        </span>
      </div>
      
      <div v-if="showCharCount" class="char-counter">
        <span 
          class="char-count" 
          :style="{ color: charCountColor }"
          :class="{ 'over-limit': isOverLimit }"
        >
          {{ charCount }}
        </span>
        <span class="char-limit">/{{ maxLength }}</span>
      </div>
    </div>
    
    <!-- Индикатор типинга -->
    <div v-if="isTyping" class="typing-indicator">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="typing-text">печатаю...</span>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  @apply relative w-full;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-focused {
  transform: translateY(-3px);
  filter: drop-shadow(0 8px 25px rgba(59, 130, 246, 0.15));
}

.input-disabled {
  opacity: 0.6;
  pointer-events: none;
  filter: grayscale(0.5);
}

/* Индикатор команды */
.command-indicator {
  @apply flex items-center justify-between gap-2 px-4 py-3 mb-3;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  font-size: 13px;
  color: #3b82f6;
  animation: command-glow 2s ease-in-out infinite alternate;
  backdrop-filter: blur(10px);
}

@keyframes command-glow {
  0% { 
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.3);
  }
  100% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    border-color: rgba(59, 130, 246, 0.5);
  }
}

.command-icon {
  font-size: 16px;
  animation: command-pulse 1.5s ease-in-out infinite;
}

@keyframes command-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.command-text {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
}

.command-hint {
  font-size: 11px;
  opacity: 0.9;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  animation: hint-fade 3s ease-in-out infinite;
}

@keyframes hint-fade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Основной контейнер ввода (из ChatPage дизайн) */
.input-wrapper {
  @apply flex items-end gap-3 bg-white rounded-full border-2 border-gray-300 pl-6 pr-2 shadow-lg;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-top: 3px;
  padding-bottom: 3px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
}

.input-focused .input-wrapper {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.2),
    0 0 0 4px rgba(59, 130, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%);
}

/* Поле ввода */
.input-field {
  @apply flex-1 resize-none border-0 outline-0 bg-transparent text-sm;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.9;
  color: #1f2937;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-field::placeholder {
  color: #9ca3af;
  transition: all 0.3s ease;
  font-style: italic;
}

.input-focused .input-field::placeholder {
  color: #6b7280;
  transform: translateX(2px);
}

.input-field:focus::placeholder {
  opacity: 0.7;
  transform: translateX(4px);
}

/* Кнопка отправки (из InteractiveInput стили) */
.send-button {
  @apply flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 flex-shrink-0;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
  border: 2px solid rgba(203, 213, 225, 0.5);
  cursor: pointer;
  color: #9ca3af;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.send-button:hover::before {
  left: 100%;
}

.send-button svg {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

/* Активное состояние кнопки */
.send-ready {
  color: #ffffff !important;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%) !important;
  border-color: rgba(59, 130, 246, 0.7) !important;
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.4),
    0 0 0 3px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: ready-pulse 2.5s ease-in-out infinite;
}

.send-ready svg {
  transform: scale(1.15);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%, 100% { transform: scale(1.15) translateY(0); }
  50% { transform: scale(1.15) translateY(-1px); }
}

.send-ready:hover {
  transform: scale(1.08);
  box-shadow: 
    0 12px 35px rgba(59, 130, 246, 0.5),
    0 0 0 4px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  animation: none;
}

.send-ready:hover svg {
  transform: scale(1.3) rotate(12deg);
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
  animation: none;
}

.send-ready:active {
  transform: scale(0.98);
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.4),
    0 0 0 2px rgba(59, 130, 246, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.send-ready:active svg {
  transform: scale(1.1) rotate(0deg);
}

/* Состояние загрузки */
.send-loading {
  color: #ffffff !important;
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%) !important;
  border-color: rgba(107, 114, 128, 0.7) !important;
  cursor: not-allowed;
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% { 
    box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
    opacity: 0.9;
  }
  50% { 
    box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
    opacity: 1;
  }
}

/* Неактивное состояние кнопки */
.send-button:disabled:not(.send-loading) {
  color: #9ca3af !important;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.7) 0%, rgba(241, 245, 249, 0.7) 100%);
  border-color: rgba(203, 213, 225, 0.3);
  cursor: not-allowed;
  opacity: 0.6;
  transform: scale(0.95);
}

.send-button:disabled svg {
  opacity: 0.4;
  transform: scale(0.85);
}

/* Спиннер загрузки */
.loading-spinner {
  @apply w-6 h-6 border-2 border-white border-t-transparent rounded-full;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ready-pulse {
  0%, 100% { 
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.4),
      0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  50% { 
    box-shadow: 
      0 12px 35px rgba(59, 130, 246, 0.6),
      0 0 0 4px rgba(59, 130, 246, 0.3);
  }
}

/* Нижняя панель */
.input-footer {
  @apply flex items-center justify-between px-4 py-3 mt-3;
  font-size: 12px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.6);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-focused .input-footer {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.input-hints {
  @apply flex items-center gap-4;
  color: #6b7280;
}

.hint {
  @apply flex items-center gap-2;
  transition: all 0.3s ease;
}

.hint:hover {
  color: #3b82f6;
  transform: translateY(-1px);
}

.command-hint {
  color: #3b82f6;
  font-weight: 600;
  animation: command-hint-glow 2s ease-in-out infinite;
}

@keyframes command-hint-glow {
  0%, 100% { 
    text-shadow: 0 0 4px rgba(59, 130, 246, 0.3);
  }
  50% { 
    text-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  }
}

kbd {
  @apply px-2 py-1 bg-white rounded-md text-xs border-2;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 11px;
  color: #374151;
  border-color: #e5e7eb;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.hint:hover kbd {
  background: #f3f4f6;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05);
}

/* Счетчик символов */
.char-counter {
  @apply flex items-center gap-2;
}

.char-count {
  font-weight: 700;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.over-limit {
  animation: pulse-red 1s infinite;
  color: #ef4444 !important;
}

.char-limit {
  color: #9ca3af;
  font-weight: 500;
}

@keyframes pulse-red {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.05);
  }
}

/* Индикатор типинга */
.typing-indicator {
  @apply flex items-center gap-3 mt-3 px-4 py-2;
  color: #6b7280;
  font-size: 13px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  animation: typing-glow 2s ease-in-out infinite alternate;
}

@keyframes typing-glow {
  0% { 
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }
  100% { 
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
}

.typing-dots {
  @apply flex items-center gap-1;
}

.typing-dots span {
  @apply w-2 h-2 rounded-full;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  animation: typing-bounce 1.4s ease-in-out infinite both;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.typing-text {
  font-style: italic;
  font-weight: 500;
  color: #3b82f6;
  text-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .input-hints {
    @apply flex-wrap gap-2;
  }
  
  .input-field {
    font-size: 16px; /* Предотвращает зум на iOS */
  }
  
  .send-button {
    @apply w-12 h-12;
  }
  
  .input-wrapper {
    @apply pl-4 pr-1;
  }
}
</style> 