import type {
  DecoratedRange,
  EditorExtensionReference,
  EditorUpdateContext,
} from '../../facade';
import {
  type AnyBasePlugin,
  type PlatePluginReadState,
  type PlatePluginTransaction,
  type PluginSchemaContext,
  type PluginSchemaDeclaration,
  type PluginReference,
  type PluginSelectorMethods,
  type PluginSelectors,
  type WithAnyName,
  type NormalizePluginSelectors,
  defineBasePlugin,
} from '../../lib';
import type { BasePluginDependencyReferences } from '../../lib/plugin/basePluginCompiler.internal';
import type {
  PlatePlugin,
  PlatePluginContext,
  PlatePluginDefinitionInput,
  PlateShortcutRecord,
  Decorate,
  UseHooks,
  ValidatedPlateShortcuts,
} from './PlatePlugin';
import type { NormalizePlatePluginInput } from './platePluginCompiler.internal';
import { toPlatePlugin } from './toPlatePlugin';

type PlatePluginDependencies = ReadonlyArray<
  EditorExtensionReference | PluginReference
>;

type PlatePluginConstructorContextDefinition<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration = never,
  TTargetPlugins extends ReadonlyArray<PluginReference | string> = readonly [],
> = NormalizePlatePluginInput<
  Readonly<{
    initialState: S;
    name: N;
    schema: TSchema;
    targetPlugins: TTargetPlugins;
  }>
> &
  Readonly<{ dependencies: D }>;

type PlatePluginConstructorInitialStateInput<
  N extends string,
  D extends PlatePluginDependencies,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> =
  | ((
      context: PlatePluginContext<
        PlatePluginConstructorContextDefinition<N, D, {}, never, TTargetPlugins>
      >
    ) => any)
  | Readonly<Record<string, unknown>>;

type ConstructorFactoryResult<TValue> = TValue extends (
  ...args: any[]
) => infer TResult
  ? TResult
  : TValue;

type IsAny<TValue> = 0 extends 1 & TValue ? true : false;

type PlatePluginConstructorState<
  TKeys extends PlatePluginConstructorKey,
  TInitialStateInput,
> = 'initialState' extends TKeys
  ? Extract<ConstructorFactoryResult<TInitialStateInput>, object>
  : {};

type PlatePluginConstructorRestKey = Exclude<
  PlatePluginConstructorKey,
  | 'api'
  | 'conflicts'
  | 'dependencies'
  | 'decorate'
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

type PlatePluginConstructorResultInput<
  TKeys extends PlatePluginConstructorKey,
  N extends string,
  D extends PlatePluginDependencies,
  TConflicts extends PlatePluginDependencies,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TDecoration extends object,
  TEnabled extends boolean,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
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
    ? Readonly<{ decorate: () => Array<DecoratedRange & TDecoration> }>
    : Readonly<Record<never, never>>) &
  ('schema' extends TKeys
    ? Readonly<{ schema: TSchema }>
    : Readonly<Record<never, never>>) &
  ('targetPlugins' extends TKeys
    ? Readonly<{ targetPlugins: TTargetPlugins }>
    : Readonly<Record<never, never>>);

type PlatePluginConstructorRestInput<
  TKeys extends PlatePluginConstructorKey,
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = Readonly<{
  [
    TKey in Extract<TKeys, PlatePluginConstructorRestKey>
  ]: PlatePluginConstructorRestFieldInput<
    NoInfer<
      PlatePluginConstructorContextDefinition<N, D, S, TSchema, TTargetPlugins>
    >,
    TKey
  >;
}>;

type PlatePluginConstructorRestFieldInput<
  C extends PlatePluginConstructorContextDefinition<
    string,
    PlatePluginDependencies,
    object,
    PluginSchemaDeclaration,
    ReadonlyArray<PluginReference | string>
  >,
  TKey extends PlatePluginConstructorRestKey,
> = TKey extends 'useHooks'
  ? UseHooks<WithAnyName<C>>
  : PlatePluginDefinitionInput<C>[TKey];

type PlatePluginConstructorSchemaInput<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TSchema extends PluginSchemaDeclaration,
> =
  | ((
      context: PluginSchemaContext<
        PlatePluginConstructorContextDefinition<N, D, S, never, TTargetPlugins>
      >
    ) => TSchema)
  | (TSchema & Readonly<Record<string, unknown>>);

type PlatePluginConstructorKey = Exclude<
  keyof PlatePluginDefinitionInput,
  'name'
>;

type PlatePluginConstructorDependencies<
  TKeys extends PlatePluginConstructorKey,
  D extends PlatePluginDependencies,
> = BasePluginDependencyReferences<
  PlatePluginConstructorRawDependencies<TKeys, D>
>;

type PlatePluginConstructorRawDependencies<
  TKeys extends PlatePluginConstructorKey,
  D extends PlatePluginDependencies,
> = 'dependencies' extends TKeys ? D : readonly [];

type PlatePluginConstructorUpdateFactory<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TUpdate extends object,
> = (
  context: PlatePluginContext<
    NoInfer<
      PlatePluginConstructorContextDefinition<N, D, S, TSchema, TTargetPlugins>
    >
  > & {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<
      NoInfer<
        PlatePluginConstructorContextDefinition<
          N,
          D,
          S,
          TSchema,
          TTargetPlugins
        >
      >
    >;
  }
) => TUpdate;

type PlatePluginConstructorStateConsumerInput<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = Readonly<{
  api?: (
    context: PlatePluginContext<
      NoInfer<
        PlatePluginConstructorContextDefinition<
          N,
          D,
          S,
          TSchema,
          TTargetPlugins
        >
      >
    >
  ) => TApi;
  read?: (
    context: PlatePluginContext<
      NoInfer<
        PlatePluginConstructorContextDefinition<
          N,
          D,
          S,
          TSchema,
          TTargetPlugins
        >
      >
    > & {
      state: PlatePluginReadState<
        NoInfer<
          PlatePluginConstructorContextDefinition<
            N,
            D,
            S,
            TSchema,
            TTargetPlugins
          >
        >
      >;
    }
  ) => TRead;
  selectors?: TSelectors & PluginSelectors<NoInfer<S>>;
  update?: PlatePluginConstructorUpdateFactory<
    N,
    D,
    S,
    TSchema,
    TTargetPlugins,
    TUpdate
  >;
}>;

// Factory state is fixed by the constructor before derived-state consumers run.
type PlatePluginConstructorDeferredStateConsumers = Readonly<{
  api?: never;
  read?: never;
  selectors?: never;
  update?: never;
}>;

type PlatePluginConstructorStagedStateConsumerInput<
  TKeys extends PlatePluginConstructorKey,
  TInitialStateInput,
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> =
  Extract<TKeys, 'api' | 'read' | 'selectors' | 'update'> extends never
    ? Readonly<Record<never, never>>
    : 'initialState' extends TKeys
      ? IsAny<TInitialStateInput> extends true
        ? PlatePluginConstructorDeferredStateConsumers
        : Extract<TInitialStateInput, (...args: any[]) => any> extends never
          ? PlatePluginConstructorStateConsumerInput<
              N,
              D,
              S,
              TSchema,
              TApi,
              TRead,
              TSelectors,
              TUpdate,
              TTargetPlugins
            >
          : PlatePluginConstructorDeferredStateConsumers
      : PlatePluginConstructorStateConsumerInput<
          N,
          D,
          S,
          TSchema,
          TApi,
          TRead,
          TSelectors,
          TUpdate,
          TTargetPlugins
        >;

type CompactBasePluginDefinition<TDefinition> = Readonly<{
  [TKey in keyof TDefinition]: TDefinition[TKey];
}>;

export function definePlatePlugin<
  const N extends string,
  const TKeys extends PlatePluginConstructorKey,
  TInitialStateInput,
  const TApi extends object = {},
  const TUpdate extends object = {},
  const TDecoration extends object = {},
  const TSchema extends PluginSchemaDeclaration = never,
  const D extends PlatePluginDependencies = readonly [],
  const TConflicts extends PlatePluginDependencies = readonly [],
  const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
    readonly [],
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<
    PlatePluginConstructorState<TKeys, TInitialStateInput>
  > = {},
  const TEnabled extends boolean = boolean,
>(
  name: N,
  definition: Readonly<Record<TKeys, unknown>> &
    ('schema' extends TKeys
      ? Readonly<{
          schema: PlatePluginConstructorSchemaInput<
            N,
            PlatePluginConstructorDependencies<TKeys, D>,
            PlatePluginConstructorState<TKeys, TInitialStateInput>,
            TTargetPlugins,
            TSchema
          >;
        }>
      : Readonly<{ schema?: never }>) &
    PlatePluginConstructorRestInput<
      TKeys,
      N,
      PlatePluginConstructorDependencies<TKeys, D>,
      PlatePluginConstructorState<TKeys, TInitialStateInput>,
      NoInfer<'schema' extends TKeys ? TSchema : never>,
      TTargetPlugins
    > &
    ('decorate' extends TKeys
      ? Readonly<{
          decorate: Decorate<
            NoInfer<
              PlatePluginConstructorContextDefinition<
                N,
                PlatePluginConstructorDependencies<TKeys, D>,
                PlatePluginConstructorState<TKeys, TInitialStateInput>,
                'schema' extends TKeys ? TSchema : never,
                TTargetPlugins
              >
            >,
            TDecoration
          >;
        }>
      : Readonly<{ decorate?: never }>) &
    ('initialState' extends TKeys
      ? Readonly<{
          initialState: PlatePluginConstructorInitialStateInput<
            N,
            PlatePluginConstructorDependencies<TKeys, D>,
            TTargetPlugins
          >;
        }> &
          Readonly<{ initialState: TInitialStateInput }>
      : Readonly<{ initialState?: never }>) &
    PlatePluginConstructorStagedStateConsumerInput<
      TKeys,
      TInitialStateInput,
      N,
      PlatePluginConstructorDependencies<TKeys, D>,
      PlatePluginConstructorState<TKeys, TInitialStateInput>,
      'schema' extends TKeys ? TSchema : never,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TTargetPlugins
    > &
    ('shortcuts' extends TKeys
      ? Readonly<{
          shortcuts?: ValidatedPlateShortcuts<
            PlatePluginConstructorContextDefinition<
              N,
              PlatePluginConstructorDependencies<TKeys, D>,
              PlatePluginConstructorState<TKeys, TInitialStateInput>,
              TSchema,
              TTargetPlugins
            >,
            PlateShortcutRecord
          >;
        }>
      : Readonly<Record<never, never>>) &
    Readonly<{
      conflicts?: TConflicts;
      dependencies?: D;
      enabled?: TEnabled;
      targetPlugins?: TTargetPlugins;
    }>
): PlatePlugin<
  CompactBasePluginDefinition<
    Omit<
      NormalizePlatePluginInput<
        PlatePluginConstructorResultInput<
          TKeys,
          N,
          readonly [],
          TConflicts,
          PlatePluginConstructorState<TKeys, TInitialStateInput>,
          TApi,
          TRead,
          TSelectors,
          TUpdate,
          TDecoration,
          TEnabled,
          'schema' extends TKeys ? TSchema : never,
          TTargetPlugins
        >
      >,
      'dependencies'
    > &
      ('dependencies' extends TKeys
        ? Readonly<{
            dependencies: PlatePluginConstructorDependencies<TKeys, D>;
          }>
        : Readonly<Record<never, never>>)
  >
>;

export function definePlatePlugin(name: string, definition: unknown): object {
  return definePlatePluginRuntime(name, definition);
}

const definePlatePluginRuntime = (name: string, definition: unknown) => {
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

  const render = Reflect.get(definition, 'render');
  const api = Reflect.get(definition, 'api');
  const initialState = Reflect.get(definition, 'initialState');

  if (
    typeof render === 'object' &&
    render !== null &&
    Object.hasOwn(render, 'node')
  ) {
    throw new Error(
      'Plate plugin `render.node` is private. Use top-level `component`.'
    );
  }
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
    defineBasePlugin as unknown as (
      name: string,
      definition: unknown
    ) => AnyBasePlugin
  )(name, definition);

  return Reflect.apply(toPlatePlugin, undefined, [basePlugin]);
};
