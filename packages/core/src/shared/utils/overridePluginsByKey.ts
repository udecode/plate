import defaultsDeep from 'lodash/defaultsDeep.js';

import type { AnyPlatePlugin } from '../types/plugin/PlatePlugin';

/**
 * Recursive deep merge of each plugin from `override.plugins` into plugin with
 * same key (plugin > plugin.plugins).
 */
export const overridePluginsByKey = <P extends AnyPlatePlugin = AnyPlatePlugin>(
  plugin: P,
  overrideByKey: Record<string, Partial<AnyPlatePlugin>> = {},
  nested = false
): P => {
  if (overrideByKey[plugin.key]) {
    const {
      __extensions: pluginOverridesExtensions,
      plugins: pluginOverridesPlugins,
      ...pluginOverrides
    } = overrideByKey[plugin.key];

    // Override plugin
    plugin = defaultsDeep({}, pluginOverrides, plugin);

    // Merge __extensions
    if (pluginOverridesExtensions) {
      plugin.__extensions = [
        ...(plugin.__extensions || []),
        ...pluginOverridesExtensions,
      ];
    }
    if (!nested) {
      // Concat new pluginOverrides.plugins to plugin.plugins
      pluginOverridesPlugins?.forEach((pOverrides) => {
        if (!plugin.plugins) plugin.plugins = [];

        const found = plugin.plugins.find((p) => p.key === pOverrides.key);

        if (!found) plugin.plugins.push(pOverrides);
      });
    }
  }
  if (plugin.plugins) {
    // Override plugin.plugins
    plugin.plugins = plugin.plugins.map((p) =>
      overridePluginsByKey(p, overrideByKey, true)
    );
  }

  return plugin;
};
