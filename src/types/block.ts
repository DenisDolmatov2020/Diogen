export interface Item {
  title: string
  data?: string | number
  hidden_data?: string
  status?: string
  variable: string
  fate: string
}

export interface TreeBlock {
  component_name: string
  components_id: string
  parent_block_id: string
  action_mode: string
  action_params: Array<{
    variable: string
    data: any
  }>
  children?: TreeBlock[]
  items?: Item[]
}

export interface FlatBlock extends Omit<TreeBlock, 'children'> {
  component_id: string
} 