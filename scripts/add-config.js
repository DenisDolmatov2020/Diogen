#!/usr/bin/env node

/**
 * Скрипт для добавления нового конфигурационного файла
 * Использование: node scripts/add-config.js project-name page-name
 * Пример: node scripts/add-config.js my-project main
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectName = process.argv[2]
const pageName = process.argv[3]

if (!projectName || !pageName) {
  console.log('❌ Использование: node scripts/add-config.js <project-name> <page-name>')
  console.log('📝 Пример: node scripts/add-config.js my-project main')
  process.exit(1)
}

// Шаблон конфигурации
const configTemplate = [
  {
    "component_name": "info_panel",
    "action_mode": "deep_layout",
    "action_params": [
      {
        "variable": "keys", 
        "data": ["title", "description"]
      }
    ],
    "children": [
      {
        "component_name": "text_block",
        "action_mode": "layout",
        "action_params": [
          {
            "variable": "keys",
            "data": ["content"]
          }
        ]
      }
    ]
  }
]

// Создаем папки
const configDir = path.join(__dirname, '..', 'public', 'configs', 'project_pages', projectName)
const configPath = path.join(configDir, `${pageName}.json`)

try {
  // Создаем папку если её нет
  fs.mkdirSync(configDir, { recursive: true })
  
  // Создаем конфигурационный файл
  fs.writeFileSync(configPath, JSON.stringify(configTemplate, null, 2))
  
  console.log(`✅ Конфиг создан: ${configPath}`)
  
  // Добавляем в generatedRoutes.ts
  const routesPath = path.join(__dirname, '..', 'src', 'router', 'generatedRoutes.ts')
  const routesContent = fs.readFileSync(routesPath, 'utf8')
  
  const newConfigEntry = `  '/configs/project_pages/${projectName}/${pageName}.json'`
  const configFilesMatch = routesContent.match(/const configFiles = \[([\s\S]*?)\]/m)
  
  if (configFilesMatch) {
    const existingConfigs = configFilesMatch[1]
    if (!existingConfigs.includes(newConfigEntry.trim())) {
      const updatedConfigs = existingConfigs.replace(
        /(\s*\/\/.*добавляйте.*)/i,
        `,\n${newConfigEntry}$1`
      )
      
      const updatedContent = routesContent.replace(
        /const configFiles = \[([\s\S]*?)\]/m,
        `const configFiles = [${updatedConfigs}]`
      )
      
      fs.writeFileSync(routesPath, updatedContent)
      console.log(`✅ Маршрут добавлен в generatedRoutes.ts`)
      console.log(`🌐 Доступен по адресу: /${projectName}/${pageName}`)
    } else {
      console.log(`⚠️ Маршрут уже существует в generatedRoutes.ts`)
    }
  }
  
} catch (error) {
  console.error('❌ Ошибка:', error.message)
  process.exit(1)
} 