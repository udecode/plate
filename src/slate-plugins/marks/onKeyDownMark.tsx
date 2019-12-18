import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { OnKeyDownMarkOptions } from './types';

export const onKeyDownMark = ({ type, hotkey }: OnKeyDownMarkOptions) => (
  e: any,
  editor: Editor
) => {
  if (isHotkey(hotkey, e)) {
    e.preventDefault();
    editor.exec({
      type: 'format_text',
      properties: { [type]: true },
    });
  }
};
