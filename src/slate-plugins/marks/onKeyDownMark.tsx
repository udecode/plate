import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { toggleMark } from './transforms/toggleMark';
import { OnKeyDownMarkOptions } from './types';

export const onKeyDownMark = ({ mark, hotkey }: OnKeyDownMarkOptions) => (
  e: any,
  editor: Editor
) => {
  if (isHotkey(hotkey, e)) {
    e.preventDefault();
    toggleMark(editor, mark);
  }
};
