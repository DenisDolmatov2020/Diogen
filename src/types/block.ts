export interface TreeBlock {
  component_name: string
  action_mode: string
  action_params: Array<{
    variable: string
    data: any
  }>
  children?: TreeBlock[]
}

export interface FlatBlock extends Omit<TreeBlock, 'children'> {
  component_id: string
} 