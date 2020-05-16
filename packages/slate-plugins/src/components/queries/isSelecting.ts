// TODO: test all conditions
import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';

export const isSelecting = (editor: ReactEditor) =>
  editor.selection &&
  ReactEditor.isFocused(editor) &&
  !Range.isCollapsed(editor.selection) &&
  !!Editor.string(editor, editor.selection).length;

export default isSelecting;
