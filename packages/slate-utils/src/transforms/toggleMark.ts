import { TEditor, Value, withoutNormalizing } from '@udecode/slate';
import castArray from 'lodash/castArray.js';

import { isMarkActive } from '../queries';
import { removeMark } from './removeMark';

export interface ToggleMarkOptions {
  clear?: string | string[];
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
  { key, clear }: ToggleMarkOptions
) => {
  if (!editor.selection) return;

  withoutNormalizing(editor, () => {
    const isActive = isMarkActive(editor, key);

    if (isActive) {
      editor.removeMark(key);
      return;
    }

    if (clear) {
      const clears = castArray<string>(clear);
      removeMark(editor, { key: clears });
    }

    editor.addMark(key, true);
  });
};
