import type { RouteRecordRaw } from 'vue-router'

// Сканируем все JSON-файлы в папке configs/project_pages
const pages = import.meta.glob('/src/configs/project_pages/**/*.json')

function fsPathToRoutePath(fsPath: string): string {
  // Преобразуем путь файла в путь роута
  // /src/configs/project_pages/article/list.json -> /article/list
  // /src/configs/project_pages/article/[id].json -> /article/:id
  return '/' + fsPath
    .replace('/src/configs/project_pages/', '')
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
  return Object.entries(pages).map(([fsPath, loader]) => ({
    path: fsPathToRoutePath(fsPath),
    component: () => import('../components/RoutePage.vue'),
    meta: { 
      loadJson: loader,
      configPath: fsPath
    }
  }))
}

// Для отладки - показать все сгенерированные маршруты
export function getGeneratedRoutes() {
  return Object.keys(pages).map(fsPath => ({
    file: fsPath,
    route: fsPathToRoutePath(fsPath)
  }))
} 