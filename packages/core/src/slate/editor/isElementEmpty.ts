import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';
import { EElement } from '../element/TElement';

/**
 * Check if an element is empty, accounting for void nodes.
 */
export const isElementEmpty = <V extends Value>(
  editor: TEditor<V>,
  element: EElement<V>
) => Editor.isEmpty(editor as any, element);
