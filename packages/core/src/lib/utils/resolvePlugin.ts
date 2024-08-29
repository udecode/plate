import type { SlateEditor } from '../editor';
import type { PluginConfig } from '../plugin/BasePlugin';
import type { AnySlatePlugin, SlatePlugin } from '../plugin/SlatePlugin';

import { mergeWithoutArray } from '../../internal/mergeWithoutArray';
import { createSlatePlugin, getEditorPlugin } from '../plugin';

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
 *   const plugin = createSlatePlugin({ key: 'myPlugin', ...otherOptions }).extend(...);
 *   const resolvedPlugin = resolvePlugin(editor, plugin);
 */
export const resolvePlugin = <P extends AnySlatePlugin>(
  editor: SlateEditor,
  _plugin: P
): P => {
  // Create a deep clone of the plugin
  let plugin = createSlatePlugin(_plugin) as P;

  plugin.__resolved = true;

  // Apply the stored configuration first
  if (plugin.__configuration) {
    const configResult = plugin.__configuration(
      getEditorPlugin(editor, plugin as any)
    );

    plugin = mergeWithoutArray({}, plugin, configResult);

    delete (plugin as any).__configuration;
  }
  // Apply all stored extensions
  if (plugin.__extensions && plugin.__extensions.length > 0) {
    plugin.__extensions.forEach((extension) => {
      plugin = mergeWithoutArray(
        {},
        plugin,
        extension(getEditorPlugin(editor, plugin as any))
      );
    });
    plugin.__extensions = [];
  }
  if (plugin.plugins) {
    plugin.plugins = plugin.plugins.map((p) => resolvePlugin(editor, p));
  }

  const targetPluginToInject = plugin.inject?.targetPluginToInject;
  const targetPlugins = plugin.inject?.targetPlugins;

  if (targetPluginToInject && targetPlugins && targetPlugins.length > 0) {
    plugin.inject = plugin.inject || {};
    plugin.inject.plugins = mergeWithoutArray(
      {},
      plugin.inject.plugins,
      Object.fromEntries(
        targetPlugins.map((targetPlugin) => {
          const injectedPlugin = targetPluginToInject({
            ...getEditorPlugin(editor, plugin as any),
            targetPlugin,
          });

          return [targetPlugin, injectedPlugin];
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
  editor: SlateEditor,
  plugin: SlatePlugin<PluginConfig<K, O, A, T>>
) => {
  if (!plugin.__extensions) {
    editor.api.debug.error(
      `Invalid plugin '${plugin.key}', you should use createSlatePlugin.`,
      'USE_CREATE_PLUGIN'
    );
  }
  if (plugin.node.isElement && plugin.node.isLeaf) {
    editor.api.debug.error(
      `Plugin ${plugin.key} cannot be both an element and a leaf.`,
      'PLUGIN_NODE_TYPE'
    );
  }
};
