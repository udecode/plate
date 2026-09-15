import type { RuntimePluginReference } from '../../facade';
import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  getPluginDescriptorMetadata,
  isNominalPluginDescriptor,
  setPluginDescriptorMetadata,
} from '../../internal/utils/mergePlugins';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  ConfiguredPluginDescriptor,
  PluginReference,
} from '../../lib';
import type { PluginDefinitionWitness } from '../../lib/plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { MergePluginDefinitions } from '../../lib/plugin/pluginDefinitionMerge.internal';
import type {
  ConfiguredPlugin,
  Plugin,
  PluginContext,
  PluginDefinitionInput,
  PluginExtendInput,
} from './PlatePlugin';
import type { NormalizePluginInput } from './platePluginCompiler.internal';

type AdapterContribution<C extends AnyBasePluginDefinition> = Exclude<
  PluginExtendInput<C>,
  RuntimePluginReference | ((...args: never[]) => unknown)
>;

type BasePluginAdapterSource = PluginReference &
  Pick<AnyBasePlugin, 'configure' | 'extend'>;

type BasePluginDefinitionOf<TPlugin extends BasePluginAdapterSource> =
  InternalPluginDefinitionOf<TPlugin> extends infer C extends
    AnyBasePluginDefinition
    ? C
    : never;

type AdapterObject<C extends AnyBasePluginDefinition> = AdapterContribution<C> &
  Pick<PluginDefinitionInput<C>, 'component' | 'dependencies'>;

type AdapterObjectWithoutDependencies<C extends AnyBasePluginDefinition> = Omit<
  AdapterObject<C>,
  'dependencies'
>;

type AdapterInput<C extends AnyBasePluginDefinition> =
  | AdapterObject<C>
  | ((
      context: PluginContext<C>
    ) => Exclude<PluginExtendInput<C>, (...args: never[]) => unknown>);

type AdapterResult<TInput> = TInput extends (...args: never[]) => infer TResult
  ? TResult
  : TInput;

type NormalizePluginAdapterInput<
  TInput,
  TFallbackName extends string,
> = NormalizePluginInput<Omit<TInput, 'dependencies'>, TFallbackName> &
  ('dependencies' extends keyof TInput
    ? TInput extends {
        dependencies: infer TDependencies extends ReadonlyArray<
          RuntimePluginReference | PluginReference
        >;
      }
      ? Readonly<{
          dependencies: TDependencies;
        }>
      : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>);

type NormalizePluginAdapterWithDependencies<
  TInput,
  TFallbackName extends string,
  TDependencies extends ReadonlyArray<RuntimePluginReference | PluginReference>,
> = NormalizePluginInput<Omit<TInput, 'dependencies'>, TFallbackName> &
  Readonly<{ dependencies: TDependencies }>;

type AdaptedBasePluginDefinition<
  C extends AnyBasePluginDefinition,
  TNormalized,
> = Omit<
  MergePluginDefinitions<C, TNormalized, TNormalized>,
  'dependencies' | 'name'
> &
  Readonly<{ name: C['name'] }> &
  ('dependencies' extends keyof TNormalized
    ? TNormalized extends {
        dependencies: infer TDependencies extends ReadonlyArray<
          RuntimePluginReference | PluginReference
        >;
      }
      ? Readonly<{ dependencies: TDependencies }>
      : Readonly<Record<never, never>>
    : 'dependencies' extends keyof C
      ? Pick<C, 'dependencies'>
      : Readonly<Record<never, never>>);

/**
 * Exact Plate result of adapting one Base descriptor.
 *
 * @internal
 */
export type InternalReactPluginAdapterResult<
  TBasePlugin extends BasePluginAdapterSource,
  TAdapter,
> = Plugin<
  AdaptedBasePluginDefinition<
    BasePluginDefinitionOf<TBasePlugin>,
    NormalizePluginAdapterInput<
      AdapterResult<TAdapter>,
      BasePluginDefinitionOf<TBasePlugin>['name']
    >
  >
>;

type PluginRecord = Record<PropertyKey, unknown>;

const isObjectRecord = (value: unknown): value is PluginRecord =>
  typeof value === 'object' && value !== null;

const isRuntimeBasePlugin = (value: unknown): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) &&
  typeof Reflect.get(value, 'configure') === 'function' &&
  typeof Reflect.get(value, 'extend') === 'function';

const assertAdapterObject = (value: PluginRecord) => {
  for (const field of ['name', 'schema', 'type'] as const) {
    if (Object.hasOwn(value, field)) {
      throw new Error(
        `toReactPlugin() cannot define \`${field}\`; declare model identity on the Base plugin.`
      );
    }
  }
};

const assertPlateExtendObject = (value: PluginRecord) => {
  if (Object.hasOwn(value, 'component')) {
    throw new Error(
      'Plate plugin .extend() cannot define `component`; bind it in definePlugin(), toReactPlugin(), or terminal .configure().'
    );
  }
  if (Object.hasOwn(value, 'api') && typeof value.api !== 'function') {
    throw new Error('Plate plugin `api` must be a factory.');
  }
};

const prepareAdapterObject = (
  value: PluginRecord
): Readonly<{
  component?: unknown;
  contribution: PluginRecord;
  dependencies?: readonly unknown[];
  hasComponent: boolean;
}> => {
  assertAdapterObject(value);
  if (Object.hasOwn(value, 'api') && typeof value.api !== 'function') {
    throw new Error('Plate plugin `api` must be a factory.');
  }
  const { component, dependencies, ...contribution } = value;

  return {
    component,
    contribution,
    hasComponent: Object.hasOwn(value, 'component'),
    ...(dependencies === undefined
      ? {}
      : {
          dependencies: Object.freeze([
            ...(dependencies as readonly unknown[]),
          ]),
        }),
  };
};

const callBaseMethod = (
  basePlugin: AnyBasePlugin,
  method: 'configure' | 'extend',
  input: unknown
) => {
  const baseMethod = Reflect.get(basePlugin, method);

  if (typeof baseMethod !== 'function') {
    throw new TypeError(`Plate plugin method "${method}" is not callable.`);
  }

  return Reflect.apply(baseMethod, basePlugin, [input]) as AnyBasePlugin;
};

const bindPlateComponent = (
  plugin: AnyBasePlugin,
  component: unknown,
  hasComponent: boolean
) =>
  hasComponent
    ? (brandPluginDescriptor({ ...plugin, component }, plugin) as AnyBasePlugin)
    : plugin;

const wrapPlatePlugin = (
  basePlugin: AnyBasePlugin,
  dependencies?: readonly unknown[],
  sourcePlugin?: AnyBasePlugin
): AnyBasePlugin => {
  const plugin = brandPluginDescriptor(
    {
      ...basePlugin,
      ...(dependencies === undefined ? {} : { dependencies }),
    },
    basePlugin
  ) as AnyBasePlugin;

  if (sourcePlugin) {
    const metadata = getPluginDescriptorMetadata(plugin);

    setPluginDescriptorMetadata(plugin, {
      ...metadata,
      sourceReferences: Object.freeze([
        ...metadata.sourceReferences,
        sourcePlugin,
      ]),
    });
  }

  Reflect.set(plugin, 'configure', (input: unknown) => {
    const normalizedInput =
      typeof input === 'function'
        ? (context: unknown) => {
            const configuration = Reflect.apply(input, undefined, [context]);

            if (!isObjectRecord(configuration)) {
              throw new Error(
                'Plate plugin .configure() callbacks must return an object.'
              );
            }

            return configuration;
          }
        : (() => {
            if (!isObjectRecord(input)) {
              throw new Error(
                'Plate plugin .configure() values must be objects.'
              );
            }

            return input;
          })();
    const nextBasePlugin = callBaseMethod(
      basePlugin,
      'configure',
      normalizedInput
    );

    return wrapPlatePlugin(nextBasePlugin, dependencies, plugin);
  });

  Reflect.set(plugin, 'extend', (input: unknown) => {
    const normalizedInput =
      typeof input === 'function'
        ? (context: unknown) => {
            const contribution = Reflect.apply(input, undefined, [context]);

            if (!isObjectRecord(contribution)) {
              throw new Error(
                'Plate plugin .extend() callbacks must return an object.'
              );
            }

            if (!Object.hasOwn(contribution, 'name')) {
              assertPlateExtendObject(contribution);
            }

            return contribution;
          }
        : (() => {
            if (!isObjectRecord(input)) return input;
            if (!Object.hasOwn(input, 'name')) {
              assertPlateExtendObject(input);
            }

            return input;
          })();
    const nextBasePlugin = callBaseMethod(
      basePlugin,
      'extend',
      normalizedInput
    );

    return wrapPlatePlugin(nextBasePlugin, dependencies, plugin);
  });

  return plugin;
};

const toReactPluginRuntime = (
  basePlugin: unknown,
  adapter?: unknown
): AnyBasePlugin => {
  if (!isRuntimeBasePlugin(basePlugin)) {
    throw new Error(
      'toReactPlugin requires a descriptor created by definePlugin.'
    );
  }
  if (adapter === undefined) return wrapPlatePlugin(basePlugin);

  if (typeof adapter === 'function') {
    return wrapPlatePlugin(callBaseMethod(basePlugin, 'extend', adapter));
  }
  if (!isObjectRecord(adapter)) {
    throw new Error('Plate plugin adapter values must be objects.');
  }

  const { component, contribution, dependencies, hasComponent } =
    prepareAdapterObject(adapter);
  const extendedBasePlugin =
    Reflect.ownKeys(contribution).length === 0
      ? basePlugin
      : callBaseMethod(
          basePlugin,
          'extend',
          freezePluginDescriptorValue(contribution)
        );
  const nextBasePlugin = bindPlateComponent(
    extendedBasePlugin,
    component,
    hasComponent
  );

  return wrapPlatePlugin(nextBasePlugin, dependencies);
};

/**
 * Lift one semantic Base descriptor into the React layer.
 *
 * The returned value remains the same single Base plugin descriptor;
 * this adapter only adds React authoring context and component binding.
 */
export function toReactPlugin<const C extends AnyBasePluginDefinition>(
  basePlugin: BasePluginAdapterSource &
    PluginDefinitionWitness<C> &
    ConfiguredPluginDescriptor
): ConfiguredPlugin<C>;

export function toReactPlugin<const C extends AnyBasePluginDefinition>(
  basePlugin: BasePluginAdapterSource & PluginDefinitionWitness<C>
): Plugin<C>;

export function toReactPlugin<
  const TBasePlugin extends BasePluginAdapterSource,
  const TDependencies extends ReadonlyArray<
    RuntimePluginReference | PluginReference
  >,
  const TAdapter extends AdapterObjectWithoutDependencies<
    NoInfer<BasePluginDefinitionOf<TBasePlugin>>
  >,
>(
  basePlugin: TBasePlugin &
    (TBasePlugin extends ConfiguredPluginDescriptor ? never : unknown),
  adapter: TAdapter & Readonly<{ dependencies: TDependencies }>
): Plugin<
  AdaptedBasePluginDefinition<
    BasePluginDefinitionOf<TBasePlugin>,
    NormalizePluginAdapterWithDependencies<
      AdapterResult<TAdapter>,
      BasePluginDefinitionOf<TBasePlugin>['name'],
      TDependencies
    >
  >
>;

export function toReactPlugin<
  const TBasePlugin extends BasePluginAdapterSource,
  const TAdapter extends AdapterInput<
    NoInfer<BasePluginDefinitionOf<TBasePlugin>>
  >,
>(
  basePlugin: TBasePlugin &
    (TBasePlugin extends ConfiguredPluginDescriptor ? never : unknown),
  adapter: TAdapter
): InternalReactPluginAdapterResult<TBasePlugin, TAdapter>;

export function toReactPlugin(basePlugin: unknown, adapter?: unknown): unknown {
  return toReactPluginRuntime(basePlugin, adapter);
}
