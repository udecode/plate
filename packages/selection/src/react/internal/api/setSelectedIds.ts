import { type SlateEditor, getEditorPlugin, KEYS } from 'platejs';

import type { BlockSelectionConfig } from '../../BlockSelectionPlugin';

import { querySelectorSelectable } from '../../../lib';
import { extractSelectableIds } from '../../../lib/extractSelectableIds';

export const setSelectedIds = (
  editor: SlateEditor,
  {
    added,
    ids,
    removed,
  }: Partial<{
    added: Element[];
    removed: Element[];
  }> & {
    ids?: string[];
  }
) => {
  const { getOptions, setOption } = getEditorPlugin<BlockSelectionConfig>(
    editor,
    { key: KEYS.blockSelection }
  );

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
  editor: SlateEditor,
  id: string,
  options: { clear?: boolean; delay?: number } = {}
) => {
  const { api, getOptions, setOption } = getEditorPlugin<BlockSelectionConfig>(
    editor,
    { key: KEYS.blockSelection }
  );

  const { clear = true, delay } = options;

  const element = querySelectorSelectable(id);

  if (!element) return;
  if (!getOptions().selectedIds!.has(id) && clear) {
    setOption('selectedIds', new Set());
  }

  api.blockSelection.setSelectedIds({
    added: [element],
    removed: [],
  });

  if (delay) {
    setTimeout(() => {
      api.blockSelection.setSelectedIds({
        added: [],
        removed: [element],
      });
    }, delay);
  }
};
