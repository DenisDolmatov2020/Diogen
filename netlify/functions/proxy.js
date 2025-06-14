exports.handler = async (event, context) => {
  const { httpMethod, headers, body, queryStringParameters } = event;
  
  // Обработка preflight запросов
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL, X-TOKEN, X-Front-Token',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    const targetUrl = headers['x-target-url'] || 'https://knowledge.slovo-soft.ru/api/v1/mentorium';
    const token = headers['x-token'] || headers['x-front-token'];
    
    console.log('🔄 Netlify Proxy:', {
      method: httpMethod,
      targetUrl,
      hasToken: !!token,
      headers: Object.keys(headers)
    });
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Netlify-Function-Proxy'
    };
    
    // Поддержка Basic Auth через X-TOKEN заголовок
    if (token) {
      // Если токен уже в формате Basic auth (base64), используем как есть
      if (token.includes(':')) {
        requestHeaders['Authorization'] = `Basic ${Buffer.from(token).toString('base64')}`;
      } else {
        // Если токен уже закодирован в base64
        requestHeaders['Authorization'] = `Basic ${token}`;
      }
    }

    console.log('📤 Отправляем запрос к API:', {
      url: targetUrl,
      method: httpMethod,
      hasAuth: !!requestHeaders['Authorization']
    });

    const response = await fetch(targetUrl, {
      method: httpMethod,
      headers: requestHeaders,
      body: httpMethod !== 'GET' ? body : undefined
    });

    const responseBody = await response.text();
    
    console.log('📥 Получен ответ от API:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      bodyLength: responseBody.length
    });
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL, X-TOKEN, X-Front-Token',
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: responseBody
    };
  } catch (error) {
    console.error('❌ Ошибка прокси:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Proxy error: ' + error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 