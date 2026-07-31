import type { EditorUpdateContext } from '@platejs/plite';

import {
  type AnyBasePlugin,
  type PlatePluginReadState,
  type PlatePluginTransaction,
  type PluginSchemaContext,
  type PluginSchemaDeclaration,
  type PluginSelectorMethods,
  type PluginSelectors,
  type WithAnyName,
  type NormalizePluginSelectors,
  createBasePlugin,
} from '../../lib';
import type { BasePluginDependencyReferences } from '../../lib/plugin/basePluginCompiler.internal';
import type {
  AnyPlatePlugin,
  PlatePlugin,
  PlatePluginContext,
  PlatePluginDefinitionInput,
  PlateShortcutRecord,
  UseHooks,
  ValidatedPlateShortcuts,
} from './PlatePlugin';
import type { NormalizePlatePluginInput } from './platePluginCompiler.internal';

import { toPlatePlugin } from './toPlatePlugin';

type PlatePluginDependencies = readonly Readonly<{ name: string }>[];

type PlatePluginConstructorContextDefinition<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TType extends string = N,
  TSchema extends PluginSchemaDeclaration = never,
  TTargetPluginNames extends readonly string[] = readonly [],
> = NormalizePlatePluginInput<
  Readonly<{
    initialState: S;
    name: N;
    schema: TSchema;
    targetPluginNames: TTargetPluginNames;
    type: TType;
  }>
> &
  Readonly<{ dependencies: D }>;

type PlatePluginConstructorInitialStateInput<
  N extends string,
  D extends PlatePluginDependencies,
  TType extends string,
  TTargetPluginNames extends readonly string[],
> =
  | ((
      context: PlatePluginContext<
        PlatePluginConstructorContextDefinition<
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
  TEnabled extends boolean,
  TType extends string,
  TSchema extends PluginSchemaDeclaration,
  TTargetPluginNames extends readonly string[],
> = Readonly<{
  [TKey in Exclude<
    TKeys,
    | 'api'
    | 'conflicts'
    | 'dependencies'
    | 'enabled'
    | 'initialState'
    | 'name'
    | 'read'
    | 'schema'
    | 'selectors'
    | 'targetPluginNames'
    | 'type'
    | 'update'
  >]: true;
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
  ('schema' extends TKeys
    ? Readonly<{ schema: TSchema }>
    : Readonly<Record<never, never>>) &
  ('targetPluginNames' extends TKeys
    ? Readonly<{ targetPluginNames: TTargetPluginNames }>
    : Readonly<Record<never, never>>) &
  ('type' extends TKeys
    ? Readonly<{ type: TType }>
    : Readonly<Record<never, never>>);

type PlatePluginConstructorRestInput<
  TKeys extends PlatePluginConstructorKey,
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TType extends string,
  TSchema extends PluginSchemaDeclaration,
  TTargetPluginNames extends readonly string[],
> = Readonly<{
  [TKey in Extract<
    TKeys,
    PlatePluginConstructorRestKey
  >]: PlatePluginConstructorRestFieldInput<
    NoInfer<
      PlatePluginConstructorContextDefinition<
        N,
        D,
        S,
        TType,
        TSchema,
        TTargetPluginNames
      >
    >,
    TKey
  >;
}>;

type PlatePluginConstructorRestFieldInput<
  C extends PlatePluginConstructorContextDefinition<
    string,
    PlatePluginDependencies,
    object,
    string,
    PluginSchemaDeclaration,
    readonly string[]
  >,
  TKey extends PlatePluginConstructorRestKey,
> = TKey extends 'useHooks'
  ? UseHooks<WithAnyName<C>>
  : PlatePluginDefinitionInput<C>[TKey];

type PlatePluginConstructorSchemaInput<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TType extends string,
  TTargetPluginNames extends readonly string[],
  TSchema extends PluginSchemaDeclaration,
> =
  | ((
      context: PluginSchemaContext<
        PlatePluginConstructorContextDefinition<
          N,
          D,
          S,
          TType,
          never,
          TTargetPluginNames
        >,
        TType
      >
    ) => TSchema)
  | (TSchema & Readonly<Record<string, unknown>>);

type PlatePluginConstructorKey = keyof PlatePluginDefinitionInput;

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
  TType extends string,
  TTargetPluginNames extends readonly string[],
  TUpdate extends object,
> = (
  context: PlatePluginContext<
    NoInfer<
      PlatePluginConstructorContextDefinition<
        N,
        D,
        S,
        TType,
        never,
        TTargetPluginNames
      >
    >
  > & {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<
      NoInfer<
        PlatePluginConstructorContextDefinition<
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

type PlatePluginConstructorStateConsumerInput<
  N extends string,
  D extends PlatePluginDependencies,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TType extends string,
  TTargetPluginNames extends readonly string[],
> = Readonly<{
  api?: (
    context: PlatePluginContext<
      NoInfer<
        PlatePluginConstructorContextDefinition<
          N,
          D,
          S,
          TType,
          never,
          TTargetPluginNames
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
          TType,
          never,
          TTargetPluginNames
        >
      >
    > & {
      state: PlatePluginReadState<
        NoInfer<
          PlatePluginConstructorContextDefinition<
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
  ) => TRead;
  selectors?: TSelectors & PluginSelectors<NoInfer<S>>;
  update?: PlatePluginConstructorUpdateFactory<
    N,
    D,
    S,
    TType,
    TTargetPluginNames,
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
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<S>,
  TUpdate extends object,
  TType extends string,
  TTargetPluginNames extends readonly string[],
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
              TApi,
              TRead,
              TSelectors,
              TUpdate,
              TType,
              TTargetPluginNames
            >
          : PlatePluginConstructorDeferredStateConsumers
      : PlatePluginConstructorStateConsumerInput<
          N,
          D,
          S,
          TApi,
          TRead,
          TSelectors,
          TUpdate,
          TType,
          TTargetPluginNames
        >;

type CompactPlatePluginDefinition<TDefinition> = Readonly<{
  [TKey in keyof TDefinition]: TDefinition[TKey];
}>;

export function createPlatePlugin<
  const N extends string,
  const TKeys extends PlatePluginConstructorKey,
  TInitialStateInput,
  const TApi extends object = {},
  const TUpdate extends object = {},
  const TSchema extends PluginSchemaDeclaration = never,
  const D extends PlatePluginDependencies = readonly [],
  const TConflicts extends PlatePluginDependencies = readonly [],
  const TType extends string = N,
  const TTargetPluginNames extends readonly string[] = readonly [],
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<
    PlatePluginConstructorState<TKeys, TInitialStateInput>
  > = {},
  const TEnabled extends boolean = boolean,
  const TShortcuts extends PlateShortcutRecord = {},
>(
  definition: Readonly<Record<TKeys, unknown>> &
    ('schema' extends TKeys
      ? Readonly<{
          schema: PlatePluginConstructorSchemaInput<
            N,
            PlatePluginConstructorDependencies<TKeys, D>,
            PlatePluginConstructorState<TKeys, TInitialStateInput>,
            TType,
            TTargetPluginNames,
            TSchema
          >;
        }>
      : Readonly<{ schema?: never }>) &
    PlatePluginConstructorRestInput<
      TKeys,
      N,
      PlatePluginConstructorDependencies<TKeys, D>,
      PlatePluginConstructorState<TKeys, TInitialStateInput>,
      TType,
      NoInfer<'schema' extends TKeys ? TSchema : never>,
      TTargetPluginNames
    > &
    ('initialState' extends TKeys
      ? Readonly<{
          initialState: PlatePluginConstructorInitialStateInput<
            N,
            PlatePluginConstructorDependencies<TKeys, D>,
            TType,
            TTargetPluginNames
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
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TType,
      TTargetPluginNames
    > &
    ('shortcuts' extends TKeys
      ? Readonly<{
          shortcuts?: ValidatedPlateShortcuts<
            PlatePluginConstructorContextDefinition<
              N,
              PlatePluginConstructorDependencies<TKeys, D>,
              PlatePluginConstructorState<TKeys, TInitialStateInput>,
              TType,
              TSchema,
              TTargetPluginNames
            >,
            TShortcuts
          >;
        }>
      : Readonly<Record<never, never>>) &
    Readonly<{
      conflicts?: TConflicts;
      dependencies?: D;
      enabled?: TEnabled;
      name: N;
      targetPluginNames?: TTargetPluginNames;
      type?: TType;
    }>
): PlatePlugin<
  CompactPlatePluginDefinition<
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
          TEnabled,
          TType,
          'schema' extends TKeys ? TSchema : never,
          TTargetPluginNames
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

export function createPlatePlugin(definition: unknown): AnyPlatePlugin {
  return createPlatePluginRuntime(definition);
}

const createPlatePluginRuntime = (definition: unknown) => {
  if (typeof definition !== 'object' || definition === null) {
    throw new Error('Plate plugin definitions must be objects.');
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
    createBasePlugin as unknown as (definition: unknown) => AnyBasePlugin
  )(definition);

  return Reflect.apply(toPlatePlugin, undefined, [basePlugin]);
};
