<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { apiService } from '@/api/apiService'
import BlockRenderer from '@/components/core/BlockRenderer.vue'
import { transformMessageComponentsToTreeBlocks, createTextMessageBlock } from '@/utils/chatTransform'
import { getOrCreateReferenceId } from '@/utils/referenceIdManager'
import type { TreeBlock } from '@/types/block'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isLoading?: boolean
  components?: MessageComponent[]
  treeBlocks?: TreeBlock[]
}

interface MessageComponent {
  component_name: string
  parent_block_id: string
  items: ComponentItem[]
}

interface ComponentItem {
  title?: string
  data: any
  status: string
  variable?: string
}

// Состояние чата
const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLDivElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const currentReferenceId = ref<string>('')

// Добавляем начальное сообщение от бота
onMounted(() => {
  // Инициализируем reference_id при загрузке страницы
  currentReferenceId.value = getOrCreateReferenceId()
  console.log('🆔 Инициализирован reference_id для чата:', currentReferenceId.value)
  
  addMessage('Привет! Я ваш помощник-бот. Как дела? Чем могу помочь?', false)
  
  // Устанавливаем фокус на поле ввода
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
})

// Добавление нового сообщения
function addMessage(content: string, isUser: boolean, isLoading: boolean = false, components?: MessageComponent[]) {
  let treeBlocks: TreeBlock[] = []
  
  // Если есть компоненты, трансформируем их в TreeBlock формат
  if (components && components.length > 0) {
    treeBlocks = transformMessageComponentsToTreeBlocks(components)
  } else if (content && !isLoading) {
    // Для обычных текстовых сообщений создаем простой TreeBlock
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    treeBlocks = [createTextMessageBlock(content, messageId)]
  }

  const message: Message = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    content,
    isUser,
    timestamp: new Date(),
    isLoading,
    components,
    treeBlocks
  }
  
  messages.value.push(message)
  
  // Прокрутка к последнему сообщению
  nextTick(() => {
    scrollToBottom()
  })
  
  return message
}

// Прокрутка к последнему сообщению
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Отправка сообщения
async function sendMessage(messageText?: string, keys?: string[]) {
  const message = messageText || inputMessage.value.trim()
  if (!message || isLoading.value) return
  
  // Добавляем сообщение пользователя
  addMessage(message, true)
  
  // Очищаем поле ввода только если это обычное сообщение
  if (!messageText) {
    inputMessage.value = ''
  }
  
  // Добавляем индикатор загрузки
  const loadingMessage = addMessage('Печатает...', false, true)
  isLoading.value = true
  
  try {
    // Отправляем запрос с новым форматом
    const response = await apiService.sendChatMessage(
      message,
      currentReferenceId.value,
      keys
    )
    
    // Удаляем индикатор загрузки
    const loadingIndex = messages.value.findIndex(msg => msg.id === loadingMessage.id)
    if (loadingIndex !== -1) {
      messages.value.splice(loadingIndex, 1)
    }
    
    // Обрабатываем ответ
    if (response && Array.isArray(response)) {
      processServerResponse(response)
    } else {
      addMessage('Извините, не могу ответить на ваш вопрос.', false)
    }
    
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error)
    
    // Удаляем индикатор загрузки
    const loadingIndex = messages.value.findIndex(msg => msg.id === loadingMessage.id)
    if (loadingIndex !== -1) {
      messages.value.splice(loadingIndex, 1)
    }
    
    // Добавляем сообщение об ошибке
    addMessage('Извините, произошла ошибка. Попробуйте еще раз.', false)
  } finally {
    isLoading.value = false
  }
}

// Обработка ответа сервера
function processServerResponse(response: MessageComponent[]) {
  let textContent = ''
  const components: MessageComponent[] = []
  
  response.forEach(component => {
    if (component.component_name === 'text_block') {
      // Извлекаем текстовое содержимое
      component.items.forEach(item => {
        if (item.data) {
          textContent += (textContent ? '\n\n' : '') + item.data
        }
      })
    }
    
    // Сохраняем все компоненты для отображения
    components.push(component)
  })
  
  // Добавляем сообщение с текстом и компонентами
  addMessage(textContent || 'Ответ получен', false, false, components)
}

// Обработка действий от компонентов (например, нажатие кнопок)
function handleBlockAction(actionData: any) {
  console.log('🎯 Действие от блока:', actionData)
  
  // Если это кнопка действия, обрабатываем её
  if (actionData.source_component === 'action_button' || actionData.type === 'button_click') {
    console.log('🔘 Обработка действия кнопки:', actionData.payload)
    
    // В новой структуре от бэкенда главным параметром является title
    const buttonTitle = actionData.payload?.title
    
    if (buttonTitle) {
      // Отправляем сообщение с заголовком кнопки
      sendMessage(buttonTitle)
    } else {
      console.warn('⚠️ Не найден title для кнопки действия:', actionData)
    }
  }
}

// Обработка Enter и автоматическое изменение размера textarea
function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function handleInput() {
  // Автоматическое изменение высоты textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

// Форматирование времени
function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Простая обработка markdown-подобного форматирования
function formatMessageText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
    .replace(/`(.*?)`/g, '<code>$1</code>') // `code`
    .replace(/\n/g, '<br>') // переносы строк
}
</script>

<template>
  <div class="chat-page">
    <!-- Область сообщений -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- Подсказка когда нет сообщений -->
      <div v-if="messages.length <= 1" class="chat-placeholder">
        <p class="placeholder-text">
          Введите теги, термины или задайте вопрос<br>
          для поиска информации
        </p>
      </div>

      <!-- Сообщения -->
      <div class="messages-container">
        <TransitionGroup name="message" tag="div">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['message', message.isUser ? 'message-user' : 'message-bot']"
          >
            <div class="message-content">
              <div v-if="message.isLoading" class="message-loading">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div v-else class="message-body">
                <!-- Для пользовательских сообщений показываем только текст -->
                <div v-if="message.isUser" class="message-text">
                  {{ message.content }}
                </div>
                
                <!-- Для сообщений бота используем BlockRenderer -->
                <div v-else class="bot-message-blocks">
                  <!-- Если есть TreeBlocks, рендерим их через BlockRenderer -->
                  <div v-if="message.treeBlocks && message.treeBlocks.length > 0" class="rendered-blocks">
                    <BlockRenderer 
                      v-for="(block, index) in message.treeBlocks"
                      :key="`block-${message.id}-${index}`"
                      :block="block"
                      :skeleton="false"
                      :level="0"
                      @action="handleBlockAction"
                    />
                  </div>
                  
                  <!-- Fallback: если нет TreeBlocks, показываем обычный текст -->
                  <div v-else-if="message.content" class="message-text">
                    <div v-html="formatMessageText(message.content)"></div>
                  </div>
                </div>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Поле ввода зафиксировано внизу -->
    <div class="chat-input-fixed">
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            ref="textareaRef"
            v-model="inputMessage"
            :disabled="isLoading"
            placeholder="Введите запрос..."
            class="input-field"
            rows="1"
            @keydown="handleKeyPress"
            @input="handleInput"
          />
          <button
            :disabled="!inputMessage.trim() || isLoading"
            class="send-button"
            @click="() => sendMessage()"
          >
            <svg
              width="22"
              height="20"
              viewBox="0 0 22 20"
              
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                :fill="!inputMessage.length || isLoading ? '#9CA3AF' : '#333333'"
                d="M2.24862 0.249944C1.42319 -0.144342 0.516337 0.609944 0.752051 1.49366L2.48005 7.95051C2.52336 8.11279 2.61338 8.25877 2.73895 8.37032C2.86452 8.48186 3.02009 8.55406 3.18634 8.57794L11.6583 9.78823C11.9035 9.82252 11.9035 10.1774 11.6583 10.2125L3.18719 11.4219C3.02094 11.4458 2.86537 11.518 2.73981 11.6296C2.61424 11.7411 2.52421 11.8871 2.48091 12.0494L0.752051 18.5097C0.516337 19.3925 1.42319 20.1468 2.24862 19.7534L20.6755 10.9685C21.4889 10.5811 21.4889 9.42223 20.6755 9.03394L2.24862 0.249944Z" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  @apply w-full h-screen flex flex-col bg-gray-50;
  margin: 0;
  padding: 0;
}

/* Заголовок чата */
.chat-header {
  @apply bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0;
}

.chat-title {
  @apply font-semibold text-gray-800 m-0;
  font-size: 22px;
  font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
}

/* Область сообщений */
.chat-messages {
  @apply flex-1 overflow-y-auto;
  padding-bottom: 100px; /* Отступ для фиксированного поля ввода */
}

/* Плейсхолдер в центре */
.chat-placeholder {
  @apply flex items-center justify-center;
  min-height: 300px;
}

.placeholder-text {
  @apply text-center text-gray-400 text-base leading-relaxed;
}

/* Контейнер сообщений */
.messages-container {
  @apply px-4 py-4 space-y-4 max-w-4xl mx-auto;
}

.message {
  @apply flex my-4;
}

.message-user {
  @apply justify-end;
}

.message-bot {
  @apply justify-start;
}

.message-content {
  @apply max-w-md;
}

/* Сообщения пользователя */
.message-user .message-content {
  @apply text-gray-900 border;
  background: var(--desktop-surface-background-beige, #F5F0EA);
  gap: 10px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 16px;
  padding: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
  min-width: 280px;
}

/* Сообщения бота */
.message-bot .message-content {
  @apply bg-white text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 border border-gray-200;
}

.message-text {
  @apply text-sm leading-relaxed;
}

.message-time {
  @apply text-xs opacity-60 mt-1;
}

.message-user .message-time {
  @apply text-right;
}

.message-bot .message-time {
  @apply text-left;
}

/* Индикатор загрузки */
.message-loading {
  @apply flex items-center gap-2;
}

.loading-dots {
  @apply flex gap-1;
}

.loading-dots span {
  @apply w-2 h-2 bg-gray-400 rounded-full;
  animation: dots-pulse 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dots-pulse {
  0%, 80%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Стили для блоков от BlockRenderer */
.bot-message-blocks {
  @apply w-full;
}

.rendered-blocks {
  @apply space-y-2;
}

/* Переопределяем стили для компонентов в чате */
.rendered-blocks :deep(.block-container) {
  @apply border-0 shadow-none bg-transparent p-0 m-0;
}

/* Кнопки действий в чате имеют особый стиль */
.rendered-blocks :deep(.action-button) {
  @apply text-sm font-medium transition-colors border-0;
  min-width: 67px;
  gap: 12px;
  border-radius: 20px;
  padding: 14px 22px;
  background: var(--desktop-surface-background-blue, #33AFE1);
  color: white;
  font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: 0;
  margin-right: 12px;
  margin-bottom: 8px;
}

.rendered-blocks :deep(.action-button:hover) {
  background: #2A9BC7;
}

/* Изображения в чате */
.rendered-blocks :deep(.component-image) {
  @apply max-w-full h-auto rounded-lg border border-gray-200 shadow-sm;
  max-height: 300px;
  object-fit: cover;
}

/* Текстовые блоки в чате */
.rendered-blocks :deep(.text-block-content) {
  @apply text-sm leading-relaxed;
}

.rendered-blocks :deep(.component-title) {
  @apply font-bold mb-2 mt-0;
  color: var(--desktop-content-text-black, #231F1F);
  font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
  font-size: 18px;
  line-height: 1.3;
}

/* Зафиксированное поле ввода */
.chat-input-fixed {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10;
}

.input-container {
  @apply max-w-4xl mx-auto px-4 pt-2 pb-5;
}

.input-wrapper {
  @apply flex items-center gap-3 bg-white rounded-full border border-gray-300 pl-6 pr-2 shadow-sm;
}

.input-field {
  @apply flex-1 resize-none border-0 outline-0 bg-transparent text-sm;
  min-height: 32px;
  max-height: 120px;
  line-height: 32px;
  color: #333333;
}

.input-field::placeholder {
  @apply text-gray-400;
}

.send-button {
  @apply bg-transparent disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0;
}

/* Анимации сообщений */
.message-enter-active {
  @apply transition-all duration-300;
}

.message-enter-from {
  @apply opacity-0 transform translate-y-4;
}

.message-enter-to {
  @apply opacity-100 transform translate-y-0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .chat-header {
    @apply px-4 py-3;
  }
  
  .messages-container {
    @apply px-3;
  }
  
  .message-content {
    @apply max-w-xs;
  }
  
  .rendered-blocks :deep(.component-image) {
    max-height: 200px;
  }
  
  .rendered-blocks :deep(.action-button) {
    @apply w-full justify-center;
    padding: 12px 18px;
    font-size: 14px;
    margin-bottom: 8px;
  }
}

/* Скроллбар */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style> 