import { Editor } from 'slate';
import { TElement } from '../element/TElement';
import { TEditor, Value } from './TEditor';

/**
 * Check if a node has inline and text children.
 */
export const hasInlines = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasInlines(editor as any, element);
