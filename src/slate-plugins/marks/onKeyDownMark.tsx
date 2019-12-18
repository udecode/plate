import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { MarkCommand, OnKeyDownMarkOptions } from './types';

export const onKeyDownMark = ({ mark, hotkey }: OnKeyDownMarkOptions) => (
  e: any,
  editor: Editor
) => {
  if (isHotkey(hotkey, e)) {
    e.preventDefault();
    editor.exec({
      type: MarkCommand.TOGGLE_MARK,
      format: mark,
    });
  }
};
