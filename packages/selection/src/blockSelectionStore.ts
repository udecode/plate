import { createStore } from '@udecode/plate-core';
import { ChangedElements } from './components/SelectionArea';
import { extractSelectableIds } from './utils/extractSelectableIds';

export const blockSelectionStore = createStore('selection')({
  selectedIds: new Set(),
})
  .extendActions((set, get) => ({
    setSelectedIds: ({ added, removed }: ChangedElements) => {
      const prev = get.selectedIds();

      const next = new Set(prev);
      extractSelectableIds(added).forEach((id) => next.add(id));
      extractSelectableIds(removed).forEach((id) => next.delete(id));

      set.selectedIds(next);
    },
    reset: () => {
      set.selectedIds(new Set());
    },
  }))
  .extendSelectors((set, get) => ({
    isSelecting: () => get.selectedIds().size > 0,
    isSelected: (id?: string) => id && get.selectedIds().has(id),
  }));

export const useBlockSelectionSelectors = () => blockSelectionStore.use;
export const blockSelectionSelectors = blockSelectionStore.get;
export const blockSelectionActions = blockSelectionStore.set;
