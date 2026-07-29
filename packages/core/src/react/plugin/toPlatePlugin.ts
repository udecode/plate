import type {
  AnyPluginConfig,
  InferApi,
  InferDependencies,
  InferEnabled,
  InferPluginStoreState,
  InferPluginApi,
  InferPluginSchemaModel,
  InferSelectors,
  InferState,
  InferTx,
  NodeComponent,
  PluginConfig,
  PluginDependencyReferences,
  PluginShortcutInput,
  PluginReference,
  AnyBasePlugin,
} from '../../lib';
import type {
  AnyPlatePlugin,
  ConfiguredPlatePlugin,
  AuthoringPlateEditorExtensionInput,
  PlatePlugin,
  PlatePluginContext,
  PlatePluginMethods,
  Shortcut,
} from './PlatePlugin';

import { createBasePlugin } from '../../lib';
import {
  brandPluginDescriptor,
  isNominalPluginDescriptor,
  mergePlugins,
} from '../../internal/utils/mergePlugins';

type PlateShortcutRecord = Record<string, Shortcut | null | undefined>;

type PlatePluginConfig<
  C extends AnyPluginConfig,
  EStoreState extends object = {},
  EA extends object = {},
  ES extends object = {},
  TShortcuts extends PlateShortcutRecord = {},
  D extends readonly PluginReference[] = InferDependencies<C>,
  Enabled extends boolean = InferEnabled<C>,
> = Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        EStoreState & InferPluginStoreState<C>,
        EA & InferApi<C>,
        InferTx<C>,
        ES & InferSelectors<C>,
        InferState<C>,
        PluginDependencyReferences<D>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        Enabled
      >
    >
  >,
  | keyof PlatePluginMethods
  | 'api'
  | 'dependencies'
  | 'initialState'
  | 'render'
  | 'schema'
  | 'shortcuts'
> & {
  api?: EA & Partial<InferApi<C>>;
  component?: NodeComponent;
  dependencies?: D;
  initialState?: EStoreState & Partial<InferPluginStoreState<C>>;
  render?: Omit<NonNullable<PlatePlugin<C>['render']>, 'node'> | null;
  selectors?: ES & Partial<InferSelectors<C>>;
  shortcuts?: PluginShortcutInput<
    PluginConfig<
      C['key'],
      EStoreState & InferPluginStoreState<C>,
      EA & InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>,
      PluginDependencyReferences<D>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>,
      Enabled
    >,
    TShortcuts,
    Shortcut
  >;
};

type RuntimePlatePluginConfig<
  C extends AnyPluginConfig,
  EStoreState extends object = {},
  EA extends object = {},
  ES extends object = {},
  TShortcuts extends PlateShortcutRecord = {},
> = Omit<
  PlatePluginConfig<C, EStoreState, EA, ES, TShortcuts>,
  | 'component'
  | 'dependencies'
  | 'extension'
  | 'parsers'
  | 'render'
  | 'schema'
  | 'type'
> & {
  extension?: AuthoringPlateEditorExtensionInput<C>;
  render?: Omit<
    NonNullable<
      PlatePluginConfig<C, EStoreState, EA, ES, TShortcuts>['render']
    >,
    'isDecoration' | 'node'
  > | null;
};

type BasePluginDescriptorInput<C extends AnyPluginConfig = AnyPluginConfig> =
  PluginReference & {
    readonly __config: C;
    readonly __configured?: never;
  };

type ConfiguredBasePluginDescriptorInput<
  C extends AnyPluginConfig = AnyPluginConfig,
> = PluginReference & {
  readonly __config: C;
  readonly __configured: true;
};

const methodsToWrap = [
  'clone',
  'configure',
  'extend',
] as const satisfies readonly (keyof PlatePluginMethods)[];

const isObjectRecord = (
  value: unknown
): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null;

const extensionArrayKeys = [
  '__apiExtensions',
  '__codecExtensions',
  '__htmlCodecExtensions',
  '__editorExtensions',
  '__readExtensions',
  '__txExtensions',
] as const;

type ExtensionArrayRecord = {
  [K in (typeof extensionArrayKeys)[number]]?: readonly unknown[];
};

const preserveExtensionArrays = <P extends ExtensionArrayRecord>(
  basePlugin: ExtensionArrayRecord,
  extendedPlugin: P
): P => {
  for (const key of extensionArrayKeys) {
    const baseExtensions = basePlugin[key] ?? [];
    const extendedExtensions = extendedPlugin[key] ?? [];

    if (baseExtensions.length === 0) continue;

    (extendedPlugin as Record<string, unknown>)[key] = [
      ...baseExtensions,
      ...extendedExtensions.filter(
        (extension) => !baseExtensions.includes(extension as never)
      ),
    ];
  }

  return extendedPlugin;
};

type ExtendPlatePluginConfig<
  C extends AnyPluginConfig = PluginConfig,
  TShortcuts extends PlateShortcutRecord = {},
> = Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        Partial<InferPluginStoreState<C>>,
        Partial<InferApi<C>>,
        Partial<InferTx<C>>,
        Partial<InferSelectors<C>>,
        InferState<C>,
        InferDependencies<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        InferEnabled<C>
      >
    >
  >,
  keyof PlatePluginMethods | 'render' | 'schema' | 'shortcuts'
> & {
  component?: NodeComponent;
  render?: Omit<NonNullable<PlatePlugin<C>['render']>, 'node'> | null;
  shortcuts?: PluginShortcutInput<C, TShortcuts, Shortcut>;
};

type RuntimeExtendPlatePluginConfig<
  C extends AnyPluginConfig = PluginConfig,
  TShortcuts extends PlateShortcutRecord = {},
> = Omit<
  ExtendPlatePluginConfig<C, TShortcuts>,
  | 'component'
  | 'dependencies'
  | 'extension'
  | 'parsers'
  | 'render'
  | 'schema'
  | 'type'
> & {
  extension?: AuthoringPlateEditorExtensionInput<C>;
  render?: Omit<
    NonNullable<ExtendPlatePluginConfig<C, TShortcuts>['render']>,
    'isDecoration' | 'node'
  > | null;
};

/**
 * Extends a BasePlugin to create a React PlatePlugin.
 *
 * @remarks
 *   This function adapts a BasePlugin into a React PlatePlugin, allowing for
 *   React-specific functionality to be added.
 * @param basePlugin - The base BasePlugin to be extended.
 * @param extendConfig - Static plugin configuration, or a runtime callback for
 *   behavior that does not define schema or HTML behavior.
 * @returns A new PlatePlugin that combines the base BasePlugin functionality
 *   with React-specific features defined in the extension configuration.
 */
export function toPlatePlugin<C extends AnyPluginConfig>(
  basePlugin: ConfiguredBasePluginDescriptorInput<C>
): ConfiguredPlatePlugin<C>;

export function toPlatePlugin<C extends AnyPluginConfig>(
  basePlugin: BasePluginDescriptorInput<C>
): PlatePlugin<C>;

export function toPlatePlugin<
  C extends AnyPluginConfig,
  EStoreState extends object = {},
  EA extends object = {},
  ES extends object = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  basePlugin: BasePluginDescriptorInput<C>,
  extendConfig: (
    ctx: PlatePluginContext<C>
  ) => RuntimePlatePluginConfig<C, EStoreState, EA, ES, TShortcuts>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EStoreState & InferPluginStoreState<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    InferEnabled<C>
  >
>;

export function toPlatePlugin<
  C extends AnyPluginConfig,
  EStoreState extends object = {},
  EA extends object = {},
  ES extends object = {},
  const TShortcuts extends PlateShortcutRecord = {},
  const D extends readonly PluginReference[] = InferDependencies<C>,
  const Enabled extends boolean = InferEnabled<C>,
>(
  basePlugin: BasePluginDescriptorInput<C>,
  extendConfig: PlatePluginConfig<
    C,
    EStoreState,
    EA,
    ES,
    TShortcuts,
    D,
    Enabled
  >
): PlatePlugin<
  PluginConfig<
    C['key'],
    EStoreState & InferPluginStoreState<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    PluginDependencyReferences<D>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >
>;

export function toPlatePlugin<
  C extends AnyPluginConfig = PluginConfig,
  TContext extends AnyPluginConfig = AnyPluginConfig,
  const TShortcuts extends PlateShortcutRecord = {},
>(
  basePlugin: BasePluginDescriptorInput,
  extendConfig?:
    | ((
        ctx: PlatePluginContext<TContext>
      ) => RuntimeExtendPlatePluginConfig<C, TShortcuts>)
    | ExtendPlatePluginConfig<C, TShortcuts>
): PlatePlugin<
  PluginConfig<
    C['key'],
    InferPluginStoreState<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    InferEnabled<C>
  >
>;

export function toPlatePlugin(
  basePlugin: unknown,
  extendConfig?: unknown
): unknown {
  return toPlatePluginRuntime(basePlugin, extendConfig);
}

const isRuntimeBasePlugin = (value: unknown): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) &&
  ['clone', 'configure', 'extend'].every(
    (method) => typeof Reflect.get(value, method) === 'function'
  );

const toPlatePluginRuntime = (
  basePlugin: unknown,
  extendConfig?: unknown
): AnyPlatePlugin => {
  if (!isRuntimeBasePlugin(basePlugin)) {
    throw new Error(
      'toPlatePlugin requires a plugin descriptor created by createBasePlugin.'
    );
  }

  const plugin = brandPluginDescriptor(
    {
      ...basePlugin,
    },
    basePlugin
  ) as unknown as AnyPlatePlugin;

  methodsToWrap.forEach((method) => {
    const originalMethod = Reflect.get(plugin, method);

    if (typeof originalMethod !== 'function') {
      throw new TypeError(`Plate plugin method "${method}" is not callable.`);
    }

    Reflect.set(plugin, method, (...args: unknown[]) => {
      if (
        method === 'configure' &&
        isObjectRecord(args[0]) &&
        Object.hasOwn(args[0], 'component')
      ) {
        const { component, ...baseConfig } = args[0];
        const configuredBasePlugin = Reflect.apply(originalMethod, basePlugin, [
          baseConfig,
        ]);

        return toPlatePluginRuntime(configuredBasePlugin, { component });
      }

      const nextBasePlugin = Reflect.apply(originalMethod, basePlugin, args);

      return preserveExtensionArrays(
        plugin,
        toPlatePluginRuntime(nextBasePlugin)
      );
    });
  });

  if (extendConfig === undefined) return plugin;

  if (typeof extendConfig === 'function') {
    const extend = Reflect.get(basePlugin, 'extend');

    if (typeof extend !== 'function') {
      throw new TypeError('Plate plugin extend method is not callable.');
    }
    const extendedBasePlugin = Reflect.apply(extend, basePlugin, [
      extendConfig,
    ]);

    return preserveExtensionArrays(
      plugin,
      toPlatePluginRuntime(extendedBasePlugin)
    );
  }
  if (!isObjectRecord(extendConfig)) {
    throw new Error('Plate plugin extension values must be objects.');
  }
  if (Object.hasOwn(extendConfig, 'schema')) {
    throw new Error(
      `Plate plugin '${plugin.key}' cannot define schema through toPlatePlugin(). Declare schema when creating the base plugin.`
    );
  }
  const render = Reflect.get(extendConfig, 'render');

  if (isObjectRecord(render) && Object.hasOwn(render, 'node')) {
    throw new Error(
      'Plate plugin `render.node` is private. Use top-level `component`.'
    );
  }

  let normalizedConfig = extendConfig;

  if (Object.hasOwn(extendConfig, 'component')) {
    const { component, ...configWithoutComponent } = extendConfig;

    normalizedConfig = mergePlugins(configWithoutComponent, {
      render: { node: component },
    });
  }
  const extendedBasePlugin = Reflect.apply(createBasePlugin, undefined, [
    mergePlugins(plugin, normalizedConfig),
  ]);

  return preserveExtensionArrays(
    plugin,
    toPlatePluginRuntime(extendedBasePlugin)
  );
};
