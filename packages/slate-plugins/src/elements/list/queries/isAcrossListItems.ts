import {
  isCollapsed,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

/**
 * Is selection across blocks with list items
 */
export const isAcrossListItems = (
  editor: Editor,
  options: SlatePluginsOptions
) => {
  const { li } = options;

  const { selection } = editor;

  if (!selection || isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);
  if (!isAcrossBlocks) return false;

  return someNode(editor, { match: { type: li.type } });
};
