import isHotkey from 'is-hotkey';
import { Editor, Range } from 'slate';

export const onKeyDownSoftBreak = () => (
  event: KeyboardEvent,
  editor: Editor
) => {
  if (
    isHotkey('shift+enter', event) &&
    editor.selection &&
    Range.isCollapsed(editor.selection)
  ) {
    event.preventDefault();
    editor.insertText('\n');
  }
};
