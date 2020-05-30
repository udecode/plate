import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';

export const onKeyDownSoftBreak = () => (
  event: KeyboardEvent,
  editor: Editor
) => {
  if (isHotkey('shift+enter', event) && isCollapsed(editor.selection)) {
    event.preventDefault();
    editor.insertText('\n');
  }
};
