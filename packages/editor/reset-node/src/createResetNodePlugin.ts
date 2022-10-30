import {
  createPluginFactory,
  getEndPoint,
  getStartPoint,
  isCollapsed,
  resetEditorChildren,
  setNodes,
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
  withOverrides: (editor, { options }) => {
    const { deleteFragment, deleteBackward } = editor;

    if (!options.disableEditorReset) {
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
          resetEditorChildren(editor, {
            insertOptions: { select: true },
          });
          return true;
        }
      };

      editor.deleteFragment = (direction) => {
        if (deleteFragmentPlugin()) return;

        deleteFragment(direction);
      };
    }

    if (!options.disableFirstBlockReset) {
      editor.deleteBackward = (unit) => {
        const { selection } = editor;
        if (selection && isCollapsed(selection)) {
          const start = getStartPoint(editor, []);

          if (Point.equals(selection.anchor, start)) {
            const { children, ...props } = editor.blockFactory({}, [0]);

            setNodes(editor, props, { at: [0] });
            return;
          }
        }

        deleteBackward(unit);
      };
    }

    return editor;
  },
  options: {
    rules: [],
  },
});
