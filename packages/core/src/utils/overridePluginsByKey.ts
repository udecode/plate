import defaultsDeep from 'lodash/defaultsDeep';
import { NoInfer } from '../common/types/utility/NoInfer';
import { Value } from '../slate/types/TEditor';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';

/**
 * Recursive deep merge of each plugin from `overrideByKey`
 * into plugin with same key (plugin > plugin.plugins).
 */
export const overridePluginsByKey = <V extends Value, T = {}, P = {}>(
  plugin: PlatePlugin<V, T, NoInfer<P>>,
  overrideByKey: OverrideByKey<V, T> = {},
  nested?: boolean
): PlatePlugin<V, T, NoInfer<P>> => {
  if (overrideByKey[plugin.key]) {
    const {
      plugins: pluginOverridesPlugins,
      then: pluginOverridesThen,
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
      overridePluginsByKey<V, T, {}>(p, overrideByKey, true)
    );
  }

  const { then } = plugin;

  if (then) {
    // override plugin.then
    plugin.then = (editor, p) => {
      const pluginThen = { key: plugin.key, ...then(editor, p) };

      return defaultsDeep(
        overridePluginsByKey(pluginThen as any, overrideByKey),
        pluginThen
      );
    };
  } else if (overrideByKey[plugin.key]?.then) {
    // TODO: recursvie
    plugin.then = overrideByKey[plugin.key].then as any;
  }

  return plugin;
};
