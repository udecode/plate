import type {
  EditorExtension,
  EditorStateSchemaApi,
  EditorUpdateTransaction,
} from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';
import { getCompiledEditorSchemaFromApi } from '@platejs/plite/internal';
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
import {
  reapplyResolvedPluginConfigurations,
  type ResolvedPluginConfiguration,
  resolvePluginWithConfigurations,
} from './resolvePlugin';
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
export type PlatePluginSourceGroups = Readonly<{
  baseCore?: readonly AnyBasePlugin[];
  internalRoot?: AnyBasePlugin;
  reactCore?: readonly AnyBasePlugin[];
  user?: readonly AnyBasePlugin[];
}>;

export const plateReactCorePlugins = Symbol('plate.reactCorePlugins');

type NormalizedPlatePluginSourceGroups = Readonly<{
  baseCore: readonly AnyBasePlugin[];
  internalRoot?: AnyBasePlugin;
  reactCore: readonly AnyBasePlugin[];
  user: readonly AnyBasePlugin[];
}>;

type PlatePluginSourceInput =
  | PlatePluginSourceGroups
  | readonly AnyBasePlugin[];

const normalizePlatePluginSources = (
  sources: PlatePluginSourceInput
): NormalizedPlatePluginSourceGroups => {
  if (Array.isArray(sources)) {
    return {
      baseCore: [],
      reactCore: [],
      user: sources as readonly AnyBasePlugin[],
    };
  }

  const groups = sources as PlatePluginSourceGroups;

  return {
    baseCore: groups.baseCore ?? [],
    internalRoot: groups.internalRoot,
    reactCore: groups.reactCore ?? [],
    user: groups.user ?? [],
  };
};

export const snapshotPlatePluginSources = (
  sources: PlatePluginSourceGroups
): NormalizedPlatePluginSourceGroups => {
  const normalized = normalizePlatePluginSources(sources);
  const snapshots = new WeakMap<object, unknown>();
  const optionReferences = new WeakMap<object, unknown>();
  const snapshot = (plugin: AnyBasePlugin) =>
    snapshotPluginDescriptorValue(
      plugin,
      snapshots,
      { path: [], pluginKey: plugin.key },
      undefined,
      optionReferences
    ) as AnyBasePlugin;

  return Object.freeze({
    baseCore: Object.freeze(normalized.baseCore.map(snapshot)),
    internalRoot: normalized.internalRoot
      ? snapshot(normalized.internalRoot)
      : undefined,
    reactCore: Object.freeze(normalized.reactCore.map(snapshot)),
    user: Object.freeze(normalized.user.map(snapshot)),
  });
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

      if (key === 'dependencies') {
        const references = Array.isArray(descriptor.value)
          ? descriptor.value
          : [];

        value = Object.freeze(
          references.flatMap((reference: unknown) => {
            if (!isNominalPluginDescriptor(reference)) return [];
            const installed = publishedByKey.get(reference.key);

            if (installed) return [installed];
            throw new Error(
              `Plate plugin "${plugin.key}" lost installed dependency "${reference.key}" during publication.`
            );
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
  sources: PlatePluginSourceInput = []
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
  const resolvedPlugins = resolveAndSortPlugins(editor, sources);
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
  const apiSnapshots = new WeakMap<object, unknown>();
  const apiByPlugin: Record<
    string,
    Readonly<Record<string, unknown>>
  > = Object.create(null);
  const pluginApiNamespaces = new Set<string>();
  const shortcutApiByPlugin: Record<string, ShortcutApiOwner> =
    Object.create(null);

  withCompiledPlatePluginApiCandidate(editor, apiByPlugin, () => {
    pluginList.forEach((plugin) => {
      const pluginApi: Record<string, unknown> = {};

      apiByPlugin[plugin.key] = pluginApi;
      const editorApi = resolvePluginApi(editor, plugin, pluginApi);
      const frozenPluginApi = snapshotApiValue(pluginApi, apiSnapshots);
      const hasPluginApi = Object.keys(pluginApi).length > 0;

      Object.keys(editorApi).forEach((key) => {
        if (pluginApiNamespaces.has(key)) {
          throw new Error(
            `Plate API namespace "${key}" is declared by both plugin API and editor API owners while resolving plugin "${plugin.key}".`
          );
        }
      });
      if (
        hasPluginApi &&
        (Object.hasOwn(api, plugin.key) || Object.hasOwn(editorApi, plugin.key))
      ) {
        throw new Error(
          `Plate API namespace "${plugin.key}" is declared by both plugin API and editor API owners while resolving plugin "${plugin.key}".`
        );
      }

      apiByPlugin[plugin.key] = frozenPluginApi;
      shortcutApiByPlugin[plugin.key] = Object.freeze({
        editor: snapshotApiValue(editorApi),
        plugin: frozenPluginApi,
      });
      merge(api, editorApi);
      if (hasPluginApi) {
        api[plugin.key] = pluginApi;
        pluginApiNamespaces.add(plugin.key);
      }
    });
  });
  const runtimeApi = snapshotApiValue(api, apiSnapshots);
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

type PluginRootRole = 'baseCore' | 'internalRoot' | 'reactCore' | 'user';

type PluginRootOrigin = Readonly<{
  descriptor: AnyBasePlugin;
  path: string;
  role: PluginRootRole;
  sourceIndex: number;
}>;

type PluginRelationship = Readonly<{
  ownerKey: string;
  path: string;
  targetKey: string;
}>;

type PluginGraphNode = {
  baseResolved?: AnyBasePlugin;
  configurations: readonly ResolvedPluginConfiguration[];
  dependencyEdges: PluginRelationship[];
  descriptor: AnyBasePlugin;
  expanded: boolean;
  origin: PluginRootOrigin | Readonly<{ path: string; sourceIndex: number }>;
  resolved?: AnyBasePlugin;
};

const rootRolePrecedence: Readonly<Record<PluginRootRole, number>> = {
  baseCore: 1,
  internalRoot: 4,
  reactCore: 2,
  user: 3,
};

const getPluginDependencies = (plugin: AnyBasePlugin): readonly unknown[] => {
  const value = plugin.dependencies;

  return Array.isArray(value) ? value : [];
};

const assertPluginReference = (
  reference: unknown,
  ownerKey: string,
  path: string
): AnyBasePlugin => {
  if (!isNominalPluginDescriptor(reference)) {
    throw new Error(
      `Plate plugin "${ownerKey}" has an invalid dependency at "${path}". Pass a plugin descriptor, not its key.`
    );
  }
  if (!reference.key) {
    throw new Error(
      `Plate plugin "${ownerKey}" has an empty dependency key at "${path}".`
    );
  }
  if (reference.key === 'root') {
    throw new Error(
      `Plate plugin key "root" is reserved for the internal editor root (${path}).`
    );
  }

  return reference as AnyBasePlugin;
};

const assertStaticPluginTopology = (
  source: AnyBasePlugin,
  resolved: AnyBasePlugin
) => {
  if (resolved.key !== source.key) {
    throw new Error(
      `Plate plugin "${source.key}" cannot change its key while being configured.`
    );
  }

  const declared = getPluginDependencies(source);
  const configured = getPluginDependencies(resolved);

  if (
    declared.length !== configured.length ||
    declared.some((plugin, index) => plugin !== configured[index])
  ) {
    throw new Error(
      `Plate plugin "${source.key}" cannot change dependencies through configure or extend. Declare dependencies at plugin creation.`
    );
  }
};

const collectPlatePluginSourceCandidates = (
  sourceInput: PlatePluginSourceInput
) => {
  const sources = normalizePlatePluginSources(sourceInput);
  const candidates: AnyBasePlugin[] = [];
  const visited = new WeakSet<object>();
  const queue: unknown[] = [
    ...(sources.internalRoot ? [sources.internalRoot] : []),
    ...sources.baseCore,
    ...sources.reactCore,
    ...sources.user,
  ];

  for (const candidate of queue) {
    if (!candidate || typeof candidate !== 'object' || visited.has(candidate)) {
      continue;
    }
    visited.add(candidate);
    if (!isNominalPluginDescriptor(candidate)) continue;

    const plugin = candidate as AnyBasePlugin;

    candidates.push(plugin);
    queue.push(...getPluginDependencies(plugin));
  }

  return candidates;
};

const applyComponentOverrides = (
  plugins: readonly AnyBasePlugin[]
): BasePlugins => {
  const componentOverrides: Record<
    string,
    { component: unknown; priority: number }
  > = Object.create(null);

  for (const plugin of plugins) {
    const components = (plugin.override as { components?: NodeComponents })
      .components;

    if (!components) continue;
    Object.entries(components).forEach(([key, component]) => {
      if (
        !componentOverrides[key] ||
        plugin.priority > componentOverrides[key].priority
      ) {
        componentOverrides[key] = {
          component,
          priority: plugin.priority,
        };
      }
    });
  }

  return plugins.map((plugin) => {
    const override = componentOverrides[plugin.key];

    if (
      !override ||
      (plugin.render.node && override.priority <= plugin.priority)
    ) {
      return plugin;
    }

    return brandPluginDescriptor({
      ...plugin,
      render: {
        ...plugin.render,
        node: override.component,
      },
    }) as AnyBasePlugin;
  });
};

const getPresentPluginKeys = (
  nodes: ReadonlyMap<string, PluginGraphNode>,
  rootOriginsByKey: ReadonlyMap<string, readonly PluginRootOrigin[]>
) => {
  const present = new Set<string>();
  const queue = [...rootOriginsByKey.keys()];

  for (const key of queue) {
    if (present.has(key)) continue;
    present.add(key);
    const owner = nodes.get(key);

    if (!owner?.resolved || owner.resolved.enabled === false) continue;

    for (const edge of owner.dependencyEdges) {
      if (!present.has(edge.targetKey)) queue.push(edge.targetKey);
    }
  }

  return present;
};

const weakPluginOverrideForbiddenKeys = new Set<PropertyKey>([
  '__apiExtensions',
  '__config',
  '__configurationLayers',
  '__editorApi',
  '__editorExtensions',
  '__extensions',
  '__pluginReference',
  '__selectorExtensions',
  '__txExtensions',
  'clone',
  'configure',
  'dependencies',
  'extend',
  'extendApi',
  'extendEditorApi',
  'extendExtension',
  'extendSelectors',
  'extendTx',
  'extendTxGroup',
  'key',
  'override',
  'plugins',
  'withComponent',
]);

const assertWeakPluginOverride = (
  contributorKey: string,
  targetKey: string,
  value: unknown
): Record<PropertyKey, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(
      `Plate plugin "${contributorKey}" weak override for "${targetKey}" must be an object.`
    );
  }

  for (const key of Reflect.ownKeys(value)) {
    if (weakPluginOverrideForbiddenKeys.has(key)) {
      throw new Error(
        `Plate plugin "${contributorKey}" weak override for "${targetKey}" cannot define "${String(key)}". Weak overrides cannot mutate plugin identity, topology, or authoring state.`
      );
    }
  }
  if (
    Object.hasOwn(value, 'enabled') &&
    typeof Reflect.get(value, 'enabled') !== 'boolean'
  ) {
    throw new Error(
      `Plate plugin "${contributorKey}" weak override for "${targetKey}" must define "enabled" as a boolean.`
    );
  }

  return value as Record<PropertyKey, unknown>;
};

const getWeakOverrideGraphSignature = (
  nodes: ReadonlyMap<string, PluginGraphNode>,
  present: ReadonlySet<string>
) =>
  [...nodes.entries()]
    .map(([key, node]) => {
      const plugin = node.resolved;

      return `${key}:${present.has(key) ? 1 : 0}:${plugin?.enabled === false ? 0 : 1}:${plugin?.priority ?? ''}`;
    })
    .join('|');

const applyWeakPluginOverrides = (
  editor: BaseEditor,
  nodes: ReadonlyMap<string, PluginGraphNode>,
  rootOriginsByKey: ReadonlyMap<string, readonly PluginRootOrigin[]>
) => {
  let present = getPresentPluginKeys(nodes, rootOriginsByKey);
  let signature = getWeakOverrideGraphSignature(nodes, present);
  const seen = new Set([signature]);
  const maxPasses = Math.max(4, nodes.size * 4);

  for (let pass = 0; pass < maxPasses; pass++) {
    const patchesByTarget = new Map<string, Record<PropertyKey, unknown>>();
    const contributors = [...nodes.values()]
      .filter(
        (
          node
        ): node is PluginGraphNode & {
          resolved: AnyBasePlugin;
        } =>
          !!node.resolved &&
          present.has(node.resolved.key) &&
          node.resolved.enabled !== false
      )
      // Merge weakest first so higher priority and then earlier source order
      // remain authoritative for overlapping fields.
      .sort(
        (a, b) =>
          a.resolved.priority - b.resolved.priority ||
          b.origin.sourceIndex - a.origin.sourceIndex
      );

    for (const contributor of contributors) {
      const overrides = contributor.resolved.override?.plugins;

      if (!overrides) continue;

      for (const targetKey of Object.keys(overrides)) {
        if (targetKey === 'root') {
          throw new Error(
            `Plate plugin "${contributor.resolved.key}" cannot weakly override the internal root plugin.`
          );
        }
        if (targetKey === contributor.resolved.key) {
          throw new Error(
            `Plate plugin "${contributor.resolved.key}" cannot weakly override itself. Configure the descriptor directly.`
          );
        }
        if (!present.has(targetKey)) continue;
        const patch = assertWeakPluginOverride(
          contributor.resolved.key,
          targetKey,
          overrides[targetKey]
        );

        const previous = patchesByTarget.get(targetKey);

        patchesByTarget.set(
          targetKey,
          previous ? mergePlugins(previous, patch) : mergePlugins({}, patch)
        );
      }
    }

    nodes.forEach((node, key) => {
      if (!node.baseResolved) return;
      const patch = patchesByTarget.get(key);

      if (!patch) {
        node.resolved = node.baseResolved;
        return;
      }

      const patched = mergePlugins(node.baseResolved, patch);

      patched.__configurationLayers = node.baseResolved.__configurationLayers;
      node.resolved = reapplyResolvedPluginConfigurations(
        editor,
        patched,
        node.configurations
      );
      assertStaticPluginTopology(node.descriptor, node.resolved);
    });

    const nextPresent = getPresentPluginKeys(nodes, rootOriginsByKey);
    const nextSignature = getWeakOverrideGraphSignature(nodes, nextPresent);

    if (nextSignature === signature) return;
    if (seen.has(nextSignature)) {
      throw new Error(
        'Plate weak plugin overrides contain cyclic enablement. Configure one target descriptor directly.'
      );
    }

    seen.add(nextSignature);
    present = nextPresent;
    signature = nextSignature;
  }

  throw new Error(
    'Plate weak plugin overrides did not reach a stable enablement graph.'
  );
};

const resolveAndSortPluginsCandidate = (
  editor: BaseEditor,
  sourceInput: PlatePluginSourceInput
): BasePlugins => {
  const sources = normalizePlatePluginSources(sourceInput);
  const sourceIndexByDescriptor = new WeakMap<object, number>();
  const indexed = new WeakSet<object>();
  let nextSourceIndex = 0;
  const indexDescriptor = (value: unknown) => {
    if (!value || typeof value !== 'object' || indexed.has(value)) return;

    indexed.add(value);
    sourceIndexByDescriptor.set(value, nextSourceIndex++);
    if (!isNominalPluginDescriptor(value)) return;

    const plugin = value as AnyBasePlugin;

    getPluginDependencies(plugin).forEach(indexDescriptor);
  };
  const rootOriginsByKey = new Map<string, PluginRootOrigin[]>();
  const addRoot = (
    descriptor: AnyBasePlugin,
    role: PluginRootRole,
    path: string
  ) => {
    if (!isNominalPluginDescriptor(descriptor) || !descriptor.key) {
      throw new Error(`Plate plugin at "${path}" must have a non-empty key.`);
    }
    if (descriptor.key === 'root' && role !== 'internalRoot') {
      throw new Error(
        `Plate plugin key "root" is reserved for the internal editor root (${path}).`
      );
    }
    if (role === 'internalRoot' && descriptor.key !== 'root') {
      throw new Error(
        `The internal editor root must use the reserved plugin key "root".`
      );
    }

    const origins = rootOriginsByKey.get(descriptor.key) ?? [];
    const sameDescriptor = origins.find(
      (origin) => origin.role === role && origin.descriptor === descriptor
    );

    if (!sameDescriptor) {
      origins.push({
        descriptor,
        path,
        role,
        sourceIndex: sourceIndexByDescriptor.get(descriptor)!,
      });
      rootOriginsByKey.set(descriptor.key, origins);
    }
  };
  const indexRoots = (
    plugins: readonly AnyBasePlugin[],
    role: Exclude<PluginRootRole, 'internalRoot'>
  ) => {
    plugins.forEach((plugin, index) => {
      indexDescriptor(plugin);
      addRoot(plugin, role, `${role}[${index}].${plugin.key}`);
    });
  };

  if (sources.internalRoot) {
    indexDescriptor(sources.internalRoot);
    addRoot(sources.internalRoot, 'internalRoot', 'internalRoot.root');
  }
  indexRoots(sources.baseCore, 'baseCore');
  indexRoots(sources.reactCore, 'reactCore');
  indexRoots(sources.user, 'user');

  const nodes = new Map<string, PluginGraphNode>();
  const resolvedByDescriptor = new WeakMap<
    object,
    Readonly<{
      configurations: readonly ResolvedPluginConfiguration[];
      plugin: AnyBasePlugin;
    }>
  >();
  const resolveDescriptor = (descriptor: AnyBasePlugin) => {
    let resolved = resolvedByDescriptor.get(descriptor);

    if (!resolved) {
      resolved = resolvePluginWithConfigurations(editor, descriptor);
      assertStaticPluginTopology(descriptor, resolved.plugin);
      resolvedByDescriptor.set(descriptor, resolved);
    }

    return resolved;
  };

  rootOriginsByKey.forEach((origins, key) => {
    const highestPrecedence = Math.max(
      ...origins.map((origin) => rootRolePrecedence[origin.role])
    );
    const highestRoleOrigins = origins.filter(
      (origin) => rootRolePrecedence[origin.role] === highestPrecedence
    );
    const disabledOrigins = highestRoleOrigins.filter(
      (origin) => resolveDescriptor(origin.descriptor).plugin.enabled === false
    );

    if (highestRoleOrigins.length > 1 && disabledOrigins.length === 0) {
      throw new Error(
        `Duplicate Plate plugin "${key}" in ${highestRoleOrigins[0].role}: "${highestRoleOrigins[0].path}" conflicts with "${highestRoleOrigins[1].path}".`
      );
    }

    const selected = disabledOrigins[0] ?? highestRoleOrigins[0];
    const winner = {
      ...selected,
      sourceIndex: Math.min(...origins.map((origin) => origin.sourceIndex)),
    };
    const resolved = resolveDescriptor(winner.descriptor);

    nodes.set(key, {
      baseResolved: resolved.plugin,
      configurations: resolved.configurations,
      dependencyEdges: [],
      descriptor: winner.descriptor,
      expanded: false,
      origin: winner,
      resolved: resolved.plugin,
    });
  });

  const hiddenByKey = new Map<
    string,
    Readonly<{ descriptor: AnyBasePlugin; path: string }>
  >();
  const queue = [...nodes.values()];
  const addRelationship = (
    owner: PluginGraphNode,
    reference: unknown,
    index: number
  ) => {
    const ownerPlugin = owner.resolved!;
    const path = `${owner.origin.path}.dependencies[${index}]`;
    const descriptor = assertPluginReference(reference, ownerPlugin.key, path);
    const hidden = hiddenByKey.get(descriptor.key);

    if (hidden && hidden.descriptor !== descriptor) {
      throw new Error(
        `Plate plugin "${descriptor.key}" has conflicting dependency descriptors at "${hidden.path}" and "${path}".`
      );
    }
    if (!hidden) {
      hiddenByKey.set(descriptor.key, { descriptor, path });
    }

    let target = nodes.get(descriptor.key);

    if (!target) {
      target = {
        configurations: [],
        dependencyEdges: [],
        descriptor,
        expanded: false,
        origin: {
          path,
          sourceIndex:
            sourceIndexByDescriptor.get(descriptor) ?? nextSourceIndex++,
        },
      };
      nodes.set(descriptor.key, target);
      queue.push(target);
    } else if (
      target.origin.sourceIndex >
      (sourceIndexByDescriptor.get(descriptor) ?? Number.POSITIVE_INFINITY)
    ) {
      target.origin = {
        ...target.origin,
        sourceIndex: sourceIndexByDescriptor.get(descriptor)!,
      };
    }

    const edge: PluginRelationship = {
      ownerKey: ownerPlugin.key,
      path,
      targetKey: descriptor.key,
    };

    owner.dependencyEdges.push(edge);
  };

  for (const node of queue) {
    if (node.expanded) continue;
    node.expanded = true;

    const resolution = node.baseResolved
      ? {
          configurations: node.configurations,
          plugin: node.baseResolved,
        }
      : resolveDescriptor(node.descriptor);
    const resolved = resolution.plugin;

    node.baseResolved = resolved;
    node.configurations = resolution.configurations;
    node.resolved = resolved;
    setCompiledPlatePluginCandidate(editor, resolved);

    getPluginDependencies(resolved).forEach((dependency, dependencyIndex) => {
      addRelationship(node, dependency, dependencyIndex);
    });
  }

  applyWeakPluginOverrides(editor, nodes, rootOriginsByKey);
  const presentPluginKeys = getPresentPluginKeys(nodes, rootOriginsByKey);
  const requiredByTarget = new Map<string, PluginRelationship[]>();

  nodes.forEach((owner, key) => {
    if (!presentPluginKeys.has(key) || owner.resolved?.enabled === false) {
      return;
    }

    owner.dependencyEdges.forEach((edge) => {
      const edges = requiredByTarget.get(edge.targetKey) ?? [];

      edges.push(edge);
      requiredByTarget.set(edge.targetKey, edges);
    });
  });

  requiredByTarget.forEach((edges, targetKey) => {
    const target = nodes.get(targetKey)!;

    if (target.resolved?.enabled === false) {
      const edge = edges[0];

      throw new Error(
        `Plate plugin "${edge.ownerKey}" requires disabled plugin "${targetKey}" at "${edge.path}".`
      );
    }
  });

  const enabledNodes = [...nodes.values()].filter(
    (node): node is PluginGraphNode & { resolved: AnyBasePlugin } =>
      !!node.resolved &&
      node.resolved.enabled !== false &&
      presentPluginKeys.has(node.resolved.key)
  );
  const enabledByKey = new Map(
    enabledNodes.map((node) => [node.resolved.key, node])
  );
  const dependencyKeysByOwner = new Map<string, Set<string>>();
  const dependentsByDependency = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();

  enabledNodes.forEach((node) => {
    indegree.set(node.resolved.key, 0);
  });
  enabledNodes.forEach((node) => {
    const ownerKey = node.resolved.key;
    const dependencies = dependencyKeysByOwner.get(ownerKey) ?? new Set();

    node.dependencyEdges.forEach((edge) => {
      if (
        !enabledByKey.has(edge.targetKey) ||
        dependencies.has(edge.targetKey)
      ) {
        return;
      }
      dependencies.add(edge.targetKey);
      indegree.set(ownerKey, (indegree.get(ownerKey) ?? 0) + 1);
      const dependents =
        dependentsByDependency.get(edge.targetKey) ?? new Set<string>();

      dependents.add(ownerKey);
      dependentsByDependency.set(edge.targetKey, dependents);
    });
    dependencyKeysByOwner.set(ownerKey, dependencies);
  });

  const compareReady = (
    a: PluginGraphNode & { resolved: AnyBasePlugin },
    b: PluginGraphNode & { resolved: AnyBasePlugin }
  ) =>
    b.resolved.priority - a.resolved.priority ||
    a.origin.sourceIndex - b.origin.sourceIndex;
  const ready = enabledNodes
    .filter((node) => indegree.get(node.resolved.key) === 0)
    .sort(compareReady);
  const ordered: AnyBasePlugin[] = [];

  while (ready.length > 0) {
    const node = ready.shift()!;
    const key = node.resolved.key;

    ordered.push(node.resolved);
    dependentsByDependency.get(key)?.forEach((dependentKey) => {
      const next = (indegree.get(dependentKey) ?? 0) - 1;

      indegree.set(dependentKey, next);
      if (next === 0) {
        ready.push(enabledByKey.get(dependentKey)!);
        ready.sort(compareReady);
      }
    });
  }

  if (ordered.length !== enabledNodes.length) {
    const state = new Map<string, 'visited' | 'visiting'>();
    const stack: string[] = [];
    let cycle: string[] | undefined;
    const visit = (key: string) => {
      if (cycle || state.get(key) === 'visited') return;
      if (state.get(key) === 'visiting') {
        const start = stack.indexOf(key);

        cycle = [...stack.slice(start), key];
        return;
      }

      state.set(key, 'visiting');
      stack.push(key);
      dependencyKeysByOwner.get(key)?.forEach(visit);
      stack.pop();
      state.set(key, 'visited');
    };

    enabledNodes.forEach((node) => {
      visit(node.resolved.key);
    });

    throw new Error(
      `Circular plugin dependency: ${(cycle ?? []).join(' -> ')}`
    );
  }

  const finalPlugins = applyComponentOverrides(ordered);

  finalPlugins.forEach((plugin) => {
    setCompiledPlatePluginCandidate(editor, plugin);
  });

  return finalPlugins;
};

export const resolveAndSortPlugins = (
  editor: BaseEditor,
  sources: PlatePluginSourceInput
): BasePlugins =>
  withCompiledPlatePluginCandidate(
    editor,
    collectPlatePluginSourceCandidates(sources),
    () => resolveAndSortPluginsCandidate(editor, sources)
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
