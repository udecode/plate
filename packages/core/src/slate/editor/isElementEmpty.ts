import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { EElement } from '../types/TElement';

/**
 * Check if an element is empty, accounting for void nodes.
 */
export const isElementEmpty = <V extends Value>(
  editor: TEditor<V>,
  element: EElement<V>
) => Editor.isEmpty(editor as any, element);
