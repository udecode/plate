import type { BaseEditor } from '../../lib/editor';
import type { AnyPluginTx, PluginConfig } from '../../lib/plugin/PluginConfig';
import type { AnyBasePlugin, BasePlugin } from '../../lib/plugin/BasePlugin';

import { getEditorPlugin } from '../../lib/plugin/getEditorPlugin';
import {
  freezePluginDescriptorValue,
  mergePlugins,
} from '../utils/mergePlugins';
import { withResolvingPlatePlugin } from './compilePlateModel';

const normalizeConfiguredInputRules = (config: unknown) => {
  if (config === undefined) return [];
  if (Array.isArray(config)) return [...config];

  throw new Error(
    'inputRules config must be an array of explicit rule instances.'
  );
};

/**
 * Resolves and finalizes a plugin configuration for use in a Plate editor.
 *
 * This function processes a given plugin configuration, applying any extensions
 * and resolving nested plugins. It prepares the plugin for integration into the
 * Plate editor system by:
 *
 * 1. Cloning the plugin to avoid mutating the original
 * 2. Applying all stored extensions to the plugin
 * 3. Clearing the extensions array after application
 *
 * @example
 *   const plugin = createBasePlugin({ key: 'myPlugin', ...otherOptions }).extend(...);
 *   const resolvedPlugin = resolvePlugin(editor, plugin);
 */
export const resolvePlugin = <P extends AnyBasePlugin>(
  editor: BaseEditor,
  _plugin: P
): P => {
  // Create a deep clone of the plugin
  let plugin = mergePlugins({}, _plugin) as P;

  plugin.__resolved = true;

  // Configuration layers are applied in call order. Object overlays and
  // contextual overlays deliberately share one ordered pipeline so a later
  // configure call always wins, regardless of which form it uses.
  const configurationLayers = [...plugin.__configurationLayers];

  for (const layer of configurationLayers) {
    const rawConfigResult =
      layer.kind === 'context'
        ? withResolvingPlatePlugin(editor, plugin, () =>
            layer.value(getEditorPlugin(editor, plugin))
          )
        : layer.value;
    // Copy before inspecting: descriptor snapshots and callback results can be
    // reused across editor instances.
    const { inputRules: configInputRules, ...configResult } =
      rawConfigResult as any;

    if (configInputRules !== undefined) {
      const normalizedInputRules =
        normalizeConfiguredInputRules(configInputRules);

      (plugin as any).__configuredInputRules = [
        ...normalizeConfiguredInputRules(
          (plugin as any).__configuredInputRules
        ),
        ...normalizedInputRules,
      ];
    }

    plugin = mergePlugins(plugin, configResult);
    plugin.__configurationLayers = configurationLayers;
  }
  // Apply all stored extensions
  if (plugin.__extensions && plugin.__extensions.length > 0) {
    const extensions = [...plugin.__extensions];

    for (const extension of extensions) {
      plugin = mergePlugins(
        plugin,
        withResolvingPlatePlugin(editor, plugin, () =>
          extension(getEditorPlugin(editor, plugin))
        )
      );
    }
    plugin.__extensions = extensions;
  }

  plugin.schema = freezePluginDescriptorValue(plugin.schema);
  (plugin as { targetPluginKeys: readonly string[] }).targetPluginKeys =
    Object.freeze([...plugin.targetPluginKeys]);

  (validatePlugin as any)(editor, plugin);

  return plugin;
};

export const validatePlugin = <
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
>(
  editor: BaseEditor,
  plugin: BasePlugin<PluginConfig<K, O, A, Tx, S>>
) => {
  if (!plugin.__extensions) {
    editor.api.debug.error(
      `Invalid plugin '${plugin.key}', you should use createBasePlugin.`,
      'USE_CREATE_PLUGIN'
    );
  }
};
