import { Editor, Range } from 'slate';

export const onKeyDownSoftBreak = () => (e: KeyboardEvent, editor: Editor) => {
  if (
    e.key === 'Enter' &&
    e.shiftKey &&
    editor.selection &&
    Range.isCollapsed(editor.selection)
  ) {
    e.preventDefault();
    editor.insertText('\n');
  }
};
