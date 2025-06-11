import { PointApi, RangeApi } from '@platejs/slate';

import type { OverrideEditor } from '../../plugin';
import type { DeleteRules } from '../../plugin/BasePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withDeleteRules: OverrideEditor = (ctx) => {
  const {
    editor,
    tf: { deleteBackward, deleteForward, deleteFragment },
  } = ctx;

  const resetMarks = () => {
    if (editor.api.isAt({ start: true })) {
      editor.tf.removeMarks();
    }
  };

  const checkMatchRulesOverride = (
    rule: string,
    blockNode: any,
    blockPath: any
  ): DeleteRules | null => {
    const matchRulesKeys = editor.meta.pluginCache.rules.match;
    for (const key of matchRulesKeys) {
      const overridePlugin = editor.getPlugin({ key });
      if (
        overridePlugin.rules?.delete &&
        overridePlugin.rules?.match?.({
          ...ctx,
          node: blockNode,
          path: blockPath,
          rule: rule as any,
        })
      ) {
        return overridePlugin.rules.delete;
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

            const deleteRules = plugin?.rules.delete;

            // Handle 'start' scenario
            if (editor.api.isAt({ start: true })) {
              const overrideDeleteRules = checkMatchRulesOverride(
                'delete.start',
                blockNode,
                blockPath
              );
              const effectiveDeleteRules = overrideDeleteRules || deleteRules;
              const startAction = effectiveDeleteRules?.start;

              if (executeDeleteAction(startAction, blockPath)) {
                return;
              }
            }

            // Handle 'empty' scenario
            if (editor.api.isEmpty(editor.selection, { block: true })) {
              const overrideDeleteRules = checkMatchRulesOverride(
                'delete.empty',
                blockNode,
                blockPath
              );
              const effectiveDeleteRules = overrideDeleteRules || deleteRules;
              const emptyAction = effectiveDeleteRules?.empty;

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
