import {
  createPluginFactory,
  getEndPoint,
  getStartPoint,
  resetEditorChildren,
  select,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Point } from 'slate';
import { onKeyDownResetNode } from './onKeyDownResetNode';
import { ResetNodePlugin } from './types';

export const KEY_RESET_NODE = 'resetNode';

/**
 * Enables support for resetting block type from rules.
 */
export const createResetNodePlugin = createPluginFactory<ResetNodePlugin>({
  key: KEY_RESET_NODE,
  handlers: {
    onKeyDown: onKeyDownResetNode,
  },
  withOverrides: (editor) => {
    const { deleteFragment } = editor;

    const deleteFragmentPlugin = () => {
      const { selection } = editor;
      if (!selection) return;

      const start = getStartPoint(editor, []);
      const end = getEndPoint(editor, []);

      if (
        (Point.equals(selection.anchor, start) &&
          Point.equals(selection.focus, end)) ||
        (Point.equals(selection.focus, start) &&
          Point.equals(selection.anchor, end))
      ) {
        withoutNormalizing(editor, () => {
          resetEditorChildren(editor);
          select(editor, [0]);
        });
        return true;
      }
    };

    editor.deleteFragment = (direction) => {
      if (deleteFragmentPlugin()) return;

      deleteFragment(direction);
    };

    return editor;
  },
  options: {
    rules: [],
  },
});
