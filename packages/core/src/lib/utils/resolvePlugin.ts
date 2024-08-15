import merge from 'lodash/merge.js';

import type { PlateEditor } from '../editor';
import type {
  AnyPlatePlugin,
  PlatePlugin,
  PluginConfig,
} from '../plugin/types/PlatePlugin';

import { getPluginContext } from '../plugin';

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

  // Apply the stored configuration first
  if (plugin.__configuration) {
    const configResult = plugin.__configuration(
      getPluginContext(editor, plugin)
    );
    plugin = merge({}, plugin, configResult);
    delete (plugin as any).__configuration;
  }
  // Apply all stored extensions
  if (plugin.__extensions && plugin.__extensions.length > 0) {
    plugin.__extensions.forEach((extension) => {
      plugin = merge({}, plugin, extension(getPluginContext(editor, plugin)));
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
    plugin.inject.plugins = merge(
      {},
      plugin.inject.plugins,
      Object.fromEntries(
        validPlugins.map((validPlugin) => {
          const injectedPlugin = validPluginToInjectPlugin({
            ...getPluginContext(editor, plugin),
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

  validatePlugin(editor, plugin);

  return plugin;
};

export const validatePlugin = <K extends string = any, O = {}, A = {}, T = {}>(
  editor: PlateEditor,
  plugin: PlatePlugin<PluginConfig<K, O, A, T>>
) => {
  if (!plugin.__extensions) {
    editor.api.debug.error(
      `Invalid plugin '${plugin.key}', you should use createPlugin.`,
      'USE_CREATE_PLUGIN'
    );
  }
  if (plugin.isElement && plugin.isLeaf) {
    editor.api.debug.error(
      `Plugin ${plugin.key} cannot be both an element and a leaf.`,
      'PLUGIN_NODE_TYPE'
    );
  }
};
