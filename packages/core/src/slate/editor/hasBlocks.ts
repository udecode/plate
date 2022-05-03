import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { TElement } from '../types/TElement';

/**
 * Check if a node has block children.
 */
export const hasBlocks = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasBlocks(editor as any, element);
