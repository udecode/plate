import { TEditor } from '../../types/slate/TEditor';
import { isEndPoint } from '../slate/editor/isEndPoint';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the selection focus at the end of its parent block.
 */
export const isSelectionAtBlockEnd = (editor: TEditor): boolean => {
  const path = getBlockAbove(editor)?.[1];

  return !!path && isEndPoint(editor, editor.selection?.focus, path);
};
