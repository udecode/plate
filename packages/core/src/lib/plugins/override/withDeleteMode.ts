import { PointApi, RangeApi } from '@udecode/slate';

import type { OverrideEditor } from '../../plugin';
import type { DeleteMode } from '../../plugin/BasePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withDeleteMode: OverrideEditor = (ctx) => {
  const {
    editor,
    tf: { deleteBackward, deleteForward, deleteFragment },
  } = ctx;

  const resetMarks = () => {
    if (editor.api.isAt({ start: true })) {
      editor.tf.removeMarks();
    }
  };

  const checkMatchModeOverride = (
    mode: string,
    blockNode: any,
    blockPath: any
  ): DeleteMode | null => {
    const matchModeKeys = editor.meta.pluginKeys.node.matchMode;
    for (const key of matchModeKeys) {
      const overridePlugin = editor.getPlugin({ key }).node;
      if (
        overridePlugin.deleteMode &&
        overridePlugin.matchMode?.({
          ...ctx,
          mode: mode as any,
          node: blockNode,
          path: blockPath,
        })
      ) {
        return overridePlugin.deleteMode;
      }
    }
    return null;
  };

  const executeDeleteAction = (
    action: string | undefined,
    blockPath: any
  ): boolean => {
    if (action === 'reset') {
      editor.tf.resetBlock({ at: blockPath });
      return true;
    }
    return false;
  };

  return {
    transforms: {
      deleteBackward(unit) {
        if (editor.selection && editor.api.isCollapsed()) {
          const block = editor.api.block();
          if (block) {
            const [blockNode, blockPath] = block;
            const plugin = getPluginByType(editor, blockNode.type);

            const deleteMode = plugin?.node.deleteMode;

            // Handle 'start' scenario
            if (editor.api.isAt({ start: true })) {
              const overrideDeleteMode = checkMatchModeOverride(
                'delete.start',
                blockNode,
                blockPath
              );
              const effectiveDeleteMode = overrideDeleteMode || deleteMode;
              const startAction = effectiveDeleteMode?.start;

              if (executeDeleteAction(startAction, blockPath)) {
                return;
              }
            }

            // Handle 'empty' scenario
            if (editor.api.isEmpty(editor.selection, { block: true })) {
              const overrideDeleteMode = checkMatchModeOverride(
                'delete.empty',
                blockNode,
                blockPath
              );
              const effectiveDeleteMode = overrideDeleteMode || deleteMode;
              const emptyAction = effectiveDeleteMode?.empty;

              if (executeDeleteAction(emptyAction, blockPath)) return;
            }
          }

          // Default behavior: reset first block when deleting at start of the document
          if (
            PointApi.equals(editor.selection!.anchor, editor.api.start([])!)
          ) {
            editor.tf.resetBlock({ at: [0] });
            return;
          }
        }

        deleteBackward(unit);
        resetMarks();
      },
      deleteForward(unit) {
        deleteForward(unit);
        resetMarks();
      },
      deleteFragment(options) {
        // Default behavior: reset entire editor when deleting full selection
        if (
          editor.selection &&
          RangeApi.equals(editor.selection, editor.api.range([])!)
        ) {
          editor.tf.reset({
            children: true,
            select: true,
          });
          return;
        }

        deleteFragment(options);
        resetMarks();
      },
    },
  };
};
