(function() {
    'use strict';
    
    // CSS стили виджета - встроены для автономной работы
    const WIDGET_CSS = `
/* Diogen Chat Widget Styles - адаптированные из ChatPage.vue */
:root {
    --diogen-primary-color: #33AFE1;
    --diogen-primary-hover: #2A9BC7;
    --diogen-text-color: #231F1F;
    --diogen-bg-color: #F1F4F7;
    --diogen-surface-bg: #ffffff;
    --diogen-user-bg: #F5F0EA;
    --diogen-border-color: #E5E7EB;
    --diogen-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    --diogen-border-radius: 12px;
    --diogen-font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
    --diogen-z-index: 999999;
    --diogen-input-radius: 50px;
    --diogen-width: 508px;
    --diogen-height: 552px;
    --diogen-button-size: 60px;
    
    /* Светлая тема по умолчанию */
    --diogen-theme-text-color: var(--diogen-text-color);
    --diogen-theme-bg-color: var(--diogen-bg-color);
    --diogen-theme-surface-bg: var(--diogen-surface-bg);
    --diogen-theme-user-bg: var(--diogen-user-bg);
    --diogen-theme-border-color: var(--diogen-border-color);
    --diogen-theme-shadow: var(--diogen-shadow);
    --diogen-theme-placeholder-color: #9CA3AF;
    --diogen-theme-loading-bg: #f5f5f5;
    --diogen-theme-hover-bg: #f5f5f5;
    
    /* Кастомизируемые переменные для темной темы */
    --diogen-dark-primary-color: #33AFE1;
    --diogen-dark-primary-hover: #2A9BC7;
    --diogen-dark-text-color: #ffffff;
    --diogen-dark-bg-color: #1a1a1a;
    --diogen-dark-surface-bg: #2d2d2d;
    --diogen-dark-user-bg: #3a3a3a;
    --diogen-dark-border-color: #404040;
    --diogen-dark-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    --diogen-dark-placeholder-color: #888;
    --diogen-dark-loading-bg: #404040;
    --diogen-dark-hover-bg: #404040;
}

/* Кнопка чата */
.diogen-chat-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: var(--diogen-button-size, 60px);
    height: var(--diogen-button-size, 60px);
    background: var(--diogen-primary-color);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--diogen-shadow);
    transition: all 0.3s ease;
    z-index: var(--diogen-z-index);
    color: white;
    font-family: var(--diogen-font-family) system-ui;
}

.diogen-chat-button:hover {
    background: var(--diogen-primary-hover);
    transform: scale(1.05);
}

.diogen-chat-button-hidden {
    opacity: 0;
    transform: scale(0.8);
    pointer-events: none;
}

/* Модальное окно */
.diogen-chat-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--diogen-z-index);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    font-family: var(--diogen-font-family) system-ui;
}

.diogen-chat-modal.diogen-chat-open {
    opacity: 1;
    visibility: visible;
}

.diogen-chat-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: end;
}

/* Контейнер чата */
.diogen-chat-container {
    background: var(--diogen-theme-bg-color);
    border-radius: var(--diogen-border-radius);
    box-shadow: var(--diogen-theme-shadow);
    width: 100%;
    max-width: var(--diogen-width, 508px);
    height: var(--diogen-height, 552px);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    transform: scale(0.9);
    transition: transform 0.3s ease;
    overflow: hidden;
    margin-right: 2vw !important;
    margin-left: 2vw !important;
}

.diogen-chat-open .diogen-chat-container {
    transform: scale(1);
}

.diogen-chat-fullscreen {
    max-width: 95vw !important;
    max-height: 95vh !important;
    width: 95vw !important;
    height: 95vh !important;
}

/* Заголовок - 10% высоты */
.diogen-chat-header {
    height: 60px;
    min-height: 60px;
    max-height: 60px;
    padding: 0 20px;
    border-bottom: 1px solid var(--diogen-theme-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--diogen-theme-surface-bg);
    flex-shrink: 0;
}

.diogen-chat-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--diogen-theme-text-color);
    font-family: var(--diogen-font-family) system-ui;
    line-height: 1.2;
}

.diogen-chat-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.diogen-chat-controls button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    color: var(--diogen-theme-text-color);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    opacity: 0.7;
}

.diogen-chat-controls button:hover {
    background: var(--diogen-theme-hover-bg);
    opacity: 1;
}

/* Контент чата - 80% высоты */
.diogen-chat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    position: relative;
}

/* Область сообщений */
.diogen-chat-messages {
    flex: 1;
    overflow-y: auto;
    scroll-behavior: smooth;
    position: relative;
}

/* Контейнер сообщений */
.diogen-messages-container {
    padding: 16px;
    min-height: 100%;
    padding-bottom: 50px; /* Отступ для поля ввода */
}

/* Плейсхолдер в центре */
.diogen-chat-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.diogen-chat-placeholder p {
    text-align: center;
    color: var(--diogen-theme-placeholder-color);
    font-size: 16px;
    line-height: 1.5;
    margin: 0;
}

/* Сообщения */
.diogen-message {
    display: flex;
    margin: 16px 0;
    animation: messageSlideIn 0.3s ease-out;
}

.diogen-user-message {
    justify-content: flex-end;
}

.diogen-bot-message {
    justify-content: flex-start;
}

.diogen-message-content {
    max-width: 384px;
}

/* Сообщения пользователя */
.diogen-user-message .diogen-message-text {
    color: var(--diogen-theme-text-color);
    background: var(--diogen-theme-user-bg);
    border: 1px solid var(--diogen-theme-border-color);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 16px;
    padding: 12px;
    min-width: 280px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
}

/* Сообщения бота */
.diogen-bot-message .diogen-message-content {
    color: var(--diogen-theme-text-color);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    padding: 16px 8px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
}

.diogen-message-text {
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
}

/* Индикатор загрузки */
.diogen-loading-message .diogen-message-content {
    background: var(--diogen-theme-loading-bg);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    padding: 16px;
}

.diogen-loading-dots {
    display: flex;
    gap: 4px;
}

.diogen-loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--diogen-theme-text-color);
    opacity: 0.4;
    animation: loadingDots 1.4s infinite ease-in-out;
}

.diogen-loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
}

.diogen-loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes loadingDots {
    0%, 80%, 100% {
        transform: scale(1);
        opacity: 0.5;
    }
    40% {
        transform: scale(1.2);
        opacity: 1;
    }
}

/* Кнопки действий в чате */
.diogen-action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 12px 0;
}

.diogen-action-button {
    font-size: 16px;
    font-weight: 500;
    font-family: var(--diogen-font-family) system-ui;
    line-height: 1.2;
    letter-spacing: 0;
    transition: all 0.2s ease;
    border: 0;
    min-width: 67px;
    gap: 12px;
    border-radius: 20px;
    padding: 14px 22px;
    background: var(--diogen-primary-color);
    color: white;
    cursor: pointer;
    margin-right: 12px;
    margin-bottom: 8px;
}

.diogen-action-button:hover {
    background: var(--diogen-primary-hover);
}

.diogen-action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #ccc;
}

/* Изображения в чате */
.diogen-pictures-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 12px 0;
}

.diogen-picture-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.diogen-image-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--diogen-theme-surface-bg);
    border: 1px solid var(--diogen-theme-border-color);
    border-radius: 8px;
    overflow: hidden;
    min-height: 100px;
    max-width: 100%;
}

.diogen-picture-image {
    max-width: 100%;
    max-height: 300px;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: pointer;
    transition: transform 0.2s ease;
    border-radius: 8px;
}

.diogen-picture-image:hover {
    transform: scale(1.02);
}

.diogen-picture-title {
    font-size: 14px;
    line-height: 1.4;
    color: var(--diogen-theme-text-color);
    text-align: center;
    padding: 0 8px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.diogen-image-error {
    padding: 16px;
    text-align: center;
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.4;
}

.diogen-image-error a {
    color: #2563eb;
    text-decoration: underline;
    word-break: break-all;
    display: block;
    margin-top: 8px;
}

.diogen-image-error pre {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 8px;
    margin-top: 8px;
    font-size: 12px;
    text-align: left;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
}

/* Адаптивность для изображений */
@media (max-width: 768px) {
    .diogen-picture-image {
        max-height: 200px;
    }
    
    .diogen-picture-title {
        font-size: 13px;
    }
    
    .diogen-image-error {
        padding: 12px;
        font-size: 13px;
    }
}

/* Поле ввода - 10% высоты */
.diogen-chat-input-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 80px;
    background: var(--diogen-theme-bg-color);
    z-index: 10;
    flex-shrink: 0;
}

.diogen-input-container {
    height: 100%;
    padding: 12px 16px;
    display: flex;
    align-items: center;
}

.diogen-input-wrapper {
    width: 100%;
    display: flex;
    align-items: end;
    background: var(--diogen-theme-surface-bg);
    border: 1px solid var(--diogen-theme-border-color);
    border-radius: var(--diogen-input-radius);
    padding-left: 24px;
    padding-right: 8px;
    transition: border-color 0.2s ease;
    flex: 1;
    gap: 8px;
}

.diogen-input-wrapper:focus-within {
    border-color: var(--diogen-primary-color);
}

.diogen-input-field {
    flex: 1;
    resize: none;
    border: none;
    outline: none;
    background: transparent;
    color: var(--diogen-theme-text-color);
    font-size: 14px;
    min-height: 32px;
    max-height: 32px;
    line-height: 32px;
    font-family: var(--diogen-font-family) system-ui;
}

.diogen-input-field:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.diogen-input-field::placeholder {
    color: var(--diogen-theme-placeholder-color);
}

.diogen-send-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.diogen-send-button:hover:not(:disabled) {
    background: rgba(51, 175, 225, 0.1);
}

.diogen-send-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* Анимации */
@keyframes messageSlideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Скроллбар */
.diogen-chat-messages::-webkit-scrollbar {
    width: 6px;
}

.diogen-chat-messages::-webkit-scrollbar-track {
    background: transparent;
}

.diogen-chat-messages::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.diogen-chat-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}

/* Стили для ссылок в чате */
.diogen-chat-link {
    color: #0053DA;
    text-decoration: underline;
    transition: opacity 0.2s ease;
}

.diogen-chat-link:hover {
    opacity: 0.8;
    text-decoration: underline;
}

/* Адаптивность */
@media (max-width: 768px) {
    .diogen-chat-overlay {
        padding: 10px;
    }
    
    .diogen-chat-container {
        max-width: 100%;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }
    
    .diogen-chat-button {
        bottom: 15px;
        right: 15px;
        width: calc(var(--diogen-button-size) * 0.83);
        height: calc(var(--diogen-button-size) * 0.83);
    }
    
    .diogen-message-content {
        max-width: calc(100vw - 80px);
    }
    
    .diogen-messages-container {
        padding: 12px;
    }
    
    .diogen-input-container {
        padding: 8px 12px;
    }
    
    .diogen-action-button {
        width: 100%;
        justify-content: center;
        padding: 12px 18px;
        font-size: 14px;
        margin-bottom: 8px;
    }
}

@media (max-width: 480px) {
    .diogen-chat-header {
        height: 50px;
        min-height: 50px;
        max-height: 50px;
        padding: 0 16px;
    }
    
    .diogen-chat-title {
        font-size: 16px;
    }
    
    .diogen-message-content {
        max-width: calc(100vw - 60px);
    }
    
    .diogen-input-field {
        font-size: 16px; /* Предотвращает зум на iOS */
    }
}

/* Темная тема - ручное управление */
.diogen-theme-dark {
    --diogen-theme-text-color: var(--diogen-dark-text-color);
    --diogen-theme-bg-color: var(--diogen-dark-bg-color);
    --diogen-theme-surface-bg: var(--diogen-dark-surface-bg);
    --diogen-theme-user-bg: var(--diogen-dark-user-bg);
    --diogen-theme-border-color: var(--diogen-dark-border-color);
    --diogen-theme-shadow: var(--diogen-dark-shadow);
    --diogen-theme-placeholder-color: var(--diogen-dark-placeholder-color);
    --diogen-theme-loading-bg: var(--diogen-dark-loading-bg);
    --diogen-theme-hover-bg: var(--diogen-dark-hover-bg);
}

/* Автоматическая тема - следует системным настройкам */
@media (prefers-color-scheme: dark) {
    .diogen-theme-auto {
        --diogen-theme-text-color: var(--diogen-dark-text-color);
        --diogen-theme-bg-color: var(--diogen-dark-bg-color);
        --diogen-theme-surface-bg: var(--diogen-dark-surface-bg);
        --diogen-theme-user-bg: var(--diogen-dark-user-bg);
        --diogen-theme-border-color: var(--diogen-dark-border-color);
        --diogen-theme-shadow: var(--diogen-dark-shadow);
        --diogen-theme-placeholder-color: var(--diogen-dark-placeholder-color);
        --diogen-theme-loading-bg: var(--diogen-dark-loading-bg);
        --diogen-theme-hover-bg: var(--diogen-dark-hover-bg);
    }
}

/* Светлая тема - явное указание */
.diogen-theme-light {
    --diogen-theme-text-color: var(--diogen-text-color);
    --diogen-theme-bg-color: var(--diogen-bg-color);
    --diogen-theme-surface-bg: var(--diogen-surface-bg);
    --diogen-theme-user-bg: var(--diogen-user-bg);
    --diogen-theme-border-color: var(--diogen-border-color);
    --diogen-theme-shadow: var(--diogen-shadow);
    --diogen-theme-placeholder-color: #9CA3AF;
    --diogen-theme-loading-bg: #f5f5f5;
    --diogen-theme-hover-bg: #f5f5f5;
}

/* Индикатор новых сообщений */
.diogen-new-message-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--diogen-primary-color);
    color: white;
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
    pointer-events: none;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.diogen-new-message-indicator.diogen-indicator-visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: all;
}

.diogen-new-message-indicator:hover {
    background: var(--diogen-primary-hover);
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.diogen-indicator-content {
    display: flex;
    align-items: center;
    gap: 6px;
}

.diogen-indicator-content svg {
    animation: bounce 1s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-4px);
    }
    60% {
        transform: translateY(-2px);
    }
}

/* Улучшенные анимации сообщений */
.diogen-message {
    animation: messageAppear 0.3s ease-out;
}

@keyframes messageAppear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Анимация для загрузочного сообщения */
.diogen-loading-message {
    animation: loadingAppear 0.2s ease-out;
}

@keyframes loadingAppear {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Плавный скролл для контейнера сообщений */
.diogen-messages-container {
    scroll-behavior: smooth;
}

/* Улучшенная анимация появления кнопки отправки */
.diogen-send-button {
    transition: all 0.2s ease, background-color 0.3s ease;
}

.diogen-send-button:not(:disabled) {
    transform: scale(1);
}

.diogen-send-button:not(:disabled):hover {
    transform: scale(1.05);
}

.diogen-send-button:disabled {
    transform: scale(0.95);
    opacity: 0.6;
}

/* Анимация для кнопок действий */
.diogen-action-button {
    transition: all 0.2s ease;
    transform: translateY(0);
}

.diogen-action-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(51, 175, 225, 0.3);
}

.diogen-action-button:active:not(:disabled) {
    transform: translateY(0);
}

/* Темная тема для индикатора */
.diogen-theme-dark .diogen-new-message-indicator {
    background: var(--diogen-dark-primary-color, var(--diogen-primary-color));
    border-color: rgba(255, 255, 255, 0.2);
}

.diogen-theme-dark .diogen-new-message-indicator:hover {
    background: var(--diogen-dark-primary-hover, var(--diogen-primary-hover));
}

@media (prefers-color-scheme: dark) {
    .diogen-theme-auto .diogen-new-message-indicator {
        background: var(--diogen-dark-primary-color, var(--diogen-primary-color));
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    .diogen-theme-auto .diogen-new-message-indicator:hover {
        background: var(--diogen-dark-primary-hover, var(--diogen-primary-hover));
    }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    .diogen-new-message-indicator {
        bottom: 15px;
        padding: 6px 12px;
        font-size: 13px;
        border-radius: 16px;
    }
    
    .diogen-indicator-content {
        gap: 4px;
    }
    
    .diogen-indicator-content svg {
        width: 14px;
        height: 14px;
    }
}

@media (max-width: 480px) {
    .diogen-new-message-indicator {
        bottom: 12px;
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 14px;
    }
}
`;

    // Функция для инъекции CSS в DOM
    function injectStyles() {
        // Проверяем, не были ли стили уже добавлены
        if (document.getElementById('diogen-widget-styles')) {
            return;
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'diogen-widget-styles';
        styleElement.textContent = WIDGET_CSS;
        
        // Добавляем стили в head
        const head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(styleElement);
        
        console.log('🎨 Стили виджета успешно загружены');
    }

    // Конфигурация по умолчанию
    const DEFAULT_CONFIG = {
        apiUrl: 'https://knowledge.slovo-soft.ru/api/v1/mentorium',
        width: '508px',
        height: '552px',
        buttonSize: '60px',
        position: 'bottom-right',
        project: 'pfki',
        projectId: '000', // Добавляем projectId для reference_id
        userId: '3654823', // Добавляем userId для reference_id
        basicLogin: 'slsuser',
        basicPassword: '20241001',
        theme: 'auto', // 'light', 'dark', 'auto'
        enableThemeToggle: true,
        // Опции для разработки и прокси
        devMode: 'auto', // 'auto', 'true', 'false' - автоматическое определение или принудительное
        proxyPath: '/api/proxy', // Путь для прокси (будет добавлен хеш от URL)
        // Кастомизация цветов
        primaryColor: null,
        primaryHoverColor: null,
        textColor: null,
        bgColor: null,
        surfaceBgColor: null,
        userBgColor: null,
        borderColor: null,
        borderRadius: null,
        fontFamily: null,
        inputRadius: null,
        title: 'Чат-бот',
        // Темная тема
        darkPrimaryColor: null,
        darkTextColor: null,
        darkBgColor: null,
        darkSurfaceBgColor: null,
        darkUserBgColor: null,
        darkBorderColor: null,
        // Позиционирование
        bottomOffset: null,
        rightOffset: null,
        leftOffset: null,
        topOffset: null
    };
    
    class DiogenChatWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.isOpen = false;
            this.isFullscreen = false;
            this.messages = [];
            this.isLoading = false;
            this.referenceId = this.getOrCreateReferenceId();
            this.currentTheme = this.getInitialTheme();
            this.init();
        }
        
        init() {
            // Первым делом внедряем стили
            injectStyles();
            
            this.createWidgetButton();
            this.createModal();
            this.attachEventListeners();
            this.applyCustomStyles();
        }
        
        getOrCreateReferenceId() {
            // Ключ для localStorage с учетом проекта и пользователя
            const storageKey = `diogen-reference-id-${this.config.projectId}-${this.config.userId}`;
            
            // Пытаемся получить существующий reference_id из localStorage
            const existingReferenceId = localStorage.getItem(storageKey);
            
            if (existingReferenceId) {
                console.log('🔄 Используем существующий reference_id из localStorage:', existingReferenceId);
                return existingReferenceId;
            }
            
            // Если нет сохраненного reference_id, генерируем новый
            const newReferenceId = this.generateReferenceId();
            
            // Сохраняем в localStorage
            localStorage.setItem(storageKey, newReferenceId);
            console.log('🆕 Создан и сохранен новый reference_id:', newReferenceId);
            
            return newReferenceId;
        }
        
        generateReferenceId() {
            // Генерируем reference_id в формате PROJECT_ID.USER_ID.TIMESTAMP
            const projectId = this.config.projectId || '000';
            const userId = this.config.userId || '3654823';
            const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp в секундах
            
            const referenceId = `${projectId}.${userId}.${timestamp}`;
            console.log('🆔 Генерируем новый reference_id:', referenceId);
            
            return referenceId;
        }
        
        // Метод для принудительного обновления reference_id
        resetReferenceId() {
            const storageKey = `diogen-reference-id-${this.config.projectId}-${this.config.userId}`;
            
            // Удаляем старый reference_id
            localStorage.removeItem(storageKey);
            console.log('🗑️ Удален старый reference_id из localStorage');
            
            // Генерируем и сохраняем новый
            this.referenceId = this.getOrCreateReferenceId();
            console.log('🔄 Reference_id обновлен на:', this.referenceId);
            
            return this.referenceId;
        }
        
        // Метод для получения текущего reference_id
        getCurrentReferenceId() {
            return this.referenceId;
        }
        
        // Определяем, нужен ли прокси
        shouldUseProxy() {
            // Простая логика: используем прокси для всех внешних API
            const currentOrigin = window.location.origin;
            const apiUrl = new URL(this.config.apiUrl);
            const apiOrigin = apiUrl.origin;
            
            // Если API на том же домене, прокси не нужен
            const isDifferentOrigin = apiOrigin !== currentOrigin;
            
            console.log('🔄 Определение необходимости прокси:', {
                currentOrigin,
                apiOrigin,
                isDifferentOrigin,
                shouldUse: isDifferentOrigin,
                note: isDifferentOrigin ? 'Используем прокси для внешнего API' : 'Прямое подключение к тому же домену'
            });
            
            return isDifferentOrigin;
        }
        
        // Генерируем URL для прокси
        generateProxyUrl() {
            // Всегда используем /api/proxy (работает и в dev, и в production)
            console.log('🔧 Используем прокси: /api/proxy');
            return '/api/proxy';
        }
        
        // Получаем финальный URL для запроса
        getApiUrl() {
            if (this.shouldUseProxy()) {
                const proxyUrl = this.generateProxyUrl();
                console.log('🔄 Используем прокси:', proxyUrl, '→', this.config.apiUrl);
                return proxyUrl;
            }
            console.log('🌐 Прямое подключение к:', this.config.apiUrl);
            return this.config.apiUrl;
        }
        
        getInitialTheme() {
            // Проверяем сохраненную тему
            const savedTheme = localStorage.getItem('diogen-chat-theme');
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                return savedTheme;
            }
            return this.config.theme;
        }
        
        setTheme(theme) {
            this.currentTheme = theme;
            localStorage.setItem('diogen-chat-theme', theme);
            this.applyTheme();
            if (this.themeToggleBtn && this.config.enableThemeToggle) {
                this.updateThemeButton();
            }
        }
        
        applyTheme() {
            const body = document.body;
            
            // Удаляем существующие классы темы
            body.classList.remove('diogen-theme-light', 'diogen-theme-dark', 'diogen-theme-auto');
            
            // Добавляем класс текущей темы
            body.classList.add(`diogen-theme-${this.currentTheme}`);
        }
        
        toggleTheme() {
            const themeOrder = ['auto', 'light', 'dark'];
            const currentIndex = themeOrder.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % themeOrder.length;
            this.setTheme(themeOrder[nextIndex]);
        }
        
        createWidgetButton() {
            const button = document.createElement('div');
            button.className = 'diogen-chat-button';
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.39L2 22l5.61-1.05C9.04 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.76-.35-4-.99l-.28-.17-2.35.44.44-2.35-.17-.28C4.35 14.76 4 13.4 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                    <path d="M8.5 9.5c0-.28.22-.5.5-.5h6c.28 0 .5.22.5.5s-.22.5-.5.5H9c-.28 0-.5-.22-.5-.5zM9 12h4c.28 0 .5.22.5.5s-.22.5-.5.5H9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5zM9 14.5h2c.28 0 .5.22.5.5s-.22.5-.5.5H9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z" fill="currentColor"/>
                </svg>
            `;
            
            document.body.appendChild(button);
            this.button = button;
            this.applyButtonPosition();
        }
        
        createModal() {
            const modal = document.createElement('div');
            modal.className = 'diogen-chat-modal';
            modal.innerHTML = `
                <div class="diogen-chat-overlay">
                    <div class="diogen-chat-container">
                        <div class="diogen-chat-header">
                            <h3 class="diogen-chat-title">${this.config.title}</h3>
                            <div class="diogen-chat-controls">
                                <button title="На весь экран" class="diogen-chat-btn-fullscreen">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.9733 4.66667C10.9733 4.48986 10.9031 4.32029 10.7781 4.19526C10.653 4.07024 10.4835 4 10.3067 4H4.66667C4.48986 4 4.32029 4.07024 4.19526 4.19526C4.07024 4.32029 4 4.48986 4 4.66667V10.3067C4 10.4835 4.07024 10.653 4.19526 10.7781C4.32029 10.9031 4.48986 10.9733 4.66667 10.9733C4.84348 10.9733 5.01305 10.9031 5.13807 10.7781C5.2631 10.653 5.33333 10.4835 5.33333 10.3067V6.27733L9.836 10.78C9.8975 10.8437 9.97106 10.8945 10.0524 10.9294C10.1337 10.9643 10.2212 10.9827 10.3097 10.9835C10.3983 10.9843 10.486 10.9674 10.568 10.9339C10.6499 10.9004 10.7243 10.8509 10.7869 10.7883C10.8495 10.7257 10.899 10.6512 10.9325 10.5693C10.9661 10.4874 10.9829 10.3996 10.9822 10.3111C10.9814 10.2225 10.963 10.1351 10.9281 10.0537C10.8931 9.97239 10.8423 9.89883 10.7787 9.83733L6.276 5.33333H10.3067C10.4835 5.33333 10.653 5.2631 10.7781 5.13807C10.9031 5.01305 10.9733 4.84348 10.9733 4.66667ZM16.6667 5.33333C17.1971 5.33333 17.7058 5.54405 18.0809 5.91912C18.456 6.29419 18.6667 6.8029 18.6667 7.33333V12H14.3587C13.7328 12 13.1325 12.2486 12.6899 12.6912C12.2473 13.1338 11.9987 13.7341 11.9987 14.36V18.6667H7.33333C6.8029 18.6667 6.29419 18.456 5.91912 18.0809C5.54405 17.7058 5.33333 17.1971 5.33333 16.6667V13.6933C5.33333 13.5165 5.2631 13.347 5.13807 13.2219C5.01305 13.0969 4.84348 13.0267 4.66667 13.0267C4.48986 13.0267 4.32029 13.0969 4.19526 13.2219C4.07024 13.347 4 13.5165 4 13.6933V16.6667C4 17.5507 4.35119 18.3986 4.97631 19.0237C5.60143 19.6488 6.44928 20 7.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667V7.33333C20 6.44928 19.6488 5.60143 19.0237 4.97631C18.3986 4.35119 17.5507 4 16.6667 4H13.6933C13.5165 4 13.347 4.07024 13.2219 4.19526C13.0969 4.32029 13.0267 4.48986 13.0267 4.66667C13.0267 4.84348 13.0969 5.01305 13.2219 5.13807C13.347 5.2631 13.5165 5.33333 13.6933 5.33333H16.6667Z" fill="currentColor"/>
                                    </svg>
                                </button>
                                ${this.config.enableThemeToggle ? `
                                <button title="Переключить тему" class="diogen-chat-btn-theme">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor"/>
                                    </svg>
                                </button>
                                ` : ''}
                                <button class="diogen-chat-close" title="Закрыть">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="diogen-chat-content">
                            <div class="diogen-chat-messages" id="diogen-messages-container">
                                <div class="diogen-messages-container">
                                    <div class="diogen-chat-placeholder">
                                        <p>Введите теги, термины или задайте вопрос<br>для поиска информации</p>
                                    </div>
                                </div>
                            </div>
                            <div class="diogen-chat-input-container">
                                <div class="diogen-input-container">
                                    <div class="diogen-input-wrapper">
                                        <textarea 
                                            class="diogen-input-field" 
                                            placeholder="Введите запрос..."
                                            rows="1"
                                            id="diogen-input-field"
                                        ></textarea>
                                        <button class="diogen-send-button" id="diogen-send-button">
                                            <svg width="22" height="20" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="currentColor" d="M2.24862 0.249944C1.42319 -0.144342 0.516337 0.609944 0.752051 1.49366L2.48005 7.95051C2.52336 8.11279 2.61338 8.25877 2.73895 8.37032C2.86452 8.48186 3.02009 8.55406 3.18634 8.57794L11.6583 9.78823C11.9035 9.82252 11.9035 10.1774 11.6583 10.2125L3.18719 11.4219C3.02094 11.4458 2.86537 11.518 2.73981 11.6296C2.61424 11.7411 2.52421 11.8871 2.48091 12.0494L0.752051 18.5097C0.516337 19.3925 1.42319 20.1468 2.24862 19.7534L20.6755 10.9685C21.4889 10.5811 21.4889 9.42223 20.6755 9.03394L2.24862 0.249944Z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.modal = modal;
            this.messagesContainer = modal.querySelector('.diogen-messages-container');
            this.messagesScrollContainer = modal.querySelector('.diogen-chat-messages'); // Добавляем правильный элемент для скроллинга
            this.inputField = modal.querySelector('#diogen-input-field');
            this.sendButton = modal.querySelector('#diogen-send-button');
            this.container = modal.querySelector('.diogen-chat-container');
            this.fullscreenBtn = modal.querySelector('.diogen-chat-btn-fullscreen');
            this.closeBtn = modal.querySelector('.diogen-chat-close');
            this.themeToggleBtn = modal.querySelector('.diogen-chat-btn-theme');
        }
        
        attachEventListeners() {
            // Проверяем что все элементы найдены
            if (!this.button || !this.modal || !this.inputField || !this.sendButton) {
                console.error('Diogen Chat Widget: Не удалось найти необходимые элементы DOM');
                return;
            }

            // Открытие чата
            this.button.addEventListener('click', () => this.openChat());
            
            // Закрытие чата
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.closeChat());
            }
            
            const overlay = this.modal.querySelector('.diogen-chat-overlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) this.closeChat();
                });
            }
            
            // Полноэкранный режим
            if (this.fullscreenBtn) {
                this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
            }
            
            // Отправка сообщения
            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Автоматическое изменение размера textarea и обновление кнопки
            this.inputField.addEventListener('input', () => {
                this.handleInputResize();
                this.updateSendButton();
            });
            
            // Инициализируем состояние кнопок
            this.updateSendButton();
            if (this.fullscreenBtn) {
                this.updateFullscreenButton();
            }
            
            // ESC для закрытия
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.closeChat();
            });
            
            // Переключение темы
            if (this.themeToggleBtn) {
                this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
            }
            
            // Инициализируем тему
            this.applyTheme();
            if (this.themeToggleBtn && this.config.enableThemeToggle) {
                this.updateThemeButton();
            }
        }
        
        openChat() {
            if (!this.isOpen) {
                this.modal.classList.add('diogen-chat-open');
                this.button.classList.add('diogen-chat-button-hidden');
                this.isOpen = true;
                
                // Фокус на поле ввода
                setTimeout(() => {
                    this.inputField.focus();
                }, 300);
            }
        }
        
        closeChat() {
            this.modal.classList.remove('diogen-chat-open');
            this.button.classList.remove('diogen-chat-button-hidden');
            this.isOpen = false;
            this.isFullscreen = false;
            this.container.classList.remove('diogen-chat-fullscreen');
        }
        
        toggleFullscreen() {
            this.isFullscreen = !this.isFullscreen;
            this.container.classList.toggle('diogen-chat-fullscreen', this.isFullscreen);
            
            // Обновляем иконку и подсказку
            this.updateFullscreenButton();
        }
        
        updateFullscreenButton() {
            const fullscreenBtn = this.fullscreenBtn;
            if (!fullscreenBtn) return;

            // Меняем иконку в зависимости от состояния
            if (this.isFullscreen) {
                // Иконка "свернуть"
                fullscreenBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.00886 10.3169C4.00886 10.4937 4.0791 10.6632 4.20412 10.7883C4.32915 10.9133 4.49871 10.9835 4.67553 10.9835H10.3155C10.4923 10.9835 10.6619 10.9133 10.7869 10.7883C10.912 10.6632 10.9822 10.4937 10.9822 10.3169V4.67686C10.9822 4.50005 10.912 4.33048 10.7869 4.20545C10.6619 4.08043 10.4923 4.01019 10.3155 4.01019C10.1387 4.01019 9.96915 4.08043 9.84412 4.20545C9.7191 4.33048 9.64886 4.50005 9.64886 4.67686V8.70619L5.14619 4.20353C5.08469 4.13985 5.01113 4.08906 4.9298 4.05412C4.84846 4.01919 4.76098 4.00079 4.67246 4.00003C4.58394 3.99926 4.49615 4.01612 4.41422 4.04964C4.33229 4.08316 4.25786 4.13267 4.19526 4.19526C4.13267 4.25786 4.08316 4.33229 4.04964 4.41422C4.01612 4.49615 3.99926 4.58394 4.00003 4.67246C4.00079 4.76098 4.01919 4.84846 4.05412 4.92979C4.08906 5.01113 4.13985 5.08469 4.20353 5.14619L8.70619 9.65019H4.67553C4.49871 9.65019 4.32915 9.72043 4.20412 9.84545C4.0791 9.97048 4.00886 10.14 4.00886 10.3169ZM16.6667 5.33333C17.1971 5.33333 17.7058 5.54405 18.0809 5.91912C18.456 6.29419 18.6667 6.8029 18.6667 7.33333V12H14.3587C13.7328 12 13.1325 12.2486 12.6899 12.6912C12.2473 13.1338 11.9987 13.7341 11.9987 14.36V18.6667H7.33333C6.8029 18.6667 6.29419 18.456 5.91912 18.0809C5.54405 17.7058 5.33333 17.1971 5.33333 16.6667V13.6933C5.33333 13.5165 5.2631 13.347 5.13807 13.2219C5.01305 13.0969 4.84348 13.0267 4.66667 13.0267C4.48986 13.0267 4.32029 13.0969 4.19526 13.2219C4.07024 13.347 4 13.5165 4 13.6933V16.6667C4 17.5507 4.35119 18.3986 4.97631 19.0237C5.60143 19.6488 6.44928 20 7.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667V7.33333C20 6.44928 19.6488 5.60143 19.0237 4.97631C18.3986 4.35119 17.5507 4 16.6667 4H13.6933C13.5165 4 13.347 4.07024 13.2219 4.19526C13.0969 4.32029 13.0267 4.48986 13.0267 4.66667C13.0267 4.84348 13.0969 5.01305 13.2219 5.13807C13.347 5.2631 13.5165 5.33333 13.6933 5.33333H16.6667Z" fill="currentColor"/>
                    </svg>
                `;
                fullscreenBtn.title = 'Свернуть';
            } else {
                // Иконка "развернуть" 
                fullscreenBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.9733 4.66667C10.9733 4.48986 10.9031 4.32029 10.7781 4.19526C10.653 4.07024 10.4835 4 10.3067 4H4.66667C4.48986 4 4.32029 4.07024 4.19526 4.19526C4.07024 4.32029 4 4.48986 4 4.66667V10.3067C4 10.4835 4.07024 10.653 4.19526 10.7781C4.32029 10.9031 4.48986 10.9733 4.66667 10.9733C4.84348 10.9733 5.01305 10.9031 5.13807 10.7781C5.2631 10.653 5.33333 10.4835 5.33333 10.3067V6.27733L9.836 10.78C9.8975 10.8437 9.97106 10.8945 10.0524 10.9294C10.1337 10.9643 10.2212 10.9827 10.3097 10.9835C10.3983 10.9843 10.486 10.9674 10.568 10.9339C10.6499 10.9004 10.7243 10.8509 10.7869 10.7883C10.8495 10.7257 10.899 10.6512 10.9325 10.5693C10.9661 10.4874 10.9829 10.3996 10.9822 10.3111C10.9814 10.2225 10.963 10.1351 10.9281 10.0537C10.8931 9.97239 10.8423 9.89883 10.7787 9.83733L6.276 5.33333H10.3067C10.4835 5.33333 10.653 5.2631 10.7781 5.13807C10.9031 5.01305 10.9733 4.84348 10.9733 4.66667ZM16.6667 5.33333C17.1971 5.33333 17.7058 5.54405 18.0809 5.91912C18.456 6.29419 18.6667 6.8029 18.6667 7.33333V12H14.3587C13.7328 12 13.1325 12.2486 12.6899 12.6912C12.2473 13.1338 11.9987 13.7341 11.9987 14.36V18.6667H7.33333C6.8029 18.6667 6.29419 18.456 5.91912 18.0809C5.54405 17.7058 5.33333 17.1971 5.33333 16.6667V13.6933C5.33333 13.5165 5.2631 13.347 5.13807 13.2219C5.01305 13.0969 4.84348 13.0267 4.66667 13.0267C4.48986 13.0267 4.32029 13.0969 4.19526 13.2219C4.07024 13.347 4 13.5165 4 13.6933V16.6667C4 17.5507 4.35119 18.3986 4.97631 19.0237C5.60143 19.6488 6.44928 20 7.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667V7.33333C20 6.44928 19.6488 5.60143 19.0237 4.97631C18.3986 4.35119 17.5507 4 16.6667 4H13.6933C13.5165 4 13.347 4.07024 13.2219 4.19526C13.0969 4.32029 13.0267 4.48986 13.0267 4.66667C13.0267 4.84348 13.0969 5.01305 13.2219 5.13807C13.347 5.2631 13.5165 5.33333 13.6933 5.33333H16.6667Z" fill="currentColor"/>
                    </svg>
                `;
                fullscreenBtn.title = 'На весь экран';
            }
        }
        
        updateThemeButton() {
            const themeBtn = this.themeToggleBtn;
            if (!themeBtn) return;

            // Меняем иконку и подсказку в зависимости от текущей темы
            switch (this.currentTheme) {
                case 'light':
                    themeBtn.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="5" fill="currentColor"/>
                            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    `;
                    themeBtn.title = 'Светлая тема (нажать для переключения)';
                    break;
                case 'dark':
                    themeBtn.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor"/>
                        </svg>
                    `;
                    themeBtn.title = 'Темная тема (нажать для переключения)';
                    break;
                case 'auto':
                default:
                    themeBtn.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M12 2a10 10 0 0 1 0 20V2Z" fill="currentColor"/>
                        </svg>
                    `;
                    themeBtn.title = 'Автоматическая тема (нажать для переключения)';
                    break;
            }
        }
        
        handleInputResize() {
            this.inputField.style.height = 'auto';
            this.inputField.style.height = this.inputField.scrollHeight + 'px';
        }
        
        addMessage(content, isUser, isLoading = false) {
            const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const message = {
                id: messageId,
                content,
                isUser,
                timestamp: new Date(),
                isLoading
            };
            
            this.messages.push(message);
            this.renderMessage(message);
            this.scrollToLastMessage();
            
            return message;
        }
        
        renderMessage(message, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = isUser ? 'diogen-message diogen-user-message' : 'diogen-message diogen-bot-message';
            
            if (isUser) {
                messageDiv.innerHTML = `
                    <div class="diogen-message-content">
                        <div class="diogen-message-text">${this.formatMessageText(message)}</div>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="diogen-message-content">
                        <div class="diogen-message-text">${this.formatMessageText(message)}</div>
                    </div>
                `;
            }
            
            // Удаляем placeholder при первом сообщении
            const placeholder = this.messagesContainer.querySelector('.diogen-chat-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            this.messagesContainer.appendChild(messageDiv);
            this.forceScrollToLastMessage(50);
        }
        
        formatMessageText(text) {
            if (!text) return '';
            
            let formatted = text;
            
            // Убираем отладочную информацию
            formatted = formatted.replace(/Бот работает в режиме спец тестирования\.\s*\\исходные ответы[\s\S]*?(?=\n\n|\n[А-Я]|$)/gi, '');
            formatted = formatted.replace(/Уверенность системы в данных = \d+\.\d+%/gi, '');
            formatted = formatted.replace(/Принято решение использовать finetune модель/gi, '');
            formatted = formatted.replace(/Ответ модели до цензора:/gi, '');
            
            // Обрабатываем переносы строк
            formatted = formatted
                .replace(/\\r\\n/g, '\n')
                .replace(/\\n/g, '\n')
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n');
            
            // Обрабатываем markdown форматирование
            formatted = formatted
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>');
            
            // Обрабатываем ссылки
            const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/gi;
            formatted = formatted.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="diogen-chat-link">$1</a>');
            
            const urlRegex = /(?<!\]\()(https?:\/\/[^\s<>"{}|\\^`\[\]]+)(?!\))/gi;
            formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="diogen-chat-link">$1</a>');
            
            // Обрабатываем переносы строк для HTML
            formatted = formatted.replace(/\n/g, '<br>');
            
            return formatted.trim();
        }
        
        scrollToLastMessage() {
            // Улучшенный скроллинг к началу последнего сообщения
            if (!this.messagesScrollContainer) {
                console.warn('⚠️ Элемент для скроллинга не найден');
                return;
            }

            // Используем requestAnimationFrame для плавного скроллинга
            requestAnimationFrame(() => {
                try {
                    const scrollElement = this.messagesScrollContainer;
                    const lastMessage = this.messagesContainer.lastElementChild;
                    
                    if (lastMessage && lastMessage.classList.contains('diogen-message')) {
                        // Прокручиваем к началу последнего сообщения
                        const messageTop = lastMessage.offsetTop;
                        const containerTop = this.messagesContainer.offsetTop;
                        const targetScrollTop = messageTop - containerTop;
                        
                        scrollElement.scrollTo({
                            top: targetScrollTop,
                            behavior: 'smooth'
                        });
                        
                        console.log('📜 Скролл к последнему сообщению выполнен:', {
                            messageTop,
                            containerTop,
                            targetScrollTop,
                            currentScrollTop: scrollElement.scrollTop
                        });
                    } else {
                        // Fallback к обычному скроллингу вниз если нет сообщений
                        scrollElement.scrollTo({
                            top: scrollElement.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.error('❌ Ошибка при скроллинге к последнему сообщению:', error);
                    // Fallback к обычному скроллингу
                    this.messagesScrollContainer.scrollTop = this.messagesScrollContainer.scrollHeight;
                }
            });
        }
        
        // Принудительный скроллинг с задержкой для загрузки контента
        forceScrollToLastMessage(delay = 200) {
            setTimeout(() => {
                this.scrollToLastMessage();
                // Дополнительный скролл через небольшую задержку для надежности
                setTimeout(() => this.scrollToLastMessage(), 100);
            }, delay);
        }
        
        sendMessage(messageText = null) {
            const text = messageText || this.inputField.value.trim();
            if (!text || this.isLoading) return; // Блокируем если уже идет загрузка

            // Отображаем сообщение пользователя
            this.renderMessage(text, true);
            
            // Принудительный скролл после добавления сообщения пользователя
            this.forceScrollToLastMessage(50);
            
            // Очищаем поле ввода
            if (!messageText) {
                this.inputField.value = '';
                this.updateSendButton();
            }

            // Отправляем запрос к API
            this.callChatAPI(text);
        }
        
        async callChatAPI(message) {
            if (this.isLoading) return; // Предотвращаем повторные запросы
            
            try {
                // Устанавливаем флаг загрузки
                this.isLoading = true;
                this.updateSendButton();
                this.disableInput();
                this.disableActionButtons();
                
                // Показываем индикатор загрузки
                this.showLoadingMessage();
                
                // Формируем payload в правильном формате как в curl примере
                const payload = [{
                    component_name: "meta_data",
                    parent_block_id: "block-0-1",
                    action_mode: "dialog",
                    action_params: [
                        {
                            variable: "input_text",
                            data: message
                        },
                        {
                            variable: "reference_id",
                            data: this.referenceId
                        }
                    ]
                }];
                
                console.log('📤 Отправляем запрос с reference_id:', this.referenceId);
                console.log('📤 Полный payload:', JSON.stringify(payload, null, 2));
                
                // Формируем заголовки в зависимости от типа подключения
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (this.shouldUseProxy()) {
                    // Используем прокси - передаем данные через специальные заголовки
                    headers['X-Target-URL'] = this.config.apiUrl;
                    headers['X-TOKEN'] = btoa(this.config.basicLogin + ':' + this.config.basicPassword);
                    console.log('🔄 Используем прокси с заголовками:', headers);
                } else {
                    // Прямое подключение к API (если на том же домене)
                    headers['Authorization'] = 'Basic ' + btoa(this.config.basicLogin + ':' + this.config.basicPassword);
                    console.log('🔗 Прямое подключение с заголовками:', headers);
                }
                
                const response = await fetch(this.getApiUrl(), {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('📥 Получен ответ от сервера:', data);
                this.processServerResponse(data);
                
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
                this.hideLoadingMessage();
                
                // Улучшенное сообщение об ошибке с инструкциями
                let errorMessage = 'Извините, произошла ошибка при отправке сообщения.';
                
                if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                    if (this.shouldUseProxy()) {
                        const isLocalhost = window.location.hostname === 'localhost' || 
                                           window.location.hostname === '127.0.0.1' ||
                                           window.location.hostname.includes('localhost');
                        
                        if (isLocalhost) {
                            // Dev режим - показываем инструкции по настройке прокси
                            errorMessage = `Ошибка CORS в dev режиме. Убедитесь что dev сервер запущен и настроен прокси в vite.config.js`;
                        } else {
                            // Продакшен с прокси
                            errorMessage = 'Ошибка подключения через прокси. Возможно, прокси сервис недоступен или API сервер не отвечает.';
                        }
                    } else {
                        // Прямое подключение - показываем общее сообщение
                        errorMessage = 'Ошибка подключения к серверу. Возможно, сервер недоступен или есть проблемы с CORS.';
                    }
                }
                
                this.renderMessage(errorMessage, false);
                
                // Принудительный скролл после ошибки
                this.forceScrollToLastMessage(100);
                
                // Дополнительная информация в консоль для разработчиков
                if (this.shouldUseProxy()) {
                    console.group('🔧 Инструкции по настройке прокси:');
                    console.log('Добавьте в vite.config.js:');
                    console.log(`'${this.generateProxyUrl()}': {`);
                    console.log(`  target: '${this.config.apiUrl}',`);
                    console.log(`  changeOrigin: true,`);
                    console.log(`  secure: false`);
                    console.log(`}`);
                    console.groupEnd();
                }
            } finally {
                // Всегда снимаем флаг загрузки
                this.isLoading = false;
                this.updateSendButton();
                this.enableInput();
                this.enableActionButtons();
            }
        }
        
        showLoadingMessage() {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'diogen-message diogen-bot-message diogen-loading-message';
            loadingDiv.innerHTML = `
                <div class="diogen-message-content">
                    <div class="diogen-loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            this.messagesContainer.appendChild(loadingDiv);
            this.scrollToLastMessage();
        }
        
        hideLoadingMessage() {
            const loadingMessage = this.messagesContainer.querySelector('.diogen-loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
        
        processServerResponse(data) {
            this.hideLoadingMessage();
            console.log('📥 Получен ответ от сервера:', data);
            
            // Обрабатываем ответ в формате массива
            if (Array.isArray(data) && data.length > 0) {
                // Создаем одно составное сообщение для всех компонентов
                this.renderCompositeMessage(data);
                return; // Успешно обработали ответ
            }
            
            // Обратная совместимость со старым форматом
            if (data.message) {
                this.renderMessage(data.message, false);
                return;
            }
            
            // Если ничего не смогли извлечь
            console.warn('⚠️ Не удалось обработать ответ сервера:', data);
            this.renderMessage('Получен ответ от сервера, но не удалось извлечь текст сообщения.', false);
        }
        
        renderCompositeMessage(components) {
            // Создаем контейнер для составного сообщения
            const messageDiv = document.createElement('div');
            messageDiv.className = 'diogen-message diogen-bot-message';
            
            let messageContent = '<div class="diogen-message-content">';
            
            // Обрабатываем каждый компонент и добавляем в одно сообщение
            components.forEach(component => {
                if (component.component_name === 'text_block' && component.items && component.items.length > 0) {
                    // Добавляем текстовые блоки
                    component.items.forEach(item => {
                        if (item.data) {
                            console.log('📝 Добавляем текст в составное сообщение:', item.data);
                            messageContent += `<div class="diogen-message-text">${this.formatMessageText(item.data)}</div>`;
                        }
                    });
                } else if (component.component_name === 'picture_block' && component.items && component.items.length > 0) {
                    // Добавляем изображения
                    console.log('🖼️ Добавляем изображения в составное сообщение:', component.items);
                    messageContent += this.generatePicturesHtml(component.items);
                } else if (component.component_name === 'action_button' && component.items && component.items.length > 0) {
                    // Добавляем кнопки действий
                    console.log('🔘 Добавляем кнопки в составное сообщение:', component.items);
                    messageContent += this.generateActionButtonsHtml(component.items);
                }
            });
            
            messageContent += '</div>';
            messageDiv.innerHTML = messageContent;
            
            // Удаляем placeholder при первом сообщении
            const placeholder = this.messagesContainer.querySelector('.diogen-chat-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            this.messagesContainer.appendChild(messageDiv);
            
            // Добавляем обработчики событий для интерактивных элементов
            this.attachCompositeMessageHandlers(messageDiv, components);
            
            this.scrollToLastMessage();
        }
        
        generatePicturesHtml(pictures) {
            if (!pictures || pictures.length === 0) return '';
            
            let picturesHtml = '<div class="diogen-pictures-container">';
            
            pictures.forEach((picture, index) => {
                const pictureData = this.getPictureData(picture.data);
                const title = picture.title || '';
                
                console.log('🖼️ Обрабатываем изображение:', pictureData);
                
                if (pictureData.src) {
                    const imageId = `diogen-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
                    
                    picturesHtml += `
                        <div class="diogen-picture-item">
                            <div class="diogen-image-container" id="container-${imageId}">
                                <img 
                                    id="${imageId}"
                                    src="${pictureData.src}" 
                                    alt="${pictureData.alt || title || 'Изображение'}"
                                    class="diogen-picture-image"
                                    data-src="${pictureData.src}"
                                />
                            </div>
                            ${title ? `<div class="diogen-picture-title">${this.formatMessageText(title)}</div>` : ''}
                        </div>
                    `;
                } else {
                    picturesHtml += `
                        <div class="diogen-picture-item">
                            <div class="diogen-image-error">
                                ❌ Нет ссылки на изображение
                                <pre>${JSON.stringify(picture.data, null, 2)}</pre>
                            </div>
                        </div>
                    `;
                }
            });
            
            picturesHtml += '</div>';
            return picturesHtml;
        }
        
        generateActionButtonsHtml(actions) {
            if (!actions || actions.length === 0) return '';
            
            let buttonsHtml = '<div class="diogen-action-buttons">';
            actions.forEach(action => {
                const buttonText = action.title || action.label || 'Действие';
                const buttonValue = action.value || action.title || buttonText;
                buttonsHtml += `<button class="diogen-action-button" data-action="${buttonValue}">${buttonText}</button>`;
            });
            buttonsHtml += '</div>';
            
            return buttonsHtml;
        }
        
        attachCompositeMessageHandlers(messageDiv, components) {
            // Обработчики для изображений
            const images = messageDiv.querySelectorAll('.diogen-picture-image');
            images.forEach(imgElement => {
                const containerElement = imgElement.parentElement;
                const imageSrc = imgElement.getAttribute('data-src');
                
                // Обработчик успешной загрузки
                imgElement.addEventListener('load', () => {
                    console.log('✅ Изображение загружено:', imageSrc);
                    imgElement.style.cursor = 'pointer';
                    // Скроллинг после загрузки изображения
                    this.forceScrollToLastMessage(50);
                });
                
                // Обработчик ошибки загрузки
                imgElement.addEventListener('error', () => {
                    console.error('❌ Ошибка загрузки изображения:', imageSrc);
                    containerElement.innerHTML = `
                        <div class="diogen-image-error">
                            ❌ Не удалось загрузить изображение<br>
                            <a href="${imageSrc}" target="_blank">${imageSrc}</a>
                        </div>
                    `;
                    // Скроллинг после обработки ошибки изображения
                    this.forceScrollToLastMessage(50);
                });
                
                // Обработчик клика для открытия в новой вкладке
                imgElement.addEventListener('click', () => {
                    window.open(imageSrc, '_blank');
                });
            });
            
            // Обработчики для кнопок действий
            const actionButtons = messageDiv.querySelectorAll('.diogen-action-button');
            actionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = e.target.getAttribute('data-action');
                    console.log('🔘 Нажата кнопка:', action);
                    this.handleActionClick(action);
                });
            });
        }
        
        handleActionClick(action) {
            this.sendMessage(action);
        }
        
        // Публичные методы для управления виджетом
        setProject(projectId) {
            this.config.project = projectId;
            // Сбрасываем reference_id для нового проекта
            this.referenceId = this.generateReferenceId();
        }
        
        updateStyles(styles) {
            // Обновляем конфигурацию стилей
            Object.assign(this.config, styles);
            // Применяем новые стили
            this.applyCustomStyles();
        }
        
        updateConfig(newConfig) {
            // Обновляем конфигурацию
            Object.assign(this.config, newConfig);
            // Применяем изменения
            this.applyCustomStyles();
        }
        
        getCurrentTheme() {
            return this.currentTheme;
        }
        
        getConfig() {
            return { ...this.config };
        }
        
        // Методы для управления reference_id
        getReferenceId() {
            return this.getCurrentReferenceId();
        }
        
        newReferenceId() {
            return this.resetReferenceId();
        }
        
        clearReferenceId() {
            const storageKey = `diogen-reference-id-${this.config.projectId}-${this.config.userId}`;
            localStorage.removeItem(storageKey);
            console.log('🗑️ Reference_id удален из localStorage');
        }
        
        destroy() {
            if (this.button) this.button.remove();
            if (this.modal) this.modal.remove();
        }
        
        applyCustomStyles() {
            const root = document.documentElement;
            
            // Применяем основные стили
            if (this.config.primaryColor) {
                root.style.setProperty('--diogen-primary-color', this.config.primaryColor);
            }
            if (this.config.primaryHoverColor) {
                root.style.setProperty('--diogen-primary-hover', this.config.primaryHoverColor);
            }
            if (this.config.textColor) {
                root.style.setProperty('--diogen-text-color', this.config.textColor);
            }
            if (this.config.bgColor) {
                root.style.setProperty('--diogen-bg-color', this.config.bgColor);
            }
            if (this.config.surfaceBgColor) {
                root.style.setProperty('--diogen-surface-bg', this.config.surfaceBgColor);
            }
            if (this.config.userBgColor) {
                root.style.setProperty('--diogen-user-bg', this.config.userBgColor);
            }
            if (this.config.borderColor) {
                root.style.setProperty('--diogen-border-color', this.config.borderColor);
            }
            if (this.config.borderRadius) {
                root.style.setProperty('--diogen-border-radius', this.config.borderRadius);
            }
            if (this.config.fontFamily) {
                root.style.setProperty('--diogen-font-family', this.config.fontFamily);
            }
            if (this.config.inputRadius) {
                root.style.setProperty('--diogen-input-radius', this.config.inputRadius);
            }
            
            // Размеры
            if (this.config.width) {
                root.style.setProperty('--diogen-width', this.config.width);
            }
            if (this.config.height) {
                root.style.setProperty('--diogen-height', this.config.height);
            }
            if (this.config.buttonSize) {
                root.style.setProperty('--diogen-button-size', this.config.buttonSize);
            }
            
            // Темная тема
            if (this.config.darkPrimaryColor) {
                root.style.setProperty('--diogen-dark-primary-color', this.config.darkPrimaryColor);
            }
            if (this.config.darkTextColor) {
                root.style.setProperty('--diogen-dark-text-color', this.config.darkTextColor);
            }
            if (this.config.darkBgColor) {
                root.style.setProperty('--diogen-dark-bg-color', this.config.darkBgColor);
            }
            if (this.config.darkSurfaceBgColor) {
                root.style.setProperty('--diogen-dark-surface-bg', this.config.darkSurfaceBgColor);
            }
            if (this.config.darkUserBgColor) {
                root.style.setProperty('--diogen-dark-user-bg', this.config.darkUserBgColor);
            }
            if (this.config.darkBorderColor) {
                root.style.setProperty('--diogen-dark-border-color', this.config.darkBorderColor);
            }
            
            // Позиционирование кнопки
            this.applyButtonPosition();
        }
        
        applyButtonPosition() {
            if (!this.button) return;
            
            const button = this.button;
            
            // Сбрасываем все позиции
            button.style.bottom = '';
            button.style.right = '';
            button.style.left = '';
            button.style.top = '';
            
            // Применяем позиционирование на основе конфигурации
            switch (this.config.position) {
                case 'bottom-left':
                    button.style.bottom = this.config.bottomOffset || '20px';
                    button.style.left = this.config.leftOffset || '20px';
                    break;
                case 'top-right':
                    button.style.top = this.config.topOffset || '20px';
                    button.style.right = this.config.rightOffset || '20px';
                    break;
                case 'top-left':
                    button.style.top = this.config.topOffset || '20px';
                    button.style.left = this.config.leftOffset || '20px';
                    break;
                case 'bottom-right':
                default:
                    button.style.bottom = this.config.bottomOffset || '20px';
                    button.style.right = this.config.rightOffset || '20px';
                    break;
            }
        }
        
        disableInput() {
            this.inputField.disabled = true;
            this.sendButton.disabled = true;
        }
        
        enableInput() {
            this.inputField.disabled = false;
            this.sendButton.disabled = false;
        }
        
        disableActionButtons() {
            const actionButtons = this.messagesContainer.querySelectorAll('.diogen-action-button');
            actionButtons.forEach(button => {
                button.disabled = true;
            });
        }
        
        enableActionButtons() {
            const actionButtons = this.messagesContainer.querySelectorAll('.diogen-action-button');
            actionButtons.forEach(button => {
                button.disabled = false;
            });
        }
        
        getPictureData(data) {
            console.log('🖼️ Получаем данные изображения:', data);
            
            if (typeof data === 'object' && data !== null && data.src) {
                return {
                    src: data.src,
                    alt: data.alt || ''
                };
            } else if (typeof data === 'string' && data.trim()) {
                return {
                    src: data.trim(),
                    alt: ''
                };
            }
            
            console.warn('⚠️ Некорректные данные изображения:', data);
            return { src: '', alt: '' };
        }
        
        updateSendButton() {
            const hasText = this.inputField.value.trim().length > 0;
            this.sendButton.disabled = !hasText || this.isLoading;
            
            // Меняем цвет иконки в зависимости от состояния
            const svgPath = this.sendButton.querySelector('path');
            if (svgPath) {
                if (!hasText || this.isLoading) {
                    svgPath.setAttribute('fill', '#9CA3AF'); // Серый цвет
                } else {
                    svgPath.setAttribute('fill', '#FFFFFF'); // Белый цвет
                }
            }
        }
    }
    
    // Автоматическая инициализация при загрузке страницы
    function initWidget() {
        // Пытаемся найти скрипт с конфигурацией
        const script = document.currentScript || document.querySelector('script[data-diogen-project]');
        
        const config = {};
        
        // Если скрипт найден, берем конфигурацию из атрибутов
        if (script) {
            config.project = script.getAttribute('data-diogen-project') || DEFAULT_CONFIG.project;
            config.projectId = script.getAttribute('data-diogen-project-id') || DEFAULT_CONFIG.projectId;
            config.userId = script.getAttribute('data-diogen-user-id') || DEFAULT_CONFIG.userId;
            config.position = script.getAttribute('data-diogen-position') || DEFAULT_CONFIG.position;
            config.buttonSize = script.getAttribute('data-diogen-button-size') || DEFAULT_CONFIG.buttonSize;
            config.width = script.getAttribute('data-diogen-width') || DEFAULT_CONFIG.width;
            config.height = script.getAttribute('data-diogen-height') || DEFAULT_CONFIG.height;
            config.apiUrl = script.getAttribute('data-diogen-api-url') || DEFAULT_CONFIG.apiUrl;
            config.theme = script.getAttribute('data-diogen-theme') || DEFAULT_CONFIG.theme;
            config.enableThemeToggle = script.getAttribute('data-diogen-enable-theme-toggle') !== 'false';
            config.basicLogin = script.getAttribute('data-diogen-basic-login') || DEFAULT_CONFIG.basicLogin;
            config.basicPassword = script.getAttribute('data-diogen-basic-password') || DEFAULT_CONFIG.basicPassword;
            
            // Опции для разработки
            config.devMode = script.getAttribute('data-diogen-dev-mode') || DEFAULT_CONFIG.devMode;
            config.proxyPath = script.getAttribute('data-diogen-proxy-path') || DEFAULT_CONFIG.proxyPath;
            
            // Стили - основные цвета
            config.primaryColor = script.getAttribute('data-diogen-primary-color');
            config.primaryHoverColor = script.getAttribute('data-diogen-primary-hover-color');
            config.textColor = script.getAttribute('data-diogen-text-color');
            config.bgColor = script.getAttribute('data-diogen-bg-color');
            config.surfaceBgColor = script.getAttribute('data-diogen-surface-bg-color');
            config.userBgColor = script.getAttribute('data-diogen-user-bg-color');
            config.borderColor = script.getAttribute('data-diogen-border-color');
            config.borderRadius = script.getAttribute('data-diogen-border-radius');
            config.fontFamily = script.getAttribute('data-diogen-font-family');
            config.inputRadius = script.getAttribute('data-diogen-input-radius');
            config.title = script.getAttribute('data-diogen-title') || DEFAULT_CONFIG.title;
            
            // Стили - темная тема
            config.darkPrimaryColor = script.getAttribute('data-diogen-dark-primary-color');
            config.darkTextColor = script.getAttribute('data-diogen-dark-text-color');
            config.darkBgColor = script.getAttribute('data-diogen-dark-bg-color');
            config.darkSurfaceBgColor = script.getAttribute('data-diogen-dark-surface-bg-color');
            config.darkUserBgColor = script.getAttribute('data-diogen-dark-user-bg-color');
            config.darkBorderColor = script.getAttribute('data-diogen-dark-border-color');
            
            // Позиционирование
            config.bottomOffset = script.getAttribute('data-diogen-bottom-offset');
            config.rightOffset = script.getAttribute('data-diogen-right-offset');
            config.leftOffset = script.getAttribute('data-diogen-left-offset');
            config.topOffset = script.getAttribute('data-diogen-top-offset');
        }
        
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                try {
                    window.DiogenChat = new DiogenChatWidget(config);
                    console.log('✅ Diogen Chat Widget инициализирован');
                } catch (error) {
                    console.error('❌ Ошибка инициализации Diogen Chat Widget:', error);
                }
            });
        } else {
            try {
                window.DiogenChat = new DiogenChatWidget(config);
                console.log('✅ Diogen Chat Widget инициализирован');
            } catch (error) {
                console.error('❌ Ошибка инициализации Diogen Chat Widget:', error);
            }
        }
    }
    
    // Экспорт для ручной инициализации
    window.DiogenChatWidget = DiogenChatWidget;
    
    // Автоматическая инициализация
    initWidget();
})(); 