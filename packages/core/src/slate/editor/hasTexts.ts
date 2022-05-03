import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { TElement } from '../types/TElement';

/**
 * Check if a node has text children.
 */
export const hasTexts = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasTexts(editor as any, element);
