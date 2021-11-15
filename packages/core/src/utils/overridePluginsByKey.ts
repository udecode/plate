import defaultsDeep from 'lodash/defaultsDeep';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';

/**
 * Recursive deep merge of each plugin from `overridesByKey`
 * into plugin with same key (plugin > plugin.plugins).
 */
export const overridePluginsByKey = <T = {}, P = {}>(
  plugin: PlatePlugin<T, P>,
  overridesByKey: Record<string, Partial<PlatePlugin<T>>> = {}
): PlatePlugin<T, P> => {
  // override plugin
  if (overridesByKey[plugin.key]) {
    plugin = defaultsDeep(overridesByKey[plugin.key], plugin);
  }

  // overrides plugin.plugins
  plugin.plugins?.forEach((p, i) => {
    // override plugin.plugins[i]
    plugin.plugins![i] = overridePluginsByKey(p, overridesByKey);
  });

  const { then } = plugin;

  if (then) {
    // override plugin.then
    plugin.then = (editor, p) => {
      const pluginThen = then(editor, p);

      return defaultsDeep(
        overridePluginsByKey(pluginThen as any, overridesByKey),
        pluginThen
      );
    };
  }

  return plugin;
};
