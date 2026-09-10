import type {
  EditorExtensionReference,
  EditorReadMethodRecord,
  EditorReadMethodTree,
  EditorUpdateContext,
} from '../../facade';
import type {
  PlatePluginReadState,
  PlatePluginTransaction,
} from '../editor/pluginRuntimeTypes';
import type {
  BasePluginContext,
  BasePluginDefinitionInput,
  BasePlugin,
  Decorate,
  EditorShortcut,
  PluginCodecMapDeclaration,
} from './BasePlugin';
import type { BasePluginDependencyReferences } from './basePluginCompiler.internal';
import { createBasePlugin } from './defineBasePlugin.internal';
import type {
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginReference,
  PluginSelectorMethods,
  PluginSelectors,
  NormalizePluginSelectors,
  NormalizePluginState,
} from './PluginDefinition';
import type { PluginInitialStateInput } from './pluginInitialState.internal';
import type { InferPluginWritablePropertyEntries } from './pluginSchemaModel.internal';

type BasePluginDependencies = ReadonlyArray<
  EditorExtensionReference | PluginReference
>;

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
  TTargetPlugins extends ReadonlyArray<PluginReference | string> = readonly [],
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
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
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
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
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
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
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
  | 'slots'
  | 'stateFields'
  | 'prepareDocument'
  | 'validate';

type BasePluginConstructorRestInput<
  N extends string,
  TKeys extends BasePluginConstructorKey,
  D extends BasePluginDependencies,
  S extends object,
  TSchema extends PluginSchemaDeclaration,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = Pick<
  BasePluginDefinitionInput<
    NoInfer<
      BasePluginConstructorContextDefinition<N, D, S, TSchema, TTargetPlugins>
    >
  >,
  Exclude<
    TKeys,
    | 'api'
    | 'codecs'
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
  >
>;

type BasePluginConstructorSchemaInput<
  N extends string,
  D extends BasePluginDependencies,
  S extends object,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
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
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = BasePluginConstructorContextDefinition<N, D, S, never, TTargetPlugins> &
  ('schema' extends TKeys
    ? Readonly<{ schema: TSchema }>
    : Readonly<Record<never, never>>);

type BasePluginConstructorRead<
  TKeys extends BasePluginConstructorKey,
  TSchema extends PluginSchemaDeclaration,
> = 'schema' extends TKeys
  ? TSchema extends Readonly<{ mark: unknown }>
    ? EditorReadMethodRecord
    : EditorReadMethodTree
  : EditorReadMethodTree;

/**
 * Create one exact render-capable Plate definition.
 *
 * The callback-rich input is normalized to a compact private definition
 * witness. Ordered `.extend()` stages may consume capabilities from earlier
 * stages; `.configure()` is terminal and never widens the definition.
 * Every top-level state field must have a defined default; use `null` for an
 * empty value. Nested domain objects may retain optional properties.
 */
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
  const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
    readonly [],
  const TRead extends BasePluginConstructorRead<TKeys, TSchema> =
    BasePluginConstructorRead<TKeys, TSchema>,
  const TSelectors extends PluginSelectors<S> = {},
  const TEnabled extends boolean = boolean,
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
      TKeys,
      BasePluginConstructorDependencies<TKeys, D>,
      S,
      NoInfer<'schema' extends TKeys ? TSchema : never>,
      TTargetPlugins
    > &
    ('initialState' extends TKeys
      ? Readonly<{
          initialState: TInitialStateInput &
            PluginInitialStateInput<NoInfer<TInitialStateInput>>;
        }>
      : Readonly<{ initialState?: never }>) &
    ('decorate' extends TKeys
      ? Readonly<{
          decorate: Decorate<
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
        }>
      : Readonly<{ decorate?: never }>) &
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
      shortcuts?: BasePluginShortcutRecord;
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
    [
      P in Extract<
        keyof Readonly<Record<TKeys, unknown>>,
        BasePluginConstructorPresenceKey
      >
    ]: true;
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
    ('decorate' extends TKeys
      ? Readonly<{ decorate: true }>
      : Readonly<Record<never, never>>) &
    ('schema' extends TKeys
      ? Readonly<{
          __pluginWritableProperties: InferPluginWritablePropertyEntries<
            Readonly<{ name: N; schema: TSchema }>
          >;
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
  return createBasePlugin(name, definition);
}
