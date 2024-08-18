import { isDefined } from '@udecode/utils';

import type { SlateEditor } from '../editor';

import { mergeWithoutArray } from '../../internal/mergeWithoutArray';
import {
  type SlatePlugin,
  type SlatePlugins,
  getSlatePluginContext,
} from '../plugin';
import { resolvePlugin } from './resolvePlugin';

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export const resolvePlugins = (
  editor: SlateEditor,
  plugins: SlatePlugins = []
) => {
  editor.pluginList = [];
  editor.plugins = {};
  editor.api = {} as any;
  editor.transforms = {} as any;

  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);

  mergePlugins(editor, resolvedPlugins);

  applyPluginOverrides(editor);

  mergePluginApis(editor);

  // withOverrides
  editor.pluginList.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides(
        getSlatePluginContext(editor, plugin)
      ) as any;
    }
  });

  return editor;
};

const mergePluginApis = (editor: SlateEditor) => {
  editor.pluginList.forEach((plugin) => {
    Object.entries(plugin.api).forEach(([apiKey, apiFunction]) => {
      (editor.api as any)[apiKey] = apiFunction;
    });
  });

  (editor.pluginList as SlatePlugin[]).forEach((plugin) => {
    // Apply api extensions
    if (plugin.__apiExtensions && plugin.__apiExtensions.length > 0) {
      plugin.__apiExtensions.forEach((methodExtension) => {
        const newApi = methodExtension(getSlatePluginContext(editor, plugin));

        mergeWithoutArray(plugin.api, newApi);
        mergeWithoutArray(editor.api, newApi);
      });
      delete (plugin as any).__apiExtensions;
    }
    // Apply transform extensions
    if (
      plugin.__transformExtensions &&
      plugin.__transformExtensions.length > 0
    ) {
      plugin.__transformExtensions.forEach((transformExtension) => {
        const newTransforms = transformExtension(
          getSlatePluginContext(editor, plugin)
        );

        mergeWithoutArray(plugin.transforms, newTransforms);
        mergeWithoutArray(editor.transforms, newTransforms); // Add transforms to editor.api as well
      });
      delete (plugin as any).__transformExtensions;
    }
  });
};

const flattenAndMergePlugins = (
  plugins: SlatePlugins
): Map<string, SlatePlugin> => {
  const pluginMap = new Map<string, SlatePlugin>();

  const processPlugin = (plugin: SlatePlugin) => {
    const existingPlugin = pluginMap.get(plugin.key);

    if (existingPlugin) {
      pluginMap.set(plugin.key, mergeWithoutArray({}, existingPlugin, plugin));
    } else {
      pluginMap.set(plugin.key, plugin);
    }
    if (plugin.plugins && plugin.plugins.length > 0) {
      plugin.plugins.forEach(processPlugin);
    }
  };

  plugins.forEach(processPlugin);

  return pluginMap;
};

export const resolveAndSortPlugins = (
  editor: SlateEditor,
  plugins: SlatePlugins
): SlatePlugins => {
  // Step 1: Resolve, flatten, and merge all plugins
  const pluginMap = flattenAndMergePlugins(
    plugins.map((plugin) => resolvePlugin(editor, plugin))
  );

  // Step 2: Filter out disabled plugins
  const enabledPlugins = Array.from(pluginMap.values()).filter(
    (plugin) => plugin.enabled !== false
  );

  // Step 4: Sort plugins by priority
  enabledPlugins.sort((a, b) => b.priority - a.priority);

  // Step 5: Reorder based on dependencies
  const orderedPlugins: SlatePlugins = [];
  const visited = new Set<string>();

  const visit = (plugin: SlatePlugin) => {
    if (visited.has(plugin.key)) return;

    visited.add(plugin.key);

    plugin.dependencies?.forEach((depKey) => {
      const depPlugin = pluginMap.get(depKey);

      if (depPlugin) {
        visit(depPlugin);
      } else {
        editor.api.debug.warn(
          `Plugin "${plugin.key}" depends on missing plugin "${depKey}"`,
          'PLUGIN_DEPENDENCY_MISSING'
        );
      }
    });

    orderedPlugins.push(plugin);
  };

  enabledPlugins.forEach(visit);

  return orderedPlugins;
};

export const mergePlugins = (editor: SlateEditor, plugins: SlatePlugins) => {
  editor.pluginList = plugins;
  editor.plugins = Object.fromEntries(
    plugins.map((plugin) => [plugin.key, plugin])
  );
};

export const applyPluginOverrides = (editor: SlateEditor) => {
  const applyOverrides = (plugins: SlatePlugin[]): SlatePlugin[] => {
    let overriddenPlugins = [...plugins];

    const enabledOverrides: Record<string, boolean> = {};
    const componentOverrides: Record<
      string,
      { component: any; priority: number }
    > = {};
    const pluginOverrides: Record<string, Partial<SlatePlugin>> = {};

    // Collect all overrides
    for (const plugin of plugins) {
      if (plugin.override.enabled) {
        mergeWithoutArray(enabledOverrides, plugin.override.enabled);
      }
      // TODO react
      if ((plugin.override as any).components) {
        Object.entries((plugin.override as any).components).forEach(
          ([key, component]) => {
            if (
              !componentOverrides[key] ||
              plugin.priority > componentOverrides[key].priority
            ) {
              componentOverrides[key] = {
                component,
                priority: plugin.priority,
              };
            }
          }
        );
      }
      if (plugin.override.plugins) {
        Object.entries(plugin.override.plugins).forEach(([key, value]) => {
          pluginOverrides[key] = mergeWithoutArray(
            {},
            pluginOverrides[key],
            value
          );

          if (value.enabled !== undefined) {
            enabledOverrides[key] = value.enabled;
          }
        });
      }
    }

    // Apply overrides
    overriddenPlugins = overriddenPlugins.map((p) => {
      let updatedPlugin = { ...p };

      // Apply plugin overrides
      if (pluginOverrides[p.key]) {
        updatedPlugin = mergeWithoutArray(
          {},
          updatedPlugin,
          pluginOverrides[p.key]
        );
      }
      // Apply component overrides
      // TODO react
      if (
        componentOverrides[p.key] &&
        (!(p as any).component ||
          componentOverrides[p.key].priority > p.priority)
      ) {
        (updatedPlugin as any).component = componentOverrides[p.key].component;
      }

      // Apply enabled overrides
      const enabled = enabledOverrides[p.key] ?? updatedPlugin.enabled;

      if (isDefined(enabled)) {
        updatedPlugin.enabled = enabled;
      }

      return updatedPlugin;
    });

    return overriddenPlugins
      .filter((p) => p.enabled !== false)
      .map((plugin) => ({
        ...plugin,
        plugins: applyOverrides(plugin.plugins || []),
      }));
  };

  editor.pluginList = applyOverrides(editor.pluginList as any);

  // Final pass: ensure all plugins are properly resolved after overrides
  editor.pluginList = editor.pluginList.map((plugin) =>
    resolvePlugin(editor, plugin as any)
  );
  editor.plugins = Object.fromEntries(
    editor.pluginList.map((plugin) => [plugin.key, plugin])
  );
};
