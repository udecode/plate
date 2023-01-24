import { getBlockAbove } from '../queries/index';
import { getMarks, isExpanded, isStartPoint, Value } from '../slate/index';
import { removeMark } from '../transforms/index';
import { PlateEditor } from '../types/index';
import { createPluginFactory } from '../utils/plate/createPluginFactory';

export const KEY_EDITOR_PROTOCOL = 'editorProtocol';

export const withEditorProtocol = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { deleteBackward, deleteForward, deleteFragment } = editor;

  const resetMarks = () => {
    // move to isSelectionAtBlockStart
    const path = getBlockAbove(editor)?.[1];
    if (!path) return;

    let isAtBlockStart = isStartPoint(editor, editor.selection?.focus, path);
    isAtBlockStart =
      isAtBlockStart ||
      (isExpanded(editor.selection) &&
        isStartPoint(editor, editor.selection?.anchor, path));

    if (isAtBlockStart) {
      const marks = getMarks(editor);

      if (marks) {
        // remove all marks
        removeMark(editor, {
          key: Object.keys(marks) as any,
        });
      }
    }
  };

  editor.deleteBackward = (unit) => {
    deleteBackward(unit);

    resetMarks();
  };

  editor.deleteForward = (unit) => {
    deleteForward(unit);

    resetMarks();
  };

  editor.deleteFragment = (direction) => {
    deleteFragment(direction);

    resetMarks();
  };

  return editor;
};

export const createEditorProtocolPlugin = createPluginFactory({
  key: KEY_EDITOR_PROTOCOL,
  withOverrides: withEditorProtocol,
});
