import { isCollapsed } from 'common/queries/isCollapsed';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';

export const onKeyDownSoftBreak = () => (
  event: KeyboardEvent,
  editor: Editor
) => {
  if (isHotkey('shift+enter', event) && isCollapsed(editor.selection)) {
    event.preventDefault();
    editor.insertText('\n');
  }
};
