const REFERENCE_ID_KEY = 'diogen_reference_id'

interface ReferenceIdConfig {
  projectId: string
  userId: string
  timestamp: number
}

/**
 * Генерирует частичный reference_id (только project_id.user_id)
 * Формат: PROJECT_ID.USER_ID
 */
export function generatePartialReferenceId(): string {
  const projectId = import.meta.env.VITE_PROJECT_ID || '000'
  const userId = import.meta.env.VITE_USER_ID || '3654823'
  
  const partialReferenceId = `${projectId}.${userId}`
  
  console.log('🆔 [generatePartialReferenceId] Генерируем частичный reference_id:', {
    projectId,
    userId,
    partialReferenceId
  })
  
  return partialReferenceId
}

/**
 * Генерирует уникальный reference_id на основе переменных окружения и текущего времени
 * Формат: PROJECT_ID.USER_ID.TIMESTAMP
 */
export function generateReferenceId(): string {
  const projectId = import.meta.env.VITE_PROJECT_ID || '000'
  const userId = import.meta.env.VITE_USER_ID || '3654823'
  const timestamp = Math.floor(Date.now() / 1000) // Unix timestamp в секундах
  
  const referenceId = `${projectId}.${userId}.${timestamp}`
  
  console.log('🆔 [generateReferenceId] Генерируем новый reference_id:', {
    projectId,
    userId,
    timestamp,
    referenceId
  })
  
  return referenceId
}

/**
 * Сохраняет reference_id в localStorage
 */
export function saveReferenceId(referenceId: string): void {
  try {
    localStorage.setItem(REFERENCE_ID_KEY, referenceId)
    console.log('💾 [saveReferenceId] Сохранен reference_id в localStorage:', referenceId)
  } catch (error) {
    console.error('❌ [saveReferenceId] Ошибка сохранения в localStorage:', error)
  }
}

/**
 * Получает текущий reference_id из localStorage
 */
export function getCurrentReferenceId(): string | null {
  try {
    const referenceId = localStorage.getItem(REFERENCE_ID_KEY)
    console.log('📖 [getCurrentReferenceId] Получен reference_id из localStorage:', referenceId)
    return referenceId
  } catch (error) {
    console.error('❌ [getCurrentReferenceId] Ошибка чтения из localStorage:', error)
    return null
  }
}

/**
 * Получает reference_id или генерирует новый, если его нет
 */
export function getOrCreateReferenceId(): string {
  let referenceId = getCurrentReferenceId()
  
  if (!referenceId) {
    console.log('🔄 [getOrCreateReferenceId] reference_id не найден, генерируем новый')
    referenceId = generateReferenceId()
    saveReferenceId(referenceId)
  } else {
    console.log('✅ [getOrCreateReferenceId] Используем существующий reference_id:', referenceId)
  }
  
  return referenceId
}

/**
 * Очищает сохраненный reference_id (для создания нового сеанса)
 */
export function clearReferenceId(): void {
  try {
    localStorage.removeItem(REFERENCE_ID_KEY)
    console.log('🗑️ [clearReferenceId] reference_id удален из localStorage')
  } catch (error) {
    console.error('❌ [clearReferenceId] Ошибка удаления из localStorage:', error)
  }
}

/**
 * Принудительно создает новый reference_id и сохраняет его
 */
export function createNewReferenceId(): string {
  console.log('🆕 [createNewReferenceId] Принудительно создаем новый reference_id')
  const referenceId = generateReferenceId()
  saveReferenceId(referenceId)
  return referenceId
}

/**
 * Создает новый reference_id через сервер (генерирует частичный ID локально, 
 * отправляет на сервер и получает полный ID с timestamp)
 */
export async function createNewReferenceIdFromServer(inputData?: {
  input_title?: string
  input_text?: string
  input_audio?: string
  input_file?: string
}): Promise<string> {
  try {
    console.log('🆕 [createNewReferenceIdFromServer] Создаем новый reference_id через сервер')
    
    // Импортируем apiService динамически, чтобы избежать циклических зависимостей
    const { apiService } = await import('@/api/apiService')
    
    // Генерируем частичный reference_id
    const partialReferenceId = generatePartialReferenceId()
    
    // Отправляем на сервер и получаем полный reference_id
    const fullReferenceId = await apiService.createFullReferenceId(partialReferenceId, inputData)
    
    // Сохраняем полный reference_id
    saveReferenceId(fullReferenceId)
    
    return fullReferenceId
  } catch (error) {
    console.error('❌ [createNewReferenceIdFromServer] Ошибка создания reference_id через сервер:', error)
    throw error
  }
}

/**
 * Парсит reference_id и возвращает его компоненты
 */
export function parseReferenceId(referenceId: string): ReferenceIdConfig | null {
  try {
    const parts = referenceId.split('.')
    if (parts.length !== 3) {
      throw new Error('Неверный формат reference_id')
    }
    
    return {
      projectId: parts[0],
      userId: parts[1],
      timestamp: parseInt(parts[2], 10)
    }
  } catch (error) {
    console.error('❌ [parseReferenceId] Ошибка парсинга reference_id:', error)
    return null
  }
} 