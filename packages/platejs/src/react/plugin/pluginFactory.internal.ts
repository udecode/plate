import {
  freezePluginDescriptorValue,
  isConfiguredPluginDescriptor,
  isNominalPluginDescriptor,
} from '../../internal/utils/mergePlugins';
import type {
  AnyBasePluginDefinition,
  PluginReference,
  PluginSelectors,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type {
  AnyPlugin,
  InternalPluginAuthorExtension,
  InternalPluginAuthorState,
  InternalPluginAuthorStageCompatibility,
  InternalPluginAuthorStageInput,
  InternalPluginAuthorStageKeys,
  PluginContext,
  Shortcuts,
} from './PlatePlugin';

interface PluginFactoryTypeLambda {
  readonly input: object;
  readonly output: object;
}

type ApplyPluginFactory<
  TType extends PluginFactoryTypeLambda,
  TInput extends TType['input'],
> = (TType & Readonly<{ input: TInput }>)['output'];

type PluginFactoryDefinition<
  TType extends PluginFactoryTypeLambda,
  TInput extends TType['input'],
> =
  InternalPluginDefinitionOf<ApplyPluginFactory<TType, TInput>> extends infer C
    ? C extends AnyBasePluginDefinition
      ? C
      : never
    : never;

type RequireDefined<TInput, TKey extends keyof TInput> = Omit<TInput, TKey> & {
  readonly [K in TKey]-?: NonNullable<TInput[K]>;
};

declare class PrivatePluginFactoryWitness<
  TType extends PluginFactoryTypeLambda,
  TAllowedInput extends TType['input'],
> {
  protected readonly pluginFactory: readonly [TType, TAllowedInput];
}

interface MappedPluginFactoryType<
  TSource extends PluginFactoryTypeLambda,
  TKeys extends PropertyKey,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> extends PluginFactoryTypeLambda {
  readonly input: TSource['input'];
  readonly output: InternalPluginAuthorExtension<
    ApplyPluginFactory<TSource, this['input']>,
    PluginFactoryDefinition<TSource, this['input']>,
    TKeys,
    S,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPlugins
  >;
}

type MappedPluginFactory<
  TSource extends PluginFactoryTypeLambda,
  TAllowedInput extends TSource['input'],
  TKeys extends PropertyKey,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = PluginFactory<
  MappedPluginFactoryType<
    TSource,
    TKeys,
    S,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPlugins
  >,
  TAllowedInput
>;

export interface PluginFactory<
  TType extends PluginFactoryTypeLambda,
  TAllowedInput extends TType['input'] = TType['input'],
> extends PrivatePluginFactoryWitness<TType, TAllowedInput> {
  create<const TInput extends TAllowedInput>(
    input: TInput
  ): ApplyPluginFactory<TType, TInput>;
  map<
    const TKeys extends InternalPluginAuthorStageKeys<
      PluginFactoryDefinition<TType, TAllowedInput>
    >,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<
      InternalPluginAuthorState<PluginFactoryDefinition<TType, TAllowedInput>>
    > = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
      readonly [],
    const TShortcuts extends Shortcuts = {},
  >(
    stage: (
      context: PluginContext<PluginFactoryDefinition<TType, TAllowedInput>>
    ) => InternalPluginAuthorStageInput<
      PluginFactoryDefinition<TType, TAllowedInput>,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPlugins,
      TShortcuts
    >,
    ...compatibility: InternalPluginAuthorStageCompatibility<
      PluginFactoryDefinition<TType, TAllowedInput>,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate
    >
  ): MappedPluginFactory<
    TType,
    TAllowedInput,
    TKeys,
    S,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPlugins
  >;
  map<
    const TKeys extends InternalPluginAuthorStageKeys<
      PluginFactoryDefinition<TType, TAllowedInput>
    >,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<
      InternalPluginAuthorState<PluginFactoryDefinition<TType, TAllowedInput>>
    > = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
      readonly [],
    const TShortcuts extends Shortcuts = {},
  >(
    stage: Readonly<{ call?: never }> &
      InternalPluginAuthorStageInput<
        PluginFactoryDefinition<TType, TAllowedInput>,
        TKeys,
        S,
        TApi,
        TRead,
        TSelectors,
        TUpdate,
        TConflictNames,
        TEnabled,
        TTargetPlugins,
        TShortcuts
      >,
    ...compatibility: InternalPluginAuthorStageCompatibility<
      PluginFactoryDefinition<TType, TAllowedInput>,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate
    >
  ): MappedPluginFactory<
    TType,
    TAllowedInput,
    TKeys,
    S,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPlugins
  >;
  require<const TKey extends keyof TAllowedInput>(
    key: TKey,
    ...keys: readonly TKey[]
  ): PluginFactory<TType, RequireDefined<TAllowedInput, TKey> & TType['input']>;
}

type RuntimePluginFactorySource = (input: never) => unknown;
type RuntimePluginFactoryStage = object | ((context: unknown) => object);

type RuntimePluginFactory = Readonly<{
  create: (input: object) => AnyPlugin;
  map: (stage: RuntimePluginFactoryStage) => RuntimePluginFactory;
  require: (
    key: PropertyKey,
    ...keys: readonly PropertyKey[]
  ) => RuntimePluginFactory;
}>;

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

const isPluginFactoryOutput = (value: unknown): value is AnyPlugin =>
  isNominalPluginDescriptor(value) &&
  !isConfiguredPluginDescriptor(value) &&
  typeof Reflect.get(value, 'extend') === 'function' &&
  typeof Reflect.get(value, 'configure') === 'function';

const createPluginFactoryRuntime = (
  source: RuntimePluginFactorySource,
  requiredKeys: readonly PropertyKey[] = [],
  stages: readonly RuntimePluginFactoryStage[] = []
): RuntimePluginFactory => {
  const capturedRequiredKeys = Object.freeze([...requiredKeys]);
  const capturedStages = Object.freeze([...stages]);

  return Object.freeze({
    create(input: object) {
      if (!isObject(input)) {
        throw new TypeError('Plugin factory input must be an object.');
      }
      for (const key of capturedRequiredKeys) {
        if (Reflect.get(input, key) == null) {
          throw new Error(`Plugin factory requires \`${String(key)}\`.`);
        }
      }

      const created: unknown = Reflect.apply(source, undefined, [input]);

      if (!isPluginFactoryOutput(created)) {
        throw new TypeError('Plugin factory source must create a descriptor.');
      }

      let plugin = created;

      for (const stage of capturedStages) {
        const extend = Reflect.get(plugin, 'extend');

        if (typeof extend !== 'function') {
          throw new TypeError(
            'Plugin factory source must create a descriptor.'
          );
        }
        const next: unknown = Reflect.apply(extend, plugin, [stage]);

        if (!isPluginFactoryOutput(next)) {
          throw new TypeError(
            'Plugin factory mapping must create a descriptor.'
          );
        }
        plugin = next;
      }

      return plugin;
    },
    map(stage: RuntimePluginFactoryStage) {
      if (typeof stage !== 'function' && !isObject(stage)) {
        throw new TypeError('Plugin factory .map() requires an author stage.');
      }

      const capturedStage =
        typeof stage === 'function'
          ? stage
          : freezePluginDescriptorValue(stage);

      return createPluginFactoryRuntime(source, capturedRequiredKeys, [
        ...capturedStages,
        capturedStage,
      ]);
    },
    require(key: PropertyKey, ...keys: readonly PropertyKey[]) {
      if (key === undefined) {
        throw new TypeError(
          'Plugin factory .require() requires at least one key.'
        );
      }

      return createPluginFactoryRuntime(
        source,
        [...capturedRequiredKeys, key, ...keys],
        capturedStages
      );
    },
  });
};

export function createPluginFactory<TType extends PluginFactoryTypeLambda>(
  source: (input: TType['input']) => AnyPlugin
): PluginFactory<TType>;
export function createPluginFactory(
  source: RuntimePluginFactorySource
): object {
  return createPluginFactoryRuntime(source);
}
