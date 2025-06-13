(function() {
    'use strict';
    
    // Конфигурация по умолчанию
    const DEFAULT_CONFIG = {
        apiUrl: 'https://knowledge.slovo-soft.ru/api/v1/mentorium',
        width: '508px',
        height: '552px',
        buttonSize: '60px',
        position: 'bottom-right',
        project: 'pfki',
        basicLogin: 'slsuser',
        basicPassword: '20241001'
    };
    
    class DiogenChatWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.isOpen = false;
            this.isFullscreen = false;
            this.messages = [];
            this.isLoading = false;
            this.referenceId = this.generateReferenceId();
            this.init();
        }
        
        init() {
            this.createWidgetButton();
            this.createModal();
            this.attachEventListeners();
        }
        
        generateReferenceId() {
            return 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        }
        
        createModal() {
            const modal = document.createElement('div');
            modal.className = 'diogen-chat-modal';
            modal.innerHTML = `
                <div class="diogen-chat-overlay">
                    <div class="diogen-chat-container">
                        <div class="diogen-chat-header">
                            <h3 class="diogen-chat-title">Чат-бот</h3>
                            <div class="diogen-chat-controls">
                                <button title="На весь экран" class="diogen-chat-btn-fullscreen">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.9733 4.66667C10.9733 4.48986 10.9031 4.32029 10.7781 4.19526C10.653 4.07024 10.4835 4 10.3067 4H4.66667C4.48986 4 4.32029 4.07024 4.19526 4.19526C4.07024 4.32029 4 4.48986 4 4.66667V10.3067C4 10.4835 4.07024 10.653 4.19526 10.7781C4.32029 10.9031 4.48986 10.9733 4.66667 10.9733C4.84348 10.9733 5.01305 10.9031 5.13807 10.7781C5.2631 10.653 5.33333 10.4835 5.33333 10.3067V6.27733L9.836 10.78C9.8975 10.8437 9.97106 10.8945 10.0524 10.9294C10.1337 10.9643 10.2212 10.9827 10.3097 10.9835C10.3983 10.9843 10.486 10.9674 10.568 10.9339C10.6499 10.9004 10.7243 10.8509 10.7869 10.7883C10.8495 10.7257 10.899 10.6512 10.9325 10.5693C10.9661 10.4874 10.9829 10.3996 10.9822 10.3111C10.9814 10.2225 10.963 10.1351 10.9281 10.0537C10.8931 9.97239 10.8423 9.89883 10.7787 9.83733L6.276 5.33333H10.3067C10.4835 5.33333 10.653 5.2631 10.7781 5.13807C10.9031 5.01305 10.9733 4.84348 10.9733 4.66667ZM16.6667 5.33333C17.1971 5.33333 17.7058 5.54405 18.0809 5.91912C18.456 6.29419 18.6667 6.8029 18.6667 7.33333V12H14.3587C13.7328 12 13.1325 12.2486 12.6899 12.6912C12.2473 13.1338 11.9987 13.7341 11.9987 14.36V18.6667H7.33333C6.8029 18.6667 6.29419 18.456 5.91912 18.0809C5.54405 17.7058 5.33333 17.1971 5.33333 16.6667V13.6933C5.33333 13.5165 5.2631 13.347 5.13807 13.2219C5.01305 13.0969 4.84348 13.0267 4.66667 13.0267C4.48986 13.0267 4.32029 13.0969 4.19526 13.2219C4.07024 13.347 4 13.5165 4 13.6933V16.6667C4 17.5507 4.35119 18.3986 4.97631 19.0237C5.60143 19.6488 6.44928 20 7.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667V7.33333C20 6.44928 19.6488 5.60143 19.0237 4.97631C18.3986 4.35119 17.5507 4 16.6667 4H13.6933C13.5165 4 13.347 4.07024 13.2219 4.19526C13.0969 4.32029 13.0267 4.48986 13.0267 4.66667C13.0267 4.84348 13.0969 5.01305 13.2219 5.13807C13.347 5.2631 13.5165 5.33333 13.6933 5.33333H16.6667Z" fill="currentColor"/>
                                    </svg>
                                </button>
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
            this.inputField = modal.querySelector('#diogen-input-field');
            this.sendButton = modal.querySelector('#diogen-send-button');
            this.container = modal.querySelector('.diogen-chat-container');
            this.fullscreenBtn = modal.querySelector('.diogen-chat-btn-fullscreen');
            this.closeBtn = modal.querySelector('.diogen-chat-close');
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
            this.scrollToBottom();
            
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
            this.scrollToBottom();
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
        
        scrollToBottom() {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
        }
        
        sendMessage(messageText = null) {
            const text = messageText || this.inputField.value.trim();
            if (!text) return;

            // Отображаем сообщение пользователя
            this.renderMessage(text, true);
            
            // Очищаем поле ввода
            if (!messageText) {
                this.inputField.value = '';
                this.updateSendButton();
            }

            // Отправляем запрос к API
            this.callChatAPI(text);
        }
        
        async callChatAPI(message) {
            try {
                // Показываем индикатор загрузки
                this.showLoadingMessage();
                
                const response = await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa(this.config.basicLogin + ':' + this.config.basicPassword)
                    },
                    body: JSON.stringify({
                        message: message,
                        project: this.config.project,
                        reference_id: this.generateReferenceId()
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.processServerResponse(data);
                
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
                this.hideLoadingMessage();
                this.renderMessage('Извините, произошла ошибка при отправке сообщения. Попробуйте еще раз.', false);
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
            this.scrollToBottom();
        }
        
        hideLoadingMessage() {
            const loadingMessage = this.messagesContainer.querySelector('.diogen-loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
        
        processServerResponse(data) {
            this.hideLoadingMessage();
            
            if (data.message) {
                this.renderMessage(data.message, false);
            }
            
            if (data.actions && data.actions.length > 0) {
                this.renderActionButtons(data.actions);
            }
        }
        
        renderActionButtons(actions) {
            if (!actions || actions.length === 0) return;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'diogen-message diogen-bot-message';
            
            let buttonsHtml = '<div class="diogen-message-content"><div class="diogen-action-buttons">';
            actions.forEach(action => {
                buttonsHtml += `<button class="diogen-action-button" data-action="${action.value}">${action.label}</button>`;
            });
            buttonsHtml += '</div></div>';
            
            actionsDiv.innerHTML = buttonsHtml;
            this.messagesContainer.appendChild(actionsDiv);
            
            // Добавляем обработчики событий для кнопок действий
            actionsDiv.querySelectorAll('.diogen-action-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = e.target.getAttribute('data-action');
                    this.handleActionClick(action);
                });
            });
            
            this.scrollToBottom();
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
                    svgPath.setAttribute('fill', '#333333'); // Черный цвет
                }
            }
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
        
        destroy() {
            if (this.button) this.button.remove();
            if (this.modal) this.modal.remove();
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
            config.position = script.getAttribute('data-diogen-position') || DEFAULT_CONFIG.position;
            config.buttonSize = script.getAttribute('data-diogen-button-size') || DEFAULT_CONFIG.buttonSize;
            config.width = script.getAttribute('data-diogen-width') || DEFAULT_CONFIG.width;
            config.height = script.getAttribute('data-diogen-height') || DEFAULT_CONFIG.height;
            config.apiUrl = script.getAttribute('data-diogen-api-url') || DEFAULT_CONFIG.apiUrl;
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