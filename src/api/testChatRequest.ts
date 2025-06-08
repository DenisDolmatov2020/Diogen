// Пример правильного запроса для чат-бота
export const exampleChatRequest = [
  {
    "component_name": "meta_data",
    "parent_block_id": "block-0-1",
    "action_mode": "dialog",
    "action_params": [
      {
        "variable": "input_text",
        "data": "Тестовый вопрос пользователя"
      },
      {
        "variable": "keys",
        "data": ["...001"]
      },
      {
        "variable": "reference_id",
        "data": "000.3654823.1741177241t"
      }
    ]
  }
]

// Пример ответа сервера
export const exampleChatResponse = [
  {
    "component_name": "text_block",
    "parent_block_id": "block-0-0",
    "component_id": "txt-0-0-0",
    "items": [
      {
        "title": "!!!! Пример ответа на вопрос пользователя",
        "data": "Какой-то ответ бота на вопрос пользователя",
        "status": "nice"
      }
    ]
  },
  {
    "component_name": "picture_block",
    "parent_block_id": "block-0-0",
    "component_id": "pict-0-0-1",
    "items": [
      {
        "title": "Изображение 1",
        "status": "nice",
        "data": {
          "src": "http://public.url.for.picture",
          "alt": "Альтернативный текст в случае неудачной загрузки изображения",
          "width": 800,
          "height": 600
        }
      }
    ]
  },
  {
    "component_name": "action_button",
    "parent_block_id": "block-0-0",
    "component_id": "btn-0-0-2",
    "items": [
      {
        "title": "Предопределенный вопрос 1",
        "status": "normal",
        "variable": "...001"
      },
      {
        "title": "Предопределенный вопрос 2",
        "status": "normal",
        "variable": "...002"
      }
    ]
  }
]
