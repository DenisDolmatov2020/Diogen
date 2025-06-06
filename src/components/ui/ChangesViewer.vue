<template>
  <div class="changes-viewer">
    <!-- Фиксированная кнопка (аналогично Debug Info) -->
    <button
      v-if="!changesStore.isViewerOpen"
      class="changes-toggle"
      @click="changesStore.toggleViewer()"
      :class="{ 'has-changes': changesStore.changesCount > 0 }"
    >
      <div class="changes-toggle-content">
        <div class="changes-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </div>
        <span class="changes-text">Изменения</span>
        <div v-if="changesStore.changesCount > 0" class="changes-badge">
          {{ changesStore.changesCount }}
        </div>
      </div>
    </button>

    <!-- Модальная панель изменений (как debug панель) -->
    <div 
      v-if="changesStore.isViewerOpen" 
      class="changes-panel"
      @click.self="changesStore.toggleViewer()"
    >
      <div class="changes-content" @click.stop>
        <div class="changes-header">
          <h3 class="changes-title">
            <span class="changes-title-icon">✨</span>
            Управление изменениями
          </h3>
          <button @click="changesStore.toggleViewer()" class="changes-close">×</button>
        </div>

        <div class="changes-body">
          <!-- Статистика изменений -->
          <div class="changes-stats">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <div class="stat-number">{{ changesStore.changesCount }}</div>
                <div class="stat-label">Изменений</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🕒</div>
              <div class="stat-info">
                <div class="stat-number">{{ latestChangeTime }}</div>
                <div class="stat-label">Последнее</div>
              </div>
            </div>
          </div>

          <!-- Состояние: нет изменений -->
          <div v-if="changesStore.changesCount === 0" class="no-changes">
            <div class="no-changes-icon">📋</div>
            <h4 class="no-changes-title">Изменений пока нет</h4>
            <p class="no-changes-text">Начните редактировать поля с пометкой "Редактируемое" для отслеживания изменений</p>
          </div>
          
          <!-- Список изменений -->
          <div v-else class="changes-list">
            <div class="changes-list-header">
              <h4 class="changes-list-title">📋 Список изменений</h4>
            </div>
            
            <div class="changes-scroll">
              <div v-for="(change, index) in sortedChanges" :key="change.id" class="change-item">
                <div class="change-index">{{ index + 1 }}</div>
                
                <div class="change-main">
                  <div class="change-info">
                    <div class="change-block">
                      <span class="change-block-icon">🏗️</span>
                      <span class="change-block-text">{{ change.blockId }}</span>
                    </div>
                    <div class="change-field">
                      <span class="field-badge">{{ change.field }}</span>
                    </div>
                  </div>
                  
                  <div class="change-values">
                    <div class="value-comparison">
                      <div class="old-value">
                        <div class="value-label">Было:</div>
                        <div class="value-content">{{ formatValue(change.oldValue) }}</div>
                      </div>
                      <div class="value-arrow">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                      </div>
                      <div class="new-value">
                        <div class="value-label">Стало:</div>
                        <div class="value-content">{{ formatValue(change.newValue) }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="change-meta">
                    <span class="change-time">🕒 {{ formatTime(change.timestamp) }}</span>
                  </div>
                </div>
                
                <div class="change-actions">
                  <button @click="changesStore.removeChange(change.id)" class="remove-change-btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Футер с действиями -->
        <div class="changes-footer">
          <div class="changes-actions">
            <button 
              @click="changesStore.clearAllChanges()" 
              class="action-btn clear-btn"
              :disabled="changesStore.changesCount === 0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Очистить все
            </button>
            
            <button 
              @click="saveChanges" 
              class="action-btn save-btn"
              :disabled="changesStore.changesCount === 0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChangesStore } from '@/stores/changesStore'

const changesStore = useChangesStore()

const sortedChanges = computed(() => {
  return [...changesStore.changes].sort((a, b) => b.timestamp - a.timestamp)
})

const latestChangeTime = computed(() => {
  if (changesStore.changesCount === 0) return '—'
  const latest = Math.max(...changesStore.changes.map(c => c.timestamp))
  return formatTime(latest)
})

const formatValue = (value: any): string => {
  if (value === null) return 'пусто'
  if (value === undefined) return 'не определено'
  if (typeof value === 'string') {
    if (value.trim() === '') return 'пустая строка'
    if (value.length > 50) return `"${value.substring(0, 47)}..."`
    return `"${value}"`
  }
  return String(value)
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const saveChanges = () => {
  console.log('💾 Сохранение изменений:', changesStore.changes)
  
  // Красивое уведомление с анимацией
  const notification = document.createElement('div')
  notification.className = 'save-notification'
  notification.innerHTML = `
    <div class="save-notification-content">
      <div class="save-notification-icon">✅</div>
      <div class="save-notification-text">
        <div class="save-notification-title">Изменения сохранены!</div>
        <div class="save-notification-subtitle">Обработано ${changesStore.changesCount} изменений</div>
      </div>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Убираем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove()
  }, 3000)
  
  changesStore.clearAllChanges()
  changesStore.toggleViewer()
}
</script>

<style scoped>
.changes-viewer {
  @apply relative;
}

/* Фиксированная кнопка изменений */
.changes-toggle {
  @apply fixed bottom-20 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-xl;
  @apply hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300;
  @apply focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50;
  z-index: 1000;
  padding: 12px 16px;
  animation: slideInUp 0.5s ease-out;
}

.changes-toggle.has-changes {
  @apply from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600;
  animation: slideInUp 0.5s ease-out, glowPulse 2s ease-in-out infinite;
}

.changes-toggle-content {
  @apply flex items-center gap-2;
}

.changes-icon {
  @apply flex items-center justify-center;
}

.changes-text {
  @apply font-semibold text-sm;
}

.changes-badge {
  @apply bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center;
  @apply border border-white border-opacity-30;
  backdrop-filter: blur(10px);
}

/* Модальная панель */
.changes-panel {
  @apply pb-4 fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center;
  z-index: 1001;
  backdrop-filter: blur(4px);
  animation: fadeInBackdrop 0.3s ease-out;
}

@keyframes fadeInBackdrop {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

.changes-content {
  @apply bg-white rounded-t-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 4px solid transparent;
  background-image: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%), 
                    linear-gradient(90deg, #a855f7, #ec4899, #f59e0b, #10b981);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  animation: slideInFromBottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInFromBottom {
  from {
    transform: translateY(100%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.changes-header {
  @apply flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100;
  @apply border-b border-gray-200;
}

.changes-title {
  @apply text-xl font-bold text-gray-800 flex items-center gap-2;
}

.changes-title-icon {
  @apply text-2xl;
}

.changes-close {
  @apply text-gray-400 hover:text-gray-600 text-3xl w-10 h-10 flex items-center justify-center rounded-full;
  @apply hover:bg-gray-200 transition-all duration-200;
}

.changes-body {
  @apply p-6 overflow-auto max-h-[calc(90vh-180px)];
}

/* Статистика */
.changes-stats {
  @apply grid grid-cols-2 gap-4 mb-6;
}

.stat-card {
  @apply bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-100;
  @apply flex items-center gap-3;
  animation: scaleIn 0.5s ease-out;
  animation-fill-mode: both;
  transition: all 0.3s ease;
}

.stat-card:nth-child(1) { animation-delay: 0.2s; }
.stat-card:nth-child(2) { animation-delay: 0.3s; }

.stat-card:hover {
  @apply shadow-md;
  transform: translateY(-3px) scale(1.02);
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.stat-icon {
  @apply text-2xl;
}

.stat-number {
  @apply text-2xl font-bold text-gray-800;
}

.stat-label {
  @apply text-sm text-gray-600;
}

/* Состояние "нет изменений" */
.no-changes {
  @apply text-center py-12 px-6;
}

.no-changes-icon {
  @apply text-6xl mb-4;
}

.no-changes-title {
  @apply text-xl font-bold text-gray-800 mb-2;
}

.no-changes-text {
  @apply text-gray-600 max-w-md mx-auto leading-relaxed;
}

/* Список изменений */
.changes-list-header {
  @apply mb-4;
}

.changes-list-title {
  @apply text-lg font-bold text-gray-800 flex items-center gap-2;
}

.changes-scroll {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.change-item {
  @apply bg-white rounded-xl p-4 shadow-sm border border-gray-100;
  @apply flex items-start gap-4 hover:shadow-md transition-shadow duration-200;
  animation: slideInFromLeft 0.3s ease-out;
  animation-fill-mode: both;
}

.change-item:nth-child(1) { animation-delay: 0.1s; }
.change-item:nth-child(2) { animation-delay: 0.2s; }
.change-item:nth-child(3) { animation-delay: 0.3s; }
.change-item:nth-child(4) { animation-delay: 0.4s; }
.change-item:nth-child(5) { animation-delay: 0.5s; }
.change-item:nth-child(n+6) { animation-delay: 0.6s; }

.change-item:hover {
  @apply shadow-lg;
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.change-index {
  @apply w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full;
  @apply flex items-center justify-center text-sm font-bold;
}

.change-main {
  @apply flex-1 space-y-3;
}

.change-info {
  @apply flex items-center gap-4;
}

.change-block {
  @apply flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg;
}

.change-block-icon {
  @apply text-sm;
}

.change-block-text {
  @apply text-sm font-medium text-blue-800;
}

.field-badge {
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full;
  @apply text-xs font-semibold;
}

.value-comparison {
  @apply grid grid-cols-3 gap-4 items-center;
}

.old-value, .new-value {
  @apply space-y-1;
}

.value-label {
  @apply text-xs font-semibold text-gray-500 uppercase tracking-wide;
}

.old-value .value-content {
  @apply bg-red-50 border border-red-200 text-red-800 p-2 rounded-lg text-sm;
}

.new-value .value-content {
  @apply bg-green-50 border border-green-200 text-green-800 p-2 rounded-lg text-sm;
}

.value-arrow {
  @apply flex justify-center text-gray-400;
}

.change-meta {
  @apply text-xs text-gray-500;
}

.change-actions {
  @apply flex flex-col gap-2;
}

.remove-change-btn {
  @apply p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors;
  @apply hover:scale-110 transform duration-200;
}

/* Футер */
.changes-footer {
  @apply p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200;
}

.changes-actions {
  @apply flex justify-between gap-4;
}

.action-btn {
  @apply flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-opacity-50;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:active {
  transform: scale(0.98);
}

.clear-btn {
  @apply bg-gradient-to-r from-red-500 to-pink-500 text-white;
  @apply hover:from-red-600 hover:to-pink-600 transform hover:scale-105;
  @apply focus:ring-red-300;
}

.save-btn {
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white;
  @apply hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105;
  @apply focus:ring-emerald-300;
}
</style>

<style>
/* Глобальные стили для уведомления о сохранении */
.save-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  animation: slideInRight 0.3s ease-out;
}

.save-notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-notification-icon {
  font-size: 24px;
}

.save-notification-title {
  font-weight: 600;
  font-size: 16px;
}

.save-notification-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(100%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.4);
    transform: scale(1.05);
  }
}
</style> 