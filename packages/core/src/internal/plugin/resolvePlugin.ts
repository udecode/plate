import type { BaseEditor } from '../../lib/editor';
import type { AnyPluginTx, PluginConfig } from '../../lib/plugin/PluginConfig';
import type { AnyBasePlugin, BasePlugin } from '../../lib/plugin/BasePlugin';

import { getEditorPlugin } from '../../lib/plugin/getEditorPlugin';
import {
  freezePluginDescriptorValue,
  mergePlugins,
} from '../utils/mergePlugins';
import { withResolvingPlatePlugin } from './compilePlateModel';

const assertConfiguredInputRules = (config: unknown) => {
  if (
    config === undefined ||
    typeof config === 'function' ||
    Array.isArray(config)
  ) {
    return;
  }

  throw new Error(
    'inputRules config must be an array of explicit rule instances or a factory.'
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
 * 2. Resolving the stored consumer configuration once
 * 3. Applying extensions against the configured values
 * 4. Reapplying the captured consumer values as the final override
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

  // A direct descriptor contributes at most one terminal consumer
  // configuration. Nested configurePlugin overlays share this internal list.
  // Capture every result so contextual callbacks execute only once per editor.
  const configurationLayers = [...plugin.__configurationLayers];
  const resolvedConfigurations: Record<PropertyKey, unknown>[] = [];

  for (const layer of configurationLayers) {
    const rawConfigResult =
      layer.kind === 'context'
        ? withResolvingPlatePlugin(editor, plugin, () =>
            layer.value(getEditorPlugin(editor, plugin))
          )
        : layer.value;
    // Copy before merging: descriptor snapshots and callback results can be
    // reused across editor instances.
    const configResult = {
      ...rawConfigResult,
    } as Record<PropertyKey, unknown>;

    if (Object.hasOwn(configResult, 'inputRules')) {
      assertConfiguredInputRules(configResult.inputRules);
    }

    plugin = mergePlugins(plugin, configResult);
    plugin.__configurationLayers = configurationLayers;
    resolvedConfigurations.push(configResult);
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
  // Extensions read configured values, but the consumer configuration remains
  // the final override for fields that both layers define.
  for (const configuration of resolvedConfigurations) {
    plugin = mergePlugins(plugin, configuration);
    plugin.__configurationLayers = configurationLayers;
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
