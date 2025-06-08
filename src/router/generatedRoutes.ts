import type { RouteRecordRaw } from 'vue-router'

// Статический список конфигурационных файлов
// Обновляется вручную при добавлении новых страниц
const configFiles = [
  '/configs/project_pages/test/backend_integration.json',
  // Добавляйте новые конфиги здесь
]

function fsPathToRoutePath(fsPath: string): string {
  // Преобразуем путь файла в путь роута
  // /configs/project_pages/test/backend_integration.json -> /test/backend_integration
  return '/' + fsPath
    .replace('/configs/project_pages/', '')
    .replace('.json', '')
    .split('/')
    .map(segment => 
      segment.startsWith('[') && segment.endsWith(']')
        ? ':' + segment.slice(1, -1)  // [id] -> :id
        : segment
    )
    .join('/')
}

export function buildRoutes(): RouteRecordRaw[] {
  return configFiles.map(configPath => ({
    path: fsPathToRoutePath(configPath),
    component: () => import('../components/core/RoutePage.vue'),
    meta: { 
      configPath: configPath  // Путь к конфигу в public папке
    }
  }))
}

// Для отладки - показать все сгенерированные маршруты
export function getGeneratedRoutes() {
  const configRoutes = configFiles.map(configPath => ({
    file: configPath,
    route: fsPathToRoutePath(configPath)
  }))
  
  // Добавляем маршрут чата
  configRoutes.push({
    file: 'chat',
    route: '/chat'
  })
  
  // Добавляем маршрут Reference ID Manager
  configRoutes.push({
    file: 'reference-id-manager',
    route: '/reference-id'
  })
  
  return configRoutes
} 