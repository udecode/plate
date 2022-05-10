import { Editor } from 'slate';
import { TElement } from '../element/TElement';
import { TEditor, Value } from './TEditor';

/**
 * Check if a node has text children.
 */
export const hasTexts = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasTexts(editor as any, element);
