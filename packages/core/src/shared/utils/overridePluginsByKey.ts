import defaultsDeep from 'lodash/defaultsDeep.js';

import type { NoInfer } from '../types/misc/NoInfer';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { callOrReturn } from './misc/callOrReturn';

/**
 * Recursive deep merge of each plugin from `overrideByKey` into plugin with
 * same key (plugin > plugin.plugins).
 */
export const overridePluginsByKey = <O = {}, T = {}, Q = {}, S = {}>(
  plugin: PlatePlugin<NoInfer<O>, NoInfer<T>, NoInfer<Q>, NoInfer<S>>,
  overrideByKey: Record<string, Partial<PlatePlugin<any, any, any, any>>> = {},
  nested = false
): PlatePlugin<NoInfer<O>, NoInfer<T>, NoInfer<Q>, NoInfer<S>> => {
  if (overrideByKey[plugin.key]) {
    const {
      __extend: pluginOverridesExtend,
      plugins: pluginOverridesPlugins,
      ...pluginOverrides
    } = overrideByKey[plugin.key];

    // override plugin
    plugin = defaultsDeep(pluginOverrides, plugin);

    if (!nested) {
      // concat new pluginOverrides.plugins to plugin.plugins
      pluginOverridesPlugins?.forEach((pOverrides) => {
        if (!plugin.plugins) plugin.plugins = [];

        const found = plugin.plugins.find((p) => p.key === pOverrides.key);

        if (!found) plugin.plugins.push(pOverrides);
      });
    }
  }
  if (plugin.plugins) {
    // override plugin.plugins
    plugin.plugins = plugin.plugins.map((p) =>
      overridePluginsByKey(p, overrideByKey, true)
    );
  }

  const { __extend } = plugin;

  if (__extend) {
    if (plugin.__extendCount === undefined) {
      plugin.__extendCount = 0;
    }
    // Limit the number of times that `__extend` can be replaced.
    // otherwise we will accidentally create a stack overflow.
    // There is probably a better solution for this.
    if ((plugin.__extendCount as number) < 10) {
      // override plugin.__extend
      plugin.__extend = (editor, p) => {
        const pluginExtend = {
          key: plugin.key,
          ...callOrReturn(__extend, editor, p),
        };

        return defaultsDeep(
          overridePluginsByKey(pluginExtend as any, overrideByKey),
          pluginExtend
        );
      };
      (plugin.__extendCount as number)++;
    }
  } else if (overrideByKey[plugin.key]?.__extend) {
    // TODO: recursive
    plugin.__extend = overrideByKey[plugin.key].__extend as any;
  }

  return plugin;
};
