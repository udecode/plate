import {
  assignLegacyApi,
  assignLegacyTransforms,
  syncLegacyMethods,
} from '@platejs/slate';
import { isDefined } from '@udecode/utils';
import merge from 'lodash/merge.js';
import { createVanillaStore } from 'zustand-x/vanilla';

import type { SlateEditor, SlatePlugin, SlatePlugins } from '../../lib';

import { getEditorPlugin } from '../../lib/plugin';
import { mergePlugins } from '../utils/mergePlugins';
import { resolvePlugin } from './resolvePlugin';

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export type PluginStoreFactory = typeof createVanillaStore;

export const resolvePlugins = (
  editor: SlateEditor,
  plugins: SlatePlugins = [],
  createStore: PluginStoreFactory = createVanillaStore
) => {
  editor.plugins = {};
  editor.meta.pluginList = [];
  editor.meta.shortcuts = {} as Record<
    string,
    SlatePlugin['shortcuts'][string]
  >;
  editor.meta.components = {};
  editor.meta.pluginCache = {
    decorate: [],
    handlers: {
      onChange: [],
      onNodeChange: [],
      onTextChange: [],
    },
    inject: {
      nodeProps: [],
    },
    node: {
      isContainer: [],
      isLeaf: [],
      isText: [],
      leafProps: [],
      textProps: [],
      types: {},
    },
    normalizeInitialValue: [],
    render: {
      aboveEditable: [],
      aboveNodes: [],
      aboveSlate: [],
      afterContainer: [],
      afterEditable: [],
      beforeContainer: [],
      beforeEditable: [],
      belowNodes: [],
      belowRootNodes: [],
    },
    rules: {
      match: [],
    },
    useHooks: [],
  };

  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);

  applyPluginsToEditor(editor, resolvedPlugins);

  resolvePluginOverrides(editor);

  resolvePluginStores(editor, createStore);

  // Last pass
  editor.meta.pluginList.forEach((plugin: SlatePlugin) => {
    if (plugin.extendEditor) {
      // biome-ignore lint/style/noParameterAssign: Intentional editor extension pattern
      editor = plugin.extendEditor(getEditorPlugin(editor, plugin) as any);

      // Sync any editor methods that were modified by extendEditor
      syncLegacyMethods(editor);
    }

    // Sync overridden plugin methods to legacy editor methods
    resolvePluginMethods(editor, plugin);

    if (plugin.node?.isContainer) {
      editor.meta.pluginCache.node.isContainer.push(plugin.key);
    }

    editor.meta.pluginCache.node.types[plugin.node.type] = plugin.key;

    if (plugin.inject?.nodeProps) {
      editor.meta.pluginCache.inject.nodeProps.push(plugin.key);
    }

    if (plugin.render?.node) {
      editor.meta.components[plugin.key] = plugin.render.node;
    }

    if (
      plugin.node?.isLeaf &&
      (plugin.node?.isDecoration === true ||
        plugin.render.leaf ||
        (plugin.render.node && plugin.node?.isDecoration !== false))
    ) {
      editor.meta.pluginCache.node.isLeaf.push(plugin.key);
    }

    if (plugin.node.isLeaf && plugin.node.isDecoration === false) {
      editor.meta.pluginCache.node.isText.push(plugin.key);
    }

    if (plugin.node?.leafProps) {
      editor.meta.pluginCache.node.leafProps.push(plugin.key);
    }

    if (plugin.node.textProps) {
      editor.meta.pluginCache.node.textProps.push(plugin.key);
    }

    if (plugin.render.aboveEditable) {
      editor.meta.pluginCache.render.aboveEditable.push(plugin.key);
    }

    if (plugin.render.aboveSlate) {
      editor.meta.pluginCache.render.aboveSlate.push(plugin.key);
    }

    if (plugin.render.afterEditable) {
      editor.meta.pluginCache.render.afterEditable.push(plugin.key);
    }

    if (plugin.render.beforeEditable) {
      editor.meta.pluginCache.render.beforeEditable.push(plugin.key);
    }

    if (plugin.rules?.match) {
      editor.meta.pluginCache.rules.match.push(plugin.key);
    }

    if (plugin.render.afterContainer) {
      editor.meta.pluginCache.render.afterContainer.push(plugin.key);
    }

    if (plugin.render.beforeContainer) {
      editor.meta.pluginCache.render.beforeContainer.push(plugin.key);
    }

    if (plugin.render.belowRootNodes) {
      editor.meta.pluginCache.render.belowRootNodes.push(plugin.key);
    }

    if (plugin.normalizeInitialValue) {
      editor.meta.pluginCache.normalizeInitialValue.push(plugin.key);
    }

    if (plugin.decorate) {
      editor.meta.pluginCache.decorate.push(plugin.key);
    }

    if (plugin.render.aboveNodes) {
      editor.meta.pluginCache.render.aboveNodes.push(plugin.key);
    }

    if (plugin.render.belowNodes) {
      editor.meta.pluginCache.render.belowNodes.push(plugin.key);
    }

    if ((plugin as any).useHooks) {
      editor.meta.pluginCache.useHooks.push(plugin.key);
    }

    if ((plugin as any).handlers?.onChange) {
      editor.meta.pluginCache.handlers.onChange.push(plugin.key);
    }
    if ((plugin as any).handlers?.onNodeChange) {
      editor.meta.pluginCache.handlers.onNodeChange.push(plugin.key);
    }
    if ((plugin as any).handlers?.onTextChange) {
      editor.meta.pluginCache.handlers.onTextChange.push(plugin.key);
    }
  });

  resolvePluginShortcuts(editor);

  return editor;
};

const resolvePluginStores = (
  editor: SlateEditor,
  createStore: PluginStoreFactory
) => {
  // Create zustand stores for each plugin
  editor.meta.pluginList.forEach((plugin) => {
    let store = createStore(plugin.options, {
      mutative: true,
      name: plugin.key,
    });

    // Apply option extensions
    if (
      (plugin as any).__selectorExtensions &&
      (plugin as any).__selectorExtensions.length > 0
    ) {
      (plugin as any).__selectorExtensions.forEach((extension: any) => {
        const extendedOptions = extension(getEditorPlugin(editor, plugin));

        store = store.extendSelectors(() => extendedOptions);
      });
    }

    plugin.optionsStore = store;
  });
};

const resolvePluginMethods = (editor: SlateEditor, plugin: any) => {
  // Merge APIs
  Object.entries(plugin.api).forEach(([apiKey, apiFunction]) => {
    (editor.api as any)[apiKey] = apiFunction;
  });

  // Apply API and transform extensions
  if (plugin.__apiExtensions && plugin.__apiExtensions.length > 0) {
    plugin.__apiExtensions.forEach(
      ({ extension, isOverride, isPluginSpecific, isTransform }: any) => {
        const newExtensions = extension(getEditorPlugin(editor, plugin) as any);

        if (isOverride) {
          // Handle combined API and transforms override
          if (newExtensions.api) {
            merge(editor.api, newExtensions.api);
            merge(plugin.api, newExtensions.api);
            assignLegacyApi(editor, editor.api);
          }
          if (newExtensions.transforms) {
            merge(editor.transforms, newExtensions.transforms);
            merge(plugin.transforms, newExtensions.transforms);
            assignLegacyTransforms(editor, newExtensions.transforms);
          }
        } else if (isTransform) {
          // Handle transforms
          if (isPluginSpecific) {
            // Plugin-specific transform
            if (!(editor.transforms as any)[plugin.key]) {
              (editor.transforms as any)[plugin.key] = {};
            }
            if (!(plugin.transforms as any)[plugin.key]) {
              (plugin.transforms as any)[plugin.key] = {};
            }

            merge((editor.transforms as any)[plugin.key], newExtensions);
            merge((plugin.transforms as any)[plugin.key], newExtensions);
          } else {
            // Editor-wide transform
            merge(editor.transforms, newExtensions);
            merge(plugin.transforms, newExtensions);
            assignLegacyTransforms(editor, newExtensions);
          }
        } else if (isPluginSpecific) {
          // Handle APIs - Plugin-specific API
          if (!(editor.api as any)[plugin.key]) {
            (editor.api as any)[plugin.key] = {};
          }
          if (!(plugin.api as any)[plugin.key]) {
            (plugin.api as any)[plugin.key] = {};
          }

          merge((editor.api as any)[plugin.key], newExtensions);
          merge((plugin.api as any)[plugin.key], newExtensions);
        } else {
          // Handle APIs - Editor-wide API
          merge(editor.api, newExtensions);
          merge(plugin.api, newExtensions);
          assignLegacyApi(editor, editor.api);
        }
      }
    );
    plugin.__apiExtensions = undefined;
  }
};

const resolvePluginShortcuts = (editor: SlateEditor) => {
  editor.meta.shortcuts = {} as Record<
    string,
    SlatePlugin['shortcuts'][string]
  >; // Initialize with a more specific type

  editor.meta.pluginList.forEach((plugin) => {
    Object.entries(plugin.shortcuts).forEach(([originalKey, hotkey]) => {
      const namespacedKey = `${plugin.key}.${originalKey}`;

      if (hotkey === null) {
        // If hotkey is null, remove the namespaced shortcut
        delete (
          editor.meta.shortcuts as Record<
            string,
            SlatePlugin['shortcuts'][string]
          >
        )[namespacedKey];
      } else if (hotkey && typeof hotkey === 'object') {
        const resolvedHotkey = { ...hotkey } as NonNullable<
          SlatePlugin['shortcuts'][string]
        >;

        // If no custom handler is provided, try to use plugin transform method as handler
        if (!resolvedHotkey.handler) {
          const pluginSpecificTransforms = (plugin.transforms as any)?.[
            plugin.key
          ];
          const pluginSpecificApi = (plugin.api as any)?.[plugin.key];

          if (pluginSpecificTransforms?.[originalKey]) {
            resolvedHotkey.handler = () =>
              pluginSpecificTransforms[originalKey]();
          } else if (pluginSpecificApi?.[originalKey]) {
            resolvedHotkey.handler = () => pluginSpecificApi[originalKey]();
          }
        }

        // Set shortcut priority, falling back to plugin priority
        resolvedHotkey.priority = resolvedHotkey.priority ?? plugin.priority;

        (
          editor.meta.shortcuts as Record<
            string,
            SlatePlugin['shortcuts'][string]
          >
        )[namespacedKey] = resolvedHotkey;
      }
    });
  });
};

const flattenAndResolvePlugins = (
  editor: SlateEditor,
  plugins: SlatePlugins
): Map<string, SlatePlugin> => {
  const pluginMap = new Map<string, SlatePlugin>();

  const processPlugin = (plugin: SlatePlugin) => {
    const resolvedPlugin = resolvePlugin(editor, plugin);

    if (resolvedPlugin.key) {
      const existingPlugin = pluginMap.get(resolvedPlugin.key);

      if (existingPlugin) {
        pluginMap.set(
          resolvedPlugin.key,
          mergePlugins(existingPlugin, resolvedPlugin)
        );
      } else {
        pluginMap.set(resolvedPlugin.key, resolvedPlugin);
      }
    } else {
      // If the plugin has no key, we just just skip it.
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

export const applyPluginsToEditor = (
  editor: SlateEditor,
  plugins: SlatePlugins
) => {
  editor.meta.pluginList = plugins;
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
          pluginOverrides[key] = mergePlugins(pluginOverrides[key], value);

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
        updatedPlugin = mergePlugins(updatedPlugin, pluginOverrides[p.key]);
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

  editor.meta.pluginList = applyOverrides(editor.meta.pluginList as any);
  editor.plugins = Object.fromEntries(
    editor.meta.pluginList.map((plugin) => [plugin.key, plugin])
  );
};
