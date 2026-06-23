import { ElementApi } from '@platejs/plite';

import type { LegacyTransformOverride } from '../../../../internal/plugin/withLegacyTransformOverride';
import type { NormalizeRules } from '../../../plugin/BasePlugin';

import { getPluginByType } from '../../../plugin/getEditorPluginInstance';

export const withNormalizeRules: LegacyTransformOverride = (ctx) => {
  const { editor, tf } = ctx;
  const { normalizeNode } = tf;

  const checkMatchRulesOverride = (
    rule: string,
    node: any,
    path: any
  ): NormalizeRules | null => {
    const matchRulesKeys = editor.meta.pluginCache.rules.match;
    for (const key of matchRulesKeys) {
      const overridePlugin = editor.getPlugin({ key });
      if (
        overridePlugin.rules?.normalize &&
        overridePlugin.rules?.match?.({
          ...ctx,
          node,
          path,
          rule: rule as any,
        })
      ) {
        return overridePlugin.rules.normalize;
      }
    }
    return null;
  };

  return {
    tf: {
      normalizeNode([node, path]: [any, any]) {
        if (ElementApi.isElement(node) && node.type) {
          const plugin = getPluginByType(editor, node.type);
          const normalizeRules = plugin?.rules.normalize;

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
            editor.api.string(path).length === 0
          ) {
            tf.removeNodes({ at: path });
            return;
          }
        }

        normalizeNode([node, path]);
      },
    },
  };
};
