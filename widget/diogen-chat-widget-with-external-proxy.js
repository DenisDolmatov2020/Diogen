// Копируем весь код из основного виджета, но изменяем логику прокси
// Этот файл будет использоваться для тестирования на удаленных доменах

// Вставляем весь код из diogen-chat-widget.js, но с измененными методами прокси
// Для краткости показываю только измененные части:

(function() {
    'use strict';
    
    // ... весь CSS и остальной код остается тот же ...
    
    // Конфигурация по умолчанию с внешним прокси
    const DEFAULT_CONFIG = {
        apiUrl: 'https://knowledge.slovo-soft.ru/api/v1/mentorium',
        // ВАЖНО: Замените на URL вашего развернутого прокси-сервера
        externalProxyUrl: 'https://your-proxy-server.railway.app/proxy', // Замените на реальный URL
        width: '508px',
        height: '552px',
        buttonSize: '60px',
        position: 'bottom-right',
        project: 'pfki',
        projectId: '000',
        userId: '3654823',
        basicLogin: 'pfki',
        basicPassword: 'pfki',
        theme: 'auto',
        enableThemeToggle: true,
        // Опции для прокси
        useExternalProxy: true, // Всегда используем внешний прокси для удаленного тестирования
        // ... остальные настройки
        title: 'Чат-бот'
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
        
        // ... все остальные методы остаются теми же, кроме:
        
        // Определяем, нужен ли прокси (для внешнего прокси всегда true, кроме localhost)
        shouldUseProxy() {
            const isLocalhost = window.location.hostname === 'localhost';
            
            if (isLocalhost) {
                // На localhost используем локальный прокси (как раньше)
                console.log(`[Diogen] Localhost обнаружен, используем локальный прокси`);
                return true;
            } else {
                // На удаленных доменах используем внешний прокси
                console.log(`[Diogen] Удаленный домен: ${window.location.hostname}, используем внешний прокси`);
                return this.config.useExternalProxy;
            }
        }
        
        // Генерируем URL для прокси
        generateProxyUrl() {
            const isLocalhost = window.location.hostname === 'localhost';
            
            if (isLocalhost) {
                // На localhost используем локальный прокси
                console.log('🔧 Localhost: используем локальный прокси /api/proxy');
                return '/api/proxy';
            } else {
                // На удаленных доменах используем внешний прокси
                const externalProxy = this.config.externalProxyUrl;
                console.log('🌐 Удаленный домен: используем внешний прокси', externalProxy);
                
                if (!externalProxy || externalProxy.includes('your-proxy-server')) {
                    console.error('❌ ОШИБКА: Не настроен URL внешнего прокси-сервера!');
                    console.error('📝 Инструкция:');
                    console.error('1. Разверните прокси-сервер из папки proxy-server');
                    console.error('2. Замените externalProxyUrl в конфигурации на реальный URL');
                    console.error('3. Например: https://your-app.railway.app/proxy');
                    return null;
                }
                
                return externalProxy;
            }
        }
        
        // Получаем финальный URL для запроса
        getApiUrl() {
            if (this.shouldUseProxy()) {
                const proxyUrl = this.generateProxyUrl();
                if (!proxyUrl) {
                    console.error('❌ Не удалось получить URL прокси');
                    return this.config.apiUrl; // Fallback к прямому подключению
                }
                console.log('🔄 Используем прокси:', proxyUrl, '→', this.config.apiUrl);
                return proxyUrl;
            }
            console.log('🌐 Прямое подключение к:', this.config.apiUrl);
            return this.config.apiUrl;
        }
        
        async callChatAPI(message) {
            if (this.isLoading) return;
            
            try {
                this.isLoading = true;
                this.updateSendButton();
                this.disableInput();
                this.disableActionButtons();
                this.showLoadingMessage();
                
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
                
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                const apiUrl = this.getApiUrl();
                
                if (this.shouldUseProxy() && apiUrl !== this.config.apiUrl) {
                    // Используем прокси - передаем данные через специальные заголовки
                    headers['X-Target-URL'] = this.config.apiUrl;
                    headers['X-TOKEN'] = btoa(this.config.basicLogin + ':' + this.config.basicPassword);
                    console.log('🔄 Используем прокси с заголовками:', headers);
                } else {
                    // Прямое подключение к API
                    headers['Authorization'] = 'Basic ' + btoa(this.config.basicLogin + ':' + this.config.basicPassword);
                    console.log('🔗 Прямое подключение с заголовками:', headers);
                }
                
                const response = await fetch(apiUrl, {
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
                
                let errorMessage = 'Извините, произошла ошибка при отправке сообщения.';
                
                if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                    const isLocalhost = window.location.hostname === 'localhost';
                    
                    if (isLocalhost) {
                        errorMessage = `Ошибка CORS в dev режиме. Убедитесь что dev сервер запущен и настроен прокси в vite.config.js`;
                    } else {
                        // Для удаленных доменов показываем информацию о внешнем прокси
                        if (!this.config.externalProxyUrl || this.config.externalProxyUrl.includes('your-proxy-server')) {
                            errorMessage = `❌ Не настроен внешний прокси-сервер. Разверните сервер из папки proxy-server и обновите externalProxyUrl в конфигурации.`;
                        } else {
                            errorMessage = `Ошибка подключения к прокси-серверу: ${this.config.externalProxyUrl}. Проверьте что сервер запущен и доступен.`;
                        }
                    }
                }
                
                this.renderMessage(errorMessage, false);
                this.forceScrollToLastMessage(100);
                
            } finally {
                this.isLoading = false;
                this.updateSendButton();
                this.enableInput();
                this.enableActionButtons();
            }
        }
        
        // ... все остальные методы остаются теми же
    }
    
    // ... остальной код инициализации остается тот же
    
    // Экспорт для ручной инициализации
    window.DiogenChatWidget = DiogenChatWidget;
    
    // Автоматическая инициализация
    initWidget();
})(); 