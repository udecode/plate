import merge from 'lodash/merge';

import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { isFunction } from './misc';

function resolvePluginExtend(
  plugin: PlatePlugin,
  extendConfig:
    | ((editor: PlateEditor, plugin: PlatePlugin) => Partial<PlatePlugin>)
    | Partial<PlatePlugin>
): PlatePlugin {
  return isFunction(extendConfig)
    ? merge({}, plugin, extendConfig({} as PlateEditor, plugin))
    : merge({}, plugin, extendConfig);
}

/**
 * Resolves and finalizes a plugin configuration for use in a Plate editor.
 *
 * This function processes a given plugin configuration, applying any
 * extensions, resolving nested plugins, and merging configurations as
 * necessary. It prepares the plugin for integration into the Plate editor
 * system.
 *
 * The function handles:
 *
 * - Applying plugin extensions (via the `__extend` property)
 * - Resolving and merging nested plugins
 * - Ensuring all plugin properties are properly set and ready for use
 *
 * @example
 *   const plugin = createPlugin({ key: 'myPlugin', ...otherOptions }).extend(...);
 *   const resolvedPlugin = resolvePlugin(editor, plugin);
 */
export const resolvePlugin = <O = {}, T = {}, Q = {}, S = {}>(
  editor: PlateEditor,
  _plugin: PlatePlugin<O, T, Q, S>
): PlatePlugin<O, T, Q, S> => {
  let plugin = { ..._plugin };

  if (plugin.__extensions) {
    plugin.__extensions.forEach((extension) => {
      plugin = resolvePluginExtend(plugin as any, extension) as any;
    });
    plugin.__extensions = [];
  }
  if (plugin.plugins) {
    plugin.plugins = plugin.plugins.map((p) => resolvePlugin(editor, p));
  }

  return plugin;
};
