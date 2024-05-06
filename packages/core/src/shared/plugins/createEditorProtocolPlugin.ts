import {
  type EAncestor,
  type GetAboveNodeOptions,
  type TEditor,
  type Value,
  getAboveNode,
  getMarks,
  isExpanded,
  isStartPoint,
  removeEditorMark,
} from '@udecode/slate';

import type { PlateEditor } from '../types/index';

import { createPluginFactory } from '../utils/createPluginFactory';

const getBlockAbove = <N extends EAncestor<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options: GetAboveNodeOptions<V> = {}
) =>
  getAboveNode<N, V>(editor, {
    ...options,
    block: true,
  });

const isSelectionAtBlockStart = <V extends Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
) => {
  const { selection } = editor;

  if (!selection) return false;

  const path = getBlockAbove(editor, options)?.[1];

  if (!path) return false;

  return (
    isStartPoint(editor, selection.focus, path) ||
    (isExpanded(editor.selection) &&
      isStartPoint(editor, selection.anchor, path))
  );
};

const removeSelectionMark = <V extends Value = Value>(editor: TEditor<V>) => {
  const marks = getMarks(editor);

  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    removeEditorMark(editor, key);
  });
};

export const KEY_EDITOR_PROTOCOL = 'editorProtocol';

export const withEditorProtocol = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
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
