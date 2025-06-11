import type { TreeBlock, FlatBlock } from '@/types/block'
import { getOrCreateReferenceId } from '@/utils/referenceIdManager'

/**
 * Автоматически заменяет все reference_id в конфиге на динамически сгенерированный
 * и добавляет reference_id к блокам, у которых его нет
 */
export function injectReferenceId(treeBlocks: TreeBlock[]): TreeBlock[] {
  const referenceId = getOrCreateReferenceId()
  
  console.log('🔧 [injectReferenceId] Внедряем reference_id:', referenceId)
  
  return treeBlocks.map(block => {
    const updatedBlock: TreeBlock = {
      ...block,
      action_params: block.action_params ? [...block.action_params] : []
    }
    
    // Заменяем статический reference_id на динамический
    if (updatedBlock.action_params) {
      updatedBlock.action_params = updatedBlock.action_params.map(param => {
        if (param.variable === 'reference_id') {
          console.log(`    🔄 Заменяем reference_id: ${param.data} → ${referenceId}`)
          return {
            ...param,
            data: referenceId
          }
        }
        return param
      })
    }
    
    // Если reference_id нет, добавляем его
    if (!updatedBlock.action_params || updatedBlock.action_params.length === 0) {
      console.log(`    ➕ Добавляем reference_id: ${referenceId}`)
      updatedBlock.action_params = [{
        variable: 'reference_id',
        data: referenceId
      }]
    }
    
    // Рекурсивно обрабатываем дочерние блоки
    if (block.children) {
      updatedBlock.children = injectReferenceId(block.children)
    }
    
    return updatedBlock
  })
}

/**
 * Преобразует древовидную структуру в плоскую для отправки на бэкенд
 */
export function treeToFlat(treeBlocks: TreeBlock[]): FlatBlock[] {
  console.log('🔄 [treeToFlat] Преобразуем дерево в плоскую структуру')
  console.log('  📊 Входящее дерево:', JSON.stringify(treeBlocks, null, 2))
  
  const flatBlocks: FlatBlock[] = []
  
  function traverse(blocks: TreeBlock[], parentId: string = '') {
    console.log(`  🚶 Обходим уровень с ${blocks.length} блоков, родитель: ${parentId || 'ROOT'}`)
    
    blocks.forEach((block, index) => {
      // Генерируем уникальный ID для блока
      const componentId = parentId ? `${parentId}.${index}` : `${index}`
      
      console.log(`    📦 Блок ${block.component_name} → ID: ${componentId}`)
      
      // Создаем плоский блок
      const flatBlock: FlatBlock = {
        components_id: block.components_id,
        component_name: block.component_name,
        component_id: componentId,
        parent_block_id: block.parent_block_id,
        action_mode: block.action_mode,
        action_params: block.action_params
      }
      
      flatBlocks.push(flatBlock)
      
      // Рекурсивно обрабатываем дочерние блоки
      if (block.children && block.children.length > 0) {
        console.log(`    👶 Блок ${block.component_name} имеет ${block.children.length} детей`)
        traverse(block.children, componentId)
      } else {
        console.log(`    🍃 Блок ${block.component_name} - лист`)
      }
    })
  }
  
  traverse(treeBlocks)
  
  console.log('🔄 [treeToFlat] Результат преобразования:')
  flatBlocks.forEach(block => {
    console.log(`    ${block.component_id}: ${block.component_name}`)
  })
  
  return flatBlocks
}

/**
 * Преобразует плоскую структуру обратно в древовидную
 */
export function flatToTree(flatBlocks: FlatBlock[]): TreeBlock[] {
  console.log('🌳 [flatToTree] Восстанавливаем дерево из плоской структуры')
  console.log('  📥 Входящие блоки:', flatBlocks.map(b => `${b.component_name}(${b.component_id})`).join(', '))
  
  // Группируем блоки по уровню иерархии
  const blocksByParent = new Map<string | null, FlatBlock[]>()
  
  flatBlocks.forEach(block => {
    const parentId = getParentId(block.component_id)
    console.log(`  📂 Блок ${block.component_name}(${block.component_id}) → родитель: ${parentId || 'ROOT'}`)
    
    if (!blocksByParent.has(parentId)) {
      blocksByParent.set(parentId, [])
    }
    blocksByParent.get(parentId)!.push(block)
  })
  
  console.log('  🗂️ Группировка по родителям:')
  blocksByParent.forEach((blocks, parentId) => {
    console.log(`    ${parentId || 'ROOT'}: [${blocks.map(b => b.component_name).join(', ')}]`)
  })
  
  // Рекурсивная функция для построения дерева
  function buildTreeFromBlocks(parentId: string | null): TreeBlock[] {
    const blocks = blocksByParent.get(parentId) || []
    console.log(`  🔨 Строим ветку для родителя ${parentId || 'ROOT'}: ${blocks.length} блоков`)
    
    return blocks.map(block => {
      // Ищем дочерние блоки
      const children = buildTreeFromBlocks(block.component_id)
      console.log(`    🌿 Блок ${block.component_name}(${block.component_id}) имеет ${children.length} детей`)
      
      const treeBlock: TreeBlock = {
        components_id: block.components_id,
        component_name: block.component_name,
        parent_block_id: block.parent_block_id,
        action_mode: block.action_mode,
        action_params: block.action_params,
        ...(children.length > 0 && { children })
      }
      
      return treeBlock
    })
  }
  
  const result = buildTreeFromBlocks(null)
  console.log('🌳 [flatToTree] Результат восстановления дерева:', JSON.stringify(result, null, 2))
  
  return result
}

function getParentId(componentId: string): string | null {
  const parts = componentId.split('.')
  if (parts.length <= 1) return null
  return parts.slice(0, -1).join('.')
}

/**
 * Применяет данные от бэкенда к древовидной структуре
 */
export function applyBackendData(treeBlocks: TreeBlock[], backendData: any[]): TreeBlock[] {
  console.log('🔄 [applyBackendData] Применяем данные от бэкенда к дереву')
  
  // Создаем карту данных от бэкенда по component_id для быстрого поиска
  const backendMap = new Map<string, any>()
  
  // Обрабатываем ответ от бэкенда
  if (Array.isArray(backendData)) {
    backendData.forEach((item, index) => {
      // Если у элемента есть component_id, используем его
      if (item.component_id !== undefined) {
        backendMap.set(item.component_id, item)
        console.log(`  📝 Мапим по component_id: ${item.component_id} → ${item.component_name}`)
      } else {
        // Иначе используем индекс как ID
        backendMap.set(index.toString(), item)
        console.log(`  📝 Мапим по индексу: ${index} → ${item.component_name}`)
      }
    })
  }
  
  function applyDataToBlock(block: TreeBlock, blockIndex: string = '0'): TreeBlock {
    console.log(`  🔧 Обрабатываем блок: ${block.component_name} (ID: ${blockIndex})`)
    
    // Ищем соответствующие данные от бэкенда
    const backendItem = backendMap.get(blockIndex) || backendMap.get(block.components_id || '')
    
    if (backendItem) {
      console.log(`  ✅ Найдены данные для блока ${block.component_name}:`, backendItem)
      
      // Создаем новый блок с сохранением исходных данных и добавлением новых
      const updatedBlock: TreeBlock = {
        ...block,
        // Добавляем items если они есть
        ...(backendItem.items && { items: backendItem.items }),
        // Обновляем action_params, добавляя новые данные
        action_params: block.action_params ? [...block.action_params] : []
      }
      
      // Добавляем данные от бэкенда в action_params, если они не системные
      if (backendItem.action_params) {
        backendItem.action_params.forEach((param: any) => {
          // Проверяем, нет ли уже такого параметра
          const existingIndex = updatedBlock.action_params!.findIndex(p => p.variable === param.variable)
          if (existingIndex !== -1) {
            // Обновляем существующий параметр
            updatedBlock.action_params![existingIndex] = param
          } else {
            // Добавляем новый параметр
            updatedBlock.action_params!.push(param)
          }
        })
      }
      
      // Рекурсивно обрабатываем дочерние блоки
      if (block.children && block.children.length > 0) {
        console.log(`  👶 Блок ${block.component_name} имеет ${block.children.length} детей`)
        updatedBlock.children = block.children.map((child, childIndex) => {
          const childId = `${blockIndex}.${childIndex}`
          return applyDataToBlock(child, childId)
        })
      }
      
      return updatedBlock
    } else {
      console.log(`  ⚠️ Данные для блока ${block.component_name} (ID: ${blockIndex}) не найдены`)
      
      // Если данных нет, просто обрабатываем детей
      if (block.children && block.children.length > 0) {
        const updatedBlock = { ...block }
        updatedBlock.children = block.children.map((child, childIndex) => {
          const childId = `${blockIndex}.${childIndex}`
          return applyDataToBlock(child, childId)
        })
        return updatedBlock
      }
      
      return block
    }
  }
  
  const result = treeBlocks.map((block, index) => applyDataToBlock(block, index.toString()))
  
  return result
} 