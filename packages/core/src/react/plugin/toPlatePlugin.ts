import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  ConfiguredPluginDescriptor,
  PluginReference,
} from '../../lib';
import type { EditorExtensionReference } from '@platejs/plite';
import type {
  ConfiguredPlatePlugin,
  PlatePlugin,
  PlatePluginContext,
  PlatePluginDefinitionInput,
  PlatePluginExtendInput,
} from './PlatePlugin';
import type { NormalizePlatePluginInput } from './platePluginCompiler.internal';
import type { PluginDefinitionWitness } from '../../lib/plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { MergePluginDefinitions } from '../../lib/plugin/pluginDefinitionMerge.internal';

import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  isNominalPluginDescriptor,
} from '../../internal/utils/mergePlugins';
import { allowPrivateRenderContribution } from '../../internal/plugin/privateRenderContribution';

type PlateAdapterContribution<C extends AnyBasePluginDefinition> = Exclude<
  PlatePluginExtendInput<C>,
  EditorExtensionReference | ((...args: never[]) => unknown)
>;

type BasePluginAdapterSource = PluginReference &
  Pick<AnyBasePlugin, 'configure' | 'extend'>;

type BasePluginDefinitionOf<TPlugin extends BasePluginAdapterSource> =
  InternalPluginDefinitionOf<TPlugin> extends infer C extends
    AnyBasePluginDefinition
    ? C
    : never;

type PlateAdapterObject<C extends AnyBasePluginDefinition> =
  PlateAdapterContribution<C> &
    Pick<PlatePluginDefinitionInput<C>, 'component' | 'dependencies'>;

type PlateAdapterObjectWithoutDependencies<C extends AnyBasePluginDefinition> =
  Omit<PlateAdapterObject<C>, 'dependencies'>;

type PlateAdapterInput<C extends AnyBasePluginDefinition> =
  | PlateAdapterObject<C>
  | ((
      context: PlatePluginContext<C>
    ) => Exclude<PlatePluginExtendInput<C>, (...args: never[]) => unknown>);

type AdapterResult<TInput> = TInput extends (...args: never[]) => infer TResult
  ? TResult
  : TInput;

type NormalizePlatePluginAdapterInput<
  TInput,
  TFallbackName extends string,
> = NormalizePlatePluginInput<Omit<TInput, 'dependencies'>, TFallbackName> &
  ('dependencies' extends keyof TInput
    ? TInput extends {
        dependencies: infer TDependencies extends readonly (
          | EditorExtensionReference
          | PluginReference
        )[];
      }
      ? Readonly<{
          dependencies: TDependencies;
        }>
      : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>);

type NormalizePlatePluginAdapterWithDependencies<
  TInput,
  TFallbackName extends string,
  TDependencies extends readonly (EditorExtensionReference | PluginReference)[],
> = NormalizePlatePluginInput<Omit<TInput, 'dependencies'>, TFallbackName> &
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
        dependencies: infer TDependencies extends readonly (
          | EditorExtensionReference
          | PluginReference
        )[];
      }
      ? Readonly<{ dependencies: TDependencies }>
      : Readonly<Record<never, never>>
    : 'dependencies' extends keyof C
      ? Pick<C, 'dependencies'>
      : Readonly<Record<never, never>>);

/** @internal Exact definition for a declaration-emission dependency adapter. */
export type InternalPlateDependencyAdapterDefinition<
  C extends AnyBasePluginDefinition,
  TDependencies extends readonly (EditorExtensionReference | PluginReference)[],
> = AdaptedBasePluginDefinition<
  C,
  NormalizePlatePluginAdapterWithDependencies<
    PlateAdapterObjectWithoutDependencies<NoInfer<C>>,
    C['name'],
    TDependencies
  >
>;

type PluginRecord = Record<PropertyKey, unknown>;

const isObjectRecord = (value: unknown): value is PluginRecord =>
  typeof value === 'object' && value !== null;

const isRuntimeBasePlugin = (value: unknown): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) &&
  typeof Reflect.get(value, 'configure') === 'function' &&
  typeof Reflect.get(value, 'extend') === 'function';

const assertNoPrivateRenderNode = (value: PluginRecord) => {
  const render = value.render;

  if (isObjectRecord(render) && Object.hasOwn(render, 'node')) {
    throw new Error(
      'Plate plugin `render.node` is private. Use top-level `component`.'
    );
  }
};

const normalizeComponent = (value: PluginRecord): PluginRecord => {
  assertNoPrivateRenderNode(value);

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

const assertAdapterObject = (value: PluginRecord) => {
  for (const field of ['name', 'schema', 'type'] as const) {
    if (Object.hasOwn(value, field)) {
      throw new Error(
        `toPlatePlugin() cannot define \`${field}\`; declare model identity on the Base plugin.`
      );
    }
  }
};

const assertPlateExtendObject = (value: PluginRecord) => {
  if (Object.hasOwn(value, 'component')) {
    throw new Error(
      'Plate plugin .extend() cannot define `component`; bind it in definePlatePlugin(), toPlatePlugin(), or terminal .configure().'
    );
  }
  if (Object.hasOwn(value, 'api') && typeof value.api !== 'function') {
    throw new Error('Plate plugin `api` must be a factory.');
  }
};

const prepareAdapterObject = (
  value: PluginRecord
): Readonly<{
  contribution: PluginRecord;
  dependencies?: readonly unknown[];
}> => {
  assertAdapterObject(value);
  if (Object.hasOwn(value, 'api') && typeof value.api !== 'function') {
    throw new Error('Plate plugin `api` must be a factory.');
  }
  const { dependencies, ...contribution } = normalizeComponent(value);

  return {
    contribution,
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

const wrapPlatePlugin = (
  basePlugin: AnyBasePlugin,
  dependencies?: readonly unknown[]
): AnyBasePlugin => {
  const plugin = brandPluginDescriptor(
    {
      ...basePlugin,
      ...(dependencies === undefined ? {} : { dependencies }),
    },
    basePlugin
  ) as AnyBasePlugin;

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

            return normalizeComponent(configuration);
          }
        : (() => {
            if (!isObjectRecord(input)) {
              throw new Error(
                'Plate plugin .configure() values must be objects.'
              );
            }

            return normalizeComponent(input);
          })();
    const nextBasePlugin = callBaseMethod(
      basePlugin,
      'configure',
      normalizedInput
    );

    return wrapPlatePlugin(nextBasePlugin, dependencies);
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

    return wrapPlatePlugin(nextBasePlugin, dependencies);
  });

  return plugin;
};

const toPlatePluginRuntime = (
  basePlugin: unknown,
  adapter?: unknown
): AnyBasePlugin => {
  if (!isRuntimeBasePlugin(basePlugin)) {
    throw new Error(
      'toPlatePlugin requires a descriptor created by defineBasePlugin.'
    );
  }
  if (adapter === undefined) return wrapPlatePlugin(basePlugin);

  if (typeof adapter === 'function') {
    return wrapPlatePlugin(callBaseMethod(basePlugin, 'extend', adapter));
  }
  if (!isObjectRecord(adapter)) {
    throw new Error('Plate plugin adapter values must be objects.');
  }

  const { contribution, dependencies } = prepareAdapterObject(adapter);
  const nextBasePlugin =
    Reflect.ownKeys(contribution).length === 0
      ? basePlugin
      : callBaseMethod(
          basePlugin,
          'extend',
          allowPrivateRenderContribution(
            freezePluginDescriptorValue(contribution)
          )
        );

  return wrapPlatePlugin(nextBasePlugin, dependencies);
};

/**
 * Lift one semantic Base descriptor into the React layer.
 *
 * The returned value remains the same single Base/Plite extension descriptor;
 * this adapter only adds React authoring context and component binding.
 */
export function toPlatePlugin<const C extends AnyBasePluginDefinition>(
  basePlugin: BasePluginAdapterSource &
    PluginDefinitionWitness<C> &
    ConfiguredPluginDescriptor
): ConfiguredPlatePlugin<C>;

export function toPlatePlugin<const C extends AnyBasePluginDefinition>(
  basePlugin: BasePluginAdapterSource & PluginDefinitionWitness<C>
): PlatePlugin<C>;

export function toPlatePlugin<
  const TBasePlugin extends BasePluginAdapterSource,
  const TDependencies extends readonly (
    | EditorExtensionReference
    | PluginReference
  )[],
  const TAdapter extends PlateAdapterObjectWithoutDependencies<
    NoInfer<BasePluginDefinitionOf<TBasePlugin>>
  >,
>(
  basePlugin: TBasePlugin &
    (TBasePlugin extends ConfiguredPluginDescriptor ? never : unknown),
  adapter: TAdapter & Readonly<{ dependencies: TDependencies }>
): PlatePlugin<
  AdaptedBasePluginDefinition<
    BasePluginDefinitionOf<TBasePlugin>,
    NormalizePlatePluginAdapterWithDependencies<
      AdapterResult<TAdapter>,
      BasePluginDefinitionOf<TBasePlugin>['name'],
      TDependencies
    >
  >
>;

export function toPlatePlugin<
  const TBasePlugin extends BasePluginAdapterSource,
  const TAdapter extends PlateAdapterInput<
    NoInfer<BasePluginDefinitionOf<TBasePlugin>>
  >,
>(
  basePlugin: TBasePlugin &
    (TBasePlugin extends ConfiguredPluginDescriptor ? never : unknown),
  adapter: TAdapter
): PlatePlugin<
  AdaptedBasePluginDefinition<
    BasePluginDefinitionOf<TBasePlugin>,
    NormalizePlatePluginAdapterInput<
      AdapterResult<TAdapter>,
      BasePluginDefinitionOf<TBasePlugin>['name']
    >
  >
>;

export function toPlatePlugin(basePlugin: unknown, adapter?: unknown): unknown {
  return toPlatePluginRuntime(basePlugin, adapter);
}
