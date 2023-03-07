import { Editor } from 'slate';
import { EElement } from '../element/TElement';
import { TEditor, Value } from './TEditor';

/**
 * Check if an element is empty, accounting for void nodes.
 */
export const isElementEmpty = <V extends Value>(
  editor: TEditor<V>,
  element: EElement<V>
) => Editor.isEmpty(editor as any, element);
