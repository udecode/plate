import type {
  AnyBasePlugin,
  AnyBasePluginContext,
  BasePluginContext,
  BasePluginDefinitionInput,
  BasePlugin,
  EditorShortcut,
  PluginCodecMapDeclaration,
} from './BasePlugin';
import type {
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginReference,
  PluginSelectorMethods,
  PluginSelectors,
  NormalizePluginSelectors,
  NormalizePluginState,
} from './PluginDefinition';
import type {
  EditorExtensionReference,
  EditorUpdateContext,
} from '@platejs/plite';

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
  getPluginDescriptorMetadata,
  isConfiguredPluginDescriptor,
  mergePlugins,
  setPluginDescriptorMetadata,
} from '../../internal/utils/mergePlugins';

const PLUGIN_NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;

type BasePluginDependencies = readonly (
  | EditorExtensionReference
  | PluginReference
)[];

type ConstructorFactoryResult<TValue> = TValue extends (
  ...args: infer _TArguments
) => infer TResult
  ? TResult
  : TValue;

type BasePluginConstructorContextDefinition<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration = never,
  TTargetPlugins extends readonly (PluginReference | string)[] = readonly [],
> = Readonly<{
  dependencies: BasePluginDependencyReferences<D>;
  initialState: S;
  name: N;
  targetPlugins: TTargetPlugins;
}> &
  ([TSchema] extends [never]
    ? Readonly<Record<never, never>>
    : Readonly<{ schema: TSchema }>);

type BasePluginConstructorSchemaFactory<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TTargetPlugins extends readonly (PluginReference | string)[],
  TSchema extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<
    NoInfer<
      BasePluginConstructorContextDefinition<N, D, S, never, TTargetPlugins>
    >
  >
) => TSchema;

type BasePluginConstructorInitialStateInput<
  N extends string,
  D extends BasePluginDependencies,
  TTargetPlugins extends readonly (PluginReference | string)[],
> =
  | ((
      context: BasePluginContext<
        BasePluginConstructorContextDefinition<N, D, {}, never, TTargetPlugins>
      >
    ) => any)
  | Readonly<Record<string, unknown>>;

type BasePluginConstructorUpdateFactory<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends readonly (PluginReference | string)[],
  TUpdate extends object,
> = (
  context: BasePluginContext<
    NoInfer<
      BasePluginConstructorContextDefinition<N, D, S, TSchema, TTargetPlugins>
    >
  > & {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<
      NoInfer<
        BasePluginConstructorContextDefinition<N, D, S, TSchema, TTargetPlugins>
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
  | 'readMiddleware'
  | 'render'
  | 'rules'
  | 'selectionKinds'
  | 'stateFields'
  | 'transformInitialValue'
  | 'useHooks'
  | 'validate';

type MutableBasePlugin = AnyBasePlugin & {
  targetPlugins: readonly (PluginReference | string)[];
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
      'Plate plugin `render.node` is private. Use top-level `component` in defineBasePlugin/definePlatePlugin, or terminal .configure({ component }).'
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
    if (Object.hasOwn(value, 'key') || Object.hasOwn(value, 'type')) {
      throw new Error(
        'Plate plugins do not support top-level `key` or `type`; declare persisted identity inside `schema`.'
      );
    }

    assertNoPublicRenderNode(value);
    if (Object.hasOwn(value, 'node')) {
      throw new Error(
        'Plate plugin `node` is unsupported. Use top-level `schema` and `render`.'
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

  for (const field of [
    'dependencies',
    'key',
    'name',
    'schema',
    'type',
  ] as const) {
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
    'key',
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
    if (!isConfiguredPluginDescriptor(plugin)) return;

    throw new Error(
      `Plate plugin '${plugin.name}' is already configured. Call .${method}() before .configure().`
    );
  };

  Reflect.set(plugin, 'configure', (input: unknown) => {
    assertAuthoringOpen('configure');
    const next = { ...plugin } as MutableBasePlugin;
    const metadata = getPluginDescriptorMetadata(plugin);

    if (isFunction(input)) {
      setPluginDescriptorMetadata(next, {
        ...metadata,
        configured: true,
        configurationLayers: [
          ...metadata.configurationLayers,
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
        ],
      });
    } else {
      if (!isObjectRecord(input)) {
        throw new Error('Plate plugin .configure() values must be objects.');
      }
      const configuration = normalizeConfiguration(input);
      setPluginDescriptorMetadata(next, {
        ...metadata,
        configured: true,
        configurationLayers: [
          ...metadata.configurationLayers,
          Object.freeze({
            kind: 'object' as const,
            value: snapshotConfiguration(configuration),
          }),
        ],
      });
    }

    return recreate(next);
  });

  Reflect.set(plugin, 'extend', (input: unknown) => {
    assertAuthoringOpen('extend');
    const next = { ...plugin } as MutableBasePlugin;
    const metadata = getPluginDescriptorMetadata(plugin);

    if (isFunction(input)) {
      setPluginDescriptorMetadata(next, {
        ...metadata,
        stages: [
          ...metadata.stages,
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
        ],
      });
    } else {
      if (!isObjectRecord(input)) {
        throw new Error('Plate plugin .extend() values must be objects.');
      }

      // A named object is a canonical raw Plite descriptor. Its name is
      // validated by the resolver and its native fields are adopted flat.
      if (!Object.hasOwn(input, 'name')) assertExtendObject(input);

      const contribution = freezePluginDescriptorValue(input);

      setPluginDescriptorMetadata(next, {
        ...metadata,
        stages: [...metadata.stages, () => contribution],
      });
    }

    return recreate(next);
  });

  return brandPluginDescriptor(plugin, familySource);
};

const defineBasePluginRuntime = (definition: unknown): MutableBasePlugin => {
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
      conflicts: [],
      dependencies: [],
      initialState: {},
      inject: {},
      inputRules: [],
      on: {},
      override: {},
      render: {},
      rules: {},
      schema: null,
      selectors: {},
      shortcuts: {},
      targetPlugins: [],
    },
    {
      ...staticDefinition,
      ...(typeof initialState === 'function' ? {} : { initialState }),
    }
  ) as unknown as MutableBasePlugin;

  setPluginDescriptorMetadata(plugin, {
    configured: false,
    configurationLayers: Object.freeze([]),
    htmlCodecContributions: Object.freeze([]),
    resolved: false,
    stages: createInitialStage(normalizedDefinition),
  });

  plugin.targetPlugins = Object.freeze([...plugin.targetPlugins]);

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
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends readonly (PluginReference | string)[],
> = Omit<
  BasePluginDefinitionInput<
    NoInfer<
      BasePluginConstructorContextDefinition<N, D, S, TSchema, TTargetPlugins>
    >
  >,
  | 'api'
  | 'codecs'
  | 'conflicts'
  | 'dependencies'
  | 'enabled'
  | 'initialState'
  | 'key'
  | 'name'
  | 'read'
  | 'schema'
  | 'selectors'
  | 'shortcuts'
  | 'targetPlugins'
  | 'type'
  | 'update'
>;

type BasePluginConstructorSchemaInput<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TTargetPlugins extends readonly (PluginReference | string)[],
  TSchema extends PluginSchemaDeclaration,
> =
  | BasePluginConstructorSchemaFactory<N, D, S, TTargetPlugins, TSchema>
  | (TSchema & Readonly<Record<string, unknown>>);

type BasePluginConstructorKey = Exclude<
  keyof BasePluginDefinitionInput,
  'name'
>;

type BasePluginConstructorDependencies<
  TKeys extends BasePluginConstructorKey,
  D extends BasePluginDependencies,
> = 'dependencies' extends TKeys ? D : readonly [];

type BasePluginConstructorCapabilityDefinition<
  N extends string,
  TKeys extends BasePluginConstructorKey,
  D extends BasePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends readonly (PluginReference | string)[],
> = BasePluginConstructorContextDefinition<N, D, S, never, TTargetPlugins> &
  ('schema' extends TKeys
    ? Readonly<{ schema: TSchema }>
    : Readonly<Record<never, never>>);

export function defineBasePlugin<
  const N extends string,
  const TKeys extends BasePluginConstructorKey,
  TInitialStateInput extends BasePluginConstructorInitialStateInput<
    N,
    BasePluginConstructorDependencies<TKeys, D>,
    TTargetPlugins
  >,
  const TApi extends object,
  const TUpdate extends object,
  const TSchema extends PluginSchemaDeclaration,
  const D extends BasePluginDependencies,
  S extends object = 'initialState' extends TKeys
    ? Extract<ConstructorFactoryResult<TInitialStateInput>, object>
    : {},
  const TConflicts extends BasePluginDependencies = readonly [],
  const TTargetPlugins extends readonly (
    | PluginReference
    | string
  )[] = readonly [],
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<S> = {},
  const TEnabled extends boolean = boolean,
  const TShortcuts extends BasePluginShortcutRecord = {},
>(
  name: N,
  definition: Readonly<Record<TKeys, unknown>> &
    ('schema' extends TKeys
      ? Readonly<{
          schema: BasePluginConstructorSchemaInput<
            N,
            BasePluginConstructorDependencies<TKeys, D>,
            S,
            TTargetPlugins,
            TSchema
          >;
        }>
      : Readonly<{ schema?: never }>) &
    BasePluginConstructorRestInput<
      N,
      BasePluginConstructorDependencies<TKeys, D>,
      S,
      NoInfer<'schema' extends TKeys ? TSchema : never>,
      TTargetPlugins
    > &
    ('initialState' extends TKeys
      ? Readonly<{ initialState: TInitialStateInput }>
      : Readonly<{ initialState?: never }>) &
    Readonly<{
      api?: (
        context: BasePluginContext<
          NoInfer<
            BasePluginConstructorCapabilityDefinition<
              N,
              TKeys,
              BasePluginConstructorDependencies<TKeys, D>,
              S,
              'schema' extends TKeys ? TSchema : never,
              TTargetPlugins
            >
          >
        >
      ) => TApi;
      codecs?:
        | PluginCodecMapDeclaration
        | ((
            context: BasePluginContext<
              NoInfer<
                BasePluginConstructorCapabilityDefinition<
                  N,
                  TKeys,
                  BasePluginConstructorDependencies<TKeys, D>,
                  S,
                  'schema' extends TKeys ? TSchema : never,
                  TTargetPlugins
                >
              >
            >
          ) => PluginCodecMapDeclaration);
      conflicts?: TConflicts;
      dependencies?: D;
      enabled?: TEnabled;
      read?: (
        context: BasePluginContext<
          NoInfer<
            BasePluginConstructorCapabilityDefinition<
              N,
              TKeys,
              BasePluginConstructorDependencies<TKeys, D>,
              S,
              'schema' extends TKeys ? TSchema : never,
              TTargetPlugins
            >
          >
        > & {
          state: PlatePluginReadState<
            NoInfer<
              BasePluginConstructorCapabilityDefinition<
                N,
                TKeys,
                BasePluginConstructorDependencies<TKeys, D>,
                S,
                'schema' extends TKeys ? TSchema : never,
                TTargetPlugins
              >
            >
          >;
        }
      ) => TRead;
      selectors?: TSelectors & PluginSelectors<NoInfer<S>>;
      shortcuts?: TShortcuts;
      targetPlugins?: TTargetPlugins;
      update?: BasePluginConstructorUpdateFactory<
        N,
        BasePluginConstructorDependencies<TKeys, D>,
        S,
        NoInfer<'schema' extends TKeys ? TSchema : never>,
        TTargetPlugins,
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
    ('targetPlugins' extends TKeys
      ? Readonly<{ targetPlugins: TTargetPlugins }>
      : Readonly<Record<never, never>>) &
    ('shortcuts' extends TKeys
      ? Readonly<{ shortcuts: true }>
      : Readonly<Record<never, never>>)
>;

export function defineBasePlugin(name: string, definition: unknown): object {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Plate plugins require a non-empty name.');
  }
  if (!PLUGIN_NAME_PATTERN.test(name)) {
    throw new Error(
      `Plate plugin name "${name}" must be a human-readable camelCase identifier.`
    );
  }
  if (!isObjectRecord(definition)) {
    throw new Error('Plate plugin definitions must be objects.');
  }
  if (Object.hasOwn(definition, 'name')) {
    throw new Error(
      'Plate plugin identity is positional. Remove `name` from the definition.'
    );
  }

  return defineBasePluginRuntime({ ...definition, name });
}
