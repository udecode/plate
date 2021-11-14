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
export const createPluginFactory = <TPlugin = {}>(
  defaultPlugin: PlatePlugin<{}, NoInfer<TPlugin>>
) => <TEditor = {}>(
  overrides?: Partial<PlatePlugin<TEditor, NoInfer<TPlugin>>>,
  overridesByKey?: Record<PluginKey, Partial<PlatePlugin<TEditor>>>
): PlatePlugin<TEditor, NoInfer<TPlugin>> => {
  let plugin: PlatePlugin<TEditor, TPlugin> = defaultsDeep(
    overrides,
    defaultPlugin
  );

  if (overridesByKey) {
    plugin = overridePluginsByKey(plugin, overridesByKey);
  }

  return plugin;
};
