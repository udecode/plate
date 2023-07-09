import { Editor } from 'slate';

import { TElement } from '../element/TElement';
import { TEditor, Value } from './TEditor';

/**
 * Check if a node has block children.
 */
export const hasBlocks = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasBlocks(editor as any, element);
