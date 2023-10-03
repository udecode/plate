import { Value } from '@udecode/slate';
import defaultsDeep from 'lodash/defaultsDeep.js';

import { NoInfer } from '../types/misc/NoInfer';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, PluginOptions } from '../types/plugin/PlatePlugin';

/**
 * Recursive deep merge of each plugin from `overrideByKey`
 * into plugin with same key (plugin > plugin.plugins).
 */
export const overridePluginsByKey = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  plugin: PlatePlugin<NoInfer<P>, V, E>,
  overrideByKey: OverrideByKey<V, E> = {},
  nested = false
): PlatePlugin<NoInfer<P>, V, E> => {
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
      overridePluginsByKey<{}, V, E>(p, overrideByKey, true)
    );
  }

  const { then } = plugin;

  if (then) {
    if (plugin._thenReplaced === undefined) {
      plugin._thenReplaced = 0;
    }
    // Limit the number of times that `then` can be replaced.
    // otherwise we will accidentally create a stack overflow.
    // There is probably a better solution for this.
    if ((plugin._thenReplaced as number) < 3) {
      // override plugin.then
      plugin.then = (editor, p) => {
        const pluginThen = { key: plugin.key, ...then(editor, p) };
        return defaultsDeep(
          overridePluginsByKey(pluginThen as any, overrideByKey),
          pluginThen
        );
      };
      (plugin._thenReplaced as number)++;
    }
  } else if (overrideByKey[plugin.key]?.then) {
    // TODO: recursvie
    plugin.then = overrideByKey[plugin.key].then as any;
  }

  return plugin;
};
