import { ElementApi } from '@udecode/slate';

import type { NormalizeRules } from '../../plugin/BasePlugin';
import type { OverrideEditor } from '../../plugin/SlatePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withNormalizeRules: OverrideEditor = (ctx) => {
  const {
    editor,
    tf: { normalizeNode },
  } = ctx;

  const checkMatchRulesOverride = (
    rule: string,
    node: any,
    path: any
  ): NormalizeRules | null => {
    const matchRulesKeys = editor.meta.pluginCache.node.matchRules;
    for (const key of matchRulesKeys) {
      const overridePlugin = editor.getPlugin({ key }).node;
      if (
        overridePlugin.normalizeRules &&
        overridePlugin.matchRules?.({
          ...ctx,
          node,
          path,
          rule: rule as any,
        })
      ) {
        return overridePlugin.normalizeRules;
      }
    }
    return null;
  };

  return {
    transforms: {
      normalizeNode([node, path]) {
        if (ElementApi.isElement(node) && node.type) {
          const plugin = getPluginByType(editor, node.type);
          const normalizeRules = plugin?.node.normalizeRules;

          // Handle 'removeEmpty' scenario
          const overridenormalizeRules = checkMatchRulesOverride(
            'normalize.removeEmpty',
            node,
            path
          );
          const effectivenormalizeRules =
            overridenormalizeRules || normalizeRules;

          if (
            effectivenormalizeRules?.removeEmpty &&
            editor.api.isEmpty(node)
          ) {
            editor.tf.removeNodes({ at: path });
            return;
          }
        }

        normalizeNode([node, path]);
      },
    },
  };
};
