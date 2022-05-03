import castArray from 'lodash/castArray';
import { withoutNormalizing } from '../../slate/editor/withoutNormalizing';
import { TEditor, Value } from '../../slate/types/TEditor';
import { EMarks } from '../../slate/types/TText';
import { removeMark } from './removeMark';

/**
 * Set marks to selected text.
 */
export const setMarks = <V extends Value, K extends keyof EMarks<V>>(
  editor: TEditor<V>,
  marks: Record<K, any>,
  clear: K | K[] = []
) => {
  if (!editor.selection) return;

  withoutNormalizing(editor, () => {
    const clears: K[] = castArray(clear);
    removeMark(editor, { key: clears });
    removeMark(editor, { key: Object.keys(marks) as K[] });

    Object.keys(marks).forEach((key) => {
      editor.addMark(key, marks[key]);
    });
  });
};
