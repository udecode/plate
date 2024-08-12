import merge from 'lodash/merge.js';

import type { PlatePlugin, PlatePlugins } from '../plugin/types/PlatePlugin';

import {
  type PlateEditor,
  overridePluginsByKey,
  resolvePlugin,
} from '../index';

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export const resolvePlugins = (
  editor: PlateEditor,
  plugins: PlatePlugins = []
) => {
  editor.plugins = [];
  editor.pluginsByKey = {};
  editor.api = {} as any;

  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);

  mergePlugins(editor, resolvedPlugins);

  applyPluginOverrides(editor);

  mergePluginApis(editor);

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides({ editor, plugin }) as any;
    }
  });

  return editor;
};

const mergePluginApis = (editor: PlateEditor) => {
  editor.plugins.forEach((plugin) => {
    if (plugin.api) {
      Object.entries(plugin.api).forEach(([apiKey, apiFunction]) => {
        (editor.api as any)[apiKey] = apiFunction;
      });
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
        editor.api.debug.warn({
          message: `Plugin "${plugin.key}" depends on missing plugin "${depKey}"`,
          type: 'PLUGIN_DEPENDENCY_MISSING',
        });
      }
    });

    orderedPlugins.push(plugin);
  };

  enabledPlugins.forEach(visit);

  return orderedPlugins;
};

export const mergePlugins = (editor: PlateEditor, plugins: PlatePlugins) => {
  editor.plugins = plugins;
  editor.pluginsByKey = Object.fromEntries(
    plugins.map((plugin) => [plugin.key, plugin])
  );
};

export const applyPluginOverrides = (editor: PlateEditor) => {
  const applyOverrides = (plugins: PlatePlugin[]): PlatePlugin[] => {
    let overriddenPlugins = plugins;

    const enabledOverrides: Record<string, boolean> = {};

    for (const plugin of plugins) {
      if (plugin.override.enabled) {
        Object.assign(enabledOverrides, plugin.override.enabled);
      }
    }

    for (const plugin of plugins) {
      if (plugin.override.plugins) {
        overriddenPlugins = overriddenPlugins.map((p) =>
          overridePluginsByKey(p, plugin.override.plugins!)
        );
      }
      // Apply component overrides
      if (plugin.override.components) {
        overriddenPlugins = overriddenPlugins.map((p) => {
          if (plugin.override.components![p.key]) {
            if (p.component) {
              // Only override if the current plugin has higher priority
              if (plugin.priority > p.priority) {
                return {
                  ...p,
                  component: plugin.override.components![p.key],
                };
              }
            } else {
              // If there's no existing component, apply the override
              return {
                ...p,
                component: plugin.override.components![p.key],
              };
            }
          }

          return p;
        });
      }
    }

    overriddenPlugins = overriddenPlugins.map((p) => ({
      ...p,
      enabled: enabledOverrides[p.key] ?? p.enabled,
    }));

    return overriddenPlugins
      .filter((p) => p.enabled !== false)
      .map((plugin) => ({
        ...plugin,
        plugins: applyOverrides(plugin.plugins),
      }));
  };

  editor.plugins = applyOverrides(editor.plugins as any);

  // Final pass: ensure all plugins are properly resolved after overrides
  editor.plugins = editor.plugins.map((plugin) =>
    resolvePlugin(editor, plugin as any)
  );
  editor.pluginsByKey = Object.fromEntries(
    editor.plugins.map((plugin) => [plugin.key, plugin])
  );
};
