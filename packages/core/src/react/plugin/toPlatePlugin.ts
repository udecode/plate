import type {
  AnyPluginConfig,
  InferApi,
  InferDependencies,
  InferEnabled,
  InferOptions,
  InferPluginApi,
  InferPluginSchemaModel,
  InferSelectors,
  InferState,
  InferTx,
  NodeComponent,
  PluginConfig,
  PluginShortcutInput,
  PluginReference,
  BasePlugin,
  ConfiguredBasePlugin,
} from '../../lib';
import type {
  ConfiguredPlatePlugin,
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
  EO = {},
  EA = {},
  ES = {},
  TShortcuts extends PlateShortcutRecord = {},
  D extends readonly PluginReference[] = InferDependencies<C>,
  Enabled extends boolean = InferEnabled<C>,
> = Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        EO & InferOptions<C>,
        EA & InferApi<C>,
        InferTx<C>,
        ES & InferSelectors<C>,
        InferState<C>,
        D,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        Enabled
      >
    >
  >,
  | keyof PlatePluginMethods
  | 'api'
  | 'options'
  | 'render'
  | 'schema'
  | 'shortcuts'
> & {
  api?: EA & Partial<InferApi<C>>;
  component?: NodeComponent;
  options?: EO & Partial<InferOptions<C>>;
  render?: Omit<NonNullable<PlatePlugin<C>['render']>, 'node'> | null;
  selectors?: ES & Partial<InferSelectors<C>>;
  shortcuts?: PluginShortcutInput<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>,
      D,
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
  EO = {},
  EA = {},
  ES = {},
  TShortcuts extends PlateShortcutRecord = {},
> = Omit<
  PlatePluginConfig<C, EO, EA, ES, TShortcuts>,
  'component' | 'dependencies' | 'parsers' | 'render' | 'schema' | 'type'
> & {
  render?: Omit<
    NonNullable<PlatePluginConfig<C, EO, EA, ES, TShortcuts>['render']>,
    'isDecoration' | 'node'
  > | null;
};

type BasePluginDescriptorInput = PluginReference & {
  readonly __config: AnyPluginConfig;
  readonly __configured?: never;
};

const methodsToWrap = [
  'clone',
  'configure',
  'extend',
] as const satisfies readonly (keyof PlatePluginMethods)[];

const extensionArrayKeys = [
  '__apiExtensions',
  '__codecExtensions',
  '__htmlCodecExtensions',
  '__editorExtensions',
  '__readExtensions',
  '__selectorExtensions',
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
        Partial<InferOptions<C>>,
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
  'component' | 'dependencies' | 'parsers' | 'render' | 'schema' | 'type'
> & {
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
  basePlugin: ConfiguredBasePlugin<C>
): ConfiguredPlatePlugin<C>;

export function toPlatePlugin<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  basePlugin: BasePlugin<C> & { readonly __configured?: never },
  extendConfig: (
    ctx: PlatePluginContext<C>
  ) => RuntimePlatePluginConfig<C, EO, EA, ES, TShortcuts>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
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
  EO = {},
  EA = {},
  ES = {},
  const TShortcuts extends PlateShortcutRecord = {},
  const D extends readonly PluginReference[] = InferDependencies<C>,
  const Enabled extends boolean = InferEnabled<C>,
>(
  basePlugin: BasePlugin<C> & { readonly __configured?: never },
  extendConfig?: PlatePluginConfig<C, EO, EA, ES, TShortcuts, D, Enabled>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    D,
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
    InferOptions<C>,
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

export function toPlatePlugin(basePlugin: any, extendConfig?: any): any {
  if (!isNominalPluginDescriptor(basePlugin)) {
    throw new Error(
      'toPlatePlugin requires a plugin descriptor created by createBasePlugin.'
    );
  }

  const plugin = brandPluginDescriptor(
    {
      ...basePlugin,
    },
    basePlugin
  ) as unknown as PlatePlugin<any>;

  methodsToWrap.forEach((method) => {
    const originalMethod = plugin[method];

    (plugin as any)[method] = (...args: any[]) => {
      if (
        method === 'configure' &&
        typeof args[0] === 'object' &&
        args[0] !== null &&
        Object.hasOwn(args[0], 'component')
      ) {
        const { component, ...baseConfig } = args[0];
        const configuredBasePlugin = (
          originalMethod as unknown as (...args: any[]) => BasePlugin
        )(baseConfig);

        return toPlatePlugin(configuredBasePlugin, { component });
      }

      const basePlugin = (
        originalMethod as unknown as (...args: any[]) => BasePlugin
      )(...args);

      return preserveExtensionArrays(plugin, toPlatePlugin(basePlugin));
    };
  });

  if (!extendConfig) return plugin as any;

  if (typeof extendConfig === 'function') {
    const extendedPlugin = plugin.extend(extendConfig);

    return preserveExtensionArrays(
      plugin,
      extendedPlugin as PlatePlugin<any>
    ) as any;
  }
  if (
    typeof extendConfig === 'object' &&
    extendConfig !== null &&
    Object.hasOwn(extendConfig, 'schema')
  ) {
    throw new Error(
      `Plate plugin '${plugin.key}' cannot define schema through toPlatePlugin(). Declare schema when creating the base plugin.`
    );
  }
  if (
    typeof extendConfig === 'object' &&
    extendConfig !== null &&
    typeof extendConfig.render === 'object' &&
    extendConfig.render !== null &&
    Object.hasOwn(extendConfig.render, 'node')
  ) {
    throw new Error(
      'Plate plugin `render.node` is private. Use top-level `component`.'
    );
  }

  let normalizedConfig = extendConfig;

  if (
    typeof extendConfig === 'object' &&
    extendConfig !== null &&
    Object.hasOwn(extendConfig, 'component')
  ) {
    const { component, ...configWithoutComponent } = extendConfig;

    normalizedConfig = mergePlugins(configWithoutComponent, {
      render: { node: component },
    });
  }
  const extendedBasePlugin = createBasePlugin(
    mergePlugins(plugin, normalizedConfig) as any
  );

  return preserveExtensionArrays(
    plugin,
    toPlatePlugin(extendedBasePlugin)
  ) as any;
}
