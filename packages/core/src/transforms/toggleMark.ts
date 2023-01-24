import castArray from 'lodash/castArray';
import { isMarkActive } from '../queries/isMarkActive';
import { TEditor, Value } from '../slate/editor/TEditor';
import { withoutNormalizing } from '../slate/editor/withoutNormalizing';
import { ToggleMarkPlugin } from '../types/plugin/ToggleMarkPlugin';
import { removeMark } from './removeMark';

export interface ToggleMarkOptions<V extends Value = Value>
  extends Pick<ToggleMarkPlugin<V>, 'clear'> {
  key: string;
}

/**
 * Add/remove marks in the selection.
 * @param editor
 * @param key mark to toggle
 * @param clear marks to clear when adding mark
 */
export const toggleMark = <V extends Value = Value>(
  editor: TEditor<V>,
  { key, clear }: ToggleMarkOptions<V>
) => {
  if (!editor.selection) return;

  withoutNormalizing(editor, () => {
    const isActive = isMarkActive(editor, key);

    if (isActive) {
      removeMark(editor, { key });
      return;
    }

    if (clear) {
      const clears = castArray<string>(clear);
      removeMark(editor, { key: clears });
    }

    editor.addMark(key, true);
  });
};
