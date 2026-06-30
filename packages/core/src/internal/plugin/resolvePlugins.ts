import type { EditorUpdateTransaction } from '@platejs/plite';
import { isDefined } from '@udecode/utils';
import merge from 'lodash/merge.js';
import { createVanillaStore } from 'zustand-x/vanilla';

import type {
  AnyBasePlugin,
  BaseEditor,
  BasePlugin,
  BasePlugins,
} from '../../lib';

import { getEditorPlugin } from '../../lib/plugin';
import { mergePlugins } from '../utils/mergePlugins';
import { resolvePlugin } from './resolvePlugin';
import type {
  AnyInputRule,
  ResolvedInputRule,
  ResolvedInputRulesMeta,
} from '../../lib/plugins/input-rules/types';
import { createInputRuleBuilder } from '../../lib/plugins/input-rules/internal/createInputRuleBuilder';

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export type PluginStoreFactory = typeof createVanillaStore;

type PluginApiCleanups = Map<string, () => void>;
type TxExtensionMetadata = {
  __plateOwnTxGroup?: true;
  __plateTxGroupKey?: string;
};

const pluginApiCleanups = new WeakMap<BaseEditor, PluginApiCleanups>();

const getPluginApiCleanups = (editor: BaseEditor) => {
  let cleanups = pluginApiCleanups.get(editor);

  if (!cleanups) {
    cleanups = new Map();
    pluginApiCleanups.set(editor, cleanups);
  }

  return cleanups;
};

const cleanupPluginApis = (editor: BaseEditor) => {
  const cleanups = pluginApiCleanups.get(editor);

  if (!cleanups) return;

  cleanups.forEach((cleanup) => {
    cleanup();
  });
  cleanups.clear();
};

const getPluginShortcutTxCommand = (
  transaction: EditorUpdateTransaction,
  pluginKey: string,
  shortcutKey: string
): (() => void) | undefined => {
  const pluginTx = (transaction as unknown as Record<string, unknown>)[
    pluginKey
  ];

  if (!pluginTx || typeof pluginTx !== 'object') return;

  const command = (pluginTx as Record<string, unknown>)[shortcutKey];

  return typeof command === 'function' ? (command as () => void) : undefined;
};

const hasOwnPluginTxGroup = (plugin: BasePlugin) => {
  if (typeof plugin.tx?.[plugin.key] === 'function') return true;

  return plugin.__txExtensions.some((txExtension) => {
    const metadata = txExtension as TxExtensionMetadata;

    return (
      metadata.__plateOwnTxGroup === true ||
      metadata.__plateTxGroupKey === plugin.key
    );
  });
};

export const resolvePlugins = (
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[] = [],
  createStore: PluginStoreFactory = createVanillaStore
) => {
  editor.plugins = {};
  editor.runtime.pluginList = [];
  editor.runtime.inputRules = {
    insertBreak: [],
    insertData: [],
    insertText: { all: [], byTrigger: {} },
    plugins: {},
  } as ResolvedInputRulesMeta;
  editor.runtime.shortcuts = {} as Record<
    string,
    BasePlugin['shortcuts'][string]
  >;
  editor.runtime.components = {};
  editor.runtime.pluginCache = {
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
      isMetadataProp: [],
      isText: [],
      leafProps: [],
      textProps: [],
      types: {},
    },
    transformInitialValue: [],
    render: {
      aboveEditable: [],
      aboveNodes: [],
      abovePlite: [],
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
  cleanupPluginApis(editor);

  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);

  applyPluginsToEditor(editor, resolvedPlugins);

  resolvePluginOverrides(editor);

  resolvePluginStores(editor, createStore);

  // Last pass
  editor.runtime.pluginList.forEach((plugin: BasePlugin) => {
    // Sync overridden plugin methods to the editor runtime.
    resolvePluginMethods(editor, plugin);

    if (plugin.node?.isContainer) {
      editor.runtime.pluginCache.node.isContainer.push(plugin.key);
    }

    if (plugin.node?.isMetadataProp) {
      editor.runtime.pluginCache.node.isMetadataProp.push(plugin.key);
    }

    editor.runtime.pluginCache.node.types[plugin.node.type] = plugin.key;

    if (plugin.inject?.nodeProps) {
      editor.runtime.pluginCache.inject.nodeProps.push(plugin.key);
    }

    if (plugin.render?.node) {
      editor.runtime.components[plugin.key] = plugin.render.node;
    }

    if (
      plugin.node?.isLeaf &&
      (plugin.node?.isDecoration === true || plugin.render.leaf)
    ) {
      editor.runtime.pluginCache.node.isLeaf.push(plugin.key);
    }

    if (plugin.node.isLeaf && plugin.node.isDecoration === false) {
      editor.runtime.pluginCache.node.isText.push(plugin.key);
    }

    if (plugin.node?.leafProps) {
      editor.runtime.pluginCache.node.leafProps.push(plugin.key);
    }

    if (plugin.node.textProps) {
      editor.runtime.pluginCache.node.textProps.push(plugin.key);
    }

    if (plugin.render.aboveEditable) {
      editor.runtime.pluginCache.render.aboveEditable.push(plugin.key);
    }

    if (plugin.render.abovePlite) {
      editor.runtime.pluginCache.render.abovePlite.push(plugin.key);
    }

    if (plugin.render.afterEditable) {
      editor.runtime.pluginCache.render.afterEditable.push(plugin.key);
    }

    if (plugin.render.beforeEditable) {
      editor.runtime.pluginCache.render.beforeEditable.push(plugin.key);
    }

    if (plugin.rules?.match) {
      editor.runtime.pluginCache.rules.match.push(plugin.key);
    }

    if (plugin.render.afterContainer) {
      editor.runtime.pluginCache.render.afterContainer.push(plugin.key);
    }

    if (plugin.render.beforeContainer) {
      editor.runtime.pluginCache.render.beforeContainer.push(plugin.key);
    }

    if (plugin.render.belowRootNodes) {
      editor.runtime.pluginCache.render.belowRootNodes.push(plugin.key);
    }

    if (plugin.transformInitialValue) {
      editor.runtime.pluginCache.transformInitialValue.push(plugin.key);
    }

    if (plugin.decorate) {
      editor.runtime.pluginCache.decorate.push(plugin.key);
    }

    if (plugin.render.aboveNodes) {
      editor.runtime.pluginCache.render.aboveNodes.push(plugin.key);
    }

    if (plugin.render.belowNodes) {
      editor.runtime.pluginCache.render.belowNodes.push(plugin.key);
    }

    if ((plugin as any).useHooks) {
      editor.runtime.pluginCache.useHooks.push(plugin.key);
    }

    if ((plugin as any).handlers?.onChange) {
      editor.runtime.pluginCache.handlers.onChange.push(plugin.key);
    }
    if ((plugin as any).handlers?.onNodeChange) {
      editor.runtime.pluginCache.handlers.onNodeChange.push(plugin.key);
    }
    if ((plugin as any).handlers?.onTextChange) {
      editor.runtime.pluginCache.handlers.onTextChange.push(plugin.key);
    }
  });

  resolvePluginShortcuts(editor);
  resolvePluginInputRules(editor);
  validateRemovedRuntimePlugins(editor);

  return editor;
};

const resolvePluginStores = (
  editor: BaseEditor,
  createStore: PluginStoreFactory
) => {
  // Create zustand stores for each plugin
  editor.runtime.pluginList.forEach((plugin) => {
    let store = createStore(plugin.options, {
      mutative: true,
      name: plugin.key,
    }) as typeof plugin.optionsStore;

    // Apply option extensions
    if (
      (plugin as any).__selectorExtensions &&
      (plugin as any).__selectorExtensions.length > 0
    ) {
      (plugin as any).__selectorExtensions.forEach((extension: any) => {
        const extendedOptions = extension(getEditorPlugin(editor, plugin));

        store = store.extendSelectors(
          () => extendedOptions
        ) as typeof plugin.optionsStore;
      });
    }

    plugin.optionsStore = store;
  });
};

const resolvePluginMethods = (editor: BaseEditor, plugin: any) => {
  // Apply API and transform extensions
  if (plugin.__apiExtensions && plugin.__apiExtensions.length > 0) {
    plugin.__apiExtensions.forEach(({ extension, isPluginSpecific }: any) => {
      const context = {
        ...(getEditorPlugin(editor, plugin) as any),
        api: editor.api,
      };

      const newExtensions = extension(context);

      if (isPluginSpecific) {
        // Handle APIs - Plugin-specific API
        if (!(plugin.api as any)[plugin.key]) {
          (plugin.api as any)[plugin.key] = {};
        }

        merge((plugin.api as any)[plugin.key], newExtensions);
      } else {
        // Handle APIs - Editor-wide API
        merge(plugin.api, newExtensions);
      }
    });
    plugin.__apiExtensions = undefined;
  }

  if (plugin.api && Object.keys(plugin.api).length > 0) {
    const cleanups = getPluginApiCleanups(editor);

    cleanups.get(plugin.key)?.();
    cleanups.set(
      plugin.key,
      editor.extend({
        api: merge({}, plugin.api),
        name: `plate:${plugin.key}:api`,
      })
    );
  }
};

const resolvePluginShortcuts = (editor: BaseEditor) => {
  editor.runtime.shortcuts = {} as Record<
    string,
    BasePlugin['shortcuts'][string]
  >; // Initialize with a more specific type

  editor.runtime.pluginList.forEach((plugin) => {
    Object.entries(plugin.shortcuts).forEach(([originalKey, hotkey]) => {
      const namespacedKey = `${plugin.key}.${originalKey}`;

      if (hotkey === null) {
        // If hotkey is null, remove the namespaced shortcut
        delete (
          editor.runtime.shortcuts as Record<
            string,
            BasePlugin['shortcuts'][string]
          >
        )[namespacedKey];
      } else if (hotkey && typeof hotkey === 'object') {
        const resolvedHotkey = { ...hotkey } as NonNullable<
          BasePlugin['shortcuts'][string]
        >;

        // If no custom handler is provided, route plugin commands through tx.
        if (!resolvedHotkey.handler) {
          const hasShortcutTxGroup = hasOwnPluginTxGroup(plugin);
          const pluginSpecificApi = (plugin.api as any)?.[plugin.key];

          if (hasShortcutTxGroup) {
            resolvedHotkey.handler = () => {
              let handled = false;

              editor.update((tx) => {
                const command = getPluginShortcutTxCommand(
                  tx,
                  plugin.key,
                  originalKey
                );

                if (!command) return;

                command();
                handled = true;
              });

              if (handled) return;

              if (typeof pluginSpecificApi?.[originalKey] === 'function') {
                return pluginSpecificApi[originalKey]();
              }

              return false;
            };
          } else if (pluginSpecificApi?.[originalKey]) {
            resolvedHotkey.handler = () => pluginSpecificApi[originalKey]();
          }
        }

        // Set shortcut priority, falling back to plugin priority
        resolvedHotkey.priority = resolvedHotkey.priority ?? plugin.priority;

        (
          editor.runtime.shortcuts as Record<
            string,
            BasePlugin['shortcuts'][string]
          >
        )[namespacedKey] = resolvedHotkey;
      }
    });
  });
};

const resolvePluginInputRules = (editor: BaseEditor) => {
  const resolvedMeta: ResolvedInputRulesMeta = {
    insertBreak: [],
    insertData: [],
    insertText: { all: [], byTrigger: {} },
    plugins: {},
  };

  editor.runtime.pluginList.forEach((plugin, pluginIndex) => {
    const pluginKey = plugin.key;
    const inputRulesDefinition = (plugin as any).inputRules;
    const definitionRules =
      typeof inputRulesDefinition === 'function'
        ? inputRulesDefinition({
            rule: createInputRuleBuilder(),
          })
        : (inputRulesDefinition ?? []);
    const configuredRules = ((plugin as any).__configuredInputRules ??
      []) as AnyInputRule[];
    const ruleDefinitions = [
      ...(definitionRules as AnyInputRule[]),
      ...configuredRules,
    ];

    resolvedMeta.plugins[pluginKey] = {
      rules: [],
    };

    ruleDefinitions.forEach((definition, ruleIndex) => {
      if (!definition) return;

      const mergedRule = mergePlugins(
        {},
        definition
      ) as unknown as ResolvedInputRule;
      const resolvedRule = {
        ...mergedRule,
        id: `${pluginKey}.${ruleIndex}`,
        pluginIndex,
        pluginKey,
        priority: mergedRule.priority ?? plugin.priority,
        ruleIndex,
      } as ResolvedInputRule;

      resolvedMeta.plugins[pluginKey].rules.push(resolvedRule);

      if (resolvedRule.target === 'insertText') {
        const triggers = Array.isArray(resolvedRule.trigger)
          ? [...resolvedRule.trigger]
          : [resolvedRule.trigger];

        resolvedMeta.insertText.all.push(resolvedRule);
        triggers.forEach((trigger) => {
          if (!resolvedMeta.insertText.byTrigger[trigger]) {
            resolvedMeta.insertText.byTrigger[trigger] = [];
          }

          resolvedMeta.insertText.byTrigger[trigger].push(resolvedRule);
        });
      } else if (resolvedRule.target === 'insertBreak') {
        resolvedMeta.insertBreak.push(resolvedRule);
      } else if (resolvedRule.target === 'insertData') {
        resolvedMeta.insertData.push(resolvedRule);
      }
    });
  });

  const sortRules = (a: ResolvedInputRule, b: ResolvedInputRule) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.pluginIndex !== b.pluginIndex) return a.pluginIndex - b.pluginIndex;

    return a.ruleIndex - b.ruleIndex;
  };

  resolvedMeta.insertBreak.sort(sortRules);
  resolvedMeta.insertData.sort(sortRules);
  resolvedMeta.insertText.all.sort(sortRules);
  Object.values(resolvedMeta.insertText.byTrigger).forEach((rules) => {
    rules.sort(sortRules);
  });

  editor.runtime.inputRules = resolvedMeta;
};

const validateRemovedRuntimePlugins = (editor: BaseEditor) => {
  const hasAutoformatPlugin = !!editor.plugins.autoformat;
  const hasResolvedInputRules =
    editor.runtime.inputRules.insertBreak.length > 0 ||
    editor.runtime.inputRules.insertData.length > 0 ||
    editor.runtime.inputRules.insertText.all.length > 0;

  if (hasAutoformatPlugin && hasResolvedInputRules) {
    throw new Error(
      [
        'AutoformatPlugin cannot be used with plugin-owned input rules.',
        'Remove AutoformatPlugin from your editor plugins.',
        'Enable inputRules on the feature plugins you use instead.',
      ].join(' ')
    );
  }
};

const flattenAndResolvePlugins = (
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[]
): Map<string, AnyBasePlugin> => {
  const pluginMap = new Map<string, AnyBasePlugin>();
  const mergeDuplicatePlugin = (
    existingPlugin: AnyBasePlugin,
    resolvedPlugin: AnyBasePlugin
  ) => {
    const mergedPlugin = mergePlugins(existingPlugin, resolvedPlugin);

    mergedPlugin.__apiExtensions = [
      ...(existingPlugin.__apiExtensions ?? []),
      ...(resolvedPlugin.__apiExtensions ?? []),
    ];
    mergedPlugin.__selectorExtensions = [
      ...(existingPlugin.__selectorExtensions ?? []),
      ...(resolvedPlugin.__selectorExtensions ?? []),
    ];
    mergedPlugin.__txExtensions = [
      ...(existingPlugin.__txExtensions ?? []),
      ...(resolvedPlugin.__txExtensions ?? []),
    ];

    return mergedPlugin;
  };

  const processPlugin = (plugin: AnyBasePlugin) => {
    const resolvedPlugin = resolvePlugin(editor, plugin);

    if (resolvedPlugin.key) {
      const existingPlugin = pluginMap.get(resolvedPlugin.key);

      if (existingPlugin) {
        pluginMap.set(
          resolvedPlugin.key,
          mergeDuplicatePlugin(existingPlugin, resolvedPlugin)
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
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[]
): BasePlugins => {
  // Step 1: Resolve, flatten, and merge all plugins
  const pluginMap = flattenAndResolvePlugins(editor, plugins);

  // Step 2: Filter out disabled plugins
  const enabledPlugins = Array.from(pluginMap.values()).filter(
    (plugin) => plugin.enabled !== false
  );

  // Step 3: Sort plugins by priority
  enabledPlugins.sort((a, b) => b.priority - a.priority);

  // Step 4: Reorder based on dependencies
  const orderedPlugins: BasePlugins = [];
  const visited = new Set<string>();

  const visit = (plugin: AnyBasePlugin) => {
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
  editor: BaseEditor,
  plugins: BasePlugins
) => {
  editor.runtime.pluginList = plugins;
  editor.plugins = Object.fromEntries(
    plugins.map((plugin) => [plugin.key, plugin])
  );
};

export const resolvePluginOverrides = (editor: BaseEditor) => {
  const applyOverrides = (plugins: AnyBasePlugin[]): AnyBasePlugin[] => {
    let overriddenPlugins = [...plugins];

    const enabledOverrides: Record<string, boolean> = {};
    const componentOverrides: Record<
      string,
      { component: any; priority: number }
    > = {};
    const pluginOverrides: Record<string, Partial<AnyBasePlugin>> = {};

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

  editor.runtime.pluginList = applyOverrides(editor.runtime.pluginList as any);
  editor.plugins = Object.fromEntries(
    editor.runtime.pluginList.map((plugin) => [plugin.key, plugin])
  );
};
