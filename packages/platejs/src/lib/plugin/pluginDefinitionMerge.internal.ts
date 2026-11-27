import type { RuntimePluginReference } from '../../facade';
import type { NormalizeBasePluginInput } from './basePluginCompiler.internal';
import type {
  AnyBasePluginDefinition,
  InferApi,
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

type MergePluginFieldKey =
  | 'api'
  | 'conflicts'
  | 'enabled'
  | 'initialState'
  | 'read'
  | 'selectors'
  | 'targetPlugins'
  | 'update';

type MergedObjectField<
  C,
  TContribution,
  TKey extends PropertyKey,
  TCurrent,
> = TKey extends keyof TContribution
  ? Readonly<
      Record<
        TKey,
        TKey extends keyof C
          ? TCurrent & ObjectField<TContribution, TKey>
          : ObjectField<TContribution, TKey>
      >
    >
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
  Omit<C, 'name' | Extract<keyof TNormalized, MergePluginFieldKey>> &
    Omit<
      TNormalized,
      'dependencies' | 'name' | 'schema' | MergePluginFieldKey
    > &
    Readonly<{ name: C['name'] }> &
    MergedObjectField<C, TNormalized, 'api', InferApi<C>> &
    MergedObjectField<C, TNormalized, 'read', InferRead<C>> &
    MergedObjectField<C, TNormalized, 'update', InferUpdate<C>> &
    ('initialState' extends keyof TNormalized
      ? Readonly<{
          initialState: NormalizePluginState<
            InferPluginStoreState<C> &
              Omit<
                ObjectField<TNormalized, 'initialState'>,
                keyof InferPluginStoreState<C>
              >
          >;
        }>
      : {}) &
    MergedObjectField<C, TNormalized, 'selectors', InferSelectors<C>> &
    ('conflicts' extends keyof TNormalized
      ? Readonly<{ conflicts: Conflicts<TNormalized> }>
      : {}) &
    ('enabled' extends keyof TNormalized
      ? Readonly<{ enabled: Enabled<TNormalized> }>
      : {}) &
    ('targetPlugins' extends keyof TNormalized
      ? Readonly<{
          targetPlugins: TargetPlugins<TNormalized>;
        }>
      : {})
>;
