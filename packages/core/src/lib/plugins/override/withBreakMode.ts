import type { OverrideEditor } from '../../plugin';
import type { BreakMode } from '../../plugin/BasePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withBreakMode: OverrideEditor = (ctx) => {
  const {
    editor,
    tf: { insertBreak },
  } = ctx;
  const checkMatchModeOverride = (
    mode: string,
    blockNode: any,
    blockPath: any
  ): BreakMode | null => {
    const matchModeKeys = editor.meta.pluginKeys.node.matchMode;
    for (const key of matchModeKeys) {
      const overridePlugin = editor.getPlugin({ key }).node;
      if (
        overridePlugin.breakMode &&
        overridePlugin.matchMode?.({
          ...ctx,
          mode: mode as any,
          node: blockNode,
          path: blockPath,
        })
      ) {
        return overridePlugin.breakMode;
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

            const breakMode = plugin?.node.breakMode;

            // Handle 'empty' scenario
            if (
              editor.api.isEmpty(editor.selection, {
                block: true,
              })
            ) {
              const overrideBreakMode = checkMatchModeOverride(
                'break.empty',
                blockNode,
                blockPath
              );
              const effectiveBreakMode = overrideBreakMode || breakMode;
              const emptyAction = effectiveBreakMode?.empty;

              if (executeBreakAction(emptyAction, blockPath)) return;
              // if 'default', fall through to breakMode.default or standard behavior
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
                  const overrideBreakMode = checkMatchModeOverride(
                    'break.emptyLineEnd',
                    blockNode,
                    blockPath
                  );
                  const effectiveBreakMode = overrideBreakMode || breakMode;
                  const emptyLineEndAction = effectiveBreakMode?.emptyLineEnd;

                  if (executeBreakAction(emptyLineEndAction, blockPath)) return;
                }
              }
            }

            // Handle 'default' scenario (or fallthrough from 'empty: default' or 'emptyLineEnd: default')
            const overrideBreakMode = checkMatchModeOverride(
              'break.default',
              blockNode,
              blockPath
            );
            const effectiveBreakMode = overrideBreakMode || breakMode;
            const defaultAction = effectiveBreakMode?.default;

            if (executeBreakAction(defaultAction, blockPath)) return;
            // if 'default', fall through to standard Slate insertBreak
          }
        }

        // Standard Slate insertBreak if no custom breakMode handled it
        insertBreak();
      },
    },
  };
};
