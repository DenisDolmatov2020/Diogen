const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Настройка CORS для всех доменов
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Target-URL', 'X-TOKEN'],
    credentials: false
}));

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Парсинг JSON
app.use(express.json());

// Главная страница с информацией
app.get('/', (req, res) => {
    res.json({
        message: 'Diogen CORS Proxy Server',
        version: '1.0.0',
        endpoints: {
            '/proxy': 'POST - Проксирует запросы к API с решением CORS',
            '/health': 'GET - Проверка работоспособности сервера'
        },
        usage: {
            method: 'POST',
            url: '/proxy',
            headers: {
                'Content-Type': 'application/json',
                'X-Target-URL': 'https://knowledge.slovo-soft.ru/api/v1/mentorium',
                'X-TOKEN': 'base64(login:password)'
            },
            body: 'JSON payload для API'
        }
    });
});

// Проверка здоровья сервера
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Основной прокси endpoint
app.post('/proxy', async (req, res) => {
    try {
        const targetUrl = req.headers['x-target-url'];
        const token = req.headers['x-token'];
        
        if (!targetUrl) {
            return res.status(400).json({
                error: 'Missing X-Target-URL header'
            });
        }
        
        if (!token) {
            return res.status(400).json({
                error: 'Missing X-TOKEN header'
            });
        }
        
        console.log('🔄 Проксируем запрос к:', targetUrl);
        console.log('🔑 Используем токен:', token.substring(0, 10) + '...');
        console.log('📤 Payload:', JSON.stringify(req.body, null, 2));
        
        // Делаем запрос к целевому API
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`,
                'User-Agent': 'Diogen-CORS-Proxy/1.0'
            },
            body: JSON.stringify(req.body)
        });
        
        const responseText = await response.text();
        console.log('📥 Ответ от API:', response.status, responseText.substring(0, 200));
        
        // Устанавливаем CORS заголовки
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-URL, X-TOKEN');
        
        // Возвращаем ответ с правильным статусом
        res.status(response.status);
        
        // Пытаемся распарсить JSON, если не получается - возвращаем как текст
        try {
            const jsonData = JSON.parse(responseText);
            res.json(jsonData);
        } catch (e) {
            res.send(responseText);
        }
        
    } catch (error) {
        console.error('❌ Ошибка прокси:', error);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message,
            details: error.stack
        });
    }
});

// Обработка OPTIONS запросов (preflight)
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-URL, X-TOKEN');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('❌ Ошибка сервера:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Diogen CORS Proxy Server запущен на порту ${PORT}`);
    console.log(`📡 Доступен по адресу: http://localhost:${PORT}`);
    console.log(`🔧 Для использования отправляйте POST запросы на /proxy`);
    console.log(`📋 Документация доступна на: http://localhost:${PORT}`);
});

module.exports = app; 