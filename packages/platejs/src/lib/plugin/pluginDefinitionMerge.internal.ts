import type { RuntimePluginReference } from '../../facade';
import type { NormalizeBasePluginInput } from './basePluginCompiler.internal';
import type {
  AnyBasePluginDefinition,
  InferApi,
  InferConflicts,
  InferEnabled,
  InferPluginStoreState,
  InferRead,
  InferSelectors,
  InferUpdate,
  NormalizePluginState,
  PluginReference,
} from './PluginDefinition';

type IsAny<TValue> = 0 extends 1 & TValue ? true : false;

type PreservesCallable<TCurrent, TNext> = TCurrent extends (
  ...args: infer TCurrentArgs
) => infer TCurrentResult
  ? TNext extends (...args: infer TNextArgs) => infer TNextResult
    ? TCurrentArgs extends TNextArgs
      ? TNextResult extends TCurrentResult
        ? true
        : false
      : false
    : false
  : false;

type PreservesPluginValue<TCurrent, TNext> =
  IsAny<TNext> extends true
    ? false
    : [TCurrent] extends [(...args: infer _TArgs) => infer _TResult]
      ? PreservesCallable<TCurrent, TNext>
      : [TCurrent] extends [object]
        ? [TNext] extends [object]
          ? false extends {
              [TKey in keyof TCurrent & keyof TNext]-?: PreservesPluginValue<
                TCurrent[TKey],
                TNext[TKey]
              >;
            }[keyof TCurrent & keyof TNext]
            ? false
            : true
          : false
        : [TNext] extends [TCurrent]
          ? true
          : false;

/** Reject contribution members that cannot preserve an inherited capability. */
export type CompatiblePluginContribution<TCurrent, TNext> = {
  [TKey in keyof TNext]: TKey extends keyof TCurrent
    ? PreservesPluginValue<TCurrent[TKey], TNext[TKey]> extends true
      ? TNext[TKey]
      : never
    : TNext[TKey];
};

export type PluginContributionCompatibility<TCurrent, TNext> =
  TNext extends CompatiblePluginContribution<TCurrent, TNext> ? unknown : never;

export type PluginCompatibilityArguments<TCompatibility> = [
  TCompatibility,
] extends [never]
  ? [compatibility: never]
  : [];

type Materialize<TObject extends object> = Readonly<{
  [TKey in keyof TObject]: TObject[TKey];
}>;

type DefinitionField<
  C,
  TContribution,
  TKey extends PropertyKey,
  TValue,
> = TKey extends keyof C | keyof TContribution
  ? Readonly<Record<TKey, TValue>>
  : {};

type ObjectField<TContribution, TKey extends PropertyKey> =
  TContribution extends Readonly<Record<TKey, infer TValue extends object>>
    ? TValue
    : {};

type Conflicts<TContribution> =
  TContribution extends Readonly<{
    conflicts: infer TConflicts extends ReadonlyArray<
      RuntimePluginReference | PluginReference
    >;
  }>
    ? TConflicts
    : readonly [];

type Enabled<TContribution> =
  TContribution extends Readonly<{ enabled: infer TEnabled }>
    ? Extract<TEnabled, boolean> extends never
      ? boolean
      : Extract<TEnabled, boolean>
    : boolean;

type TargetPlugins<TContribution> =
  TContribution extends Readonly<{
    targetPlugins: infer TTargetPlugins extends ReadonlyArray<
      PluginReference | string
    >;
  }>
    ? TTargetPlugins
    : readonly [];

/**
 * Merge one normalized authoring contribution into the exact current
 * definition. Capability objects and state accumulate; consumer switches
 * replace; model identity stays owned by the original definition.
 */
export type MergePluginDefinitions<
  C extends AnyBasePluginDefinition,
  TContribution,
  TNormalized = NormalizeBasePluginInput<TContribution, C['name']>,
> = Materialize<
  Omit<
    C,
    | 'api'
    | 'conflicts'
    | 'enabled'
    | 'initialState'
    | 'name'
    | 'read'
    | 'selectors'
    | 'targetPlugins'
    | 'update'
  > &
    Omit<
      TNormalized,
      | 'api'
      | 'conflicts'
      | 'dependencies'
      | 'enabled'
      | 'initialState'
      | 'name'
      | 'read'
      | 'schema'
      | 'selectors'
      | 'targetPlugins'
      | 'update'
    > &
    Readonly<{ name: C['name'] }> &
    DefinitionField<
      C,
      TNormalized,
      'api',
      InferApi<C> & ObjectField<TNormalized, 'api'>
    > &
    DefinitionField<
      C,
      TNormalized,
      'read',
      InferRead<C> & ObjectField<TNormalized, 'read'>
    > &
    DefinitionField<
      C,
      TNormalized,
      'update',
      InferUpdate<C> & ObjectField<TNormalized, 'update'>
    > &
    DefinitionField<
      C,
      TNormalized,
      'initialState',
      NormalizePluginState<
        InferPluginStoreState<C> &
          Omit<
            ObjectField<TNormalized, 'initialState'>,
            keyof InferPluginStoreState<C>
          >
      >
    > &
    DefinitionField<
      C,
      TNormalized,
      'selectors',
      InferSelectors<C> & ObjectField<TNormalized, 'selectors'>
    > &
    ('conflicts' extends keyof TNormalized
      ? Readonly<{ conflicts: Conflicts<TNormalized> }>
      : 'conflicts' extends keyof C
        ? Readonly<{ conflicts: InferConflicts<C> }>
        : {}) &
    ('enabled' extends keyof TNormalized
      ? Readonly<{ enabled: Enabled<TNormalized> }>
      : 'enabled' extends keyof C
        ? Readonly<{ enabled: InferEnabled<C> }>
        : {}) &
    ('targetPlugins' extends keyof TNormalized
      ? Readonly<{
          targetPlugins: TargetPlugins<TNormalized>;
        }>
      : 'targetPlugins' extends keyof C
        ? Pick<C, 'targetPlugins'>
        : {})
>;
