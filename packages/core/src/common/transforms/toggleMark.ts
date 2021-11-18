import castArray from 'lodash/castArray';
import {Editor} from 'slate';
import {TEditor} from "../../types/slate/TEditor";
import {isMarkActive} from '../queries/isMarkActive';
import {ToggleMarkPlugin} from '../types/plugins/ToggleMarkPlugin';
import {removeMark} from './removeMark';

export interface ToggleMarkOptions extends Pick<ToggleMarkPlugin, 'clear'> {
  key: string;
}

/**
 * Add/remove marks in the selection.
 * @param editor
 * @param key mark to toggle
 * @param clear marks to clear when adding mark
 */
export const toggleMark = (
  editor: TEditor,
  { key, clear }: ToggleMarkOptions
) => {
  if (!editor.selection) return;

  Editor.withoutNormalizing(editor, () => {
    const isActive = isMarkActive(editor, key);

    if (isActive) {
      removeMark(editor, { key });
      return;
    }

    const clears: string[] = castArray(clear);
    removeMark(editor, { key: clears });

    editor.addMark(key, true);
  });
};
