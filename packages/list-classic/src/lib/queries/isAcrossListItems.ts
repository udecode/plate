import type { BaseEditor } from '@platejs/core';
import { type Range, RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: BaseEditor,
  at: Range | null = editor.read.selection()
) => {
  if (!at || RangeApi.isCollapsed(at)) {
    return false;
  }

  if (!editor.read.selection.isAcrossBlocks({ at })) return false;

  return editor.read.nodes.some({
    at,
    match: { type: editor.getType(KEYS.li) },
  });
};
