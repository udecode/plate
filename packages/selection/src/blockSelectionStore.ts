import { createZustandStore } from '@udecode/plate-common/server';

import type { ChangedElements } from './internal';

import { getAllSelectableDomNode, getSelectedDomNode } from './utils';
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
  .extendActions((set) => ({
    addSelectedRow: (
      id: string,
      options: { aboveHtmlNode?: HTMLDivElement; clear?: boolean } = {}
    ) => {
      const { aboveHtmlNode, clear = true } = options;

      const element = aboveHtmlNode ?? getSelectedDomNode(id);

      if (!element) return;

      const selectedIds = blockSelectionSelectors.selectedIds();

      if (!selectedIds.has(id) && clear) {
        set.resetSelectedIds();
      }

      set.setSelectedIds({
        added: [element],
        removed: [],
      });
    },
    selectedAll: () => {
      const all = getAllSelectableDomNode();
      set.resetSelectedIds();

      set.setSelectedIds({
        added: Array.from(all),
        removed: [],
      });
    },
  }))
  .extendSelectors((set, get) => ({
    isSelected: (id?: string) => id && get.selectedIds().has(id),
    isSelectingSome: () => get.selectedIds().size > 0,
  }));

export const useBlockSelectionSelectors = () => blockSelectionStore.use;

export const blockSelectionSelectors = blockSelectionStore.get;

export const blockSelectionActions = blockSelectionStore.set;
