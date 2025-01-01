import castArray from 'lodash/castArray.js';

import type { TEditor } from '../interfaces';

import { isMarkActive } from '../queries';
import { removeMark } from './removeMark';

export interface ToggleMarkOptions {
  /** The mark key to toggle. */
  key: string;

  /** Mark keys to clear when adding the mark. */
  clear?: string[] | string;
}

/** Add or remove marks in the selection. */
export const toggleMark = (
  editor: TEditor,
  { key, clear }: ToggleMarkOptions
) => {
  if (!editor.selection) return;

  editor.tf.withoutNormalizing(() => {
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
