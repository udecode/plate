import { Editor } from 'slate';
import { EMarks } from '../text/TText';
import { TEditor, Value } from './TEditor';

/**
 * Remove a custom property from all of the leaf text nodes in the current
 * selection.
 *
 * If the selection is currently collapsed, the removal will be stored on
 * `editor.marks` and applied to the text inserted next.
 */
export const removeEditorMark = <V extends Value, M extends EMarks<V>>(
  editor: TEditor<V>,
  key: {} extends M ? string : keyof M & string
): void => Editor.removeMark(editor as any, key);
