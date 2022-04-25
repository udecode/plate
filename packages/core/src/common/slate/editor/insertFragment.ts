import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { TextOf } from '../../../types/slate/TText';

/**
 * Insert a fragment at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertFragment = <V extends Value>(
  editor: TEditor<V>,
  fragment: Array<ElementOf<TEditor<V>> | TextOf<TEditor<V>>>
) => Editor.insertFragment(editor as any, fragment);
