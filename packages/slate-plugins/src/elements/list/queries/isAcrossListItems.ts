import {
  isCollapsed,
  isRangeAcrossBlocks,
  setDefaults,
  someNode,
} from '@udecode/slate-plugins-common';
import { Editor } from 'slate';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Is selection across blocks with list items
 */
export const isAcrossListItems = (editor: Editor, options?: ListOptions) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  const { selection } = editor;

  if (!selection || isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);
  if (!isAcrossBlocks) return false;

  return someNode(editor, { match: { type: li.type } });
};
