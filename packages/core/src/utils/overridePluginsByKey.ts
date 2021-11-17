import defaultsDeep from 'lodash/defaultsDeep';
import { OverridesByKey } from '../types/OverridesByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';

/**
 * Recursive deep merge of each plugin from `overridesByKey`
 * into plugin with same key (plugin > plugin.plugins).
 */
export const overridePluginsByKey = <T = {}, P = {}>(
  plugin: PlatePlugin<T, NoInfer<P>>,
  overridesByKey: OverridesByKey<T, NoInfer<P>> = {},
  nested?: boolean
): PlatePlugin<T, NoInfer<P>> => {
  if (overridesByKey[plugin.key]) {
    const {
      plugins: pluginOverridesPlugins,
      then: pluginOverridesThen,
      ...pluginOverrides
    } = overridesByKey[plugin.key];

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

  // overrides plugin.plugins
  plugin.plugins?.forEach((p, i) => {
    plugin.plugins![i] = overridePluginsByKey<T, {}>(p, overridesByKey, true);
  });

  const { then } = plugin;

  if (then) {
    // override plugin.then
    plugin.then = (editor, p) => {
      const pluginThen = { key: plugin.key, ...then(editor, p) };

      return defaultsDeep(
        overridePluginsByKey(pluginThen as any, overridesByKey),
        pluginThen
      );
    };
  }

  return plugin;
};
