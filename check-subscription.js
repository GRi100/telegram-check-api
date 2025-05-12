const axios = require('axios');

exports.handler = async function(event, context) {
  // Разрешаем CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Для preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { userId, channelUsername } = JSON.parse(event.body);
    
    if (!userId || !channelUsername) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Отсутствуют обязательные параметры' })
      };
    }
    
    // Проверяем подписку используя токен бота
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember?chat_id=${channelUsername}&user_id=${userId}`
    );
    
    const { status } = response.data.result;
    const isSubscribed = ['creator', 'administrator', 'member'].includes(status);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, isSubscribed })
    };
  } catch (error) {
    console.error('Ошибка проверки подписки:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Ошибка проверки подписки' })
    };
  }
}