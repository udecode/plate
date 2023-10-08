import { PlateEditor, Value, isSelectionAtBlockEnd, isSelectionAtBlockStart } from '@udecode/plate-common';
import { Editor, Path, move, removeNodes } from 'slate';




export const withParagraph = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { deleteForward, deleteBackward } = editor;
  editor.deleteForward = (unit) => {
    if (isSelectionAtBlockStart(editor) && isSelectionAtBlockEnd(editor)) {
      removeNodes(editor as any);
    } else {
      // Perform the default deleteForward behavior
      deleteForward(unit);
    }
  };
  return editor;
};
