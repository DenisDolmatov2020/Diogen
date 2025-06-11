import type { TreeBlock, Item } from '@/types/block'

// Интерфейсы для данных чата (обновлены под реальную структуру от бэкенда)
export interface MessageComponent {
  component_name: string
  parent_block_id: string
  items: ComponentItem[]
}

export interface ComponentItem {
  title?: string
  data: any
  status: string
  variable?: string // Может отсутствовать в некоторых компонентах
}

/**
 * Трансформирует массив компонентов сообщения в TreeBlock формат
 * для использования с BlockRenderer
 */
export function transformMessageComponentsToTreeBlocks(components: MessageComponent[]): TreeBlock[] {
  return components.map((component, index) => {
    const componentId = `chat-${component.component_name}-${index}`
    
    const treeBlock: TreeBlock = {
      component_name: component.component_name,
      component_id: componentId,
      components_id: `chat-components-${componentId}`,
      parent_block_id: component.parent_block_id || 'chat-message',
      action_mode: getActionModeFromComponent(component.component_name),
      items: transformComponentItems(component.items, component.component_name),
      action_params: []
    }

    console.log(`  ✅ Трансформирован блок: ${component.component_name} → ${treeBlock.items?.length || 0} items`)
    return treeBlock
  })
}

/**
 * Определяет action_mode на основе типа компонента
 */
function getActionModeFromComponent(componentName: string): string {
  switch (componentName) {
    case 'text_block':
      return 'layout'
    case 'picture_block':
      return 'layout'
    case 'action_button':
      return 'layout'
    default:
      return 'layout'
  }
}

/**
 * Трансформирует элементы компонента в формат Item
 */
function transformComponentItems(items: ComponentItem[], componentName: string): Item[] {
  console.log(`  🔧 Трансформируем ${items.length} items для компонента ${componentName}`)
  
  return items.map((item, index) => {
    console.log(`    📝 Item ${index}: title="${item.title}", status="${item.status}"`)
    
    // Обрабатываем специфичные случаи для разных типов компонентов
    let transformedData = item.data
    
    // Для picture_block - данные уже в правильном формате (объект с src и alt)
    if (componentName === 'picture_block' && typeof item.data === 'object') {
      transformedData = item.data
    }
    
    // Для action_button - используем title как основные данные
    if (componentName === 'action_button' && item.title) {
      transformedData = item.title
    }
    
    const transformedItem: Item = {
      title: item.title,
      data: transformedData,
      status: mapBackendStatus(item.status),
      ...(item.variable && { variable: item.variable })
    }
    
    console.log(`    ✅ Трансформировано в:`, transformedItem)
    return transformedItem
  })
}

/**
 * Мапим статусы от бэкенда на внутренние статусы системы
 */
function mapBackendStatus(backendStatus: string): string {
  const statusMap: Record<string, string> = {
    'nice': 'normal',
    'warning': 'missed',
    'alert': 'unprocessed',
    'normal': 'normal'
  }
  
  return statusMap[backendStatus] || backendStatus
}

/**
 * Создает TreeBlock для одного текстового сообщения
 * Используется для обычных текстовых сообщений без компонентов
 */
export function createTextMessageBlock(content: string, messageId: string): TreeBlock {
  return {
    component_name: 'text_block',
    component_id: messageId,
    components_id: `text-${messageId}`,
    parent_block_id: 'chat-message',
    action_mode: 'layout',
    items: [{
      data: content,
      status: 'normal'
    }],
    action_params: []
  }
} 