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
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Netlify-Function-Proxy'
    };
    
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(targetUrl, {
      method: httpMethod,
      headers: requestHeaders,
      body: httpMethod !== 'GET' ? body : undefined
    });

    const responseBody = await response.text();
    
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
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Proxy error: ' + error.message })
    };
  }
}; 