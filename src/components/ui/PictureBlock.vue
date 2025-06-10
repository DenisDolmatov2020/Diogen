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
          <img 
            :src="getPictureData(item.data).src"
            :alt="getPictureData(item.data).alt || item.title || 'Изображение'"
            :style="getImageStyle(item.data)"
            @load="onImageLoad"
            @error="onImageError"
            class="picture-image"
          />
        </div>
        
        <!-- Заголовок под изображением -->
        <div v-if="item.title" class="picture-title">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeBlock, PictureData } from '@/types/block'

const props = defineProps<{
  data: TreeBlock
  skeleton?: boolean
}>()

const emit = defineEmits<{
  action: [data: any]
}>()

// Получаем элементы из данных
const items = computed(() => {
  return props.data.items || []
})

// Безопасное получение данных изображения
function getPictureData(data: any): PictureData {
  if (typeof data === 'object' && data !== null && 'src' in data) {
    return data as PictureData
  }
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
  console.log('✅ Изображение загружено:', target.src)
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
  console.error('❌ Ошибка загрузки изображения:', target.src)
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

/* Состояние ошибки изображения */
.picture-image[alt]:after {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-gray-100 text-gray-500 text-sm;
  content: "Не удалось загрузить изображение";
}
</style> 