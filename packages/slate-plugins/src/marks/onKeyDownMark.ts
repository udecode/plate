import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { clearMark, toggleMark } from './transforms';
import { OnKeyDownMarkOptions } from './types';

export const onKeyDownMark = ({
  mark,
  clear,
  hotkey,
}: OnKeyDownMarkOptions) => (e: any, editor: Editor) => {
  if (isHotkey(hotkey, e)) {
    e.preventDefault();
    toggleMark(editor, mark);
    if (clear) {
      clearMark(editor, clear);
    }
  }
};
