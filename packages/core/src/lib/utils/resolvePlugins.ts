import { type AnyObject, isDefined } from '@udecode/utils';
import { createZustandStore } from 'zustand-x';

import type { SlateEditor } from '../editor';

import { mergeWithoutArray } from '../../internal/mergeWithoutArray';
import {
  type SlatePlugin,
  type SlatePlugins,
  getEditorPlugin,
} from '../plugin';
import { resolvePlugin } from './resolvePlugin';

export function mergeLevel<T extends AnyObject>(
  target: T,
  source: Partial<T>,
  levels = 1
): T {
  if (!target) {
    target = {} as T;
  }

  function mergeLevel(
    targetObj: AnyObject,
    sourceObj: AnyObject,
    currentLevel: number
  ) {
    for (const key in sourceObj) {
      if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
        if (
          typeof sourceObj[key] === 'object' &&
          sourceObj[key] !== null &&
          !Array.isArray(sourceObj[key]) &&
          // TODO: levels should be used instead of 5
          currentLevel < 10
        ) {
          if (currentLevel === 5) {
            console.log('mergeLevel', sourceObj, key, currentLevel);
          }

          targetObj[key] = targetObj[key] || {};
          mergeLevel(targetObj[key], sourceObj[key], currentLevel + 1);
        } else {
          targetObj[key] = sourceObj[key];
        }
      }
    }
  }

  mergeLevel(target, source, 1);

  return target;
}

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
  editor.tf = editor.transforms;
  editor.shortcuts = {} as any;

  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);

  mergePlugins(editor, resolvedPlugins);

  resolvePluginOverrides(editor);

  resolvePluginStores(editor);

  resolvePluginApis(editor);

  // extendEditor
  editor.pluginList.forEach((plugin) => {
    if (plugin.extendEditor) {
      editor = plugin.extendEditor(getEditorPlugin(editor, plugin) as any);
    }
  });

  return editor;
};

const resolvePluginStores = (editor: SlateEditor) => {
  // Create zustand stores for each plugin
  editor.pluginList.forEach((plugin) => {
    let store = createZustandStore(plugin.key)(plugin.options, {
      immer: {
        enableMapSet: true,
      },
    });

    // Apply option extensions
    if (
      (plugin as any).__optionExtensions &&
      (plugin as any).__optionExtensions.length > 0
    ) {
      (plugin as any).__optionExtensions.forEach((extension: any) => {
        const extendedOptions = extension(getEditorPlugin(editor, plugin));

        store = store.extendSelectors(() => extendedOptions);
      });
    }

    plugin.optionsStore = store;
  });
};

const resolvePluginApis = (editor: SlateEditor) => {
  const shortcutsByPriority: any[] = [];

  editor.pluginList.forEach((plugin: any) => {
    // Merge APIs
    Object.entries(plugin.api).forEach(([apiKey, apiFunction]) => {
      (editor.api as any)[apiKey] = apiFunction;
    });

    // Apply API and transform extensions
    if (plugin.__apiExtensions && plugin.__apiExtensions.length > 0) {
      plugin.__apiExtensions.forEach(
        ({ extension, isPluginSpecific, isTransform }: any) => {
          const newExtensions = extension(
            getEditorPlugin(editor, plugin) as any
          );

          if (isTransform) {
            // Handle transforms
            if (isPluginSpecific) {
              // Plugin-specific transform
              if (!(editor.transforms as any)[plugin.key]) {
                (editor.transforms as any)[plugin.key] = {};
              }
              if (!(plugin.transforms as any)[plugin.key]) {
                (plugin.transforms as any)[plugin.key] = {};
              }

              mergeWithoutArray(
                (editor.transforms as any)[plugin.key],
                newExtensions
              );
              mergeWithoutArray(
                (plugin.transforms as any)[plugin.key],
                newExtensions
              );
            } else {
              // Editor-wide transform
              mergeWithoutArray(editor.transforms, newExtensions);
              mergeWithoutArray(plugin.transforms, newExtensions);
            }
          } else {
            // Handle APIs
            if (isPluginSpecific) {
              // Plugin-specific API
              if (!(editor.api as any)[plugin.key]) {
                (editor.api as any)[plugin.key] = {};
              }
              if (!(plugin.api as any)[plugin.key]) {
                (plugin.api as any)[plugin.key] = {};
              }

              mergeWithoutArray((editor.api as any)[plugin.key], newExtensions);
              mergeWithoutArray((plugin.api as any)[plugin.key], newExtensions);
            } else {
              // Editor-wide API
              mergeWithoutArray(editor.api, newExtensions);
              mergeWithoutArray(plugin.api, newExtensions);
            }
          }
        }
      );
      delete plugin.__apiExtensions;
    }

    // Merge shortcuts
    Object.entries(plugin.shortcuts).forEach(([key, hotkey]) => {
      if (hotkey === null) {
        // Remove any existing hotkey with this key
        const index = shortcutsByPriority.findIndex((item) => item.key === key);

        if (index !== -1) {
          shortcutsByPriority.splice(index, 1);
        }
      } else {
        const priority = (hotkey as any).priority ?? plugin.priority;
        const existingIndex = shortcutsByPriority.findIndex(
          (item) => item.key === key
        );

        if (
          existingIndex === -1 ||
          priority >= shortcutsByPriority[existingIndex].priority
        ) {
          if (existingIndex !== -1) {
            shortcutsByPriority.splice(existingIndex, 1);
          }

          shortcutsByPriority.push({ hotkey, key, priority });
        }
      }
    });
  });

  // Sort shortcuts by priority (descending)
  shortcutsByPriority.sort((a, b) => b.hotkey.priority - a.hotkey.priority);

  // After processing all plugins, set the final shortcuts on the editor
  editor.shortcuts = Object.fromEntries(
    shortcutsByPriority.map(({ hotkey, key }) => {
      const { priority, ...hotkeyWithoutPriority } = hotkey;

      return [key, hotkeyWithoutPriority];
    })
  );
};

const flattenAndResolvePlugins = (
  editor: SlateEditor,
  plugins: SlatePlugins
): Map<string, SlatePlugin> => {
  const pluginMap = new Map<string, SlatePlugin>();

  const processPlugin = (plugin: SlatePlugin) => {
    const resolvedPlugin = resolvePlugin(editor, plugin);
    const existingPlugin = pluginMap.get(resolvedPlugin.key);

    if (existingPlugin) {
      pluginMap.set(
        resolvedPlugin.key,
        mergeLevel(existingPlugin, resolvedPlugin, 3)
        // resolvedPlugin
      );
    } else {
      pluginMap.set(resolvedPlugin.key, resolvedPlugin);
    }
    if (resolvedPlugin.plugins && resolvedPlugin.plugins.length > 0) {
      resolvedPlugin.plugins.forEach(processPlugin);
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
  const pluginMap = flattenAndResolvePlugins(editor, plugins);

  // Step 2: Filter out disabled plugins
  const enabledPlugins = Array.from(pluginMap.values()).filter(
    (plugin) => plugin.enabled !== false
  );

  // Step 3: Sort plugins by priority
  enabledPlugins.sort((a, b) => b.priority - a.priority);

  // Step 4: Reorder based on dependencies
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

export const resolvePluginOverrides = (editor: SlateEditor) => {
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
        Object.assign(enabledOverrides, plugin.override.enabled);
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
        updatedPlugin = mergeLevel(updatedPlugin, pluginOverrides[p.key], 3);
      }
      // Apply component overrides
      // TODO react
      if (
        componentOverrides[p.key] &&
        ((!(p as any).render.node && !(p as any).node.component) ||
          componentOverrides[p.key].priority > p.priority)
      ) {
        (updatedPlugin as any).render.node =
          componentOverrides[p.key].component;
        (updatedPlugin as any).node.component =
          componentOverrides[p.key].component;
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
