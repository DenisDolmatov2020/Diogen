// Базовые типы данных для разных компонентов
export interface PictureData {
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface ActionButtonData {
  text?: string
  url?: string
  type?: string
}

export interface TextData {
  content?: string
  html?: string
}

// Универсальный тип для данных элемента
export type ItemData = 
  | string 
  | number 
  | boolean
  | PictureData 
  | ActionButtonData 
  | TextData
  | Record<string, any>

export interface Item {
  title?: string
  data?: ItemData
  hidden_data?: string
  status?: string
  variable?: string
  fate?: string
}

export interface ActionParam {
  variable: string
  data: any
  action_mode?: string
}

export interface TreeBlock {
  component_name: string
  component_id?: string
  components_id?: string
  parent_block_id?: string
  action_mode?: string
  action_params?: ActionParam[]
  children?: TreeBlock[]
  items?: Item[]
  
  // Дополнительные поля для совместимости
  title?: string
  text?: string
  content?: string
  [key: string]: any
}

export interface FlatBlock extends Omit<TreeBlock, 'children'> {
  component_id: string
}

// Типы для специфических компонентов
export interface PictureBlockItem extends Item {
  data: PictureData
  title: string
}

export interface ActionButtonBlockItem extends Item {
  data?: ActionButtonData
  title?: string
}

export interface TextBlockItem extends Item {
  data?: TextData | string
  title?: string
}

// Типизированные блоки для конкретных компонентов
export interface PictureBlock extends TreeBlock {
  component_name: 'picture_block'
  items: PictureBlockItem[]
}

export interface ActionButtonBlock extends TreeBlock {
  component_name: 'action_button'
  items?: ActionButtonBlockItem[]
}

export interface TextBlockComponent extends TreeBlock {
  component_name: 'text_block'
  items?: TextBlockItem[]
}

// Общий тип для всех блоков компонентов
export type ComponentBlock = 
  | PictureBlock 
  | ActionButtonBlock 
  | TextBlockComponent 
  | TreeBlock 