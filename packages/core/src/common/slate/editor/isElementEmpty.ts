import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';

/**
 * Check if an element is empty, accounting for void nodes.
 */
export const isElementEmpty = <V extends Value>(
  editor: TEditor<V>,
  element: ElementOf<TEditor<V>>
) => Editor.isEmpty(editor as any, element);
