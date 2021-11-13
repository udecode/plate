import defaultsDeep from 'lodash/defaultsDeep';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';

/**
 * Recursive deep merge of each plugin from `pluginsByKey`
 * into plugin with same key (plugin, plugin.plugins).
 */
export const mergePluginsByKey = <T = {}, P = {}>(
  plugin: PlatePlugin<T, P>,
  pluginsByKey: Record<string, Partial<PlatePlugin<T>>> = {}
) => {
  if (pluginsByKey[plugin.key]) {
    plugin = defaultsDeep(pluginsByKey[plugin.key], plugin);
  }

  plugin.plugins?.forEach((p, i) => {
    if (pluginsByKey[p.key]) {
      plugin.plugins![i] = defaultsDeep(pluginsByKey[p.key], p);
    }
    mergePluginsByKey(p, pluginsByKey);
  });

  return plugin;
};
