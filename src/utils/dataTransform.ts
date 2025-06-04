import { getOrCreateReferenceId } from './referenceIdManager'
import type { TreeBlock, FlatBlock } from '@/types/block'

/**
 * Автоматически заменяет все reference_id в конфиге на динамически сгенерированный
 * и добавляет reference_id к блокам, у которых его нет
 */
export function injectReferenceId(treeBlocks: TreeBlock[]): TreeBlock[] {
  const currentReferenceId = getOrCreateReferenceId()
  
  console.log('🔧 [injectReferenceId] Внедряем reference_id:', currentReferenceId)
  
  function updateReferenceIdRecursive(blocks: TreeBlock[]): TreeBlock[] {
    return blocks.map(block => {
      console.log(`  🔍 Обрабатываем блок: ${block.component_name}`)
      
      // Создаем копию блока
      const updatedBlock: TreeBlock = {
        ...block,
        action_params: [...block.action_params]
      }
      
      // Ищем существующий reference_id
      let hasReferenceId = false
      updatedBlock.action_params = updatedBlock.action_params.map(param => {
        if (param.variable === 'reference_id') {
          hasReferenceId = true
          console.log(`    🔄 Заменяем reference_id: ${param.data} → ${currentReferenceId}`)
          return {
            ...param,
            data: currentReferenceId
          }
        }
        return param
      })
      
      // Если reference_id нет, добавляем его
      if (!hasReferenceId) {
        console.log(`    ➕ Добавляем reference_id: ${currentReferenceId}`)
        updatedBlock.action_params.push({
          variable: 'reference_id',
          data: currentReferenceId
        })
      }
      
      // Рекурсивно обрабатываем дочерние блоки
      if (block.children && block.children.length > 0) {
        console.log(`    👶 Обрабатываем ${block.children.length} дочерних блоков`)
        updatedBlock.children = updateReferenceIdRecursive(block.children)
      }
      
      return updatedBlock
    })
  }
  
  const result = updateReferenceIdRecursive(treeBlocks)
  console.log('✅ [injectReferenceId] reference_id успешно внедрен во все блоки')
  
  return result
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
        component_name: block.component_name,
        component_id: componentId,
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
        component_name: block.component_name,
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
export function applyBackendData(
  originalTree: TreeBlock[], 
  backendFlat: FlatBlock[]
): TreeBlock[] {
  console.log('🔧 [applyBackendData] Начинаем применение данных бэкенда')
  console.log('  📊 Исходное дерево:', JSON.stringify(originalTree, null, 2))
  console.log('  📤 Данные от бэкенда:', JSON.stringify(backendFlat, null, 2))
  
  // Проверяем валидность входных данных
  if (!Array.isArray(backendFlat)) {
    console.warn('⚠️ backendFlat не является массивом, возвращаем исходное дерево')
    return originalTree
  }
  
  // Преобразуем оригинальное дерево в плоскую структуру для сопоставления
  const originalFlat = treeToFlat(originalTree)
  console.log('  🔄 Плоская структура исходного дерева:', JSON.stringify(originalFlat, null, 2))
  
  // Создаем карту для быстрого поиска данных от бэкенда
  const backendMap = new Map<string, FlatBlock>()
  backendFlat.forEach(block => {
    if (block && block.component_id) {
      backendMap.set(block.component_id, block)
    }
  })
  console.log('  🗺️ Карта данных бэкенда:', Array.from(backendMap.keys()))
  
  // Обновляем данные в плоской структуре
  const updatedFlat = originalFlat.map(originalBlock => {
    const backendBlock = backendMap.get(originalBlock.component_id)
    
    if (backendBlock && backendBlock.action_params) {
      console.log(`    ✅ Обновляем блок ${originalBlock.component_name} (${originalBlock.component_id})`)
      return {
        ...originalBlock,
        action_params: backendBlock.action_params // Используем обновленные параметры от бэкенда
      }
    }
    
    console.log(`    ⚠️ Нет обновлений для блока ${originalBlock.component_name} (${originalBlock.component_id})`)
    return originalBlock
  })
  console.log('  🔄 Обновленная плоская структура:', JSON.stringify(updatedFlat, null, 2))
  
  // Преобразуем обратно в дерево
  const result = flatToTree(updatedFlat)
  console.log('🏁 [applyBackendData] Финальное дерево:', JSON.stringify(result, null, 2))
  
  return result
} 