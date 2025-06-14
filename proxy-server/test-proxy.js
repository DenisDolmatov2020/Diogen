const fetch = require('node-fetch');

async function testProxy() {
    const proxyUrl = 'http://localhost:3001/proxy';
    const targetUrl = 'https://knowledge.slovo-soft.ru/api/v1/mentorium';
    const token = Buffer.from('pfki:pfki').toString('base64');
    
    const payload = [{
        component_name: "meta_data",
        parent_block_id: "block-0-1",
        action_mode: "dialog",
        action_params: [
            {
                variable: "input_text",
                data: "тест прокси сервера"
            },
            {
                variable: "reference_id",
                data: "000.3654823." + Math.floor(Date.now() / 1000)
            }
        ]
    }];
    
    console.log('🧪 Тестируем прокси-сервер...');
    console.log('📡 Прокси URL:', proxyUrl);
    console.log('🎯 Целевой URL:', targetUrl);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Target-URL': targetUrl,
                'X-TOKEN': token
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📊 Статус ответа:', response.status);
        console.log('📋 Заголовки ответа:');
        response.headers.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
        });
        
        const responseText = await response.text();
        console.log('📥 Тело ответа:', responseText);
        
        if (response.ok) {
            console.log('✅ Тест прокси-сервера прошел успешно!');
            try {
                const jsonData = JSON.parse(responseText);
                console.log('📝 Распарсенный JSON:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
                console.log('⚠️ Ответ не является валидным JSON');
            }
        } else {
            console.log('❌ Тест прокси-сервера не прошел');
        }
        
    } catch (error) {
        console.error('❌ Ошибка при тестировании прокси:', error.message);
    }
}

// Тест проверки здоровья
async function testHealth() {
    const healthUrl = 'http://localhost:3001/health';
    
    console.log('\n🏥 Тестируем health endpoint...');
    
    try {
        const response = await fetch(healthUrl);
        const data = await response.json();
        
        console.log('📊 Статус:', response.status);
        console.log('📋 Данные:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.status === 'OK') {
            console.log('✅ Health check прошел успешно!');
        } else {
            console.log('❌ Health check не прошел');
        }
        
    } catch (error) {
        console.error('❌ Ошибка health check:', error.message);
    }
}

// Запускаем тесты
async function runTests() {
    console.log('🚀 Запуск тестов прокси-сервера\n');
    
    await testHealth();
    await testProxy();
    
    console.log('\n🏁 Тесты завершены');
}

runTests(); 