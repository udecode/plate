import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { MarksOf } from '../../../types/slate/TText';

/**
 * Remove a custom property from all of the leaf text nodes in the current
 * selection.
 *
 * If the selection is currently collapsed, the removal will be stored on
 * `editor.marks` and applied to the text inserted next.
 */
export const removeMark = <V extends Value, M extends MarksOf<TEditor<V>>>(
  editor: TEditor<V>,
  key: {} extends M ? string : keyof M & string
): void => Editor.removeMark(editor as any, key);
