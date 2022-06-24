import castArray from 'lodash/castArray';
import { isMarkActive } from '../queries/isMarkActive';
import { TEditor, Value } from '../slate/editor/TEditor';
import { withoutNormalizing } from '../slate/editor/withoutNormalizing';
import { EMarks } from '../slate/text/TText';
import { ToggleMarkPlugin } from '../types/plugin/ToggleMarkPlugin';
import { removeMark } from './removeMark';

export interface ToggleMarkOptions<
  V extends Value = Value,
  K extends keyof EMarks<V> = keyof EMarks<V>
> extends Pick<ToggleMarkPlugin<V, K>, 'clear'> {
  key: K;
}

/**
 * Add/remove marks in the selection.
 * @param editor
 * @param key mark to toggle
 * @param clear marks to clear when adding mark
 */
export const toggleMark = <
  V extends Value = Value,
  K extends keyof EMarks<V> = keyof EMarks<V>
>(
  editor: TEditor<V>,
  { key, clear }: ToggleMarkOptions<V, K>
) => {
  if (!editor.selection) return;

  withoutNormalizing(editor, () => {
    const isActive = isMarkActive(editor, key);

    if (isActive) {
      removeMark(editor, { key });
      return;
    }

    if (clear) {
      const clears: K[] = castArray(clear);
      removeMark(editor, { key: clears });
    }

    editor.addMark(key as string, true);
  });
};
