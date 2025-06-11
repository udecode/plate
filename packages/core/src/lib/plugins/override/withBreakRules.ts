import { PathApi } from '@udecode/slate';

import type { OverrideEditor } from '../../plugin';
import type { BreakRules } from '../../plugin/BasePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withBreakRules: OverrideEditor = (ctx) => {
  const {
    editor,
    tf: { insertBreak },
  } = ctx;
  const checkMatchRulesOverride = (
    rule: string,
    blockNode: any,
    blockPath: any
  ): BreakRules | null => {
    const matchRulesKeys = editor.meta.pluginCache.rules.match;
    for (const key of matchRulesKeys) {
      const overridePlugin = editor.getPlugin({ key });
      if (
        overridePlugin.rules?.break &&
        overridePlugin.rules?.match?.({
          ...ctx,
          node: blockNode,
          path: blockPath,
          rule: rule as any,
        })
      ) {
        return overridePlugin.rules.break;
      }
    }
    return null;
  };

  const executeBreakAction = (
    action: string | undefined,
    blockPath: any
  ): boolean => {
    if (action === 'reset') {
      editor.tf.resetBlock({ at: blockPath });
      return true;
    }
    if (action === 'exit') {
      editor.tf.insertExitBreak();
      return true;
    }
    if (action === 'deleteExit') {
      editor.tf.deleteBackward('character');
      editor.tf.insertExitBreak();
      return true;
    }
    if (action === 'lineBreak') {
      editor.tf.insertSoftBreak();
      return true;
    }
    return false;
  };

  return {
    transforms: {
      insertBreak() {
        if (editor.selection && editor.api.isCollapsed()) {
          const block = editor.api.block();
          if (block) {
            const [blockNode, blockPath] = block;
            const plugin = getPluginByType(editor, blockNode.type);

            const breakRules = plugin?.rules.break;

            // Handle 'empty' scenario
            if (
              editor.api.isEmpty(editor.selection, {
                block: true,
              })
            ) {
              const overrideBreakRules = checkMatchRulesOverride(
                'break.empty',
                blockNode,
                blockPath
              );
              const effectiveBreakRules = overrideBreakRules || breakRules;
              const emptyAction = effectiveBreakRules?.empty;

              if (executeBreakAction(emptyAction, blockPath)) return;
              // if 'default', fall through to breakRules.default or standard behavior
            }

            // Handle 'emptyLineEnd' scenario
            if (
              !editor.api.isEmpty(editor.selection, {
                block: true,
              }) &&
              editor.api.isAt({ end: true })
            ) {
              const range = editor.api.range('before', editor.selection!);
              if (range) {
                const char = editor.api.string(range);
                if (char === '\n') {
                  const overrideBreakRules = checkMatchRulesOverride(
                    'break.emptyLineEnd',
                    blockNode,
                    blockPath
                  );
                  const effectiveBreakRules = overrideBreakRules || breakRules;
                  const emptyLineEndAction = effectiveBreakRules?.emptyLineEnd;

                  if (executeBreakAction(emptyLineEndAction, blockPath)) return;
                }
              }
            }

            // Handle 'default' scenario (or fallthrough from 'empty: default' or 'emptyLineEnd: default')
            const overrideDefaultBreakRules = checkMatchRulesOverride(
              'break.default',
              blockNode,
              blockPath
            );
            const defaultAction = (overrideDefaultBreakRules || breakRules)
              ?.default;

            if (executeBreakAction(defaultAction, blockPath)) return;

            const overrideSplitResetBreakRules = checkMatchRulesOverride(
              'break.splitReset',
              blockNode,
              blockPath
            );
            const splitReset =
              overrideSplitResetBreakRules?.splitReset ??
              breakRules?.splitReset;

            if (splitReset) {
              const isAtStart = editor.api.isAt({ start: true });

              insertBreak();

              editor.tf.resetBlock({
                at: isAtStart ? blockPath : PathApi.next(blockPath),
              });
              return;
            }
          }
        }

        // Standard Slate insertBreak if no custom breakRules handled it
        insertBreak();
      },
    },
  };
};
