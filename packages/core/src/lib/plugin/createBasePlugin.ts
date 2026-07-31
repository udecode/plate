import type {
  AnyBasePlugin,
  AnyBasePluginContext,
  BasePlugin,
  BasePluginContext,
  BasePluginDefinitionInput,
  EditorShortcut,
} from './BasePlugin';
import type {
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSelectorMethods,
  PluginSelectors,
  NormalizePluginSelectors,
  NormalizePluginState,
} from './PluginDefinition';
import type { EditorUpdateContext } from '@platejs/plite';

import { isFunction } from '../../internal/utils/isFunction';
import {
  allowPrivateRenderContribution,
  isPrivateRenderContribution,
} from '../../internal/plugin/privateRenderContribution';
import type {
  PlatePluginReadState,
  PlatePluginTransaction,
} from '../editor/pluginRuntimeTypes';
import type { BasePluginDependencyReferences } from './basePluginCompiler.internal';
import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  mergePlugins,
} from '../../internal/utils/mergePlugins';

type BasePluginDependencies = readonly Readonly<{ name: string }>[];

type ConstructorFactoryResult<TValue> = TValue extends (
  ...args: infer _TArguments
) => infer TResult
  ? TResult
  : TValue;

type BasePluginConstructorContextDefinition<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TType extends string = N,
  TSchema extends PluginSchemaDeclaration = never,
  TTargetPluginNames extends readonly string[] = readonly [],
> = Readonly<{
  dependencies: BasePluginDependencyReferences<D>;
  initialState: S;
  name: N;
  targetPluginNames: TTargetPluginNames;
  type: TType;
}> &
  ([TSchema] extends [never]
    ? Readonly<Record<never, never>>
    : Readonly<{ schema: TSchema }>);

type BasePluginConstructorSchemaFactory<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TType extends string,
  TTargetPluginNames extends readonly string[],
  TSchema extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<
    NoInfer<
      BasePluginConstructorContextDefinition<
        N,
        D,
        S,
        TType,
        never,
        TTargetPluginNames
      >
    >,
    NoInfer<TType>
  >
) => TSchema;

type BasePluginConstructorInitialStateInput<
  N extends string,
  D extends BasePluginDependencies,
  TType extends string,
  TTargetPluginNames extends readonly string[],
> =
  | ((
      context: BasePluginContext<
        BasePluginConstructorContextDefinition<
          N,
          D,
          {},
          TType,
          never,
          TTargetPluginNames
        >
      >
    ) => any)
  | Readonly<Record<string, unknown>>;

type BasePluginConstructorUpdateFactory<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TType extends string,
  TSchema extends PluginSchemaDeclaration,
  TTargetPluginNames extends readonly string[],
  TUpdate extends object,
> = (
  context: BasePluginContext<
    NoInfer<
      BasePluginConstructorContextDefinition<
        N,
        D,
        S,
        TType,
        TSchema,
        TTargetPluginNames
      >
    >
  > & {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<
      NoInfer<
        BasePluginConstructorContextDefinition<
          N,
          D,
          S,
          TType,
          never,
          TTargetPluginNames
        >
      >
    >;
  }
) => TUpdate;

type BasePluginShortcutRecord = Record<
  string,
  EditorShortcut | null | undefined
>;

type BasePluginConstructorPresenceKey =
  | 'activate'
  | 'codecs'
  | 'commands'
  | 'contributions'
  | 'corrections'
  | 'decorate'
  | 'editOnly'
  | 'effectTypes'
  | 'facetProviders'
  | 'inject'
  | 'inputRules'
  | 'on'
  | 'override'
  | 'parsers'
  | 'readMiddleware'
  | 'render'
  | 'rules'
  | 'selectionKinds'
  | 'stateFields'
  | 'transformInitialValue'
  | 'useHooks'
  | 'validate';

type MutableBasePlugin = AnyBasePlugin & {
  targetPluginNames: readonly string[];
};

type PluginRecord = Record<PropertyKey, unknown> & {
  name?: unknown;
};

const isObjectRecord = (value: unknown): value is PluginRecord =>
  typeof value === 'object' && value !== null;

const assertNoPublicRenderNode = (value: object) => {
  if (isPrivateRenderContribution(value)) return;

  const render = Reflect.get(value, 'render');

  if (
    typeof render === 'object' &&
    render !== null &&
    Object.hasOwn(render, 'node')
  ) {
    throw new Error(
      'Plate plugin `render.node` is private. Use top-level `component` in createBasePlugin/createPlatePlugin, or terminal .configure({ component }).'
    );
  }
};

const assertBaseDefinition: (value: unknown) => asserts value is PluginRecord =
  (value) => {
    if (!isObjectRecord(value)) {
      throw new Error('Plate plugin definitions must be objects.');
    }
    if (typeof value.name !== 'string' || value.name.length === 0) {
      throw new Error('Plate plugins require a non-empty `name`.');
    }

    assertNoPublicRenderNode(value);
    if (Object.hasOwn(value, 'node')) {
      throw new Error(
        'Plate plugin `node` is unsupported. Use top-level `type`, `schema`, and `render`.'
      );
    }
    if (Object.hasOwn(value, 'api') && typeof value.api !== 'function') {
      throw new Error('Plate plugin `api` must be a context factory.');
    }
  };

const assertExtendObject = (value: object) => {
  assertNoPublicRenderNode(value);

  if (Object.hasOwn(value, 'component')) {
    throw new Error(
      'Plate plugin .extend() cannot define `component`; declare the default in the constructor or replace it through terminal .configure({ component }).'
    );
  }

  if (
    Object.hasOwn(value, 'api') &&
    typeof Reflect.get(value, 'api') !== 'function'
  ) {
    throw new Error('Plate plugin `api` must be a context factory.');
  }

  for (const field of ['dependencies', 'name', 'schema', 'type'] as const) {
    if (Object.hasOwn(value, field)) {
      throw new Error(
        `Plate plugin .extend() cannot define \`${field}\`; declare model identity and dependencies in the constructor.`
      );
    }
  }
};

const assertConfigureObject = (value: object) => {
  assertNoPublicRenderNode(value);

  for (const field of [
    'activate',
    'api',
    'codecs',
    'commands',
    'conflicts',
    'contributions',
    'corrections',
    'dependencies',
    'effectTypes',
    'facetProviders',
    'name',
    'read',
    'readMiddleware',
    'schema',
    'selectionKinds',
    'stateFields',
    'type',
    'update',
    'validate',
  ] as const) {
    if (Object.hasOwn(value, field)) {
      throw new Error(
        `Plate plugin .configure() cannot define \`${field}\`; use .extend() for author capabilities.`
      );
    }
  }
};

const normalizeComponent = (value: PluginRecord): PluginRecord => {
  if (!Object.hasOwn(value, 'component')) return value;

  const { component, ...rest } = value;
  const render = isObjectRecord(rest.render) ? rest.render : {};

  return allowPrivateRenderContribution({
    ...rest,
    render: {
      ...render,
      node: component,
    },
  });
};

const normalizeConfiguration = (configuration: PluginRecord) => {
  assertConfigureObject(configuration);

  return normalizeComponent(configuration);
};

const snapshotConfiguration = (configuration: object) => {
  const snapshot: Record<PropertyKey, unknown> = {};

  for (const key of Reflect.ownKeys(configuration)) {
    snapshot[key] = freezePluginDescriptorValue(
      Reflect.get(configuration, key)
    );
  }

  const frozenSnapshot = Object.freeze(snapshot);

  return isPrivateRenderContribution(configuration)
    ? allowPrivateRenderContribution(frozenSnapshot)
    : frozenSnapshot;
};

const createInitialStage = (definition: PluginRecord) => {
  const { api, codecs, initialState, read, update } = definition;
  const contextualInitialState =
    typeof initialState === 'function' ? initialState : undefined;

  if (
    api === undefined &&
    codecs === undefined &&
    contextualInitialState === undefined &&
    read === undefined &&
    update === undefined
  ) {
    return [];
  }

  return [
    (context: AnyBasePluginContext) => ({
      ...(api !== undefined
        ? {
            api,
          }
        : {}),
      ...(codecs !== undefined
        ? {
            codecs:
              typeof codecs === 'function'
                ? Reflect.apply(codecs, undefined, [context])
                : codecs,
          }
        : {}),
      ...(contextualInitialState
        ? {
            initialState: Reflect.apply(contextualInitialState, undefined, [
              context,
            ]),
          }
        : {}),
      ...(read !== undefined ? { read } : {}),
      ...(update !== undefined ? { update } : {}),
    }),
  ] as const;
};

const attachPluginMethods = (
  source: MutableBasePlugin,
  familySource?: object
): MutableBasePlugin => {
  const plugin = source;
  const recreate = (next: MutableBasePlugin) =>
    attachPluginMethods(
      brandPluginDescriptor(next, familySource ?? plugin),
      familySource ?? plugin
    );
  const assertAuthoringOpen = (method: string) => {
    if (Reflect.get(plugin, '__configured') !== true) return;

    throw new Error(
      `Plate plugin '${plugin.name}' is already configured. Call .${method}() before .configure().`
    );
  };

  Reflect.set(plugin, 'configure', (input: unknown) => {
    assertAuthoringOpen('configure');
    const next = { ...plugin } as MutableBasePlugin;

    Reflect.set(next, '__configured', true);

    if (isFunction(input)) {
      next.__configurationLayers = [
        ...next.__configurationLayers,
        Object.freeze({
          kind: 'context' as const,
          value: (context: AnyBasePluginContext) => {
            const configuration = Reflect.apply(input, undefined, [context]);

            if (!isObjectRecord(configuration)) {
              throw new Error(
                'Plate plugin .configure() callbacks must return an object.'
              );
            }
            return normalizeConfiguration(configuration);
          },
        }),
      ];
    } else {
      if (!isObjectRecord(input)) {
        throw new Error('Plate plugin .configure() values must be objects.');
      }
      const configuration = normalizeConfiguration(input);
      next.__configurationLayers = [
        ...next.__configurationLayers,
        Object.freeze({
          kind: 'object' as const,
          value: snapshotConfiguration(configuration),
        }),
      ];
    }

    return recreate(next);
  });

  Reflect.set(plugin, 'extend', (input: unknown) => {
    assertAuthoringOpen('extend');
    const next = { ...plugin } as MutableBasePlugin;

    if (isFunction(input)) {
      next.__stages = [
        ...next.__stages,
        (context: AnyBasePluginContext) => {
          const contribution = Reflect.apply(input, undefined, [context]);

          if (!isObjectRecord(contribution)) {
            throw new Error(
              'Plate plugin .extend() callbacks must return an object.'
            );
          }
          if (!Object.hasOwn(contribution, 'name')) {
            assertExtendObject(contribution);
          }

          return contribution;
        },
      ];
    } else {
      if (!isObjectRecord(input)) {
        throw new Error('Plate plugin .extend() values must be objects.');
      }

      // A named object is a canonical raw Plite descriptor. Its name is
      // validated by the resolver and its native fields are adopted flat.
      if (!Object.hasOwn(input, 'name')) assertExtendObject(input);

      const contribution = freezePluginDescriptorValue(input);

      next.__stages = [...next.__stages, () => contribution];
    }

    return recreate(next);
  });

  return brandPluginDescriptor(plugin, familySource);
};

const createBasePluginRuntime = (definition: unknown): MutableBasePlugin => {
  assertBaseDefinition(definition);
  const normalizedDefinition = normalizeComponent(definition);

  const {
    api: _api,
    codecs: _codecs,
    initialState,
    read: _read,
    update: _update,
    ...staticDefinition
  } = normalizedDefinition;
  const name = normalizedDefinition.name as string;
  const plugin = mergePlugins(
    {
      name,
      __configurationLayers: [],
      __htmlCodecContributions: [],
      __stages: createInitialStage(normalizedDefinition),
      conflicts: [],
      dependencies: [],
      initialState: {},
      inject: {},
      inputRules: [],
      on: {},
      override: {},
      parsers: {},
      render: {},
      rules: {},
      schema: null,
      selectors: {},
      shortcuts: {},
      targetPluginNames: [],
      type: name,
    },
    {
      ...staticDefinition,
      ...(typeof initialState === 'function' ? {} : { initialState }),
    }
  ) as unknown as MutableBasePlugin;

  plugin.targetPluginNames = Object.freeze([...plugin.targetPluginNames]);

  return attachPluginMethods(plugin);
};

/**
 * Create one exact render-capable Plate definition.
 *
 * The callback-rich input is normalized to a compact private definition
 * witness. Ordered `.extend()` stages may consume capabilities from earlier
 * stages; `.configure()` is terminal and never widens the definition.
 */
type BasePluginConstructorRestInput<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TType extends string,
  TSchema extends PluginSchemaDeclaration,
  TTargetPluginNames extends readonly string[],
> = Omit<
  BasePluginDefinitionInput<
    NoInfer<
      BasePluginConstructorContextDefinition<
        N,
        D,
        S,
        TType,
        TSchema,
        TTargetPluginNames
      >
    >
  >,
  | 'api'
  | 'conflicts'
  | 'dependencies'
  | 'enabled'
  | 'initialState'
  | 'name'
  | 'read'
  | 'schema'
  | 'selectors'
  | 'shortcuts'
  | 'targetPluginNames'
  | 'type'
  | 'update'
>;

type BasePluginConstructorSchemaInput<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TType extends string,
  TTargetPluginNames extends readonly string[],
  TSchema extends PluginSchemaDeclaration,
> =
  | BasePluginConstructorSchemaFactory<
      N,
      D,
      S,
      TType,
      TTargetPluginNames,
      TSchema
    >
  | (TSchema & Readonly<Record<string, unknown>>);

type BasePluginConstructorKey = keyof BasePluginDefinitionInput;

type BasePluginConstructorDependencies<
  TKeys extends BasePluginConstructorKey,
  D extends BasePluginDependencies,
> = 'dependencies' extends TKeys ? D : readonly [];

export function createBasePlugin<
  const N extends string,
  const TKeys extends BasePluginConstructorKey,
  TInitialStateInput extends BasePluginConstructorInitialStateInput<
    N,
    BasePluginConstructorDependencies<TKeys, D>,
    TType,
    TTargetPluginNames
  >,
  const TApi extends object,
  const TUpdate extends object,
  const TSchema extends PluginSchemaDeclaration,
  const D extends BasePluginDependencies,
  S extends object = 'initialState' extends TKeys
    ? Extract<ConstructorFactoryResult<TInitialStateInput>, object>
    : {},
  const TConflicts extends BasePluginDependencies = readonly [],
  const TType extends string = N,
  const TTargetPluginNames extends readonly string[] = readonly [],
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<S> = {},
  const TEnabled extends boolean = boolean,
  const TShortcuts extends BasePluginShortcutRecord = {},
>(
  definition: Readonly<Record<TKeys, unknown>> &
    ('schema' extends TKeys
      ? Readonly<{
          schema: BasePluginConstructorSchemaInput<
            N,
            BasePluginConstructorDependencies<TKeys, D>,
            S,
            TType,
            TTargetPluginNames,
            TSchema
          >;
        }>
      : Readonly<{ schema?: never }>) &
    BasePluginConstructorRestInput<
      N,
      BasePluginConstructorDependencies<TKeys, D>,
      S,
      TType,
      NoInfer<'schema' extends TKeys ? TSchema : never>,
      TTargetPluginNames
    > &
    ('initialState' extends TKeys
      ? Readonly<{ initialState: TInitialStateInput }>
      : Readonly<{ initialState?: never }>) &
    Readonly<{
      api?: (
        context: BasePluginContext<
          NoInfer<
            BasePluginConstructorContextDefinition<
              N,
              BasePluginConstructorDependencies<TKeys, D>,
              S,
              TType,
              never,
              TTargetPluginNames
            >
          >
        >
      ) => TApi;
      conflicts?: TConflicts;
      dependencies?: D;
      enabled?: TEnabled;
      name: N;
      read?: (
        context: BasePluginContext<
          NoInfer<
            BasePluginConstructorContextDefinition<
              N,
              BasePluginConstructorDependencies<TKeys, D>,
              S,
              TType,
              never,
              TTargetPluginNames
            >
          >
        > & {
          state: PlatePluginReadState<
            NoInfer<
              BasePluginConstructorContextDefinition<
                N,
                BasePluginConstructorDependencies<TKeys, D>,
                S,
                TType,
                never,
                TTargetPluginNames
              >
            >
          >;
        }
      ) => TRead;
      selectors?: TSelectors & PluginSelectors<NoInfer<S>>;
      shortcuts?: TShortcuts;
      targetPluginNames?: TTargetPluginNames;
      type?: TType;
      update?: BasePluginConstructorUpdateFactory<
        N,
        BasePluginConstructorDependencies<TKeys, D>,
        S,
        TType,
        NoInfer<'schema' extends TKeys ? TSchema : never>,
        TTargetPluginNames,
        TUpdate
      >;
    }>
): BasePlugin<
  Readonly<{
    [P in Extract<
      keyof Readonly<Record<TKeys, unknown>>,
      BasePluginConstructorPresenceKey
    >]: true;
  }> &
    Readonly<{ name: N }> &
    ('dependencies' extends TKeys
      ? Readonly<{
          dependencies: BasePluginDependencyReferences<
            BasePluginConstructorDependencies<TKeys, D>
          >;
        }>
      : Readonly<Record<never, never>>) &
    ('conflicts' extends TKeys
      ? Readonly<{
          conflicts: BasePluginDependencyReferences<TConflicts>;
        }>
      : Readonly<Record<never, never>>) &
    ('initialState' extends TKeys
      ? Readonly<{ initialState: NormalizePluginState<S> }>
      : Readonly<Record<never, never>>) &
    ('enabled' extends TKeys
      ? Readonly<{ enabled: TEnabled }>
      : Readonly<Record<never, never>>) &
    ('api' extends TKeys
      ? Readonly<{ api: TApi }>
      : Readonly<Record<never, never>>) &
    ('read' extends TKeys
      ? Readonly<{ read: TRead }>
      : Readonly<Record<never, never>>) &
    ('selectors' extends TKeys
      ? Readonly<{
          selectors: NormalizePluginSelectors<
            NormalizePluginState<S>,
            PluginSelectorMethods<TSelectors>
          >;
        }>
      : Readonly<Record<never, never>>) &
    ('update' extends TKeys
      ? Readonly<{ update: TUpdate }>
      : Readonly<Record<never, never>>) &
    ('schema' extends TKeys
      ? Readonly<{
          schema: TSchema;
        }>
      : Readonly<Record<never, never>>) &
    ('targetPluginNames' extends TKeys
      ? Readonly<{ targetPluginNames: TTargetPluginNames }>
      : Readonly<Record<never, never>>) &
    ('type' extends TKeys
      ? Readonly<{ type: TType }>
      : Readonly<Record<never, never>>) &
    ('shortcuts' extends TKeys
      ? Readonly<{ shortcuts: true }>
      : Readonly<Record<never, never>>)
>;

export function createBasePlugin(definition: unknown): AnyBasePlugin {
  return createBasePluginRuntime(definition);
}
