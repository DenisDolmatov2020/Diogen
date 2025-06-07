<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/core/AppHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="app">
    <!-- Компонент header -->
    <AppHeader />

    <!-- Основной контент -->
    <main class="main-content">
      <div class="content-wrapper">
        <RouterView :key="route.fullPath" />
      </div>
    </main>
    
    <!-- Декоративные элементы -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
  </div>
</template>

<style scoped>
.app {
  @apply min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100;
  position: relative;
  overflow-x: hidden;
}

/* Основной контент */
.main-content {
  @apply min-h-screen relative z-10;
}


/* Декоративные элементы фона */
.background-decoration {
  @apply fixed inset-0 pointer-events-none overflow-hidden;
  z-index: 1;
}

.bg-circle {
  @apply absolute rounded-full opacity-20;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  filter: blur(60px);
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  top: -300px;
  right: -300px;
  animation: float 20s ease-in-out infinite;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  left: -200px;
  animation: float 25s ease-in-out infinite reverse;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 15s ease-in-out infinite;
}

/* Анимации */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(15px) rotate(240deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
}

/* Уведомления */
:global(.notification) {
  @apply fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-[100];
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

:global(.notification.show) {
  transform: translateX(0);
  opacity: 1;
}

:global(.notification.success) {
  @apply bg-green-600;
}

:global(.notification.error) {
  @apply bg-red-600;
}

:global(.notification.fade-out) {
  opacity: 0;
  transform: translateX(100%);
}
</style>
