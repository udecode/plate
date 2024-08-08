import merge from 'lodash/merge.js';

import type { PlateEditor } from '../types/PlateEditor';
import type { AnyPlatePlugin, PlatePlugin } from '../types/plugin/PlatePlugin';

/**
 * Resolves and finalizes a plugin configuration for use in a Plate editor.
 *
 * This function processes a given plugin configuration, applying any extensions
 * and resolving nested plugins. It prepares the plugin for integration into the
 * Plate editor system by:
 *
 * 1. Applying all stored extensions to the plugin
 * 2. Recursively resolving any nested plugins
 * 3. Clearing the extensions array after application
 *
 * @example
 *   const plugin = createPlugin({ key: 'myPlugin', ...otherOptions }).extend(...);
 *   const resolvedPlugin = resolvePlugin(editor, plugin);
 */
export const resolvePlugin = <P extends AnyPlatePlugin>(
  editor: PlateEditor,
  _plugin: P
): P => {
  let plugin = { ..._plugin };

  if (plugin.__extensions && plugin.__extensions.length > 0) {
    plugin.__extensions.forEach((extension) => {
      plugin = merge({}, plugin, extension({ editor, plugin }));
    });
    plugin.__extensions = [];
  }
  if (plugin.plugins) {
    plugin.plugins = plugin.plugins.map((p) => resolvePlugin(editor, p));
  }

  const validPluginToInjectPlugin =
    plugin.inject?.props?.validPluginToInjectPlugin;
  const validPlugins = plugin.inject?.props?.validPlugins;

  if (validPluginToInjectPlugin && validPlugins && validPlugins.length > 0) {
    plugin.inject = plugin.inject || {};
    plugin.inject.pluginsByKey = merge(
      {},
      plugin.inject.pluginsByKey,
      Object.fromEntries(
        validPlugins.map((validPlugin) => {
          const injectedPlugin = validPluginToInjectPlugin({
            editor,
            plugin: plugin as any,
            validPlugin,
          });

          return [validPlugin, injectedPlugin];
        })
      )
    );
  }
  if (plugin.plugins) {
    plugin.plugins = plugin.plugins.map((p) => resolvePlugin(editor, p));
  }

  validatePlugin(plugin);

  return plugin;
};

export const validatePlugin = <
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
>(
  plugin: PlatePlugin<K, O, A, T, S>
) => {
  if (!plugin.__extensions) {
    throw new Error(
      `Invalid plugin '${plugin.key}', you should use createPlugin.`
    );
  }
  if (plugin.isElement && plugin.isLeaf) {
    throw new Error(
      `Plugin ${plugin.key} cannot be both an element and a leaf.`
    );
  }
};
