import defaultsDeep from 'lodash/defaultsDeep';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { NoInfer } from '../types/utility/NoInfer';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Create plugin factory with a default plugin.
 * The plugin factory:
 * - first param can be used to (deeply) override the default plugin.
 * - second param can be used to (deeply) override a nested plugin (plugin.plugins) by key.
 */
export const createPluginFactory = <P = {}>(
  defaultPlugin: PlatePlugin<{}, NoInfer<P>>
) => <T = {}>(
  overrides?: Partial<PlatePlugin<T, NoInfer<P>>>,
  overridesByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>
): PlatePlugin<T, NoInfer<P>> => {
  let plugin: PlatePlugin<T, P> = defaultsDeep(overrides, defaultPlugin);

  if (overridesByKey) {
    plugin = overridePluginsByKey(plugin, overridesByKey);
  }

  return plugin;
};
