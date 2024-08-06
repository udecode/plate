import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin, PlatePluginList } from '../types/plugin/PlatePlugin';

import { resolvePlugin } from '../index';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export const resolvePlugins = (
  editor: PlateEditor,
  plugins: PlatePluginList = []
) => {
  editor.plugins = [];
  editor.pluginsByKey = {};
  editor.api = {};

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
};

const mergePluginApis = (editor: PlateEditor) => {
  editor.plugins.forEach((plugin) => {
    if (plugin.api) {
      editor.api[plugin.key] = {};
      Object.entries(plugin.api).forEach(([apiKey, apiFunction]) => {
        editor.api[plugin.key][apiKey] = apiFunction;
      });
    }
  });
};

export const resolveAndSortPlugins = (
  editor: PlateEditor,
  plugins: PlatePluginList
): PlatePluginList => {
  const resolvedPlugins: PlatePluginList = [];

  const processPlugin = (plugin: PlatePlugin) => {
    const resolvedPlugin = resolvePlugin(editor, plugin);

    if (resolvedPlugin.enabled !== false) {
      resolvedPlugins.push(resolvedPlugin);

      if (resolvedPlugin.plugins && resolvedPlugin.plugins.length > 0) {
        resolvedPlugin.plugins.forEach(processPlugin);
      }
    }
  };

  plugins.forEach(processPlugin);

  // Sort resolved plugins by priority (higher priority first)
  resolvedPlugins.sort((a, b) => b.priority - a.priority);

  // Reorder based on dependencies
  const pluginMap = new Map(resolvedPlugins.map((p) => [p.key, p]));
  const orderedPlugins: PlatePluginList = [];
  const visited = new Set<string>();

  const visit = (plugin: PlatePlugin) => {
    if (visited.has(plugin.key)) return;

    visited.add(plugin.key);

    plugin.dependencies?.forEach((depKey) => {
      const depPlugin = pluginMap.get(depKey);

      if (depPlugin) {
        visit(depPlugin);
      } else {
        console.warn(
          `Plugin "${plugin.key}" depends on missing plugin "${depKey}"`
        );
      }
    });

    orderedPlugins.push(plugin);
  };

  resolvedPlugins.forEach(visit);

  return orderedPlugins;
};

export const mergePlugins = (editor: PlateEditor, plugins: PlatePluginList) => {
  plugins.forEach((plugin) => {
    if (editor.pluginsByKey[plugin.key]) {
      // Update existing plugin
      const index = editor.plugins.findIndex((p) => p.key === plugin.key);
      const existingPlugin = editor.pluginsByKey[plugin.key];
      const mergedPlugin = {
        ...existingPlugin,
        ...plugin,
        component: plugin.component || existingPlugin.component, // Preserve existing component if not overridden
      };

      if (index >= 0) {
        editor.plugins[index] = mergedPlugin;
      }

      editor.pluginsByKey[plugin.key] = mergedPlugin;
    } else {
      // Add new plugin
      editor.plugins.push(plugin);
      editor.pluginsByKey[plugin.key] = plugin;
    }
  });
};

export const applyPluginOverrides = (editor: PlateEditor) => {
  const applyOverrides = (plugins: PlatePluginList): PlatePluginList => {
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

  editor.plugins = applyOverrides(editor.plugins);

  // Final pass: ensure all plugins are properly resolved after overrides
  editor.plugins = editor.plugins.map((plugin) =>
    resolvePlugin(editor, plugin)
  );
  editor.pluginsByKey = Object.fromEntries(
    editor.plugins.map((plugin) => [plugin.key, plugin])
  );
};
