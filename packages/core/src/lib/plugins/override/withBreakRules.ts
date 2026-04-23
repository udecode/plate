import { PathApi } from '@platejs/slate';

import type { OverrideEditor } from '../../plugin';

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
  ) => {
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
        return overridePlugin;
      }
    }
    return null;
  };

  const executeBreakAction = (
    action: string | undefined,
    blockPath: any,
    type: string | undefined
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
    if (action === 'lift' && type) {
      return !!editor.tf.liftBlock({
        at: blockPath,
        match: { type },
      });
    }
    return false;
  };

  return {
    transforms: {
      insertBreak() {
        if (editor.selection) {
          const block = editor.api.block();
          if (block) {
            const [blockNode, blockPath] = block;
            const plugin = getPluginByType(editor, blockNode.type);

            const breakRules = plugin?.rules.break;

            // Handle 'empty' scenario
            if (
              editor.api.isCollapsed() &&
              editor.api.isEmpty(editor.selection, {
                block: true,
              })
            ) {
              const overridePlugin = checkMatchRulesOverride(
                'break.empty',
                blockNode,
                blockPath
              );
              const effectiveBreakRules =
                overridePlugin?.rules.break ?? breakRules;
              const emptyAction = effectiveBreakRules?.empty;
              const actionType = overridePlugin?.node.type;

              if (executeBreakAction(emptyAction, blockPath, actionType))
                return;
              // if 'default', fall through to breakRules.default or standard behavior
            }

            // Handle 'emptyLineEnd' scenario
            if (
              editor.api.isCollapsed() &&
              !editor.api.isEmpty(editor.selection, {
                block: true,
              }) &&
              editor.api.isAt({ end: true })
            ) {
              const range = editor.api.range('before', editor.selection!);
              if (range) {
                const char = editor.api.string(range);
                if (char === '\n') {
                  const overridePlugin = checkMatchRulesOverride(
                    'break.emptyLineEnd',
                    blockNode,
                    blockPath
                  );
                  const effectiveBreakRules =
                    overridePlugin?.rules.break ?? breakRules;
                  const emptyLineEndAction = effectiveBreakRules?.emptyLineEnd;
                  const actionType = overridePlugin?.node.type;

                  if (
                    executeBreakAction(
                      emptyLineEndAction,
                      blockPath,
                      actionType
                    )
                  ) {
                    return;
                  }
                }
              }
            }

            // Handle 'default' scenario (or fallthrough from 'empty: default' or 'emptyLineEnd: default')
            const overrideDefaultPlugin = checkMatchRulesOverride(
              'break.default',
              blockNode,
              blockPath
            );
            const defaultAction = (
              overrideDefaultPlugin?.rules.break ?? breakRules
            )?.default;
            const defaultActionType = overrideDefaultPlugin?.node.type;

            if (
              executeBreakAction(defaultAction, blockPath, defaultActionType)
            ) {
              return;
            }

            const overrideSplitResetPlugin = checkMatchRulesOverride(
              'break.splitReset',
              blockNode,
              blockPath
            );
            const splitReset =
              overrideSplitResetPlugin?.rules.break?.splitReset ??
              breakRules?.splitReset;

            if (splitReset && !editor.api.isAt({ blocks: true })) {
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
