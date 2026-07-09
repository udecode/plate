import type { BaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { querySelectorSelectable } from '../../../lib';
import { extractSelectableIds } from '../../../lib/extractSelectableIds';

export const setSelectedIds = (
  editor: BaseEditor,
  options: Partial<{
    added: globalThis.Element[];
    removed: globalThis.Element[];
  }> & {
    ids?: string[];
  }
) => {
  const { added, ids, removed } = options;
  const { getOptions, setOption } = editor.plugin(BlockSelectionPlugin);

  if (ids) {
    setOption('selectedIds', new Set(ids));
  }
  if (added || removed) {
    const { selectedIds: prev } = getOptions();
    const next = new Set(prev);

    if (added) {
      for (const id of extractSelectableIds(added)) {
        if (id) {
          next.add(id);
        }
      }
    }
    if (removed) {
      for (const id of extractSelectableIds(removed)) {
        if (id) {
          next.delete(id);
        }
      }
    }

    setOption('selectedIds', next);
  }

  setOption('isSelecting', true);
};

export const addSelectedRow = (
  editor: BaseEditor,
  id: string,
  options: { clear?: boolean; delay?: number } = {}
) => {
  const { api, getOptions, setOption } = editor.plugin(BlockSelectionPlugin);
  const { clear = true, delay } = options;
  const element = querySelectorSelectable(id);

  if (!element) return;

  if (!getOptions().selectedIds?.has(id) && clear) {
    setOption('selectedIds', new Set());
  }

  api.setSelectedIds({
    added: [element],
    removed: [],
  });

  if (delay) {
    setTimeout(() => {
      api.setSelectedIds({
        added: [],
        removed: [element],
      });
    }, delay);
  }
};
