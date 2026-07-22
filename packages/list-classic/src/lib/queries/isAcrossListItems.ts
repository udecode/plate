import type { BaseEditor } from '@platejs/core';
import { type EditorStateView, type Range, RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: BaseEditor,
  at: Range | null | undefined,
  state: Pick<EditorStateView, 'nodes' | 'selection'> = editor.read
) => {
  const range = at === undefined ? state.selection() : at;

  if (!range || RangeApi.isCollapsed(range)) {
    return false;
  }

  if (!state.selection.isAcrossBlocks({ at: range })) return false;

  return state.nodes.some({
    at: range,
    match: { type: editor.getType(KEYS.li) },
  });
};
