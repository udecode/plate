import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { toggleMark } from './transforms';
import { OnKeyDownMarkOptions } from './types';

export const onKeyDownMark = ({
  clear,
  type,
  hotkey,
}: OnKeyDownMarkOptions) => (e: any, editor: Editor) => {
  if (isHotkey(hotkey, e)) {
    e.preventDefault();
    toggleMark(editor, type, clear);
  }
};
