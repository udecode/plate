import {
  type GetAboveNodeOptions,
  type TEditor,
  type ValueOf,
  isEndPoint,
} from '../interfaces';
import { getBlockAbove } from './getBlockAbove';

/** Is the selection focus at the end of its parent block. */
export const isSelectionAtBlockEnd = <E extends TEditor>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
): boolean => {
  const path = getBlockAbove(editor, options)?.[1];

  return !!path && isEndPoint(editor, editor.selection?.focus, path);
};
