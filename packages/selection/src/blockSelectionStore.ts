import { createZustandStore } from '@udecode/plate-common/server';

import type { ChangedElements } from './components/SelectionArea';

import { extractSelectableIds } from './utils/extractSelectableIds';

export const blockSelectionStore = createZustandStore('selection')({
  isSelecting: false,
  selectedIds: new Set(),
})
  .extendActions((set, get) => ({
    resetSelectedIds: () => {
      set.selectedIds(new Set());
    },
    setSelectedIds: ({ added, removed }: ChangedElements) => {
      const prev = get.selectedIds();

      const next = new Set(prev);
      extractSelectableIds(added).forEach((id) => next.add(id));
      extractSelectableIds(removed).forEach((id) => next.delete(id));

      set.selectedIds(next);
      set.isSelecting(true);
    },
    unselect: () => {
      set.selectedIds(new Set());
      set.isSelecting(false);
    },
  }))
  .extendSelectors((set, get) => ({
    isSelected: (id?: string) => id && get.selectedIds().has(id),
    isSelectingSome: () => get.selectedIds().size > 0,
  }));

export const useBlockSelectionSelectors = () => blockSelectionStore.use;

export const blockSelectionSelectors = blockSelectionStore.get;

export const blockSelectionActions = blockSelectionStore.set;
