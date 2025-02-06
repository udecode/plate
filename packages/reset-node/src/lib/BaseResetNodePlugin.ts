import {
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
  NodeApi,
  PointApi,
  RangeApi,
} from '@udecode/plate';

import type { ResetNodePluginRule } from './types';

export type ResetNodeConfig = PluginConfig<
  'resetNode',
  {
    disableEditorReset?: boolean;
    disableFirstBlockReset?: boolean;
    rules?: ResetNodePluginRule[];
  }
>;

/** Enables support for resetting block type from rules. */
export const BaseResetNodePlugin = createTSlatePlugin<ResetNodeConfig>({
  key: 'resetNode',
  options: {
    rules: [],
  },
}).overrideEditor(
  ({ editor, getOptions, tf: { deleteBackward, deleteFragment } }) => ({
    transforms: {
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
          if (RangeApi.equals(selection, editor.api.range([])!)) {
            editor.tf.reset({
              children: true,
              select: true,
            });

            return true;
          }
        };

        if (!getOptions().disableEditorReset && deleteFragmentPlugin()) return;

        deleteFragment(direction);
      },
    },
  })
);
