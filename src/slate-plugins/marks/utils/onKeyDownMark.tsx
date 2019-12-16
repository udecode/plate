import isHotkey from 'is-hotkey';
import { Editor } from 'slate';

export const onKeyDownMark = (hotkey: string, mark: string) => (
  e: any,
  editor: Editor
) => {
  if (isHotkey(hotkey, e)) {
    e.preventDefault();
    editor.exec({
      type: 'format_text',
      properties: { [mark]: true },
    });
  }
};
