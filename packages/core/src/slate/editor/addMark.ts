import { Editor } from 'slate';
import { EMarks } from '../text/TText';
import { TEditor, Value } from './TEditor';

/**
 * Add a custom property to the leaf text nodes in the current selection.
 *
 * If the selection is currently collapsed, the marks will be added to the
 * `editor.marks` property instead, and applied when text is inserted next.
 */
export const addMark = <
  V extends Value,
  M extends EMarks<V>,
  K extends keyof M & string
>(
  editor: TEditor<V>,
  key: {} extends M ? string : K,
  value: {} extends M ? unknown : M[K]
): void => Editor.addMark(editor as any, key, value);
