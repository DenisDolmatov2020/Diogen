<template>
  <div class="picture-block" :class="getBlockClasses()">
    <!-- Скелетон при загрузке -->
    <div v-if="skeleton" class="skeleton-picture">
      <div class="skeleton-image"></div>
      <div class="skeleton-title"></div>
    </div>
    
    <!-- Основной контент -->
    <div v-else class="picture-content">
      <!-- Обработка каждого элемента в items -->
      <div 
        v-for="(item, index) in items" 
        :key="`picture-item-${index}`"
        class="picture-item"
      >
        <!-- Изображение -->
        <div class="image-container" :style="getImageContainerStyle(item.data)">
          <!-- Отладочная информация -->
          <div v-if="!getPictureData(item.data).src" class="debug-info">
            <p>🐛 Отладка:</p>
            <pre>{{ JSON.stringify(item.data, null, 2) }}</pre>
          </div>
          
          <!-- Изображение -->
          <img 
            v-if="getPictureData(item.data).src"
            :src="getPictureData(item.data).src"
            :alt="getPictureData(item.data).alt || item.title || 'Изображение'"
            :style="getImageStyle(item.data)"
            @load="onImageLoad"
            @error="onImageError"
            @click="openModal(item.data, item.title)"
            class="picture-image clickable"
          />
          
          <!-- Сообщение об ошибке только для действительно проблемных изображений -->
          <div v-if="getPictureData(item.data).src && hasImageError(getPictureData(item.data).src)" class="error-overlay">
            <p>❌ Не удалось загрузить изображение</p>
            <a 
              :href="getPictureData(item.data).src" 
              target="_blank" 
              rel="noopener noreferrer"
              class="error-link"
              @click.stop
            >
              {{ getPictureData(item.data).src }}
            </a>
          </div>
          
          <!-- Сообщение об ошибке если нет src -->
          <div v-else-if="!getPictureData(item.data).src" class="no-image-message">
            <p>❌ Нет ссылки на изображение</p>
            <p class="text-sm text-gray-500">Получено: {{ typeof item.data }} {{ item.data }}</p>
          </div>
        </div>
        
        <!-- Заголовок под изображением -->
        <div v-if="item.title" class="picture-title">
          {{ item.title }}
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для полноэкранного просмотра -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container">
          <!-- Кнопка закрытия -->
          <button @click="closeModal" class="modal-close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <!-- Изображение в модальном окне -->
          <img 
            v-if="modalImageData"
            :src="modalImageData.src"
            :alt="modalImageData.alt"
            class="modal-image"
            @click.stop
          />
          
          <!-- Заголовок под изображением -->
          <div v-if="modalImageData?.alt" class="modal-title">
            {{ modalImageData.alt }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { TreeBlock, PictureData } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const emit = defineEmits<{
  action: [data: any]
}>()

// Состояние для отслеживания ошибок загрузки изображений
const imageErrors = ref<Set<string>>(new Set())

// Состояние для модального просмотра
const isModalOpen = ref(false)
const modalImageData = ref<PictureData | null>(null)

// Получаем элементы из данных
const items = computed(() => {
  return props.data.items || []
})

// Безопасное получение данных изображения
function getPictureData(data: any): PictureData {
  console.log('🖼️ PictureBlock получил data:', data)
  console.log('🖼️ Тип data:', typeof data)
  
  if (typeof data === 'object' && data !== null && 'src' in data) {
    console.log('✅ Найден src в data:', data.src)
    return data as PictureData
  }
  
  // Если data - это строка, пытаемся использовать её как src
  if (typeof data === 'string' && data.trim()) {
    console.log('📝 Используем строку как src:', data)
    return { src: data.trim() }
  }
  
  console.warn('⚠️ Некорректные данные изображения:', data)
  // Возвращаем значение по умолчанию если данные некорректны
  return { src: '' }
}

// Определяем классы блока
function getBlockClasses() {
  const classes = ['picture-block-container']
  
  if (props.data.action_mode) {
    classes.push(`mode-${props.data.action_mode.replace('_', '-')}`)
  }
  
  return classes
}

// Получаем стили для контейнера изображения
function getImageContainerStyle(data: any): Record<string, string> {
  const styles: Record<string, string> = {}
  const pictureData = getPictureData(data)
  
  // Если заданы размеры, используем их для определения максимальных размеров
  if (pictureData.width || pictureData.height) {
    if (pictureData.width) {
      styles.maxWidth = `${pictureData.width}px`
    }
    if (pictureData.height) {
      styles.maxHeight = `${pictureData.height}px`
    }
  }
  
  return styles
}

// Получаем стили для изображения
function getImageStyle(data: any): Record<string, string> {
  const pictureData = getPictureData(data)
  const styles: Record<string, string> = {
    width: '100%',
    height: 'auto',
    display: 'block'
  }
  
  // Если заданы оба размера, поддерживаем соотношение сторон
  if (pictureData.width && pictureData.height) {
    styles.aspectRatio = `${pictureData.width} / ${pictureData.height}`
    styles.objectFit = 'contain'
  }
  
  return styles
}

// Обработчики событий изображения
function onImageLoad(event: Event) {
  const target = event.target as HTMLImageElement
  console.log('✅ Изображение загружено успешно:', target.src)
  console.log('📏 Размеры изображения:', {
    naturalWidth: target.naturalWidth,
    naturalHeight: target.naturalHeight,
    displayWidth: target.width,
    displayHeight: target.height
  })
  
  // Убираем из списка ошибок, если изображение загрузилось
  imageErrors.value.delete(target.src)
  
  emit('action', {
    type: 'image_loaded',
    timestamp: Date.now(),
    source_component: props.data.component_name,
    source_mode: props.data.action_mode,
    payload: {
      src: target.src,
      component_id: props.data.component_id
    }
  })
}

function onImageError(event: Event) {
  const target = event.target as HTMLImageElement
  console.error('❌ Ошибка загрузки изображения:', {
    src: target.src,
    error: event,
    naturalWidth: target.naturalWidth,
    naturalHeight: target.naturalHeight
  })
  
  // Попробуем получить более подробную информацию об ошибке
  console.error('🔍 Детали ошибки:', {
    complete: target.complete,
    currentSrc: target.currentSrc,
    crossOrigin: target.crossOrigin
  })
  
  // Добавляем в список ошибок
  imageErrors.value.add(target.src)
  
  emit('action', {
    type: 'image_error',
    timestamp: Date.now(),
    source_component: props.data.component_name,
    source_mode: props.data.action_mode,
    payload: {
      src: target.src,
      error: 'Не удалось загрузить изображение',
      component_id: props.data.component_id
    }
  })
}

// Проверяем, есть ли ошибка у конкретного изображения
function hasImageError(src: string): boolean {
  return imageErrors.value.has(src)
}

// Функции для модального просмотра
function openModal(data: any, title?: string) {
  const pictureData = getPictureData(data)
  if (pictureData.src && !hasImageError(pictureData.src)) {
    modalImageData.value = {
      ...pictureData,
      alt: title || 'Изображение'
    }
    isModalOpen.value = true
    document.body.style.overflow = 'hidden' // Блокируем скролл страницы
  }
}

function closeModal() {
  isModalOpen.value = false
  modalImageData.value = null
  document.body.style.overflow = '' // Восстанавливаем скролл страницы
}

// Обработка нажатия Escape
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

// Добавляем и убираем обработчик клавиатуры
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = '' // Восстанавливаем скролл при размонтировании
})
</script>

<style scoped>
.picture-block {
  @apply w-full;
}

.picture-block-container {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden;
}

/* Скелетон */
.skeleton-picture {
  @apply p-6 space-y-4;
}

.skeleton-image {
  @apply w-full h-48 bg-gray-200 rounded-lg;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-title {
  @apply h-4 bg-gray-200 rounded w-2/3 mx-auto;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Основной контент */
.picture-content {
  @apply p-6 space-y-6;
}

.picture-item {
  @apply space-y-4;
}

/* Контейнер изображения */
.image-container {
  @apply w-full flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden;
  @apply transition-all duration-300 ease-out;
  @apply cursor-pointer relative;
  min-height: 200px;
  border-radius: 0;
}

/* Hover эффект на контейнере для предотвращения мерцания */
.image-container:hover {
  @apply shadow-xl;
  transform: translateY(-2px);
}

.image-container:hover .picture-image {
  transform: scale(1.02);
}

/* Изображение */
.picture-image {
  @apply max-w-full max-h-full rounded-lg;
  @apply transition-all duration-300 ease-out;
  transform-origin: center;
}

.picture-image.clickable {
  @apply cursor-pointer;
}

.picture-image.clickable:hover {
  @apply shadow-lg;
  transform: scale(1.02);
}

/* Заголовок */
.picture-title {
  @apply text-center text-gray-700 font-medium text-lg;
  @apply leading-relaxed;
}

/* Режимы действий */
.mode-processing {
  @apply border-blue-200 bg-blue-50;
}

.mode-editable-layout {
  @apply border-green-200 bg-green-50;
}

.mode-static {
  @apply border-gray-200 bg-gray-50;
}

/* Анимация пульса */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .picture-content {
    @apply p-4;
  }
  
  .picture-title {
    @apply text-base;
  }
  
  .image-container {
    min-height: 150px;
  }
}

/* Отладочная информация */
.debug-info {
  @apply p-4 bg-yellow-50 border border-yellow-200 rounded text-xs;
}

.debug-info pre {
  @apply bg-white p-2 rounded border mt-2 overflow-auto max-h-32;
  font-family: 'Courier New', monospace;
}

.error-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply bg-red-50 border border-red-200 text-red-700 text-center p-4 rounded;
}

.error-link {
  @apply text-blue-500 hover:text-blue-700 underline;
  @apply text-sm break-all;
  @apply transition-colors duration-200;
  @apply mt-2 block;
}

.no-image-message {
  @apply p-4 text-center text-gray-600;
}

.no-image-message .text-sm {
  @apply mt-2;
}

/* Модальное окно */
.modal-overlay {
  @apply fixed inset-0 z-50;
  @apply bg-black bg-opacity-80;
  @apply flex items-center justify-center p-4;
  @apply cursor-pointer;
  backdrop-filter: blur(4px);
}

.modal-container {
  @apply relative max-w-[90vw] max-h-[90vh];
  @apply flex flex-col items-center;
  @apply cursor-default;
}

.modal-close-button {
  @apply fixed top-1 right-1 z-10;
  @apply bg-white bg-opacity-20 hover:bg-opacity-30;
  @apply text-white p-2 rounded-full;
  @apply transition-all duration-200;
  @apply cursor-pointer;
}

.modal-close-button:hover {
  @apply bg-opacity-40 scale-110;
}

.modal-image {
  @apply max-w-full max-h-full object-contain;
  @apply rounded-lg shadow-2xl;
  @apply cursor-default;
}

.modal-title {
  @apply text-white text-center mt-4 px-4;
  @apply text-lg font-medium;
  @apply bg-black bg-opacity-50 rounded-lg py-2;
}
</style> 