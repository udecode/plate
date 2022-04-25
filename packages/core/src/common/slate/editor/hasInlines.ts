import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TElement } from '../../../types/slate/TElement';

/**
 * Check if a node has inline and text children.
 */
export const hasInlines = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasInlines(editor as any, element);
