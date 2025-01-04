import type { Range } from 'slate';

import { type SlateEditor, isCollapsed } from '@udecode/plate-common';

import { BaseListItemPlugin } from '../BaseListPlugin';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: SlateEditor,
  at: Range | null = editor.selection
) => {
  if (!at || isCollapsed(at)) {
    return false;
  }

  const isAcrossBlocks = editor.api.isAt({ at, blocks: true });

  if (!isAcrossBlocks) return false;

  return editor.api.some({
    at,
    match: { type: editor.getType(BaseListItemPlugin) },
  });
};
