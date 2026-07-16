import type {
  AnyPluginConfig,
  InferApi,
  InferDependencies,
  InferOptions,
  InferSelectors,
  InferState,
  InferTx,
  PluginConfig,
  BasePlugin,
} from '../../lib';
import type {
  PlatePlugin,
  PlatePluginContext,
  PlatePluginMethods,
} from './PlatePlugin';

type PlatePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
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
        InferDependencies<C>
      >
    >
  >,
  keyof PlatePluginMethods | 'api' | 'node' | 'options'
> & {
  api?: EA & Partial<InferApi<C>>;
  node?: Partial<PlatePlugin<C>['node']>;
  options?: EO & Partial<InferOptions<C>>;
  selectors?: ES & Partial<InferSelectors<C>>;
};

const methodsToWrap = [
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

type ExtendPlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        Partial<InferOptions<C>>,
        Partial<InferApi<C>>,
        Partial<InferTx<C>>,
        Partial<InferSelectors<C>>,
        InferState<C>,
        InferDependencies<C>
      >
    >
  >,
  keyof PlatePluginMethods
>;

/**
 * Extends a BasePlugin to create a React PlatePlugin.
 *
 * @remarks
 *   This function adapts a BasePlugin into a React PlatePlugin, allowing for
 *   React-specific functionality to be added.
 * @param basePlugin - The base BasePlugin to be extended.
 * @param extendConfig - A function or object that provides the extension
 *   configuration. If a function, it receives the plugin context and should
 *   return a partial PlatePlugin. If an object, it should be a partial
 *   PlatePlugin configuration.
 * @returns A new PlatePlugin that combines the base BasePlugin functionality
 *   with React-specific features defined in the extension configuration.
 */
export function toPlatePlugin<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
>(
  basePlugin: BasePlugin<C>,
  extendConfig?:
    | ((ctx: PlatePluginContext<C>) => PlatePluginConfig<C, EO, EA, ES>)
    | PlatePluginConfig<C, EO, EA, ES>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>
  >
>;

export function toPlatePlugin<
  C extends AnyPluginConfig = PluginConfig,
  TContext extends AnyPluginConfig = AnyPluginConfig,
>(
  basePlugin: BasePlugin<TContext>,
  extendConfig?:
    | ((ctx: PlatePluginContext<TContext>) => ExtendPlatePluginConfig<C>)
    | ExtendPlatePluginConfig<C>
): PlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>
  >
>;

export function toPlatePlugin(
  basePlugin: BasePlugin<any>,
  extendConfig?: any
): PlatePlugin<any> {
  const plugin = { ...basePlugin } as unknown as PlatePlugin;

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
