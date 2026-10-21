import type {
  RuntimePluginReference,
  EditorUpdateContext,
  TxMethodDeclarations,
} from '../../facade';
import {
  type AnyBasePlugin,
  type PluginReadState,
  type PluginTransaction,
  type PluginSchemaContext,
  type PluginSchemaDeclaration,
  type PluginReference,
  type PluginSelectorMethods,
  type PluginSelectors,
  type NormalizePluginSelectors,
  definePlugin as defineHeadlessPlugin,
} from '../../lib';
import type { BasePluginDependencyReferences } from '../../lib/plugin/basePluginCompiler.internal';
import type { PluginInitialStateInput } from '../../lib/plugin/pluginInitialState.internal';
import type {
  Plugin,
  PluginApiContext,
  PluginContext,
  PluginDefinitionInput,
  Shortcuts,
  Decorate,
  ValidatedShortcuts,
} from './PlatePlugin';
import type { NormalizePluginInput } from './platePluginCompiler.internal';
import { toReactPlugin } from './toReactPlugin';

type PluginDependencies = ReadonlyArray<
  RuntimePluginReference | PluginReference
>;

type PluginConstructorContextDefinition<
  N extends string,
  D extends PluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration = never,
  TTargetPlugins extends ReadonlyArray<PluginReference | string> = readonly [],
  TViewState extends object = {},
> = NormalizePluginInput<
  Readonly<{
    initialState: S;
    initialViewState: TViewState;
    name: N;
    schema: TSchema;
    targetPlugins: TTargetPlugins;
  }>
> &
  Readonly<{ dependencies: D }>;

type PluginConstructorInitialStateInput<
  N extends string,
  D extends PluginDependencies,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> =
  | ((
      context: PluginContext<
        PluginConstructorContextDefinition<N, D, {}, never, TTargetPlugins>
      >
    ) => any)
  | Readonly<Record<string, unknown>>;

type ConstructorFactoryResult<TValue> = TValue extends (
  ...args: any[]
) => infer TResult
  ? TResult
  : TValue;

type IsAny<TValue> = 0 extends 1 & TValue ? true : false;

type PluginConstructorState<
  TKeys extends PluginConstructorKey,
  TInitialStateInput,
> = 'initialState' extends TKeys
  ? Extract<ConstructorFactoryResult<TInitialStateInput>, object>
  : {};

type PluginConstructorRestKey = Exclude<
  PluginConstructorKey,
  | 'api'
  | 'conflicts'
  | 'dependencies'
  | 'decorate'
  | 'enabled'
  | 'initialState'
  | 'initialViewState'
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

type PluginConstructorResultInput<
  TKeys extends PluginConstructorKey,
  N extends string,
  D extends PluginDependencies,
  TConflicts extends PluginDependencies,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TEnabled extends boolean,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TViewState extends object,
> = Readonly<{
  [
    TKey in Exclude<
      TKeys,
      | 'api'
      | 'conflicts'
      | 'dependencies'
      | 'decorate'
      | 'enabled'
      | 'initialState'
      | 'initialViewState'
      | 'key'
      | 'name'
      | 'read'
      | 'schema'
      | 'selectors'
      | 'targetPlugins'
      | 'type'
      | 'update'
    >
  ]: true;
}> &
  Readonly<{ name: N }> &
  ('dependencies' extends TKeys
    ? Readonly<{ dependencies: D }>
    : Readonly<Record<never, never>>) &
  ('conflicts' extends TKeys
    ? Readonly<{ conflicts: TConflicts }>
    : Readonly<Record<never, never>>) &
  ('enabled' extends TKeys
    ? Readonly<{ enabled: TEnabled }>
    : Readonly<Record<never, never>>) &
  ('initialState' extends TKeys
    ? Readonly<{ initialState: S }>
    : Readonly<Record<never, never>>) &
  ('initialViewState' extends TKeys
    ? Readonly<{ initialViewState: TViewState }>
    : Readonly<Record<never, never>>) &
  ('api' extends TKeys
    ? Readonly<{ api: () => TApi }>
    : Readonly<Record<never, never>>) &
  ('read' extends TKeys
    ? Readonly<{ read: () => TRead }>
    : Readonly<Record<never, never>>) &
  ('selectors' extends TKeys
    ? Readonly<{
        selectors: NormalizePluginSelectors<
          S,
          PluginSelectorMethods<TSelectors>
        >;
      }>
    : Readonly<Record<never, never>>) &
  ('update' extends TKeys
    ? Readonly<{ update: () => TUpdate }>
    : Readonly<Record<never, never>>) &
  ('decorate' extends TKeys
    ? Readonly<{ decorate: true }>
    : Readonly<Record<never, never>>) &
  ('schema' extends TKeys
    ? Readonly<{ schema: TSchema }>
    : Readonly<Record<never, never>>) &
  ('targetPlugins' extends TKeys
    ? Readonly<{ targetPlugins: TTargetPlugins }>
    : Readonly<Record<never, never>>);

type PluginConstructorRestInput<
  TKeys extends PluginConstructorKey,
  N extends string,
  D extends PluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TViewState extends object,
> = Readonly<{
  [TKey in Extract<TKeys, PluginConstructorRestKey>]: PluginDefinitionInput<
    NoInfer<
      PluginConstructorContextDefinition<
        N,
        D,
        S,
        TSchema,
        TTargetPlugins,
        TViewState
      >
    >
  >[TKey];
}>;

type PluginConstructorSchemaInput<
  N extends string,
  D extends PluginDependencies,
  S extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TSchema extends PluginSchemaDeclaration,
> =
  | ((
      context: PluginSchemaContext<
        PluginConstructorContextDefinition<N, D, S, never, TTargetPlugins>
      >
    ) => TSchema)
  | (TSchema & Readonly<Record<string, unknown>>);

type PluginConstructorKey = Exclude<keyof PluginDefinitionInput, 'name'>;

type PluginConstructorDependencies<
  TKeys extends PluginConstructorKey,
  D extends PluginDependencies,
> = BasePluginDependencyReferences<PluginConstructorRawDependencies<TKeys, D>>;

type PluginConstructorRawDependencies<
  TKeys extends PluginConstructorKey,
  D extends PluginDependencies,
> = 'dependencies' extends TKeys ? D : readonly [];

type PluginConstructorUpdateFactory<
  N extends string,
  D extends PluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TUpdate extends object,
  TViewState extends object,
> = (
  context: PluginContext<
    NoInfer<
      PluginConstructorContextDefinition<
        N,
        D,
        S,
        TSchema,
        TTargetPlugins,
        TViewState
      >
    >
  > & {
    context: EditorUpdateContext;
    tx: PluginTransaction<
      NoInfer<
        PluginConstructorContextDefinition<
          N,
          D,
          S,
          TSchema,
          TTargetPlugins,
          TViewState
        >
      >
    >;
  }
) => TUpdate & TxMethodDeclarations<NoInfer<TUpdate>>;

type PluginConstructorStateConsumerInput<
  N extends string,
  D extends PluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TViewState extends object,
> = Readonly<{
  api?: (
    context: PluginApiContext<
      NoInfer<
        PluginConstructorContextDefinition<
          N,
          D,
          S,
          TSchema,
          TTargetPlugins,
          TViewState
        >
      >
    >
  ) => TApi;
  read?: (
    context: PluginContext<
      NoInfer<
        PluginConstructorContextDefinition<
          N,
          D,
          S,
          TSchema,
          TTargetPlugins,
          TViewState
        >
      >
    > & {
      state: PluginReadState<
        NoInfer<
          PluginConstructorContextDefinition<
            N,
            D,
            S,
            TSchema,
            TTargetPlugins,
            TViewState
          >
        >
      >;
    }
  ) => TRead;
  selectors?: TSelectors & PluginSelectors<NoInfer<S>>;
  update?: PluginConstructorUpdateFactory<
    N,
    D,
    S,
    TSchema,
    TTargetPlugins,
    TUpdate,
    TViewState
  >;
}>;

// Factory state is fixed by the constructor before derived-state consumers run.
type PluginConstructorDeferredStateConsumers = Readonly<{
  api?: never;
  read?: never;
  selectors?: never;
  update?: never;
}>;

type PluginConstructorStagedStateConsumerInput<
  TKeys extends PluginConstructorKey,
  TInitialStateInput,
  N extends string,
  D extends PluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TViewState extends object,
> =
  Extract<TKeys, 'api' | 'read' | 'selectors' | 'update'> extends never
    ? Readonly<Record<never, never>>
    : 'initialState' extends TKeys
      ? IsAny<TInitialStateInput> extends true
        ? PluginConstructorDeferredStateConsumers
        : Extract<TInitialStateInput, (...args: any[]) => any> extends never
          ? PluginConstructorStateConsumerInput<
              N,
              D,
              S,
              TSchema,
              TApi,
              TRead,
              TSelectors,
              TUpdate,
              TTargetPlugins,
              TViewState
            >
          : PluginConstructorDeferredStateConsumers
      : PluginConstructorStateConsumerInput<
          N,
          D,
          S,
          TSchema,
          TApi,
          TRead,
          TSelectors,
          TUpdate,
          TTargetPlugins,
          TViewState
        >;

type CompactBasePluginDefinition<TDefinition> = Readonly<{
  [TKey in keyof TDefinition]: TDefinition[TKey];
}>;

/**
 * Create one exact React-capable Plate definition.
 * Every top-level state field needs a defined default; use `null` for an empty
 * value. Nested domain objects may retain optional properties.
 */
export function definePlugin<
  const N extends string,
  const TKeys extends PluginConstructorKey,
  TInitialStateInput,
  TInitialViewStateInput extends () => object,
  const TApi extends object = {},
  const TUpdate extends object = {},
  const TSchema extends PluginSchemaDeclaration = never,
  const D extends PluginDependencies = readonly [],
  const TConflicts extends PluginDependencies = readonly [],
  const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
    readonly [],
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<
    PluginConstructorState<TKeys, TInitialStateInput>
  > = {},
  const TEnabled extends boolean = boolean,
  TViewState extends object = 'initialViewState' extends TKeys
    ? ReturnType<TInitialViewStateInput>
    : {},
>(
  name: N,
  definition: Readonly<Record<TKeys, unknown>> &
    Readonly<{
      schema?: PluginConstructorSchemaInput<
        N,
        PluginConstructorDependencies<TKeys, D>,
        PluginConstructorState<TKeys, TInitialStateInput>,
        TTargetPlugins,
        TSchema
      >;
    }> &
    PluginConstructorRestInput<
      TKeys,
      N,
      PluginConstructorDependencies<TKeys, D>,
      PluginConstructorState<TKeys, TInitialStateInput>,
      NoInfer<'schema' extends TKeys ? TSchema : never>,
      TTargetPlugins,
      TViewState
    > &
    ('decorate' extends TKeys
      ? Readonly<{
          decorate: Decorate<
            NoInfer<
              PluginConstructorContextDefinition<
                N,
                PluginConstructorDependencies<TKeys, D>,
                PluginConstructorState<TKeys, TInitialStateInput>,
                'schema' extends TKeys ? TSchema : never,
                TTargetPlugins,
                TViewState
              >
            >
          >;
        }>
      : Readonly<{ decorate?: never }>) &
    ('initialState' extends TKeys
      ? Readonly<{
          initialState: PluginConstructorInitialStateInput<
            N,
            PluginConstructorDependencies<TKeys, D>,
            TTargetPlugins
          >;
        }> &
          Readonly<{
            initialState: TInitialStateInput &
              PluginInitialStateInput<NoInfer<TInitialStateInput>>;
          }>
      : Readonly<{ initialState?: never }>) &
    ('initialViewState' extends TKeys
      ? Readonly<{
          initialViewState: TInitialViewStateInput &
            PluginInitialStateInput<NoInfer<TInitialViewStateInput>>;
        }>
      : Readonly<{ initialViewState?: never }>) &
    PluginConstructorStagedStateConsumerInput<
      TKeys,
      TInitialStateInput,
      N,
      PluginConstructorDependencies<TKeys, D>,
      PluginConstructorState<TKeys, TInitialStateInput>,
      'schema' extends TKeys ? TSchema : never,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TTargetPlugins,
      TViewState
    > &
    ('shortcuts' extends TKeys
      ? Readonly<{
          shortcuts?: ValidatedShortcuts<
            PluginConstructorContextDefinition<
              N,
              PluginConstructorDependencies<TKeys, D>,
              PluginConstructorState<TKeys, TInitialStateInput>,
              TSchema,
              TTargetPlugins,
              TViewState
            >,
            Shortcuts
          >;
        }>
      : Readonly<Record<never, never>>) &
    Readonly<{
      conflicts?: TConflicts;
      dependencies?: D;
      enabled?: TEnabled;
      targetPlugins?: TTargetPlugins;
    }>
): Plugin<
  CompactBasePluginDefinition<
    Omit<
      NormalizePluginInput<
        PluginConstructorResultInput<
          TKeys,
          N,
          readonly [],
          TConflicts,
          PluginConstructorState<TKeys, TInitialStateInput>,
          TApi,
          TRead,
          TSelectors,
          TUpdate,
          TEnabled,
          'schema' extends TKeys ? TSchema : never,
          TTargetPlugins,
          TViewState
        >
      >,
      'dependencies'
    > &
      ('dependencies' extends TKeys
        ? Readonly<{
            dependencies: PluginConstructorDependencies<TKeys, D>;
          }>
        : Readonly<Record<never, never>>)
  >
>;

export function definePlugin(name: string, definition: unknown): object {
  return definePluginRuntime(name, definition);
}

const definePluginRuntime = (name: string, definition: unknown) => {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Plate plugins require a non-empty name.');
  }
  if (typeof definition !== 'object' || definition === null) {
    throw new Error('Plate plugin definitions must be objects.');
  }
  if (Object.hasOwn(definition, 'name')) {
    throw new Error(
      'Plate plugin identity is positional. Remove `name` from the definition.'
    );
  }

  const api = Reflect.get(definition, 'api');
  const initialState = Reflect.get(definition, 'initialState');

  if (Object.hasOwn(definition, 'api') && typeof api !== 'function') {
    throw new Error('Plate plugin `api` must be a factory.');
  }
  if (typeof initialState === 'function') {
    for (const field of ['api', 'read', 'selectors', 'update'] as const) {
      if (Object.hasOwn(definition, field)) {
        throw new Error(
          `Plate plugin factory \`initialState\` must define \`${field}\` in a following .extend().`
        );
      }
    }
  }

  const basePlugin = (
    defineHeadlessPlugin as unknown as (
      name: string,
      definition: unknown
    ) => AnyBasePlugin
  )(name, definition);

  return Reflect.apply(toReactPlugin, undefined, [basePlugin]);
};
