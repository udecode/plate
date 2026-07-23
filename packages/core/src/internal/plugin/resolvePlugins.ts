import type {
  EditorExtension,
  EditorStateSchemaApi,
  EditorUpdateTransaction,
} from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';
import { getCompiledEditorSchemaFromApi } from '@platejs/plite/internal';
import { isDefined } from '@udecode/utils';
import merge from 'lodash/merge.js';
import { createVanillaStore } from 'zustand-x/vanilla';

import type {
  AnyBasePlugin,
  BaseEditor,
  BasePlugin,
  BasePlugins,
  NodeComponents,
  PlatePluginTxGroup,
  PlateSchemaIdentity,
} from '../../lib';

import { getEditorPlugin } from '../../lib/plugin';
import {
  brandPluginDescriptor,
  isOpaquePluginRenderKey,
  isNominalPluginDescriptor,
  isNominalSchemaConfigToken,
  mergePlugins,
} from '../utils/mergePlugins';
import type {
  CompiledPlateModel,
  PlateModelPublication,
} from './compilePlateModel';
import {
  getPlateModelPublication,
  getPlateRuntime,
  setCompiledPlatePluginCandidate,
  withCompiledPlatePluginApiCandidate,
  withCompiledPlatePluginCandidate,
} from './compilePlateModel';
import {
  clearPluginOptionsStores,
  createPluginOptionsSnapshot,
  snapshotPluginOptions,
  type PluginOptionsStore,
  setPluginOptionsStore,
} from './pluginOptionsStore';
import {
  setPlateRuntimeCandidate,
  type PlatePluginCache,
} from './plateRuntime';
import { resolvePlugin } from './resolvePlugin';
import type {
  AnyInputRule,
  ResolvedInputRule,
} from '../../lib/plugins/input-rules/types';
import { createInputRuleBuilder } from '../../lib/plugins/input-rules/internal/createInputRuleBuilder';

const sourcePluginDerivedKeys = new Set<PropertyKey>(['__resolved']);
type PluginDescriptorSnapshotContext = Readonly<{
  path: readonly PropertyKey[];
  pluginKey: string;
}>;

const appendPluginDescriptorPath = (
  context: PluginDescriptorSnapshotContext,
  key: PropertyKey
): PluginDescriptorSnapshotContext => ({
  path: [...context.path, key],
  pluginKey: context.pluginKey,
});

const formatPluginDescriptorPath = (path: readonly PropertyKey[]) =>
  path.reduce<string>((output, key) => {
    if (typeof key === 'number') return `${output}[${key}]`;
    if (typeof key === 'symbol') return `${output}[${String(key)}]`;

    return output ? `${output}.${key}` : key;
  }, '');

const createPluginDescriptorAccessorError = (
  context: PluginDescriptorSnapshotContext
) =>
  new Error(
    `Plate plugin "${context.pluginKey}" descriptor path "${formatPluginDescriptorPath(context.path)}" must be data-only. Accessor properties are not supported.`
  );

const isOpaquePluginHostResource = (
  context: PluginDescriptorSnapshotContext
) => {
  const { path } = context;
  const key = path.at(-1);
  const parent = path.at(-2);

  if (parent === 'render' && isOpaquePluginRenderKey(key!)) return true;

  return path.at(-3) === 'override' && parent === 'components';
};

type MutableDeep<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends readonly (infer TItem)[]
    ? MutableDeep<TItem>[]
    : T extends object
      ? { -readonly [K in keyof T]: MutableDeep<T[K]> }
      : T;

type MutablePlatePluginCache = MutableDeep<PlatePluginCache>;
type MutableResolvedInputRulesMeta = {
  insertBreak: Extract<ResolvedInputRule, { target: 'insertBreak' }>[];
  insertData: Extract<ResolvedInputRule, { target: 'insertData' }>[];
  insertText: {
    all: Extract<ResolvedInputRule, { target: 'insertText' }>[];
    byTrigger: Record<
      string,
      Extract<ResolvedInputRule, { target: 'insertText' }>[]
    >;
  };
  plugins: Record<string, { rules: ResolvedInputRule[] }>;
};

type ShortcutApiOwner = Readonly<{
  editor: Readonly<Record<string, unknown>>;
  plugin: Readonly<Record<string, unknown>>;
}>;

const createMutablePlatePluginCache = (): MutablePlatePluginCache => ({
  decorate: [],
  handlers: {
    onNodeChange: [],
    onTextChange: [],
  },
  inject: { nodeProps: [] },
  node: {
    containerTypes: [],
    decoratedMarks: [],
    leafProps: [],
    textMarks: [],
    textProps: [],
    types: Object.create(null),
  },
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
  rules: { match: [] },
  transformInitialValue: [],
  useHooks: [],
});

const createMutableResolvedInputRulesMeta =
  (): MutableResolvedInputRulesMeta => ({
    insertBreak: [],
    insertData: [],
    insertText: { all: [], byTrigger: Object.create(null) },
    plugins: Object.create(null),
  });

const snapshotPluginDescriptorValue = (
  value: unknown,
  snapshots: WeakMap<object, unknown>,
  context: PluginDescriptorSnapshotContext,
  publishedPlugins?: ReadonlyMap<string, AnyBasePlugin>,
  optionReferences = new WeakMap<object, unknown>()
): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (isOpaquePluginHostResource(context)) return value;
  if (isNominalSchemaConfigToken(value)) return value;
  if (isNominalPluginDescriptor(value)) {
    const published = publishedPlugins?.get(value.key);

    if (published) return published;
  }

  const existing = snapshots.get(value);

  if (existing !== undefined) return existing;
  if (Array.isArray(value)) {
    const snapshot: unknown[] = [];

    snapshots.set(value, snapshot);
    snapshot.push(
      ...value.map((item, index) =>
        snapshotPluginDescriptorValue(
          item,
          snapshots,
          appendPluginDescriptorPath(context, index),
          publishedPlugins,
          optionReferences
        )
      )
    );

    return Object.freeze(snapshot);
  }

  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) return value;

  const isPluginDescriptor = isNominalPluginDescriptor(value);
  const ownerContext = isPluginDescriptor
    ? { path: [], pluginKey: value.key }
    : context;
  const snapshot: Record<PropertyKey, unknown> = Object.create(prototype);

  snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    if (sourcePluginDerivedKeys.has(key)) continue;

    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor) continue;
    if (!Object.hasOwn(descriptor, 'value')) {
      throw createPluginDescriptorAccessorError(
        appendPluginDescriptorPath(ownerContext, key)
      );
    }

    Object.defineProperty(snapshot, key, {
      enumerable: descriptor.enumerable,
      value:
        isPluginDescriptor && key === 'options'
          ? snapshotPluginOptions(descriptor.value)
          : snapshotPluginDescriptorValue(
              descriptor.value,
              snapshots,
              appendPluginDescriptorPath(ownerContext, key),
              publishedPlugins,
              optionReferences
            ),
    });
  }

  const frozen = Object.freeze(snapshot);

  return isPluginDescriptor ? brandPluginDescriptor(frozen) : frozen;
};

/** Capture the immutable descriptor graph used by every Plate projection. */
export const snapshotPlatePluginSources = (
  plugins: readonly AnyBasePlugin[]
): readonly AnyBasePlugin[] => {
  const snapshots = new WeakMap<object, unknown>();
  const optionReferences = new WeakMap<object, unknown>();

  return Object.freeze(
    plugins.map((plugin) =>
      snapshotPluginDescriptorValue(
        plugin,
        snapshots,
        { path: [], pluginKey: plugin.key },
        undefined,
        optionReferences
      )
    ) as AnyBasePlugin[]
  );
};

const publishPlatePluginDescriptors = (
  pluginList: readonly AnyBasePlugin[]
): readonly AnyBasePlugin[] => {
  const publishedByKey = new Map<string, AnyBasePlugin>();

  pluginList.forEach((plugin) => {
    publishedByKey.set(plugin.key, brandPluginDescriptor({} as AnyBasePlugin));
  });

  const snapshots = new WeakMap<object, unknown>();
  const optionReferences = new WeakMap<object, unknown>();

  pluginList.forEach((plugin) => {
    const published = publishedByKey.get(plugin.key)!;

    for (const key of Reflect.ownKeys(plugin)) {
      if (sourcePluginDerivedKeys.has(key)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(plugin, key);

      if (!descriptor) continue;
      if (!Object.hasOwn(descriptor, 'value')) {
        throw createPluginDescriptorAccessorError({
          path: [key],
          pluginKey: plugin.key,
        });
      }

      let value: unknown;

      if (key === 'dependencies' || key === 'plugins') {
        const references = Array.isArray(descriptor.value)
          ? descriptor.value
          : [];

        value = Object.freeze(
          references.flatMap((reference: unknown) => {
            if (!isNominalPluginDescriptor(reference)) return [];
            const installed = publishedByKey.get(reference.key);

            if (installed) return [installed];
            if (key === 'dependencies') {
              throw new Error(
                `Plate plugin "${plugin.key}" lost installed dependency "${reference.key}" during publication.`
              );
            }

            return [];
          })
        );
      } else if (key === 'options') {
        value = snapshotPluginOptions(descriptor.value);
      } else {
        value = snapshotPluginDescriptorValue(
          descriptor.value,
          snapshots,
          { path: [key], pluginKey: plugin.key },
          publishedByKey,
          optionReferences
        );
      }

      Object.defineProperty(published, key, {
        enumerable: descriptor.enumerable,
        value,
      });
    }

    Object.defineProperty(published, '__resolved', {
      enumerable: true,
      value: true,
    });
  });

  const publishedPluginList = pluginList.map(
    (plugin) => publishedByKey.get(plugin.key)!
  );

  publishedPluginList.forEach(Object.freeze);

  return Object.freeze(publishedPluginList);
};

/**
 * Initialize and configure the editor's plugin system. This function sets up
 * the editor's plugins, resolving core and custom plugins, and applying any
 * overrides specified in the plugins.
 */
export const resolvePlugins = (
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[] = []
) => {
  if (getPlateModelPublication(editor)) {
    throw new Error(
      'Plate plugins are fixed after model publication. Configure plugin options before creating the editor.'
    );
  }

  clearPluginOptionsStores(editor);
  const pluginCache = createMutablePlatePluginCache();

  setPlateRuntimeCandidate(editor, {
    components: Object.create(null),
    inputRules: createMutableResolvedInputRulesMeta(),
    pluginCache,
    pluginList: [],
    plugins: Object.create(null),
    shortcuts: Object.create(null),
  });
  const resolvedPlugins = resolveAndSortPlugins(editor, plugins);
  const snapshotOptions = createPluginOptionsSnapshot();

  resolvedPlugins.forEach((plugin) => {
    plugin.options = snapshotOptions(plugin.options);
  });

  applyPluginsToEditor(editor, resolvedPlugins);

  resolvePluginStores(editor);

  return editor;
};

/** Compile the Plate runtime projection published by the schema extension. */
export const createPlateModelPublication = (
  editor: BaseEditor,
  identity: PlateSchemaIdentity | null,
  model: CompiledPlateModel,
  pluginList: readonly AnyBasePlugin[],
  schemaApi: EditorStateSchemaApi,
  apiByPlugin: Readonly<
    Record<string, Readonly<Record<string, unknown>> | undefined>
  >,
  shortcutApiByPlugin: Readonly<Record<string, ShortcutApiOwner | undefined>>,
  updateMethods: Readonly<Record<string, readonly string[] | undefined>>
): PlateModelPublication => {
  const publishedPluginList = publishPlatePluginDescriptors(pluginList);
  const plugins: Record<string, AnyBasePlugin> = Object.create(null);

  publishedPluginList.forEach((plugin) => {
    plugins[plugin.key] = plugin;
  });
  const compiledSchema = getCompiledEditorSchemaFromApi(schemaApi);

  if (!compiledSchema) {
    throw new Error('Plate model publication requires a compiled schema.');
  }

  const decoratedMarks: string[] = [];
  const leafProps: string[] = [];
  const textMarks: string[] = [];
  const textProps: string[] = [];
  const types: Record<string, string> = Object.create(null);
  const components: NodeComponents = Object.create(null);
  model.bindings.forEach((binding) => {
    const plugin = plugins[binding.pluginKey];

    if (binding.kind === 'none' || !plugin) return;

    types[binding.type] = binding.pluginKey;
    if (plugin.render.node) {
      components[binding.pluginKey] = plugin.render.node;
    }
    if (binding.kind !== 'mark') return;
    if (binding.isDecoration || plugin.render.leaf) {
      decoratedMarks.push(binding.pluginKey);
    }
    if (!binding.isDecoration) {
      textMarks.push(binding.pluginKey);
    }
    if (plugin.render.leafProps) {
      leafProps.push(binding.pluginKey);
    }
    if (plugin.render.textProps) {
      textProps.push(binding.pluginKey);
    }
  });

  const blockTypes = compiledSchema.elements.groups.get('block');
  const containerTypes = model.bindings.flatMap((binding) => {
    if (binding.kind !== 'element' || !blockTypes) return [];

    const childTypes = compiledSchema.elements.byType.get(binding.type)?.content
      ?.allowedElementTypes;

    if (!childTypes) return [];

    for (const childType of childTypes) {
      if (blockTypes.has(childType)) return [binding.pluginKey];
    }

    return [];
  });
  const pluginCache = createMutablePlatePluginCache();

  pluginCache.node.containerTypes.push(...containerTypes);
  pluginCache.node.decoratedMarks.push(...decoratedMarks);
  pluginCache.node.leafProps.push(...leafProps);
  pluginCache.node.textMarks.push(...textMarks);
  pluginCache.node.textProps.push(...textProps);
  Object.assign(pluginCache.node.types, types);

  publishedPluginList.forEach((plugin) => {
    if (plugin.inject.nodeProps) {
      pluginCache.inject.nodeProps.push(plugin.key);
    }
    if (plugin.render.aboveEditable) {
      pluginCache.render.aboveEditable.push(plugin.key);
    }
    if (plugin.render.aboveNodes) {
      pluginCache.render.aboveNodes.push(plugin.key);
    }
    if (plugin.render.abovePlite) {
      pluginCache.render.abovePlite.push(plugin.key);
    }
    if (plugin.render.afterContainer) {
      pluginCache.render.afterContainer.push(plugin.key);
    }
    if (plugin.render.afterEditable) {
      pluginCache.render.afterEditable.push(plugin.key);
    }
    if (plugin.render.beforeContainer) {
      pluginCache.render.beforeContainer.push(plugin.key);
    }
    if (plugin.render.beforeEditable) {
      pluginCache.render.beforeEditable.push(plugin.key);
    }
    if (plugin.render.belowNodes) {
      pluginCache.render.belowNodes.push(plugin.key);
    }
    if (plugin.render.belowRootNodes) {
      pluginCache.render.belowRootNodes.push(plugin.key);
    }
    if (plugin.rules?.match) pluginCache.rules.match.push(plugin.key);
    if (plugin.transformInitialValue) {
      pluginCache.transformInitialValue.push(plugin.key);
    }
    if (plugin.decorate) pluginCache.decorate.push(plugin.key);
    if ((plugin as any).useHooks) pluginCache.useHooks.push(plugin.key);
    if ((plugin as any).handlers?.onNodeChange) {
      pluginCache.handlers.onNodeChange.push(plugin.key);
    }
    if ((plugin as any).handlers?.onTextChange) {
      pluginCache.handlers.onTextChange.push(plugin.key);
    }
  });

  const freezeList = <T>(value: T[]) => Object.freeze(value);
  const publishedPluginCache: PlatePluginCache = Object.freeze({
    decorate: freezeList(pluginCache.decorate),
    handlers: Object.freeze({
      onNodeChange: freezeList(pluginCache.handlers.onNodeChange),
      onTextChange: freezeList(pluginCache.handlers.onTextChange),
    }),
    inject: Object.freeze({
      nodeProps: freezeList(pluginCache.inject.nodeProps),
    }),
    node: Object.freeze({
      containerTypes: freezeList(containerTypes),
      decoratedMarks: freezeList(decoratedMarks),
      leafProps: freezeList(leafProps),
      textMarks: freezeList(textMarks),
      textProps: freezeList(textProps),
      types: Object.freeze(types),
    }),
    render: Object.freeze({
      aboveEditable: freezeList(pluginCache.render.aboveEditable),
      aboveNodes: freezeList(pluginCache.render.aboveNodes),
      abovePlite: freezeList(pluginCache.render.abovePlite),
      afterContainer: freezeList(pluginCache.render.afterContainer),
      afterEditable: freezeList(pluginCache.render.afterEditable),
      beforeContainer: freezeList(pluginCache.render.beforeContainer),
      beforeEditable: freezeList(pluginCache.render.beforeEditable),
      belowNodes: freezeList(pluginCache.render.belowNodes),
      belowRootNodes: freezeList(pluginCache.render.belowRootNodes),
    }),
    rules: Object.freeze({ match: freezeList(pluginCache.rules.match) }),
    transformInitialValue: freezeList(pluginCache.transformInitialValue),
    useHooks: freezeList(pluginCache.useHooks),
  });

  return Object.freeze({
    apiByPlugin,
    components: Object.freeze(components),
    identity,
    inputRules: snapshotApiValue(createPluginInputRules(pluginList)),
    model,
    pluginCache: publishedPluginCache,
    pluginList: Object.freeze(publishedPluginList),
    plugins: Object.freeze(plugins),
    shortcuts: snapshotApiValue(
      createPluginShortcuts(
        editor,
        publishedPluginList,
        shortcutApiByPlugin,
        updateMethods
      )
    ),
  });
};

const resolvePluginStores = (editor: BaseEditor) => {
  getPlateRuntime(editor).pluginList.forEach((plugin) => {
    const base = createVanillaStore(snapshotPluginOptions(plugin.options), {
      mutative: true,
      name: plugin.key,
    }) as PluginOptionsStore;

    setPluginOptionsStore(
      editor,
      plugin.key,
      projectPluginSelectors(editor, plugin, base)
    );
  });
};

const projectPluginSelectors = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  base: PluginOptionsStore
) => {
  let store = base;

  if (plugin.__selectorExtensions.length === 0) return store;

  plugin.__selectorExtensions.forEach((extension) => {
    const extendedOptions = extension(getEditorPlugin(editor, plugin));

    store = store.extendSelectors(() => extendedOptions) as PluginOptionsStore;
  });

  return store;
};

const resolvePluginApi = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  pluginApi: Record<string, any>
) => {
  const editorApi = merge({}, plugin.__editorApi) as Record<string, any>;

  plugin.__apiExtensions.forEach(({ extension, isPluginSpecific }: any) => {
    const context = {
      ...getEditorPlugin(editor, plugin),
      api: pluginApi,
    };
    const extensionApi = extension(context);

    merge(isPluginSpecific ? pluginApi : editorApi, extensionApi);
  });

  return editorApi;
};

const snapshotApiValue = <T>(
  value: T,
  snapshots = new WeakMap<object, unknown>()
): T => {
  if (!value || typeof value !== 'object') return value;

  const existing = snapshots.get(value);

  if (existing !== undefined) return existing as T;
  if (Array.isArray(value)) {
    const snapshot: unknown[] = [];

    snapshots.set(value, snapshot);
    snapshot.push(...value.map((item) => snapshotApiValue(item, snapshots)));

    return Object.freeze(snapshot) as T;
  }
  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) return value;
  const snapshot: Record<PropertyKey, unknown> = Object.create(prototype);

  snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || !Object.hasOwn(descriptor, 'value')) continue;
    Object.defineProperty(snapshot, key, {
      enumerable: descriptor.enumerable,
      value: snapshotApiValue(descriptor.value, snapshots),
    });
  }

  return Object.freeze(snapshot) as T;
};

const collectPluginTxGroups = (
  editor: BaseEditor,
  pluginList: readonly AnyBasePlugin[]
) => {
  const txGroups = new Map<string, PlatePluginTxGroup[]>();
  const addGroup = (groupKey: string, groupFactory: unknown) => {
    if (!groupFactory) return;

    const groups = txGroups.get(groupKey) ?? [];

    groups.push(groupFactory as PlatePluginTxGroup);
    txGroups.set(groupKey, groups);
  };

  pluginList.forEach((plugin) => {
    plugin.__txExtensions.forEach((txExtension) => {
      Object.entries(txExtension(getEditorPlugin(editor, plugin))).forEach(
        ([groupKey, groupFactory]) => {
          addGroup(groupKey, groupFactory);
        }
      );
    });
    Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
      addGroup(groupKey, groupFactory);
    });
  });

  let probe: any;

  probe = new Proxy(() => probe, {
    apply: () => probe,
    get: () => probe,
  });
  const updateMethods: Record<string, readonly string[]> = Object.create(null);

  txGroups.forEach((groupFactories, groupKey) => {
    const methods = new Set<string>();

    groupFactories.forEach((groupFactory) => {
      let group: Record<string, unknown>;

      try {
        group = groupFactory(
          probe as unknown as EditorUpdateTransaction,
          editor,
          probe as never
        ) as Record<string, unknown>;
      } catch (cause) {
        throw new Error(
          `Plate update namespace "${groupKey}" could not be inspected. Transaction group factories must construct commands without executing document work.`,
          { cause }
        );
      }

      Object.entries(group).forEach(([key, value]) => {
        if (typeof value === 'function') methods.add(key);
      });
    });

    updateMethods[groupKey] = Object.freeze([...methods]);
  });

  return Object.freeze({
    groups: txGroups,
    updateMethods: Object.freeze(updateMethods),
  });
};

/** Stage plugin API and transaction factories in the Plate model revision. */
export const createPlateRuntimeExtension = (
  editor: BaseEditor,
  pluginList: readonly AnyBasePlugin[]
) => {
  const api = {} as Record<string, unknown>;
  const apiByPlugin: Record<
    string,
    Readonly<Record<string, unknown>>
  > = Object.create(null);
  const shortcutApiByPlugin: Record<string, ShortcutApiOwner> =
    Object.create(null);

  withCompiledPlatePluginApiCandidate(editor, apiByPlugin, () => {
    pluginList.forEach((plugin) => {
      const pluginApi: Record<string, unknown> = {};

      apiByPlugin[plugin.key] = pluginApi;
      const editorApi = resolvePluginApi(editor, plugin, pluginApi);

      apiByPlugin[plugin.key] = snapshotApiValue(pluginApi);
      shortcutApiByPlugin[plugin.key] = Object.freeze({
        editor: snapshotApiValue(editorApi),
        plugin: snapshotApiValue(pluginApi),
      });
      merge(api, editorApi);
    });
  });
  const runtimeApi = snapshotApiValue(api);
  const txRuntime = withCompiledPlatePluginApiCandidate(
    editor,
    apiByPlugin,
    () => collectPluginTxGroups(editor, pluginList)
  );
  const tx = Object.create(null) as NonNullable<EditorExtension['tx']>;

  txRuntime.groups.forEach((groupFactories, groupKey) => {
    tx[groupKey] = (transaction, runtimeEditor, context) => {
      const group = Object.create(null) as Record<string, unknown>;

      groupFactories.forEach((groupFactory) => {
        Object.assign(
          group,
          groupFactory(transaction, runtimeEditor as BaseEditor, context as any)
        );
      });

      return group;
    };
  });

  return Object.freeze({
    api: runtimeApi,
    apiByPlugin: Object.freeze(apiByPlugin),
    extension: defineEditorExtension<BaseEditor>()({
      ...(Object.keys(runtimeApi).length > 0 ? { api: runtimeApi } : {}),
      name: 'plate:runtime',
      ...(txRuntime.groups.size > 0 ? { tx } : {}),
    }),
    shortcutApiByPlugin: Object.freeze(shortcutApiByPlugin),
    updateMethods: txRuntime.updateMethods,
  });
};

const createPluginShortcuts = (
  editor: BaseEditor,
  pluginList: readonly AnyBasePlugin[],
  shortcutApiByPlugin?: Readonly<Record<string, ShortcutApiOwner | undefined>>,
  updateMethods?: Readonly<Record<string, readonly string[] | undefined>>
) => {
  const shortcuts = Object.create(null) as Record<
    string,
    BasePlugin['shortcuts'][string]
  >;

  pluginList.forEach((plugin) => {
    Object.entries(plugin.shortcuts).forEach(([originalKey, hotkey]) => {
      const namespacedKey = `${plugin.key}.${originalKey}`;

      if (hotkey === null) {
        // If hotkey is null, remove the namespaced shortcut
        delete (shortcuts as Record<string, BasePlugin['shortcuts'][string]>)[
          namespacedKey
        ];
      } else if (hotkey && typeof hotkey === 'object') {
        const { target, ...hotkeyOptions } = hotkey;
        const resolvedHotkey = { ...hotkeyOptions } as Record<
          string,
          unknown
        > & {
          handler?: (...args: any[]) => any;
          priority?: number;
        };

        if (resolvedHotkey.handler && target !== undefined) {
          throw new Error(
            `Plate shortcut "${namespacedKey}" cannot define \`target\` together with a custom handler.`
          );
        }

        if (!resolvedHotkey.handler && updateMethods) {
          if (target !== undefined && target !== 'api' && target !== 'update') {
            throw new Error(
              `Plate shortcut "${namespacedKey}" target must be "update" or "api".`
            );
          }
          const hasUpdate =
            updateMethods[plugin.key]?.includes(originalKey) === true;
          const apiScopes = shortcutApiByPlugin?.[plugin.key];
          const editorApiCommand = apiScopes?.editor[originalKey];
          const pluginApiCommand = apiScopes?.plugin[originalKey];
          const hasEditorApi = typeof editorApiCommand === 'function';
          const hasPluginApi = typeof pluginApiCommand === 'function';
          const hasAmbiguousApi = hasEditorApi && hasPluginApi;
          const apiOwner = hasPluginApi ? apiScopes?.plugin : apiScopes?.editor;
          const apiCommand = hasPluginApi ? pluginApiCommand : editorApiCommand;
          if (hasAmbiguousApi) {
            throw new Error(
              `Plate shortcut "${namespacedKey}" matches API commands in both plugin and editor scopes. Rename one command or add a custom handler.`
            );
          }
          const hasApi = typeof apiCommand === 'function';
          const route = (() => {
            if (target === 'update') {
              if (!hasUpdate) {
                throw new Error(
                  `Plate shortcut "${namespacedKey}" targets missing update command "${plugin.key}.${originalKey}".`
                );
              }

              return 'update';
            }
            if (target === 'api') {
              if (!hasApi) {
                throw new Error(
                  `Plate shortcut "${namespacedKey}" targets missing API command "${plugin.key}.${originalKey}".`
                );
              }

              return 'api';
            }
            if (hasUpdate && hasApi) {
              throw new Error(
                `Plate shortcut "${namespacedKey}" matches both update and API commands. Set target to "update" or "api".`
              );
            }
            if (hasUpdate) return 'update';
            if (hasApi) return 'api';

            throw new Error(
              `Plate shortcut "${namespacedKey}" does not match a public update or API command. Add a custom handler or define the command.`
            );
          })();

          if (route === 'update') {
            resolvedHotkey.handler = () => {
              const updateGroup = (
                editor.update as unknown as Record<string, unknown>
              )[plugin.key];
              const command =
                updateGroup && typeof updateGroup === 'object'
                  ? (updateGroup as Record<string, unknown>)[originalKey]
                  : undefined;

              if (typeof command !== 'function') {
                throw new Error(
                  `Plate shortcut "${namespacedKey}" lost its compiled update command.`
                );
              }

              const result = Reflect.apply(command, updateGroup, []);

              return result === false ? false : undefined;
            };
          } else {
            resolvedHotkey.handler = () =>
              Reflect.apply(
                apiCommand as (...args: never[]) => unknown,
                apiOwner,
                []
              );
          }
        }

        // Set shortcut priority, falling back to plugin priority
        resolvedHotkey.priority = resolvedHotkey.priority ?? plugin.priority;

        (shortcuts as Record<string, BasePlugin['shortcuts'][string]>)[
          namespacedKey
        ] = resolvedHotkey as NonNullable<BasePlugin['shortcuts'][string]>;
      }
    });
  });

  return shortcuts;
};

const createPluginInputRules = (pluginList: readonly AnyBasePlugin[]) => {
  const resolvedMeta = createMutableResolvedInputRulesMeta();

  pluginList.forEach((plugin, pluginIndex) => {
    const pluginKey = plugin.key;
    const inputRulesDefinition = (plugin as any).inputRules;
    const definitionRules =
      typeof inputRulesDefinition === 'function'
        ? inputRulesDefinition({
            rule: createInputRuleBuilder(),
          })
        : (inputRulesDefinition ?? []);
    const ruleDefinitions = definitionRules as AnyInputRule[];

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

  return resolvedMeta;
};

const flattenAndResolvePlugins = (
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[]
): {
  explicitKeys: Set<string>;
  pluginMap: Map<string, AnyBasePlugin>;
} => {
  const pluginMap = new Map<string, AnyBasePlugin>();
  const explicitKeys = new Set<string>();
  const mergeDuplicatePlugin = (
    existingPlugin: AnyBasePlugin,
    resolvedPlugin: AnyBasePlugin
  ) => {
    const mergedPlugin = mergePlugins(existingPlugin, resolvedPlugin);

    const mergeExtensions = <T>(current: T[] = [], next: T[] = []) => [
      ...current,
      ...next.filter((extension) => !current.includes(extension)),
    ];

    mergedPlugin.__apiExtensions = mergeExtensions(
      existingPlugin.__apiExtensions,
      resolvedPlugin.__apiExtensions
    );
    mergedPlugin.__editorExtensions = mergeExtensions(
      existingPlugin.__editorExtensions,
      resolvedPlugin.__editorExtensions
    );
    mergedPlugin.__selectorExtensions = mergeExtensions(
      existingPlugin.__selectorExtensions,
      resolvedPlugin.__selectorExtensions
    );
    mergedPlugin.__txExtensions = mergeExtensions(
      existingPlugin.__txExtensions,
      resolvedPlugin.__txExtensions
    );

    return mergedPlugin;
  };

  const dependencyObjects = new WeakSet<object>();
  const resolvedPluginBySource = new WeakMap<object, AnyBasePlugin>();
  let collectDependencies: (plugin: AnyBasePlugin) => void;
  const processPlugin = (
    plugin: AnyBasePlugin,
    explicit: boolean,
    dependenciesReady = false
  ) => {
    if (!dependenciesReady) collectDependencies(plugin);
    let resolvedPlugin = resolvedPluginBySource.get(plugin);

    if (!resolvedPlugin) {
      resolvedPlugin = resolvePlugin(editor, plugin);
      resolvedPluginBySource.set(plugin, resolvedPlugin);
    }

    if (resolvedPlugin.key) {
      if (explicit) explicitKeys.add(resolvedPlugin.key);

      const existingPlugin = pluginMap.get(resolvedPlugin.key);
      let candidate = resolvedPlugin;

      if (existingPlugin) {
        candidate = mergeDuplicatePlugin(existingPlugin, resolvedPlugin);
        pluginMap.set(resolvedPlugin.key, candidate);
      } else {
        pluginMap.set(resolvedPlugin.key, resolvedPlugin);
      }
      setCompiledPlatePluginCandidate(editor, candidate);
    } else {
      // If the plugin has no key, we just just skip it.
    }

    if (resolvedPlugin.plugins && resolvedPlugin.plugins.length > 0) {
      const nestedPlugins: readonly AnyBasePlugin[] = resolvedPlugin.plugins;

      nestedPlugins.forEach((nestedPlugin) => {
        processPlugin(nestedPlugin, explicit);
      });
    }
  };

  collectDependencies = (plugin: AnyBasePlugin) => {
    for (const dependency of plugin.dependencies) {
      if (!dependency || typeof dependency !== 'object') {
        throw new Error(
          `Plugin "${plugin.key}" has an invalid dependency. Pass the plugin object, not its key.`
        );
      }
      if (dependencyObjects.has(dependency)) continue;

      dependencyObjects.add(dependency);
      collectDependencies(dependency as AnyBasePlugin);
      processPlugin(dependency as AnyBasePlugin, false, true);
    }

    plugin.plugins.forEach(collectDependencies);
  };

  plugins.forEach(collectDependencies);
  plugins.forEach((plugin) => {
    processPlugin(plugin, true);
  });

  return { explicitKeys, pluginMap };
};

const collectPlatePluginSourceCandidates = (
  plugins: readonly AnyBasePlugin[]
) => {
  const candidates = new Map<string, AnyBasePlugin>();
  const dependencies = new WeakSet<object>();
  const collectPlugin = (plugin: AnyBasePlugin) => {
    if (plugin.key) candidates.set(plugin.key, plugin);
    plugin.plugins.forEach(collectPlugin);
  };
  const collectDependencies = (plugin: AnyBasePlugin) => {
    plugin.dependencies.forEach((dependency: unknown) => {
      if (!dependency || typeof dependency !== 'object') return;
      if (dependencies.has(dependency)) return;

      dependencies.add(dependency);
      collectDependencies(dependency as AnyBasePlugin);
      collectPlugin(dependency as AnyBasePlugin);
    });
    plugin.plugins.forEach(collectDependencies);
  };

  plugins.forEach(collectDependencies);
  plugins.forEach(collectPlugin);

  return [...candidates.values()];
};

const resolveAndSortPluginsCandidate = (
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[]
): BasePlugins => {
  const { explicitKeys, pluginMap: collectedPluginMap } =
    flattenAndResolvePlugins(editor, plugins);
  const overriddenPlugins = applyPluginOverrides(
    Array.from(collectedPluginMap.values()),
    false
  );
  const pluginMap = new Map(
    overriddenPlugins.map((plugin) => [plugin.key, plugin])
  );
  const roots = overriddenPlugins
    .filter(
      (plugin) => explicitKeys.has(plugin.key) && plugin.enabled !== false
    )
    .sort((a, b) => b.priority - a.priority);
  const orderedPlugins: BasePlugins = [];
  const state = new Map<string, 'visited' | 'visiting'>();
  const stack: string[] = [];

  const visit = (plugin: AnyBasePlugin) => {
    if (state.get(plugin.key) === 'visited') return;
    if (state.get(plugin.key) === 'visiting') {
      const cycleStart = stack.indexOf(plugin.key);
      const cycle = [...stack.slice(cycleStart), plugin.key].join(' -> ');

      throw new Error(`Circular plugin dependency: ${cycle}`);
    }

    state.set(plugin.key, 'visiting');
    stack.push(plugin.key);

    for (const dependency of plugin.dependencies) {
      if (!dependency || typeof dependency !== 'object') {
        throw new Error(
          `Plugin "${plugin.key}" has an invalid dependency. Pass the plugin object, not its key.`
        );
      }

      const dependencyKey = (dependency as AnyBasePlugin).key;
      const dependencyPlugin = pluginMap.get(dependencyKey);

      if (!dependencyPlugin) {
        throw new Error(
          `Plugin "${plugin.key}" depends on missing plugin "${dependencyKey}"`
        );
      }
      if (dependencyPlugin.enabled === false) {
        throw new Error(
          `Plugin "${plugin.key}" depends on disabled plugin "${dependencyKey}"`
        );
      }

      visit(dependencyPlugin);
    }

    stack.pop();
    state.set(plugin.key, 'visited');
    orderedPlugins.push(plugin);
  };

  roots.forEach(visit);

  return orderedPlugins;
};

export const resolveAndSortPlugins = (
  editor: BaseEditor,
  plugins: readonly AnyBasePlugin[]
): BasePlugins =>
  withCompiledPlatePluginCandidate(
    editor,
    collectPlatePluginSourceCandidates(plugins),
    () => resolveAndSortPluginsCandidate(editor, plugins)
  );

const applyPluginsToEditor = (editor: BaseEditor, plugins: BasePlugins) => {
  const runtime = getPlateRuntime(editor);
  const pluginsByKey: Record<string, AnyBasePlugin> = Object.create(null);

  plugins.forEach((plugin) => {
    pluginsByKey[plugin.key] = plugin;
  });

  setPlateRuntimeCandidate(editor, {
    ...runtime,
    pluginList: plugins,
    plugins: pluginsByKey,
  });
};

const applyPluginOverrides = (
  plugins: readonly AnyBasePlugin[],
  filterDisabled = true
): AnyBasePlugin[] => {
  let overriddenPlugins = [...plugins];

  const enabledOverrides: Record<string, boolean> = Object.create(null);
  const componentOverrides: Record<
    string,
    { component: any; priority: number }
  > = Object.create(null);
  const pluginOverrides: Record<string, Partial<AnyBasePlugin>> = Object.create(
    null
  );

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
    let updatedPlugin = {
      ...p,
      render: { ...p.render },
    };

    // Apply plugin overrides
    if (pluginOverrides[p.key]) {
      updatedPlugin = mergePlugins(updatedPlugin, pluginOverrides[p.key]);
    }
    // Apply component overrides
    // TODO react
    if (
      componentOverrides[p.key] &&
      (!p.render.node || componentOverrides[p.key].priority > p.priority)
    ) {
      (updatedPlugin as any).render.node = componentOverrides[p.key].component;
    }

    // Apply enabled overrides
    const enabled = enabledOverrides[p.key] ?? updatedPlugin.enabled;

    if (isDefined(enabled)) {
      updatedPlugin.enabled = enabled;
    }

    return brandPluginDescriptor(updatedPlugin);
  });

  return overriddenPlugins
    .filter((p) => !filterDisabled || p.enabled !== false)
    .map((plugin) =>
      brandPluginDescriptor({
        ...plugin,
        plugins: applyPluginOverrides(plugin.plugins || [], filterDisabled),
      })
    );
};
