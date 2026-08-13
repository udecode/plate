import type {
  EditorExtensionDefinitionInput,
  EditorExtensionReference,
  EditorStateSchemaApi,
} from '@platejs/plite';
import {
  compileEditorExtension,
  getCandidateEditorExtensionApi,
  getCompiledSchemaPropertyId,
  getCompiledEditorSchemaFromApi,
  txRead,
} from '@platejs/plite/internal';
import { createVanillaStore } from 'zustand-x/vanilla';

import type {
  AnyBasePlugin,
  BaseEditor,
  BasePlugin,
  BasePluginInput,
  BasePlugins,
  NodeComponents,
  PlateSchemaIdentity,
} from '../../lib';

import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import {
  brandPluginDescriptor,
  getPluginDescriptorMetadata,
  getPluginSchemaFamily,
  isOpaquePluginRenderKey,
  isNominalPluginDescriptor,
  mergePlugins,
  setPluginDescriptorMetadata,
} from '../utils/mergePlugins';
import { snapshotApiValue } from '../utils/snapshotApiValue';
import type {
  CompiledPlateModel,
  PlateModelPublication,
} from './compilePlateModel';
import {
  getPlateModelPublication,
  getPlateRuntime,
  setCompiledPlatePluginCandidate,
  withCompiledPlatePluginCandidate,
} from './compilePlateModel';
import {
  clearPluginStores,
  createPluginStore,
  createPluginStateSnapshot,
  snapshotPluginState,
  setPluginStore,
} from './pluginStore';
import { compilePlateShortcuts } from './compilePlateShortcuts';
import {
  setPlateRuntimeCandidate,
  type PlatePluginCache,
} from './plateRuntime';
import {
  getResolvedPluginCapabilities,
  inheritResolvedPluginCapabilities,
  reapplyResolvedPluginConfigurations,
  type ResolvedPluginCapabilityContribution,
  type ResolvedPluginConfiguration,
  resolvePluginWithConfigurations,
} from './resolvePlugin';
import type {
  InputRule,
  InputRuleBuilder,
  ResolvedInputRule,
} from '../../lib/plugins/input-rules/types';
import {
  createBlockFenceInputRule,
  createBlockStartInputRule,
  createMarkInputRule,
} from '../../lib/plugins/input-rules/createInputRules';
import { defineInputRule } from '../../lib/plugins/input-rules/defineInputRule';

type PlateRuntimeExtensionBinding = Readonly<{
  extension: EditorExtensionReference;
  family: object;
}>;

export type PlateRuntimeExtensionBindings = Readonly<{
  aliases: ReadonlyMap<EditorExtensionReference, EditorExtensionReference>;
  plugins: ReadonlyMap<string, PlateRuntimeExtensionBinding>;
}>;

const plateRuntimeExtensionBindings = new WeakMap<
  object,
  PlateRuntimeExtensionBindings
>();

export const getPlateRuntimeExtensionBindings = (editor: object) =>
  plateRuntimeExtensionBindings.get(editor);

export const restorePlateRuntimeExtensionBindings = (
  editor: object,
  bindings: PlateRuntimeExtensionBindings | undefined
) => {
  if (bindings) {
    plateRuntimeExtensionBindings.set(editor, bindings);
  } else {
    plateRuntimeExtensionBindings.delete(editor);
  }
};

/**
 * Resolve one authored Plate descriptor to the exact native extension compiled
 * for this editor. Raw Plite descriptors keep their own identity.
 */
export const resolvePlateRuntimeExtension = (
  editor: object,
  reference: EditorExtensionReference
): EditorExtensionReference => {
  const bindings = plateRuntimeExtensionBindings.get(editor);

  if (!isNominalPluginDescriptor(reference)) {
    return bindings?.aliases.get(reference) ?? reference;
  }

  const binding = bindings?.plugins.get(reference.name);

  if (!binding) {
    throw new Error(
      `Plate plugin "${reference.name}" is not installed as an editor extension.`
    );
  }
  if (getPluginSchemaFamily(reference) !== binding.family) {
    throw new Error(
      `Plate plugin "${reference.name}" resolves to a different descriptor family.`
    );
  }

  return binding.extension;
};

type PluginDescriptorSnapshotContext = Readonly<{
  name: string;
  path: readonly PropertyKey[];
}>;

const appendPluginDescriptorPath = (
  context: PluginDescriptorSnapshotContext,
  key: PropertyKey
): PluginDescriptorSnapshotContext => ({
  name: context.name,
  path: [...context.path, key],
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
    `Plate plugin "${context.name}" descriptor path "${formatPluginDescriptorPath(context.path)}" must be data-only. Accessor properties are not supported.`
  );

const opaqueNativeResourceFields = new Set<PropertyKey>([
  'contributions',
  'corrections',
  'effectTypes',
  'facetProviders',
  'selectionKinds',
  'stateFields',
]);

const isOpaquePluginDescriptorResource = (
  context: PluginDescriptorSnapshotContext
) => {
  const { path } = context;
  const key = path.at(-1);
  const parent = path.at(-2);

  if (parent === 'render' && isOpaquePluginRenderKey(key!)) return true;
  if (
    typeof key === 'number' &&
    path.length === 2 &&
    opaqueNativeResourceFields.has(parent!)
  ) {
    return true;
  }

  return path.at(-3) === 'override' && parent === 'components';
};

type MutableDeep<T> = T extends (...args: never[]) => unknown
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
  api: Readonly<Record<string, unknown>>;
}>;

type PlateRuntimeExtensionsResult = Readonly<{
  extensions: readonly EditorExtensionReference[];
  resolveApiPublication: () => Readonly<{
    apiByPlugin: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
    shortcutApiByPlugin: Readonly<Record<string, ShortcutApiOwner>>;
  }>;
  updateMethods: Readonly<Record<string, readonly string[]>>;
}>;

const createMutablePlatePluginCache = (): MutablePlatePluginCache => ({
  decorate: [],
  on: {
    nodeChange: [],
    textChange: [],
  },
  inject: { nodeProps: [] },
  node: {
    containerTypes: [],
    decoratedMarks: [],
    leafProps: [],
    textMarks: [],
    textProps: [],
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
  publishedPlugins?: ReadonlyMap<string, AnyBasePlugin>
): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (isOpaquePluginDescriptorResource(context)) return value;
  if (isNominalPluginDescriptor(value)) {
    const published = publishedPlugins?.get(value.name);

    if (
      published &&
      getPluginSchemaFamily(value) === getPluginSchemaFamily(published)
    ) {
      return published;
    }
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
          publishedPlugins
        )
      )
    );

    return Object.freeze(snapshot);
  }

  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) return value;

  const isPluginDescriptor = isNominalPluginDescriptor(value);
  const ownerContext = isPluginDescriptor
    ? { name: value.name, path: [] }
    : context;
  const snapshot: Record<PropertyKey, unknown> = Object.create(prototype);

  snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
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
        isPluginDescriptor && key === 'initialState'
          ? snapshotPluginState(descriptor.value)
          : snapshotPluginDescriptorValue(
              descriptor.value,
              snapshots,
              appendPluginDescriptorPath(ownerContext, key),
              publishedPlugins
            ),
    });
  }

  const frozen = Object.freeze(snapshot);

  return isPluginDescriptor ? brandPluginDescriptor(frozen, value) : frozen;
};

/** Capture the immutable descriptor graph used by every Plate projection. */
export type PlatePluginSourceGroups = Readonly<{
  baseCore?: readonly BasePluginInput[];
  internalRoot?: BasePluginInput;
  reactCore?: readonly BasePluginInput[];
  user?: readonly BasePluginInput[];
}>;

type NormalizedPlatePluginSourceGroups = Readonly<{
  baseCore: readonly AnyBasePlugin[];
  internalRoot?: AnyBasePlugin;
  reactCore: readonly AnyBasePlugin[];
  user: readonly AnyBasePlugin[];
}>;

type PlatePluginSourceInput =
  | PlatePluginSourceGroups
  | readonly BasePluginInput[];

const isPlatePluginSourceList = (
  sources: PlatePluginSourceInput
): sources is readonly BasePluginInput[] => Array.isArray(sources);

const asAnyBasePlugin = (plugin: BasePluginInput): AnyBasePlugin => {
  if (!isNominalPluginDescriptor(plugin)) {
    throw new Error(
      `Plate plugin source "${(plugin as { name: string }).name}" must be created by a Plate plugin builder.`
    );
  }

  return plugin as unknown as AnyBasePlugin;
};

const normalizePlatePluginSourceList = (
  plugins: readonly BasePluginInput[] | undefined
) => (plugins ?? []).map(asAnyBasePlugin);

const normalizePlatePluginSources = (
  sources: PlatePluginSourceInput
): NormalizedPlatePluginSourceGroups => {
  if (isPlatePluginSourceList(sources)) {
    return {
      baseCore: [],
      reactCore: [],
      user: normalizePlatePluginSourceList(sources),
    };
  }

  return {
    baseCore: normalizePlatePluginSourceList(sources.baseCore),
    internalRoot: sources.internalRoot
      ? normalizePlatePluginSourceList([sources.internalRoot])[0]
      : undefined,
    reactCore: normalizePlatePluginSourceList(sources.reactCore),
    user: normalizePlatePluginSourceList(sources.user),
  };
};

export const snapshotPlatePluginSources = (
  sources: PlatePluginSourceGroups
): NormalizedPlatePluginSourceGroups => {
  const normalized = normalizePlatePluginSources(sources);
  const snapshots = new WeakMap<object, unknown>();
  const snapshot = (plugin: AnyBasePlugin) =>
    snapshotPluginDescriptorValue(
      plugin,
      snapshots,
      { name: plugin.name, path: [] },
      undefined
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
  pluginList: readonly AnyBasePlugin[],
  model: CompiledPlateModel
): readonly AnyBasePlugin[] => {
  const publishedByName = new Map<string, AnyBasePlugin>();

  pluginList.forEach((plugin) => {
    publishedByName.set(
      plugin.name,
      brandPluginDescriptor({} as AnyBasePlugin, plugin)
    );
  });

  const snapshots = new WeakMap<object, unknown>();

  pluginList.forEach((plugin) => {
    const published = publishedByName.get(plugin.name)!;

    for (const key of Reflect.ownKeys(plugin)) {
      const descriptor = Object.getOwnPropertyDescriptor(plugin, key);

      if (!descriptor) continue;
      if (!Object.hasOwn(descriptor, 'value')) {
        throw createPluginDescriptorAccessorError({
          name: plugin.name,
          path: [key],
        });
      }

      let value: unknown;

      if (key === 'dependencies' || key === 'conflicts') {
        const references = Array.isArray(descriptor.value)
          ? descriptor.value
          : [];

        value = Object.freeze(
          references.flatMap((reference: unknown) => {
            if (!isNominalPluginDescriptor(reference)) return [];
            const installed = publishedByName.get(reference.name);

            if (installed) return [installed];
            throw new Error(
              `Plate plugin "${plugin.name}" lost installed dependency "${reference.name}" during publication.`
            );
          })
        );
      } else if (key === 'initialState') {
        value = snapshotPluginState(descriptor.value);
      } else if (key === 'inject') {
        const inject = snapshotPluginDescriptorValue(
          descriptor.value,
          snapshots,
          { name: plugin.name, path: [key] },
          publishedByName
        ) as AnyBasePlugin['inject'];
        const propertyKey = model.byName[plugin.name]?.propertyKey;

        value =
          propertyKey &&
          inject.nodeProps &&
          inject.nodeProps.nodeKey === undefined
            ? Object.freeze({
                ...inject,
                nodeProps: Object.freeze({
                  ...inject.nodeProps,
                  nodeKey: propertyKey,
                }),
              })
            : inject;
      } else {
        value = snapshotPluginDescriptorValue(
          descriptor.value,
          snapshots,
          { name: plugin.name, path: [key] },
          publishedByName
        );
      }

      Object.defineProperty(published, key, {
        enumerable: descriptor.enumerable,
        value,
      });
    }
  });

  const publishedPluginList = pluginList.map(
    (plugin) => publishedByName.get(plugin.name)!
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
      'Plate plugins are fixed after model publication. Configure plugin `initialState` before creating the editor.'
    );
  }

  clearPluginStores(editor);
  const pluginCache = createMutablePlatePluginCache();

  setPlateRuntimeCandidate(editor, {
    components: Object.create(null),
    genericElementToggles: Object.freeze([]),
    inputRules: createMutableResolvedInputRulesMeta(),
    pluginCache,
    pluginList: [],
    plugins: Object.create(null),
    shortcutTable: [],
    shortcuts: Object.create(null),
    updateMethods: Object.freeze(Object.create(null)),
  });
  const resolvedPlugins = resolveAndSortPlugins(editor, sources);
  const snapshotState = createPluginStateSnapshot();

  resolvedPlugins.forEach((plugin) => {
    plugin.initialState = snapshotState(plugin.initialState);
  });

  applyPluginsToEditor(editor, resolvedPlugins);

  resolvePluginStores(editor);

  return editor;
};

const publishCompiledSchemaHandles = (
  model: CompiledPlateModel,
  compiledSchema: NonNullable<ReturnType<typeof getCompiledEditorSchemaFromApi>>
): CompiledPlateModel => {
  const compiledProperties = [...compiledSchema.properties.byId.values()];
  const bindings = model.bindings.map((binding) => {
    const properties = Object.freeze(
      binding.properties.map((property) => {
        const id = getCompiledSchemaPropertyId(property);
        const matches = compiledProperties.filter(
          (compiled) => compiled.owner === binding.name && compiled.id === id
        );

        if (matches.length !== 1) {
          throw new Error(
            `Plate plugin "${binding.name}" schema property "${id}" did not resolve to one compiled property.`
          );
        }
        const compiled = matches[0]!;
        const compiledTarget = compiled.target ?? undefined;

        if (
          JSON.stringify(property.key) === JSON.stringify(compiled.key) &&
          JSON.stringify(property.target ?? null) ===
            JSON.stringify(compiledTarget ?? null)
        ) {
          return property;
        }

        return Object.freeze({
          ...property,
          key: compiled.key,
          target: compiledTarget,
        }) as typeof property;
      })
    );
    const propertyHandles = Object.fromEntries(
      Object.entries(binding.propertyHandles).map(([localId, handle]) => {
        if (!handle) return [localId, handle];
        const exact = compiledProperties.filter(
          (property) =>
            property.owner === binding.name && property.id === handle.id
        );
        const matches =
          exact.length === 1
            ? exact
            : compiledProperties.filter(
                (property) =>
                  property.owner === binding.name &&
                  property.placement === handle.placement &&
                  (typeof property.key === 'string'
                    ? property.key === handle.key
                    : typeof handle.key !== 'string' &&
                      property.key.prefix === handle.key.prefix)
              );

        if (matches.length !== 1) {
          throw new Error(
            `Plate plugin "${binding.name}" schema property "${localId}" (${handle.id}) did not resolve to one compiled property. Compiled owner candidates: ${
              compiledProperties
                .filter((property) => property.owner === binding.name)
                .map(
                  (property) =>
                    `${property.id}:${typeof property.key === 'string' ? property.key : `${property.key.prefix}*`}`
                )
                .join(', ') || 'none'
            }.`
          );
        }

        return [
          localId,
          Object.freeze({
            id: matches[0]!.id,
            key: matches[0]!.key,
            kind: 'schema-property' as const,
            placement: matches[0]!.placement,
          }),
        ];
      })
    );
    const primaryPropertyHandle = binding.textPropertyId
      ? Object.values(propertyHandles).find(
          (handle) => handle?.id === binding.textPropertyId
        )
      : binding.propertyKey
        ? propertyHandles[binding.propertyKey]
        : undefined;
    const propertyKey = binding.propertyKey
      ? typeof primaryPropertyHandle?.key === 'string'
        ? primaryPropertyHandle.key
        : (() => {
            throw new Error(
              `Plate plugin "${binding.name}" primary property must compile to one exact string key.`
            );
          })()
      : null;

    return Object.freeze({
      ...binding,
      properties,
      propertyKey,
      propertyHandles: Object.freeze(propertyHandles),
      schema: Object.freeze({
        ...binding.schema,
        ...(binding.kind === 'mark' ? { key: propertyKey! } : {}),
        properties: Object.freeze(
          Object.fromEntries(
            Object.keys(binding.schema.properties).map((localId) => [
              localId,
              propertyHandles[localId],
            ])
          )
        ),
      }),
    });
  });
  const byName: Record<string, (typeof bindings)[number]> = Object.create(null);
  const byType: Record<string, (typeof bindings)[number]> = Object.create(null);
  const byKey: Record<string, (typeof bindings)[number]> = Object.create(null);

  for (const binding of bindings) {
    byName[binding.name] = binding;
    if (binding.elementType) byType[binding.elementType] = binding;
    if (binding.propertyKey) byKey[binding.propertyKey] = binding;
  }

  return Object.freeze({
    ...model,
    bindings: Object.freeze(bindings),
    byKey: Object.freeze(byKey),
    byName: Object.freeze(byName),
    byType: Object.freeze(byType),
  });
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
  const compiledSchema = getCompiledEditorSchemaFromApi(schemaApi);

  if (!compiledSchema) {
    throw new Error('Plate model publication requires a compiled schema.');
  }
  const publishedModel = publishCompiledSchemaHandles(model, compiledSchema);
  const publishedPluginList = publishPlatePluginDescriptors(
    pluginList,
    publishedModel
  );
  const genericElementToggles = Object.freeze(
    publishedPluginList.flatMap((plugin) => {
      const elementType = publishedModel.byName[plugin.name]?.elementType;

      return elementType &&
        !updateMethods[plugin.name]?.includes('toggle') &&
        isGenericElementToggleEligible(compiledSchema, elementType)
        ? [plugin.name]
        : [];
    })
  );
  const publishedUpdateMethods = Object.freeze(
    Object.fromEntries(
      publishedPluginList.map((plugin) => {
        const methods = new Set(updateMethods[plugin.name] ?? []);
        const elementType = publishedModel.byName[plugin.name]?.elementType;

        if (
          elementType &&
          isGenericElementToggleEligible(compiledSchema, elementType)
        ) {
          methods.add('toggle');
        }

        return [plugin.name, Object.freeze([...methods])] as const;
      })
    )
  );
  const plugins: Record<string, AnyBasePlugin> = Object.create(null);

  publishedPluginList.forEach((plugin) => {
    plugins[plugin.name] = plugin;
  });

  const decoratedMarks: string[] = [];
  const leafProps: string[] = [];
  const textMarks: string[] = [];
  const textProps: string[] = [];
  const components: NodeComponents = Object.create(null);
  publishedModel.bindings.forEach((binding) => {
    const plugin = plugins[binding.name];

    if (binding.kind === 'none' || !plugin) return;

    if (plugin.render.node) {
      const documentIdentity = binding.elementType ?? binding.propertyKey;

      if (documentIdentity) components[documentIdentity] = plugin.render.node;
    }
    if (binding.kind !== 'mark') return;
    if (binding.isDecoration || plugin.render.leaf) {
      decoratedMarks.push(binding.name);
    }
    if (!binding.isDecoration) {
      textMarks.push(binding.name);
    }
    if (plugin.render.leafProps) {
      leafProps.push(binding.name);
    }
    if (plugin.render.textProps) {
      textProps.push(binding.name);
    }
  });

  const blockTypes = compiledSchema.elements.groups.get('block');
  const containerTypes = publishedModel.bindings.flatMap((binding) => {
    if (binding.kind !== 'element' || !blockTypes) return [];

    const childTypes = compiledSchema.elements.byType.get(binding.elementType!)
      ?.content?.allowedElementTypes;

    if (!childTypes) return [];

    for (const childType of childTypes) {
      if (blockTypes.has(childType)) return [binding.elementType!];
    }

    return [];
  });
  const pluginCache = createMutablePlatePluginCache();

  pluginCache.node.containerTypes.push(...containerTypes);
  pluginCache.node.decoratedMarks.push(...decoratedMarks);
  pluginCache.node.leafProps.push(...leafProps);
  pluginCache.node.textMarks.push(...textMarks);
  pluginCache.node.textProps.push(...textProps);

  publishedPluginList.forEach((plugin) => {
    if (plugin.inject.nodeProps) {
      pluginCache.inject.nodeProps.push(plugin.name);
    }
    if (plugin.render.aboveEditable) {
      pluginCache.render.aboveEditable.push(plugin.name);
    }
    if (plugin.render.aboveNodes) {
      pluginCache.render.aboveNodes.push(plugin.name);
    }
    if (plugin.render.abovePlite) {
      pluginCache.render.abovePlite.push(plugin.name);
    }
    if (plugin.render.afterContainer) {
      pluginCache.render.afterContainer.push(plugin.name);
    }
    if (plugin.render.afterEditable) {
      pluginCache.render.afterEditable.push(plugin.name);
    }
    if (plugin.render.beforeContainer) {
      pluginCache.render.beforeContainer.push(plugin.name);
    }
    if (plugin.render.beforeEditable) {
      pluginCache.render.beforeEditable.push(plugin.name);
    }
    if (plugin.render.belowNodes) {
      pluginCache.render.belowNodes.push(plugin.name);
    }
    if (plugin.render.belowRootNodes) {
      pluginCache.render.belowRootNodes.push(plugin.name);
    }
    if (plugin.rules?.match) pluginCache.rules.match.push(plugin.name);
    if (plugin.transformInitialValue) {
      pluginCache.transformInitialValue.push(plugin.name);
    }
    if (plugin.decorate) pluginCache.decorate.push(plugin.name);
    if (plugin.useHooks) pluginCache.useHooks.push(plugin.name);
    if (plugin.on?.nodeChange) {
      pluginCache.on.nodeChange.push(plugin.name);
    }
    if (plugin.on?.textChange) {
      pluginCache.on.textChange.push(plugin.name);
    }
  });

  const freezeList = <T>(value: T[]) => Object.freeze(value);
  const publishedPluginCache: PlatePluginCache = Object.freeze({
    decorate: freezeList(pluginCache.decorate),
    on: Object.freeze({
      nodeChange: freezeList(pluginCache.on.nodeChange),
      textChange: freezeList(pluginCache.on.textChange),
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
  const shortcutRuntime = snapshotApiValue(
    createPluginShortcuts(
      editor,
      publishedPluginList,
      shortcutApiByPlugin,
      publishedUpdateMethods
    )
  );

  return Object.freeze({
    apiByPlugin,
    components: Object.freeze(components),
    genericElementToggles,
    identity,
    inputRules: snapshotApiValue(createPluginInputRules(publishedPluginList)),
    model: publishedModel,
    pluginCache: publishedPluginCache,
    pluginList: Object.freeze(publishedPluginList),
    plugins: Object.freeze(plugins),
    shortcutTable: shortcutRuntime.shortcutTable,
    shortcuts: shortcutRuntime.shortcuts,
    updateMethods,
  });
};

const isGenericElementToggleEligible = (
  schema: NonNullable<ReturnType<typeof getCompiledEditorSchemaFromApi>>,
  elementType: string
) => {
  if (!schema.elements.groups.get('textBlock')?.has(elementType)) return false;
  if (!schema.primaryRoot.content.allowedElementTypes.has(elementType)) {
    return false;
  }
  const element = schema.elements.byType.get(elementType);

  return (
    !!element &&
    [...element.construction.propertyIds].every(
      (propertyId) =>
        schema.properties.byId.get(propertyId)?.descriptor.required !== true
    )
  );
};

const resolvePluginStores = (editor: BaseEditor) => {
  getPlateRuntime(editor).pluginList.forEach((plugin) => {
    const base = createVanillaStore(snapshotPluginState(plugin.initialState), {
      mutative: true,
      name: plugin.name,
    });
    const store = createPluginStore(plugin, base as never, plugin.selectors);

    setPluginStore(editor, plugin, store);
  });
};

const inspectPluginUpdateMethods = (
  editor: BaseEditor,
  pluginList: readonly AnyBasePlugin[],
  model: CompiledPlateModel
) => {
  let probe: unknown;

  probe = new Proxy(() => probe, {
    apply: () => probe,
    get: () => probe,
  });
  const updateMethods: Record<string, readonly string[]> = Object.create(null);

  pluginList.forEach((plugin) => {
    const binding = model.byName[plugin.name];
    const names = new Set<string>([
      ...(binding?.elementType ? ['insert', 'remove', 'set'] : []),
      ...(binding?.kind === 'mark' ? ['clear', 'set', 'toggle'] : []),
    ]);

    if (typeof plugin.update !== 'function') {
      if (names.size > 0) {
        updateMethods[plugin.name] = Object.freeze([...names]);
      }

      return;
    }

    let group: object;

    try {
      group = Reflect.apply(plugin.update, undefined, [
        Object.assign(Object.create(createPluginContext(editor, plugin)), {
          context: probe,
          tx: probe,
        }),
      ]) as object;
    } catch (cause) {
      throw new Error(
        `Plate update namespace "${plugin.name}" could not be inspected. Update factories must construct commands without executing document work.`,
        { cause }
      );
    }

    Object.entries(group).forEach(([name, value]) => {
      if (typeof value === 'function') names.add(name);
    });
    updateMethods[plugin.name] = Object.freeze([...names]);
  });

  return Object.freeze(updateMethods);
};

const lifecycleKeys = ['commit', 'transactionChange'] as const;

const isApiRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const resolvePluginCapability = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  contributions: readonly ResolvedPluginCapabilityContribution[],
  context: object
) => {
  const values = contributions.map(({ factory, kind }) =>
    Reflect.apply(factory, undefined, [
      kind === 'native'
        ? context
        : Object.assign(
            Object.create(createPluginContext(editor, plugin)),
            context
          ),
    ])
  );

  if (values.every(isApiRecord)) {
    return mergePlugins({}, ...values);
  }

  return values.at(-1);
};

const createPluginLifecycleHandlers = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) => {
  const handlers: Record<string, (context: object) => unknown> =
    Object.create(null);

  lifecycleKeys.forEach((name) => {
    const handler = plugin.on?.[name];

    if (typeof handler !== 'function') return;

    handlers[name] = (context) =>
      Reflect.apply(handler, undefined, [
        Object.assign(
          Object.create(createPluginContext(editor, plugin)),
          context
        ),
      ]);
  });

  return handlers;
};

/**
 * Lower every resolved Plate plugin to exactly one native Plite extension.
 *
 * Plate-only schema/render/store fields stay in the Plate publication. Native
 * behavior and the plugin-owned api/read/update namespaces install directly.
 */
export const createPlateRuntimeExtensions = (
  editor: BaseEditor,
  pluginList: readonly AnyBasePlugin[],
  model: CompiledPlateModel
): PlateRuntimeExtensionsResult => {
  const apiSnapshots = new WeakMap<object, unknown>();
  const extensions: EditorExtensionReference[] = [];
  const extensionByName = new Map<string, EditorExtensionReference>();
  const extensionAliases = new Map<
    EditorExtensionReference,
    EditorExtensionReference
  >();
  const pluginBindings = new Map<string, PlateRuntimeExtensionBinding>();
  const fallbackApiByPlugin = new Map<
    string,
    Readonly<Record<string, unknown>>
  >();

  pluginList.forEach((plugin, index) => {
    if (plugin.api !== undefined && !isApiRecord(plugin.api)) {
      throw new Error(
        `Plate plugin "${plugin.name}" API must resolve to an object before lowering.`
      );
    }
    const authoredApi = plugin.api ?? {};
    const frozenPluginApi = snapshotApiValue(authoredApi, apiSnapshots);
    const capabilities = getResolvedPluginCapabilities(plugin);
    const apiContributions = capabilities.api;
    const exposesApi =
      apiContributions.length > 0 ||
      Reflect.ownKeys(frozenPluginApi).length > 0;
    const dependencies = plugin.dependencies.map((dependency) => {
      const extension = extensionByName.get(dependency.name);

      if (!extension) {
        throw new Error(
          `Plate plugin "${plugin.name}" dependency "${dependency.name}" was not lowered before its owner.`
        );
      }

      return extension;
    });
    const conflicts = [
      ...plugin.conflicts.flatMap((conflict) => {
        const extension = extensionByName.get(conflict.name);

        return extension ? [extension] : [];
      }),
      ...pluginList
        .slice(0, index)
        .flatMap((previous) =>
          previous.conflicts.some((conflict) => conflict.name === plugin.name)
            ? [extensionByName.get(previous.name)!]
            : []
        ),
    ];
    const on = createPluginLifecycleHandlers(editor, plugin);
    const stateFields = plugin.stateFields ?? [];
    const effectTypes = plugin.effectTypes ?? [];
    const binding = model.byName[plugin.name];
    const elementType = binding?.elementType;
    const markKey = binding?.kind === 'mark' ? binding.propertyKey : null;
    const markIsBoolean =
      markKey !== null &&
      binding?.properties.some(
        (property) =>
          property.placement === 'text' &&
          getCompiledSchemaPropertyId(property) === binding.textPropertyId &&
          property.value.kind === 'boolean'
      );
    const definition: EditorExtensionDefinitionInput<BaseEditor> = {
      ...(plugin.enabled === false ? { enabled: false } : {}),
      ...(dependencies.length > 0 ? { dependencies } : {}),
      ...(conflicts.length > 0 ? { conflicts } : {}),
      ...(exposesApi
        ? {
            api: (context) => {
              let resolvedApi: Record<PropertyKey, unknown> = {};

              if (apiContributions.length === 0) {
                resolvedApi = mergePlugins(resolvedApi, frozenPluginApi);
              } else {
                for (const contribution of apiContributions) {
                  const value =
                    contribution.kind === 'plate'
                      ? contribution.value
                      : Reflect.apply(contribution.factory, undefined, [
                          context,
                        ]);

                  if (!isApiRecord(value)) {
                    throw new Error(
                      `Plate plugin "${plugin.name}" API factories must return an object.`
                    );
                  }
                  resolvedApi = mergePlugins(resolvedApi, value);
                }
              }

              return snapshotApiValue(resolvedApi, apiSnapshots);
            },
          }
        : {}),
      ...(markKey ||
      capabilities.read.length > 0 ||
      typeof plugin.read === 'function'
        ? {
            read: (context) => {
              const authoredRead =
                capabilities.read.length > 0
                  ? resolvePluginCapability(
                      editor,
                      plugin,
                      capabilities.read,
                      context
                    )
                  : typeof plugin.read === 'function'
                    ? Reflect.apply(plugin.read, undefined, [
                        Object.assign(
                          Object.create(createPluginContext(editor, plugin)),
                          context
                        ),
                      ])
                    : {};

              if (!markKey) {
                return isApiRecord(authoredRead)
                  ? Object.fromEntries(
                      Object.entries(authoredRead).map(([name, value]) => [
                        name,
                        typeof value === 'function'
                          ? txRead(value as (...args: never[]) => unknown)
                          : value,
                      ])
                    )
                  : authoredRead;
              }

              if (!isApiRecord(authoredRead)) {
                throw new Error(
                  `Plate mark plugin "${plugin.name}" read factories must return an object.`
                );
              }

              const defaultRead = {
                isActive: (expected?: unknown) => {
                  const current = context.state.marks()?.[markKey];

                  if (expected !== undefined) return current === expected;

                  return markIsBoolean
                    ? current === true
                    : current !== undefined;
                },
                value: () => context.state.marks()?.[markKey],
              };

              return Object.fromEntries(
                Object.entries(mergePlugins(defaultRead, authoredRead)).map(
                  ([name, value]) => [
                    name,
                    typeof value === 'function'
                      ? txRead(value as (...args: never[]) => unknown)
                      : value,
                  ]
                )
              );
            },
          }
        : {}),
      ...(elementType ||
      markKey ||
      capabilities.update.length > 0 ||
      typeof plugin.update === 'function'
        ? {
            update: (context) => {
              const authoredUpdate =
                capabilities.update.length > 0
                  ? resolvePluginCapability(
                      editor,
                      plugin,
                      capabilities.update,
                      context
                    )
                  : typeof plugin.update === 'function'
                    ? Reflect.apply(plugin.update, undefined, [
                        Object.assign(
                          Object.create(createPluginContext(editor, plugin)),
                          context
                        ),
                      ])
                    : {};

              if (!isApiRecord(authoredUpdate)) {
                throw new Error(
                  `Plate plugin "${plugin.name}" update factories must return an object.`
                );
              }
              const hasAuthoredToggle =
                typeof authoredUpdate.toggle === 'function';
              const hasGenericToggle =
                getPlateModelPublication(
                  editor
                )?.genericElementToggles.includes(plugin.name) === true;

              const defaultUpdate = {
                ...(elementType
                  ? {
                      insert: (
                        properties: Readonly<Record<string, unknown>> = {},
                        options?: Readonly<Record<string, unknown>>
                      ) => {
                        if (
                          !context.tx.selection() &&
                          options?.at === undefined
                        ) {
                          return;
                        }
                        const element = context.tx.schema.create(
                          elementType,
                          properties
                        );

                        if (
                          context.tx.schema.isBlock(element) &&
                          options?.at === undefined
                        ) {
                          return context.tx.blocks.insertAfter(
                            element,
                            options
                          );
                        }

                        return context.tx.nodes.insert(element, options);
                      },
                      remove: (options?: Readonly<Record<string, unknown>>) =>
                        context.tx.nodes.remove({
                          ...options,
                          match: { type: elementType },
                        }),
                      set: (
                        properties: Readonly<Record<string, unknown>>,
                        options?: Readonly<Record<string, unknown>>
                      ) =>
                        context.tx.nodes.set(properties, {
                          ...options,
                          match: { type: elementType },
                        }),
                      ...(hasGenericToggle && !hasAuthoredToggle
                        ? {
                            toggle: (
                              options: Readonly<Record<string, unknown>> = {}
                            ) => {
                              const { collapse, ...blockOptions } = options;

                              context.tx.blocks.toggle(
                                elementType,
                                blockOptions
                              );
                              if (collapse) {
                                context.tx.selection.collapse(
                                  collapse === true ? undefined : collapse
                                );
                              }
                            },
                          }
                        : {}),
                    }
                  : {}),
                ...(markKey
                  ? {
                      clear: () => context.tx.marks.remove(markKey),
                      set: (value: unknown) =>
                        context.tx.marks.add(markKey, value),
                      toggle: (value?: unknown) => {
                        if (!markIsBoolean && value === undefined) {
                          throw new TypeError(
                            `Plate mark plugin "${plugin.name}" requires a value to toggle.`
                          );
                        }

                        context.tx.marks.toggle(
                          markKey,
                          markIsBoolean ? true : value
                        );
                      },
                    }
                  : {}),
              };

              return mergePlugins(defaultUpdate, authoredUpdate);
            },
          }
        : {}),
      ...(plugin.readMiddleware
        ? {
            readMiddleware:
              plugin.readMiddleware as EditorExtensionDefinitionInput<BaseEditor>['readMiddleware'],
          }
        : {}),
      ...(plugin.commands
        ? {
            commands:
              plugin.commands as EditorExtensionDefinitionInput<BaseEditor>['commands'],
          }
        : {}),
      ...(plugin.corrections
        ? {
            corrections:
              plugin.corrections as EditorExtensionDefinitionInput<BaseEditor>['corrections'],
          }
        : {}),
      ...(stateFields.length > 0
        ? {
            stateFields:
              stateFields as EditorExtensionDefinitionInput<BaseEditor>['stateFields'],
          }
        : {}),
      ...(effectTypes.length > 0
        ? {
            effectTypes:
              effectTypes as EditorExtensionDefinitionInput<BaseEditor>['effectTypes'],
          }
        : {}),
      ...(plugin.facetProviders
        ? {
            facetProviders:
              plugin.facetProviders as EditorExtensionDefinitionInput<BaseEditor>['facetProviders'],
          }
        : {}),
      ...(plugin.selectionKinds
        ? {
            selectionKinds:
              plugin.selectionKinds as EditorExtensionDefinitionInput<BaseEditor>['selectionKinds'],
          }
        : {}),
      ...(plugin.contributions
        ? {
            contributions:
              plugin.contributions as EditorExtensionDefinitionInput<BaseEditor>['contributions'],
          }
        : {}),
      ...(Reflect.ownKeys(on).length > 0 ? { on } : {}),
      ...(plugin.activate
        ? {
            activate:
              plugin.activate as EditorExtensionDefinitionInput<BaseEditor>['activate'],
          }
        : {}),
      ...(plugin.validate
        ? {
            validate:
              plugin.validate as EditorExtensionDefinitionInput<BaseEditor>['validate'],
          }
        : {}),
      ...(model.contributions[plugin.name]
        ? { schema: model.contributions[plugin.name] }
        : {}),
    };
    const extension = compileEditorExtension({
      ...definition,
      name: plugin.name,
    });
    const family = getPluginSchemaFamily(plugin);

    extensions.push(extension);
    extensionByName.set(plugin.name, extension);
    if (!family) {
      throw new Error(
        `Plate plugin "${plugin.name}" is missing its descriptor family.`
      );
    }
    pluginBindings.set(
      plugin.name,
      Object.freeze({
        extension,
        family,
      })
    );
    capabilities.nativeSources.forEach((source) => {
      extensionAliases.set(source, extension);
    });
    fallbackApiByPlugin.set(plugin.name, frozenPluginApi);
  });
  const updateMethods = inspectPluginUpdateMethods(editor, pluginList, model);

  plateRuntimeExtensionBindings.set(
    editor,
    Object.freeze({
      aliases: extensionAliases,
      plugins: pluginBindings,
    })
  );

  return Object.freeze({
    extensions: Object.freeze(extensions),
    resolveApiPublication: () => {
      const apiByPlugin: Record<
        string,
        Readonly<Record<string, unknown>>
      > = Object.create(null);
      const shortcutApiByPlugin: Record<string, ShortcutApiOwner> =
        Object.create(null);

      pluginList.forEach((plugin) => {
        const extension = extensionByName.get(plugin.name)!;
        const candidate = getCandidateEditorExtensionApi(editor, extension)?.[
          plugin.name
        ];
        const api = isApiRecord(candidate)
          ? candidate
          : fallbackApiByPlugin.get(plugin.name)!;

        apiByPlugin[plugin.name] = api;
        shortcutApiByPlugin[plugin.name] = Object.freeze({ api });
      });

      return Object.freeze({
        apiByPlugin: Object.freeze(apiByPlugin),
        shortcutApiByPlugin: Object.freeze(shortcutApiByPlugin),
      });
    },
    updateMethods,
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
  const compilerInputs: Array<{
    declarationIndex: number;
    id: string;
    pluginIndex: number;
    shortcut: NonNullable<BasePlugin['shortcuts'][string]>;
  }> = [];

  pluginList.forEach((plugin, pluginIndex) => {
    Object.entries(plugin.shortcuts).forEach(
      ([originalKey, hotkey], declarationIndex) => {
        const namespacedKey = `${plugin.name}.${originalKey}`;

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
            handler?: (...args: never[]) => unknown;
            priority?: number;
          };

          if (resolvedHotkey.handler && target !== undefined) {
            throw new Error(
              `Plate shortcut "${namespacedKey}" cannot define \`target\` together with a custom handler.`
            );
          }

          if (!resolvedHotkey.handler && updateMethods) {
            if (
              target !== undefined &&
              target !== 'api' &&
              target !== 'update'
            ) {
              throw new Error(
                `Plate shortcut "${namespacedKey}" target must be "update" or "api".`
              );
            }
            const hasUpdate =
              updateMethods[plugin.name]?.includes(originalKey) === true;
            const apiScopes = shortcutApiByPlugin?.[plugin.name];
            const apiOwner = apiScopes?.api;
            const apiCommand = apiOwner?.[originalKey];
            const hasApi = typeof apiCommand === 'function';
            const route = (() => {
              if (target === 'update') {
                if (!hasUpdate) {
                  throw new Error(
                    `Plate shortcut "${namespacedKey}" targets missing update command "${plugin.name}.${originalKey}".`
                  );
                }

                return 'update';
              }
              if (target === 'api') {
                if (!hasApi) {
                  throw new Error(
                    `Plate shortcut "${namespacedKey}" targets missing API command "${plugin.name}.${originalKey}".`
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
                )[plugin.name];
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

          resolvedHotkey.priority ??= 0;

          (shortcuts as Record<string, BasePlugin['shortcuts'][string]>)[
            namespacedKey
          ] = resolvedHotkey as NonNullable<BasePlugin['shortcuts'][string]>;
          compilerInputs.push({
            declarationIndex,
            id: namespacedKey,
            pluginIndex,
            shortcut: resolvedHotkey as NonNullable<
              BasePlugin['shortcuts'][string]
            >,
          });
        }
      }
    );
  });

  return {
    shortcutTable: compilePlateShortcuts(compilerInputs),
    shortcuts,
  };
};

const createPluginInputRules = (pluginList: readonly AnyBasePlugin[]) => {
  const resolvedMeta = createMutableResolvedInputRulesMeta();

  pluginList.forEach((plugin, pluginIndex) => {
    const inputRulesDefinition = plugin.inputRules;
    const definitionRules =
      typeof inputRulesDefinition === 'function'
        ? inputRulesDefinition({
            rule: {
              blockFence: (config) => createBlockFenceInputRule(config),
              blockStart: (config) => createBlockStartInputRule(config),
              insertBreak: (rule) => defineInputRule(rule),
              insertData: (rule) => defineInputRule(rule),
              insertText: (rule) => defineInputRule(rule),
              mark: (config) => createMarkInputRule(config),
            } satisfies InputRuleBuilder,
          })
        : (inputRulesDefinition ?? []);
    const ruleDefinitions = definitionRules as InputRule[];

    resolvedMeta.plugins[plugin.name] = {
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
        id: `${plugin.name}.${ruleIndex}`,
        pluginIndex,
        plugin,
        priority: mergedRule.priority ?? 0,
        ruleIndex,
      } as ResolvedInputRule;

      resolvedMeta.plugins[plugin.name].rules.push(resolvedRule);

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
  ownerName: string;
  path: string;
  targetName: string;
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
  ownerName: string,
  path: string
): AnyBasePlugin => {
  if (!isNominalPluginDescriptor(reference)) {
    throw new Error(
      `Plate plugin "${ownerName}" has an invalid dependency at "${path}". Pass a plugin descriptor, not its name.`
    );
  }
  if (!reference.name) {
    throw new Error(
      `Plate plugin "${ownerName}" has an empty dependency name at "${path}".`
    );
  }
  if (reference.name === 'root') {
    throw new Error(
      `Plate plugin name "root" is reserved for the internal editor root (${path}).`
    );
  }

  return reference as AnyBasePlugin;
};

const assertStaticPluginTopology = (
  source: AnyBasePlugin,
  resolved: AnyBasePlugin
) => {
  if (resolved.name !== source.name) {
    throw new Error(
      `Plate plugin "${source.name}" cannot change its name while being configured.`
    );
  }

  const declared = getPluginDependencies(source);
  const configured = getPluginDependencies(resolved);

  if (
    declared.length !== configured.length ||
    declared.some((plugin, index) => plugin !== configured[index])
  ) {
    throw new Error(
      `Plate plugin "${source.name}" cannot change dependencies through configure or extend. Declare dependencies at plugin creation.`
    );
  }
};

export const collectPlatePluginSourceCandidates = (
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
    { component: unknown; terminal: boolean }
  > = Object.create(null);

  for (const plugin of plugins) {
    const components = (plugin.override as { components?: NodeComponents })
      .components;

    if (!components) continue;
    Object.entries(components).forEach(([key, component]) => {
      if (plugin.name === 'root' || !componentOverrides[key]) {
        componentOverrides[key] = {
          component,
          terminal: plugin.name === 'root',
        };
      }
    });
  }

  return plugins.map((plugin) => {
    const override = componentOverrides[plugin.name];

    if (!override || (plugin.render.node && !override.terminal)) {
      return plugin;
    }

    return inheritResolvedPluginCapabilities(
      plugin,
      brandPluginDescriptor(
        {
          ...plugin,
          render: {
            ...plugin.render,
            node: override.component,
          },
        },
        plugin
      ) as AnyBasePlugin
    );
  });
};

const getPresentNames = (
  nodes: ReadonlyMap<string, PluginGraphNode>,
  rootOriginsByName: ReadonlyMap<string, readonly PluginRootOrigin[]>
) => {
  const present = new Set<string>();
  const queue = [...rootOriginsByName.keys()];

  for (const name of queue) {
    if (present.has(name)) continue;
    present.add(name);
    const owner = nodes.get(name);

    if (!owner?.resolved || owner.resolved.enabled === false) continue;

    for (const edge of owner.dependencyEdges) {
      if (!present.has(edge.targetName)) queue.push(edge.targetName);
    }
  }

  return present;
};

const weakPluginOverrideForbiddenKeys = new Set<PropertyKey>([
  'activate',
  'api',
  'codecs',
  'commands',
  'conflicts',
  'configure',
  'contributions',
  'corrections',
  'dependencies',
  'effectTypes',
  'extend',
  'facetProviders',
  'name',
  'override',
  'plugins',
  'read',
  'readMiddleware',
  'schema',
  'selectionKinds',
  'stateFields',
  'update',
  'validate',
]);

const assertWeakPluginOverride = (
  contributorName: string,
  targetName: string,
  value: unknown
): Record<PropertyKey, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(
      `Plate plugin "${contributorName}" weak override for "${targetName}" must be an object.`
    );
  }

  for (const key of Reflect.ownKeys(value)) {
    if (weakPluginOverrideForbiddenKeys.has(key)) {
      throw new Error(
        `Plate plugin "${contributorName}" weak override for "${targetName}" cannot define "${String(key)}". Weak overrides cannot mutate plugin identity, topology, or authoring state.`
      );
    }
  }
  if (
    Object.hasOwn(value, 'enabled') &&
    typeof Reflect.get(value, 'enabled') !== 'boolean'
  ) {
    throw new Error(
      `Plate plugin "${contributorName}" weak override for "${targetName}" must define "enabled" as a boolean.`
    );
  }

  return value as Record<PropertyKey, unknown>;
};

const getWeakOverrideGraphSignature = (
  nodes: ReadonlyMap<string, PluginGraphNode>,
  present: ReadonlySet<string>
) =>
  [...nodes.entries()]
    .map(([name, node]) => {
      const plugin = node.resolved;

      return `${name}:${present.has(name) ? 1 : 0}:${plugin?.enabled === false ? 0 : 1}`;
    })
    .join('|');

const applyWeakPluginOverrides = (
  editor: BaseEditor,
  nodes: ReadonlyMap<string, PluginGraphNode>,
  rootOriginsByName: ReadonlyMap<string, readonly PluginRootOrigin[]>
) => {
  let present = getPresentNames(nodes, rootOriginsByName);
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
          present.has(node.resolved.name) &&
          node.resolved.enabled !== false
      )
      // Merge later sources first so earlier application order remains
      // authoritative for overlapping weak fields.
      .sort((a, b) => b.origin.sourceIndex - a.origin.sourceIndex);

    for (const contributor of contributors) {
      const overrides = contributor.resolved.override?.plugins;

      if (!overrides) continue;

      for (const targetName of Object.keys(overrides)) {
        if (targetName === 'root') {
          throw new Error(
            `Plate plugin "${contributor.resolved.name}" cannot weakly override the internal root plugin.`
          );
        }
        if (targetName === contributor.resolved.name) {
          throw new Error(
            `Plate plugin "${contributor.resolved.name}" cannot weakly override itself. Configure the descriptor directly.`
          );
        }
        if (!present.has(targetName)) continue;
        const patch = assertWeakPluginOverride(
          contributor.resolved.name,
          targetName,
          overrides[targetName]
        );

        const previous = patchesByTarget.get(targetName);

        patchesByTarget.set(
          targetName,
          previous ? mergePlugins(previous, patch) : mergePlugins({}, patch)
        );
      }
    }

    nodes.forEach((node, name) => {
      if (!node.baseResolved) return;
      const patch = patchesByTarget.get(name);

      if (!patch) {
        node.resolved = node.baseResolved;
        return;
      }

      const patched = inheritResolvedPluginCapabilities(
        node.baseResolved,
        mergePlugins(node.baseResolved, patch)
      );

      node.resolved = reapplyResolvedPluginConfigurations(
        editor,
        patched,
        node.configurations
      );
      assertStaticPluginTopology(node.descriptor, node.resolved);
    });

    const nextPresent = getPresentNames(nodes, rootOriginsByName);
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
  const rootOriginsByName = new Map<string, PluginRootOrigin[]>();
  const addRoot = (
    descriptor: AnyBasePlugin,
    role: PluginRootRole,
    path: string
  ) => {
    if (!isNominalPluginDescriptor(descriptor) || !descriptor.name) {
      throw new Error(`Plate plugin at "${path}" must have a non-empty name.`);
    }
    if (descriptor.name === 'root' && role !== 'internalRoot') {
      throw new Error(
        `Plate plugin name "root" is reserved for the internal editor root (${path}).`
      );
    }
    if (role === 'internalRoot' && descriptor.name !== 'root') {
      throw new Error(
        `The internal editor root must use the reserved plugin name "root".`
      );
    }

    const origins = rootOriginsByName.get(descriptor.name) ?? [];
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
      rootOriginsByName.set(descriptor.name, origins);
    }
  };
  const indexRoots = (
    plugins: readonly AnyBasePlugin[],
    role: Exclude<PluginRootRole, 'internalRoot'>
  ) => {
    plugins.forEach((plugin, index) => {
      indexDescriptor(plugin);
      addRoot(plugin, role, `${role}[${index}].${plugin.name}`);
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

  rootOriginsByName.forEach((origins, name) => {
    const highestPrecedence = Math.max(
      ...origins.map((origin) => rootRolePrecedence[origin.role])
    );
    const highestRoleOrigins = origins.filter(
      (origin) => rootRolePrecedence[origin.role] === highestPrecedence
    );
    let selected = highestRoleOrigins[0];
    let descriptor = selected.descriptor;

    if (highestRoleOrigins.length > 1) {
      const orderedOrigins = [...highestRoleOrigins].sort(
        (a, b) => a.sourceIndex - b.sourceIndex
      );
      const families = new Set(
        orderedOrigins.map((origin) => getPluginSchemaFamily(origin.descriptor))
      );
      const lineageOrigin = orderedOrigins.reduce((deepest, candidate) =>
        getPluginDescriptorMetadata(candidate.descriptor).stages.length >
        getPluginDescriptorMetadata(deepest.descriptor).stages.length
          ? candidate
          : deepest
      );
      const authoringStages = getPluginDescriptorMetadata(
        lineageOrigin.descriptor
      ).stages;
      const sharesAuthoringLineage = orderedOrigins.every(({ descriptor }) =>
        getPluginDescriptorMetadata(descriptor).stages.every(
          (stage, index) => stage === authoringStages[index]
        )
      );

      if (families.size > 1 || !sharesAuthoringLineage) {
        throw new Error(
          `Duplicate Plate plugin "${name}" in ${highestRoleOrigins[0].role}: "${highestRoleOrigins[0].path}" conflicts with "${highestRoleOrigins[1].path}".`
        );
      }

      descriptor = mergePlugins(
        {},
        ...orderedOrigins.map((origin) => origin.descriptor)
      ) as AnyBasePlugin;
      const metadata = getPluginDescriptorMetadata(lineageOrigin.descriptor);

      setPluginDescriptorMetadata(descriptor, {
        ...metadata,
        configurationLayers: Object.freeze(
          orderedOrigins.flatMap((origin) => [
            ...getPluginDescriptorMetadata(origin.descriptor)
              .configurationLayers,
          ])
        ),
      });
      selected = orderedOrigins.at(-1)!;
    }

    const resolved = resolveDescriptor(descriptor);

    assertStaticPluginTopology(selected.descriptor, resolved.plugin);
    const winner = {
      ...selected,
      sourceIndex: Math.min(...origins.map((origin) => origin.sourceIndex)),
    };

    nodes.set(name, {
      baseResolved: resolved.plugin,
      configurations: resolved.configurations,
      dependencyEdges: [],
      descriptor: winner.descriptor,
      expanded: false,
      origin: winner,
      resolved: resolved.plugin,
    });
  });

  const hiddenByName = new Map<
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
    const descriptor = assertPluginReference(reference, ownerPlugin.name, path);
    const hidden = hiddenByName.get(descriptor.name);

    if (hidden && hidden.descriptor !== descriptor) {
      throw new Error(
        `Plate plugin "${descriptor.name}" has conflicting dependency descriptors at "${hidden.path}" and "${path}".`
      );
    }
    if (!hidden) {
      hiddenByName.set(descriptor.name, { descriptor, path });
    }

    let target = nodes.get(descriptor.name);

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
      nodes.set(descriptor.name, target);
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
      ownerName: ownerPlugin.name,
      path,
      targetName: descriptor.name,
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

  applyWeakPluginOverrides(editor, nodes, rootOriginsByName);
  const presentNames = getPresentNames(nodes, rootOriginsByName);
  const requiredByTarget = new Map<string, PluginRelationship[]>();

  nodes.forEach((owner, name) => {
    if (!presentNames.has(name) || owner.resolved?.enabled === false) {
      return;
    }

    owner.dependencyEdges.forEach((edge) => {
      const edges = requiredByTarget.get(edge.targetName) ?? [];

      edges.push(edge);
      requiredByTarget.set(edge.targetName, edges);
    });
  });

  requiredByTarget.forEach((edges, targetName) => {
    const target = nodes.get(targetName)!;

    if (target.resolved?.enabled === false) {
      const edge = edges[0];

      throw new Error(
        `Plate plugin "${edge.ownerName}" requires disabled plugin "${targetName}" at "${edge.path}".`
      );
    }
  });

  const enabledNodes = [...nodes.values()].filter(
    (node): node is PluginGraphNode & { resolved: AnyBasePlugin } =>
      !!node.resolved &&
      node.resolved.enabled !== false &&
      presentNames.has(node.resolved.name)
  );
  const enabledByName = new Map(
    enabledNodes.map((node) => [node.resolved.name, node])
  );
  const dependencyNamesByOwner = new Map<string, Set<string>>();
  const dependentsByDependency = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();

  enabledNodes.forEach((node) => {
    indegree.set(node.resolved.name, 0);
  });
  enabledNodes.forEach((node) => {
    const ownerName = node.resolved.name;
    const dependencies = dependencyNamesByOwner.get(ownerName) ?? new Set();

    node.dependencyEdges.forEach((edge) => {
      if (
        !enabledByName.has(edge.targetName) ||
        dependencies.has(edge.targetName)
      ) {
        return;
      }
      dependencies.add(edge.targetName);
      indegree.set(ownerName, (indegree.get(ownerName) ?? 0) + 1);
      const dependents =
        dependentsByDependency.get(edge.targetName) ?? new Set<string>();

      dependents.add(ownerName);
      dependentsByDependency.set(edge.targetName, dependents);
    });
    dependencyNamesByOwner.set(ownerName, dependencies);
  });

  const compareReady = (
    a: PluginGraphNode & { resolved: AnyBasePlugin },
    b: PluginGraphNode & { resolved: AnyBasePlugin }
  ) => a.origin.sourceIndex - b.origin.sourceIndex;
  const ready = enabledNodes
    .filter((node) => indegree.get(node.resolved.name) === 0)
    .sort(compareReady);
  const ordered: AnyBasePlugin[] = [];

  while (ready.length > 0) {
    const node = ready.shift()!;
    const name = node.resolved.name;

    ordered.push(node.resolved);
    dependentsByDependency.get(name)?.forEach((dependentName) => {
      const next = (indegree.get(dependentName) ?? 0) - 1;

      indegree.set(dependentName, next);
      if (next === 0) {
        ready.push(enabledByName.get(dependentName)!);
        ready.sort(compareReady);
      }
    });
  }

  if (ordered.length !== enabledNodes.length) {
    const state = new Map<string, 'visited' | 'visiting'>();
    const stack: string[] = [];
    let cycle: string[] | undefined;
    const visit = (name: string) => {
      if (cycle || state.get(name) === 'visited') return;
      if (state.get(name) === 'visiting') {
        const start = stack.indexOf(name);

        cycle = [...stack.slice(start), name];
        return;
      }

      state.set(name, 'visiting');
      stack.push(name);
      dependencyNamesByOwner.get(name)?.forEach(visit);
      stack.pop();
      state.set(name, 'visited');
    };

    enabledNodes.forEach((node) => {
      visit(node.resolved.name);
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
  const pluginsByName: Record<string, AnyBasePlugin> = Object.create(null);

  plugins.forEach((plugin) => {
    pluginsByName[plugin.name] = plugin;
  });

  setPlateRuntimeCandidate(editor, {
    ...runtime,
    pluginList: plugins,
    plugins: pluginsByName,
  });
};
