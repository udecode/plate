import merge from 'lodash/merge.js';

import type { PlatePlugin, PlatePlugins } from '../plugin/types/PlatePlugin';

import { type PlateEditor, resolvePlugin } from '../index';

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export const resolvePlugins = (
  editor: PlateEditor,
  plugins: PlatePlugins = []
) => {
  editor.pluginList = [];
  editor.plugins = {};
  editor.api = {} as any;

  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);

  mergePlugins(editor, resolvedPlugins);

  applyPluginOverrides(editor);

  mergePluginApis(editor);

  // withOverrides
  editor.pluginList.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides({ api: editor.api, editor, plugin }) as any;
    }
  });

  return editor;
};

const mergePluginApis = (editor: PlateEditor) => {
  editor.pluginList.forEach((plugin) => {
    Object.entries(plugin.api).forEach(([apiKey, apiFunction]) => {
      (editor.api as any)[apiKey] = apiFunction;
    });
  });

  (editor.pluginList as PlatePlugin[]).forEach((plugin) => {
    // Apply method extensions
    if (plugin.__methodExtensions && plugin.__methodExtensions.length > 0) {
      plugin.__methodExtensions.forEach((methodExtension) => {
        const newApi = methodExtension({ api: editor.api, editor, plugin });

        merge(plugin.api, newApi);
        merge(editor.api, newApi);
      });
      delete (plugin as any).__methodExtensions;
    }
  });
};

const flattenAndMergePlugins = (
  plugins: PlatePlugins
): Map<string, PlatePlugin> => {
  const pluginMap = new Map<string, PlatePlugin>();

  const processPlugin = (plugin: PlatePlugin) => {
    const existingPlugin = pluginMap.get(plugin.key);

    if (existingPlugin) {
      pluginMap.set(plugin.key, merge({}, existingPlugin, plugin));
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
  editor: PlateEditor,
  plugins: PlatePlugins
): PlatePlugins => {
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
  const orderedPlugins: PlatePlugins = [];
  const visited = new Set<string>();

  const visit = (plugin: PlatePlugin) => {
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

export const mergePlugins = (editor: PlateEditor, plugins: PlatePlugins) => {
  editor.pluginList = plugins;
  editor.plugins = Object.fromEntries(
    plugins.map((plugin) => [plugin.key, plugin])
  );
};

export const applyPluginOverrides = (editor: PlateEditor) => {
  const applyOverrides = (plugins: PlatePlugin[]): PlatePlugin[] => {
    let overriddenPlugins = [...plugins];

    const enabledOverrides: Record<string, boolean> = {};
    const componentOverrides: Record<
      string,
      { component: any; priority: number }
    > = {};
    const pluginOverrides: Record<string, Partial<PlatePlugin>> = {};

    // Collect all overrides
    for (const plugin of plugins) {
      if (plugin.override.enabled) {
        merge(enabledOverrides, plugin.override.enabled);
      }
      if (plugin.override.components) {
        Object.entries(plugin.override.components).forEach(
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
          pluginOverrides[key] = merge({}, pluginOverrides[key], value);

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
        updatedPlugin = merge({}, updatedPlugin, pluginOverrides[p.key]);
      }
      // Apply component overrides
      if (
        componentOverrides[p.key] &&
        (!p.component || componentOverrides[p.key].priority > p.priority)
      ) {
        updatedPlugin.component = componentOverrides[p.key].component;
      }

      // Apply enabled overrides
      updatedPlugin.enabled = enabledOverrides[p.key] ?? updatedPlugin.enabled;

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
