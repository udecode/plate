import { Editor } from 'slate';
import { isCollapsed } from '../../../common/queries/isCollapsed';
import { isRangeAcrossBlocks } from '../../../common/queries/isRangeAcrossBlocks';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
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
