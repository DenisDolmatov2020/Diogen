<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  showCharCount?: boolean
  autofocus?: boolean
  allowEmpty?: boolean
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
  placeholder: 'Введите сообщение...',
  disabled: false,
  maxLength: 2000,
  showCharCount: true,
  autofocus: false,
  allowEmpty: false
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
  return inputText.value.trim().length > 0 && !isOverLimit.value && !props.disabled
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
  
  // Сохраняем текущую высоту для плавного перехода
  const currentHeight = textareaRef.value.offsetHeight
  
  textareaRef.value.style.height = 'auto'
  const scrollHeight = textareaRef.value.scrollHeight
  const maxHeight = 200 // максимальная высота в пикселях
  const minHeight = 44 // минимальная высота для одной строки
  
  let newHeight = Math.max(minHeight, scrollHeight)
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight
    textareaRef.value.style.overflowY = 'auto'
  } else {
    textareaRef.value.style.overflowY = 'hidden'
  }
  
  // Применяем новую высоту с плавным переходом
  textareaRef.value.style.height = `${newHeight}px`
  
  // Добавляем небольшую задержку для более плавной анимации при быстром наборе
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
    // Разрешаем стандартное поведение
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
  
  // Tab для автодополнения (базовая реализация)
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
  
  // Логируем в консоль как требуется
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
  // Базовые команды для автодополнения
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

function insertText(text: string) {
  if (!textareaRef.value) return
  
  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  const before = inputText.value.substring(0, start)
  const after = inputText.value.substring(end)
  
  inputText.value = before + text + after
  
  nextTick(() => {
    if (textareaRef.value) {
      const newPosition = start + text.length
      textareaRef.value.setSelectionRange(newPosition, newPosition)
      textareaRef.value.focus()
    }
    adjustTextareaHeight()
  })
}

// Экспортируем методы для родительского компонента
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  clear: clearInput,
  insertText,
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
  <div class="interactive-input" :class="{ 'input-focused': isFocused, 'input-disabled': disabled }">
    <!-- Индикатор команды -->
    <div v-if="commandMode" class="command-indicator">
      <span class="command-icon">⚡</span>
      <span class="command-text">Режим команды</span>
    </div>
    
    <!-- Основной контейнер ввода -->
    <div class="input-container">
      <!-- Поле ввода -->
      <div class="textarea-wrapper">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          :maxlength="maxLength"
          class="input-textarea"
          rows="1"
          @input="handleInput"
          @keydown="handleKeyDown"
          @focus="handleFocus"
          @blur="handleBlur"
        ></textarea>
        
        <!-- Кнопки действий -->
        <div class="action-buttons">

          <!-- Кнопка отправки -->
          <button
            @click="handleSubmit"
            :disabled="!canSubmit"
            class="action-btn send-btn"
            :class="{ 'send-ready': canSubmit }"
            title="Отправить (Enter)"
          >
            <svg viewBox="0 0 24 24" class="btn-icon">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Нижняя панель информации -->
      <div class="input-footer">
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
.interactive-input {
  @apply relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-focused {
  transform: translateY(-2px);
}

.input-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Индикатор команды */
.command-indicator {
  @apply flex items-center gap-2 px-3 py-1 mb-2;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #3b82f6;
}

.command-icon {
  font-size: 14px;
}

.command-text {
  font-weight: 500;
}

/* Основной контейнер */
.input-container {
  @apply relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.input-focused .input-container {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.textarea-wrapper {
  @apply relative flex items-end gap-2 p-3;
  transition: padding 0.2s ease;
}

/* Поле ввода */
.input-textarea {
  @apply flex-1 resize-none bg-transparent border-none outline-none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
  min-height: 44px;
  max-height: 200px;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-textarea::placeholder {
  color: red;
  transition: color 0.3s ease;
}

.input-focused .input-textarea::placeholder {
  color: green;
}

/* Кнопки действий */
.action-buttons {
  @apply flex items-center gap-2;
}

.action-btn {
  @apply flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  @apply w-4 h-4;
  fill: currentColor;
}

/* Кнопка очистки */
.clear-btn {
  color: #6b7280;
}

.clear-btn:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

/* Кнопка отправки */
.send-btn {
  @apply flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  cursor: pointer;
}

/* Активное состояние кнопки */
.send-btn:not(:disabled) {
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  animation: ready-pulse 2s ease-in-out infinite;
}

.send-btn:not(:disabled) svg {
  fill: #ffffff !important;
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  animation: none;
}

.send-btn:not(:disabled):hover svg {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

.send-btn:not(:disabled):active {
  transform: scale(0.95);
}

.send-btn:not(:disabled):active svg {
  transform: scale(1) rotate(0deg);
}

/* Неактивное состояние кнопки */
.send-btn:disabled {
  color: #9ca3af;
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(203, 213, 225, 0.4);
  cursor: not-allowed;
  opacity: 0.7;
}

.send-btn:disabled svg {
  fill: #9ca3af !important;
  opacity: 0.5;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn:disabled:hover {
  opacity: 0.8;
}

.send-ready {
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-color: rgba(59, 130, 246, 0.5);
  cursor: pointer;
  transform: scale(1);
  animation: ready-pulse 2s ease-in-out infinite;
}

.send-ready .btn-icon {
  fill: #ffffff;
  opacity: 1;
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}

.send-ready:hover {
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  transform: scale(1.05);
  animation: none;
}

.send-ready:hover .btn-icon {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

.send-ready:active {
  transform: scale(0.95);
}

.send-ready:active .btn-icon {
  transform: scale(1) rotate(0deg);
}

@keyframes ready-pulse {
  0%, 100% {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
  }
}

/* Нижняя панель */
.input-footer {
  @apply flex items-center justify-between px-3 pb-2;
  font-size: 11px;
}

.input-hints {
  @apply flex items-center gap-3;
  color: #6b7280;
}

.hint {
  @apply flex items-center gap-1;
}

.command-hint {
  color: #3b82f6;
  font-weight: 500;
}

kbd {
  @apply px-1 py-0.5 bg-gray-100 rounded text-xs;
  font-family: inherit;
  font-size: 10px;
  color: #374151;
  border: 1px solid #d1d5db;
}

/* Счетчик символов */
.char-counter {
  @apply flex items-center gap-1;
}

.char-count {
  font-weight: 600;
  transition: color 0.3s ease;
}

.over-limit {
  animation: pulse-red 1s infinite;
}

.char-limit {
  color: #9ca3af;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Индикатор типинга */
.typing-indicator {
  @apply flex items-center gap-2 mt-2 px-3 py-1;
  color: #6b7280;
  font-size: 12px;
}

.typing-dots {
  @apply flex items-center gap-1;
}

.typing-dots span {
  @apply w-1 h-1 bg-blue-500 rounded-full;
  animation: typing-bounce 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.typing-text {
  font-style: italic;
}

/* Адаптивность */
@media (max-width: 768px) {
  .input-hints {
    @apply hidden;
  }

  .input-textarea {
    font-size: 16px; /* Предотвращает зум на iOS */
  }

  .action-btn {
    @apply w-10 h-10;
  }

  .btn-icon {
    @apply w-5 h-5;
  }
}

/* Темная тема поддержка */
@media (prefers-color-scheme: dark) {
  .input-container {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(75, 85, 99, 0.3);
  }

  .input-textarea {
    color: #333333;
  }

  .input-textarea::placeholder {
    color: #333ccc;
  }

  .action-btn {
    background: rgba(55, 65, 81, 0.8);
    border-color: rgba(75, 85, 99, 0.4);
  }

  kbd {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
}

/* Кнопка отправки (универсальная) */
.send-button {
  @apply flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  cursor: pointer;
}

/* Активное состояние кнопки */
.send-button:not(:disabled) {
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  animation: ready-pulse 2s ease-in-out infinite;
}

.send-button:not(:disabled) svg {
  fill: #ffffff !important;
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-button:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  animation: none;
}

.send-button:not(:disabled):hover svg {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

.send-button:not(:disabled):active {
  transform: scale(0.95);
}

.send-button:not(:disabled):active svg {
  transform: scale(1) rotate(0deg);
}

/* Неактивное состояние кнопки */
.send-button:disabled {
  color: #9ca3af;
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(203, 213, 225, 0.4);
  cursor: not-allowed;
  opacity: 0.7;
}

.send-button:disabled svg {
  fill: #9ca3af !important;
  opacity: 0.5;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-button:disabled:hover {
  opacity: 0.8;
}
</style> 