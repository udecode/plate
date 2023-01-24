import { isSelectionAtBlockStart } from '../queries/index';
import { Value } from '../slate/index';
import { removeSelectionMark } from '../transforms/index';
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
    if (isSelectionAtBlockStart(editor)) {
      removeSelectionMark(editor);
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
