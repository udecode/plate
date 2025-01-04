import {
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
  getNode,
  getNodeProps,
  resetEditorChildren,
} from '@udecode/plate-common';
import { Point } from 'slate';

import type { ResetNodePluginOptions } from './types';

export type ResetNodeConfig = PluginConfig<'resetNode', ResetNodePluginOptions>;

/** Enables support for resetting block type from rules. */
export const BaseResetNodePlugin = createTSlatePlugin<ResetNodeConfig>({
  key: 'resetNode',
  extendEditor: ({ editor, getOptions }) => {
    const { deleteBackward, deleteFragment } = editor;

    editor.deleteFragment = (direction) => {
      const deleteFragmentPlugin = () => {
        const { selection } = editor;

        if (!selection) return;

        const start = editor.api.start([])!;
        const end = editor.api.end([])!;

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

      if (!getOptions().disableEditorReset && deleteFragmentPlugin()) return;

      deleteFragment(direction);
    };

    editor.deleteBackward = (unit) => {
      if (!getOptions().disableFirstBlockReset) {
        const { selection } = editor;

        if (selection && editor.api.isCollapsed()) {
          const start = editor.api.start([])!;

          if (Point.equals(selection.anchor, start)) {
            const node = getNode<TElement>(editor, [0])!;

            const { children, ...props } = editor.api.create.block({}, [0]);

            // replace props
            editor.tf.withoutNormalizing(() => {
              // missing id will cause block selection not working and other issues
              const { id, ...nodeProps } = getNodeProps(node);

              editor.tf.unsetNodes(Object.keys(nodeProps), { at: [0] });
              editor.tf.setNodes(props, { at: [0] });
            });

            return;
          }
        }
      }

      deleteBackward(unit);
    };

    return editor;
  },
  options: {
    rules: [],
  },
});
