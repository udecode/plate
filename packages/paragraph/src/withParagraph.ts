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
      const path = editor.selection?.focus.path;
      let previousListItemPath: Path;
      try {
        if (path != undefined) {
          previousListItemPath = Path.previous(path);
        }
        // Delete the current empty line and work as deleteBackward
        deleteBackward(unit);
        move(editor as any, { unit: "line", reverse: false });
      } catch {
        removeNodes(editor as any);
      }
    } else {
      // Perform the default deleteForward behavior
      deleteForward(unit);
    }
  };
  return editor;
};
