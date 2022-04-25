import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TElement } from '../../../types/slate/TElement';

/**
 * Check if a node has block children.
 */
export const hasBlocks = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasBlocks(editor as any, element);
