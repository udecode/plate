import { type Element, type Range, RangeApi } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: BasePlateEditor,
  at: Range | null = editor.selection
) => {
  if (!at || RangeApi.isCollapsed(at)) {
    return false;
  }

  const isAcrossBlocks = editor.api.isAt({ at, blocks: true });

  if (!isAcrossBlocks) return false;

  return editor.api.some({
    at,
    match: (node: Element) => node.type === editor.getType(KEYS.li),
  });
};
