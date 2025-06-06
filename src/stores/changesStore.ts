import { defineStore } from 'pinia'

export interface ChangeEntry {
  id: string
  blockId: string
  itemIndex: number
  field: string
  oldValue: any
  newValue: any
  timestamp: number
}

export const useChangesStore = defineStore('changes', {
  state: () => ({
    changes: [] as ChangeEntry[],
    isViewerOpen: false
  }),

  getters: {
    changesCount: (state) => state.changes.length,
    
    getChangesByBlock: (state) => (blockId: string) => {
      return state.changes.filter(change => change.blockId === blockId)
    }
  },

  actions: {
    addChange(change: Omit<ChangeEntry, 'id' | 'timestamp'>) {
      const existingChangeIndex = this.changes.findIndex(
        c => c.blockId === change.blockId && 
            c.itemIndex === change.itemIndex && 
            c.field === change.field
      )

      const newChange: ChangeEntry = {
        ...change,
        id: `${change.blockId}_${change.itemIndex}_${change.field}_${Date.now()}`,
        timestamp: Date.now()
      }

      if (existingChangeIndex !== -1) {
        // Обновляем существующее изменение
        this.changes[existingChangeIndex] = newChange
      } else {
        // Добавляем новое изменение
        this.changes.push(newChange)
      }
    },

    removeChange(changeId: string) {
      const index = this.changes.findIndex(c => c.id === changeId)
      if (index !== -1) {
        this.changes.splice(index, 1)
      }
    },

    clearAllChanges() {
      this.changes = []
    },

    toggleViewer() {
      this.isViewerOpen = !this.isViewerOpen
    }
  }
}) 