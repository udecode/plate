import { type SlateEditor, type TRange, RangeApi } from '@udecode/plate';

import { BaseListItemPlugin } from '../BaseListPlugin';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: SlateEditor,
  at: TRange | null = editor.selection
) => {
  if (!at || RangeApi.isCollapsed(at)) {
    return false;
  }

  const isAcrossBlocks = editor.api.isAt({ at, blocks: true });

  if (!isAcrossBlocks) return false;

  return editor.api.some({
    at,
    match: { type: editor.getType(BaseListItemPlugin) },
  });
};
