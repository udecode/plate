import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';
import { TElement } from '../element/TElement';

/**
 * Check if a node has block children.
 */
export const hasBlocks = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasBlocks(editor as any, element);
