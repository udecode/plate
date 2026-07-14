import type { BaseEditor } from '@platejs/core';
import { type Range, PathApi, RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: BaseEditor,
  at: Range | null = editor.read.selection()
) => {
  if (!at || RangeApi.isCollapsed(at)) {
    return false;
  }

  const startBlock = editor.read.nodes.block({ at: RangeApi.start(at) });
  const endBlock = editor.read.nodes.block({ at: RangeApi.end(at) });
  const isAcrossBlocks =
    startBlock && endBlock && !PathApi.equals(startBlock[1], endBlock[1]);

  if (!isAcrossBlocks) return false;

  return editor.read.nodes.some({
    at,
    match: { type: editor.getType(KEYS.li) },
  });
};
