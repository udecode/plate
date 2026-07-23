import type {
  AnyPluginConfig,
  InferApi,
  InferDependencies,
  InferNestedPlugins,
  InferOptions,
  InferPluginApi,
  InferPluginSchemaModel,
  InferSelectors,
  InferState,
  InferTx,
  PluginConfig,
  PluginShortcutInput,
  PluginReference,
  AnyBasePlugin,
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

type PlateShortcutRecord = Record<string, Shortcut | null | undefined>;
import { brandPluginDescriptor } from '../../internal/utils/mergePlugins';

type PlatePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  TShortcuts extends PlateShortcutRecord = {},
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
        InferDependencies<C>,
        InferNestedPlugins<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>
      >
    >
  >,
  keyof PlatePluginMethods | 'api' | 'options' | 'shortcuts'
> & {
  api?: EA & Partial<InferApi<C>>;
  options?: EO & Partial<InferOptions<C>>;
  selectors?: ES & Partial<InferSelectors<C>>;
  shortcuts?: PluginShortcutInput<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
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
  'host' | 'parser' | 'parsers' | 'plugins' | 'render' | 'schema' | 'type'
> & {
  plugins?: readonly AnyBasePlugin[];
  render?: Omit<
    NonNullable<PlatePluginConfig<C, EO, EA, ES, TShortcuts>['render']>,
    'isDecoration'
  > | null;
};

type BasePluginDescriptorInput = PluginReference & {
  readonly __config: AnyPluginConfig;
  readonly __configured?: never;
};

const methodsToWrap = [
  'clone',
  'configure',
  'configurePlugin',
  'extendEditorApi',
  'extendExtension',
  'extendSelectors',
  'extendApi',
  'extendTx',
  'extendTxGroup',
  'extend',
  'extendPlugin',
  'withComponent',
] as const satisfies readonly (keyof PlatePluginMethods)[];

const extensionArrayKeys = [
  '__apiExtensions',
  '__editorExtensions',
  '__selectorExtensions',
  '__txExtensions',
] as const;

const preserveExtensionArrays = <P extends PlatePlugin>(
  basePlugin: PlatePlugin,
  extendedPlugin: P
): P => {
  for (const key of extensionArrayKeys) {
    const baseExtensions = basePlugin[key] ?? [];
    const extendedExtensions = extendedPlugin[key] ?? [];

    if (baseExtensions.length === 0) continue;

    extendedPlugin[key] = [
      ...baseExtensions,
      ...extendedExtensions.filter(
        (extension) => !baseExtensions.includes(extension as never)
      ),
    ] as P[typeof key];
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
        InferNestedPlugins<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>
      >
    >
  >,
  keyof PlatePluginMethods | 'shortcuts'
> & {
  shortcuts?: PluginShortcutInput<C, TShortcuts, Shortcut>;
};

type RuntimeExtendPlatePluginConfig<
  C extends AnyPluginConfig = PluginConfig,
  TShortcuts extends PlateShortcutRecord = {},
> = Omit<
  ExtendPlatePluginConfig<C, TShortcuts>,
  'host' | 'parser' | 'parsers' | 'plugins' | 'render' | 'schema' | 'type'
> & {
  plugins?: readonly AnyBasePlugin[];
  render?: Omit<
    NonNullable<ExtendPlatePluginConfig<C, TShortcuts>['render']>,
    'isDecoration'
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
 *   behavior that does not define schema, parser, or host projections.
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
  extendConfig?:
    | ((
        ctx: PlatePluginContext<C>
      ) => RuntimePlatePluginConfig<C, EO, EA, ES, TShortcuts>)
    | PlatePluginConfig<C, EO, EA, ES, TShortcuts>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
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
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >
>;

export function toPlatePlugin(basePlugin: any, extendConfig?: any): any {
  const plugin = brandPluginDescriptor({
    ...basePlugin,
  }) as unknown as PlatePlugin;

  methodsToWrap.forEach((method) => {
    const originalMethod = plugin[method];

    (plugin as any)[method] = (...args: any[]) => {
      const basePlugin = (
        originalMethod as unknown as (...args: any[]) => BasePlugin
      )(...args);

      return preserveExtensionArrays(plugin, toPlatePlugin(basePlugin));
    };
  });

  if (!extendConfig) return plugin as any;

  const extendedPlugin = plugin.extend(extendConfig);

  return preserveExtensionArrays(plugin, extendedPlugin as PlatePlugin) as any;
}
