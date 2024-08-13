import { type TEditor, withoutNormalizing } from '@udecode/slate';
import castArray from 'lodash/castArray.js';

import { isMarkActive } from '../queries';
import { removeMark } from './removeMark';

export interface ToggleMarkOptions {
  key: string;
  clear?: string | string[];
}

/**
 * Add/remove marks in the selection.
 *
 * @param editor
 * @param key Mark to toggle
 * @param clear Marks to clear when adding mark
 */
export const toggleMark = (
  editor: TEditor,
  { clear, key }: ToggleMarkOptions
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
