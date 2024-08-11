import {
  type EAncestor,
  type GetAboveNodeOptions,
  type TEditor,
  type ValueOf,
  getAboveNode,
  getMarks,
  isExpanded,
  isStartPoint,
  removeEditorMark,
} from '@udecode/slate';

import type { WithOverride } from '../../plugin/types/PlatePlugin';

import { createPlugin } from '../../plugin/createPlugin';

const getBlockAbove = <
  N extends EAncestor<ValueOf<E>>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options: GetAboveNodeOptions<ValueOf<E>> = {}
) =>
  getAboveNode<N, ValueOf<E>>(editor, {
    ...options,
    block: true,
  });

const isSelectionAtBlockStart = <E extends TEditor = TEditor>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
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

const removeSelectionMark = (editor: TEditor) => {
  const marks = getMarks(editor);

  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    removeEditorMark(editor, key);
  });
};

export const KEY_EDITOR_PROTOCOL = 'editorProtocol';

export const withEditorProtocol: WithOverride = ({ editor }) => {
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

export const EditorProtocolPlugin = createPlugin({
  key: KEY_EDITOR_PROTOCOL,
  withOverrides: withEditorProtocol,
});
