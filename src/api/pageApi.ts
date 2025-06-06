import apiService from '@/api/apiService.ts'
import { treeToFlat, applyBackendData } from '@/utils/dataTransform'
import type { TreeBlock, FlatBlock } from '@/types/block'

// Интерфейс для результата загрузки
export interface LoadResult {
  data: TreeBlock[]
  isMockData: boolean
  error?: string
}

export async function fetchFilledConfig(treeConfig: TreeBlock[]): Promise<LoadResult> {
  try {
    console.log('🌳 Исходная древовидная структура:', JSON.stringify(treeConfig, null, 2))
    
    // 1. Преобразуем древовидную структуру в плоскую для бэкенда
    const flatConfig = treeToFlat(treeConfig)
    console.log('🚀 Отправляем плоский конфиг на бэкенд:', flatConfig)
    
    // 2. Отправляем на бэкенд через универсальный метод
    const responseData = await apiService.sendRequest(flatConfig)
    
    console.log('✅ Получен ответ от бэкенда:', responseData)
    
    // Проверяем, что бэкенд вернул массив
    if (!Array.isArray(responseData)) {
      console.warn('⚠️ Бэкенд вернул не массив:', responseData)
      throw new Error('Некорректный ответ от бэкенда: ожидался массив')
    }
    
    const backendData: FlatBlock[] = responseData
    
    // 3. Применяем данные от бэкенда к исходной древовидной структуре
    const updatedTree = applyBackendData(treeConfig, backendData)
    console.log('🔄 Данные применены к дереву:', updatedTree)
    
    return {
      data: updatedTree,
      isMockData: false
    }
    
  } catch (error) {
    console.warn('⚠️ Бэкенд недоступен, используем mock данные:', error)
    console.log('🌳 Исходная структура для mock данных:', JSON.stringify(treeConfig, null, 2))
    
    const mockData = generateMockTreeData(treeConfig)
    console.log('🎭 Сгенерированные mock данные:', JSON.stringify(mockData, null, 2))
    
    return {
      data: mockData,
      isMockData: true,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }
  }
}

function generateMockTreeData(treeConfig: TreeBlock[]): TreeBlock[] {
  console.log('🎭 [generateMockTreeData] Генерируем mock данные на основе реального ответа сервера')
  console.log('  📊 Входящая структура:', JSON.stringify(treeConfig, null, 2))
  
  // Реальные данные от сервера с поддержкой items
  const realBackendData = [
    {
      "component_name": "info_panel",
      "parent_block_id": "block-0-1-0",
      "component_id": "0",
      "items": [
        {
          "title": "Статус",
          "data": "Активный",
          "hidden_data": "",
          "status": "normal",
          "variable": "19003",
          "fate": "readonly"
        },
        {
          "title": "Приоритет",
          "data": "Высокий",
          "hidden_data": "",
          "status": "normal",
          "variable": "19004",
          "fate": "readonly"
        },
        {
          "title": "Категория",
          "data": "Новости",
          "hidden_data": "",
          "status": "normal",
          "variable": "19005",
          "fate": "readonly"
        },
        {
          "title": "Автор",
          "data": "Иван Иванов",
          "hidden_data": "",
          "status": "normal",
          "variable": "19006",
          "fate": "readonly"
        },
        {
          "title": "Дата создания",
          "data": "2024-01-15",
          "hidden_data": "",
          "status": "normal",
          "variable": "19007",
          "fate": "readonly"
        },
        {
          "title": "Последнее обновление",
          "data": "2024-01-20",
          "hidden_data": "",
          "status": "normal",
          "variable": "19008",
          "fate": "readonly"
        }
      ]
    },
    {
      "component_name": "action_button",
      "parent_block_id": "block-0-1-1",
      "component_id": "0.0",
      "items": [
        {
          "title": "Изменение скора",
          "hidden_data": "",
          "status": "normal",
          "variable": "11071",
          "fate": "readonly"
        }
      ]
    },
    {
      "component_name": "progress_bar",
      "parent_block_id": "block-0-1-1",
      "component_id": "1",
      "items": [
        {
          "title": "Прогресс выполнения",
          "data": "75",
          "variable": "19009",
          "fate": "readonly"
        }
      ]
    },
    {
      "component_name": "text_block",
      "parent_block_id": "block-0-1-1",
      "component_id": "2",
      "items": [
        {
          "title": "Выводы ИИ эксперта",
          "data": "Анализ показывает высокий потенциал проекта...",
          "variable": "19010",
          "fate": "readonly"
        }
      ]
    },
    {
      "component_name": "text_block",
      "parent_block_id": "block-0-2",
      "component_id": "3",
      "items": [
        {
          "title": "Название проекта",
          "data": "таймс",
          "variable": "project_name",
          "fate": "editable"
        }
      ]
    },
    {
      "component_name": "action_button",
      "parent_block_id": "block-0-2-1-0",
      "component_id": "3.0",
      "items": [
        {
          "title": "Общий бюджет ",
          "hidden_data": "Предположение ИИ: 700000.00",
          "status": "normal",
          "variable": "project_value",
          "fate": "editable"
        },
        {
          "title": "Софинансирование",
          "hidden_data": "Предположение ИИ: 200000.00",
          "status": "normal",
          "variable": "cofinancing",
          "fate": "editable"
        },
        {
          "title": "Сумма гранта",
          "hidden_data": "Предположение ИИ: 500000.00",
          "status": "normal",
          "variable": "grant_value",
          "fate": "editable"
        },
        {
          "title": "Тип проекта",
          "hidden_data": "Предположение ИИ: Инновационный проект",
          "status": "normal",
          "variable": "type_project",
          "fate": "editable"
        },
        {
          "title": "Обоснование проекта",
          "hidden_data": "Предположение ИИ: Обоснование необходимости реализации проекта заключается в растущем интересе к технологиям, позволяющим планировать и отправлять сообщения в будущее, что может значительно улучшить коммуникацию и организацию личного времени.",
          "status": "normal",
          "variable": "justification",
          "fate": "editable"
        },
        {
          "title": "Цель ",
          "hidden_data": "Предположение ИИ: Основная цель проекта заключается в разработке и внедрении платформы для отправки сообщений в будущее, с планируемым количеством пользователей не менее 10000 в течение первого года.",
          "status": "normal",
          "variable": "aim",
          "fate": "editable"
        },
        {
          "title": "Задачи  ",
          "hidden_data": "Предположение ИИ: Разработка технического задания Создание прототипа платформы Тестирование и отладка системы Запуск маркетинговой кампании Сбор и анализ обратной связи от пользователей",
          "status": "normal",
          "variable": "task",
          "fate": "editable"
        },
        {
          "title": "Актуальность проекта",
          "hidden_data": "Предположение ИИ: Актуальность проекта обусловлена необходимостью улучшения способов коммуникации в современном обществе, где планирование и организация времени становятся все более важными.",
          "status": "normal",
          "variable": "relevance",
          "fate": "editable"
        },
        {
          "title": "Целевая аудитория",
          "hidden_data": "Предположение ИИ: Целевая группа проекта включает молодежь, студентов и профессионалов, заинтересованных в эффективном управлении своим временем.",
          "status": "normal",
          "variable": "target_group",
          "fate": "editable"
        },
        {
          "title": "География проекта",
          "hidden_data": "Предположение ИИ: География проекта охватывает всю территорию Российской Федерации, с возможностью расширения на международный рынок.",
          "status": "normal",
          "variable": "geography",
          "fate": "editable"
        },
        {
          "title": "Заявитель",
          "hidden_data": "Предположение ИИ: Фонд поддержки инновационных технологий",
          "status": "normal",
          "variable": "applicant_name",
          "fate": "editable"
        },
        {
          "title": "ОГРН",
          "hidden_data": "",
          "status": "normal",
          "variable": "applicant_ogrn",
          "fate": "editable"
        }
      ]
    },
    {
      "component_name": "action_button",
      "parent_block_id": "block-0-2-1-1",
      "component_id": "3.1",
      "items": [
        {
          "title": "Сохранить изменения",
          "data": "",
          "hidden_data": "",
          "status": "normal",
          "variable": "11000",
          "fate": "readonly"
        }
      ]
    }
  ]
  
  // Применяем реальные данные к исходной структуре
  const result = applyBackendData(treeConfig, realBackendData)
  console.log('🎭 [generateMockTreeData] Применены реальные данные:', JSON.stringify(result, null, 2))
  
  return result
}
