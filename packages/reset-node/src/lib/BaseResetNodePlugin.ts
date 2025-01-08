import {
  type PluginConfig,
  type TElement,
  NodeApi,
  PointApi,
  createTSlatePlugin,
  resetEditorChildren,
} from '@udecode/plate';

import type { ResetNodePluginOptions } from './types';

export type ResetNodeConfig = PluginConfig<'resetNode', ResetNodePluginOptions>;

/** Enables support for resetting block type from rules. */
export const BaseResetNodePlugin = createTSlatePlugin<ResetNodeConfig>({
  key: 'resetNode',
  options: {
    rules: [],
  },
}).extendEditorTransforms(
  ({ editor, getOptions, tf: { deleteBackward, deleteFragment } }) => ({
    deleteBackward(unit) {
      if (!getOptions().disableFirstBlockReset) {
        const { selection } = editor;

        if (selection && editor.api.isCollapsed()) {
          const start = editor.api.start([])!;

          if (PointApi.equals(selection.anchor, start)) {
            const node = NodeApi.get<TElement>(editor, [0])!;

            const { children, ...props } = editor.api.create.block({}, [0]);

            // replace props
            editor.tf.withoutNormalizing(() => {
              // missing id will cause block selection not working and other issues
              const { id, ...nodeProps } = NodeApi.extractProps(node);

              editor.tf.unsetNodes(Object.keys(nodeProps), { at: [0] });
              editor.tf.setNodes(props, { at: [0] });
            });

            return;
          }
        }
      }

      deleteBackward(unit);
    },

    deleteFragment(direction) {
      const deleteFragmentPlugin = () => {
        const { selection } = editor;

        if (!selection) return;

        const start = editor.api.start([])!;
        const end = editor.api.end([])!;

        if (
          (PointApi.equals(selection.anchor, start) &&
            PointApi.equals(selection.focus, end)) ||
          (PointApi.equals(selection.focus, start) &&
            PointApi.equals(selection.anchor, end))
        ) {
          resetEditorChildren(editor, {
            select: true,
          });

          return true;
        }
      };

      if (!getOptions().disableEditorReset && deleteFragmentPlugin()) return;

      deleteFragment(direction);
    },
  })
);
