import type {
  AnyPluginConfig,
  InferApi,
  InferOptions,
  InferSelectors,
  InferTx,
  PluginConfig,
  EditorPlugin,
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
        {},
        ES & InferSelectors<C>,
        InferTx<C>
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
  'extendSelectors',
  'extendApi',
  'extendTx',
  'extendTxGroup',
  'extendTransforms',
  'overrideEditor',
  'extend',
  'extendPlugin',
] as const satisfies readonly (keyof PlatePluginMethods)[];

const extensionArrayKeys = [
  '__apiExtensions',
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

/**
 * Extends a EditorPlugin to create a React PlatePlugin.
 *
 * @remarks
 *   This function adapts a EditorPlugin into a React PlatePlugin, allowing for
 *   React-specific functionality to be added.
 * @param basePlugin - The base EditorPlugin to be extended.
 * @param extendConfig - A function or object that provides the extension
 *   configuration. If a function, it receives the plugin context and should
 *   return a partial PlatePlugin. If an object, it should be a partial
 *   PlatePlugin configuration.
 * @returns A new PlatePlugin that combines the base EditorPlugin functionality
 *   with React-specific features defined in the extension configuration.
 */
export function toPlatePlugin<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
>(
  basePlugin: EditorPlugin<C>,
  extendConfig?:
    | ((ctx: PlatePluginContext<C>) => PlatePluginConfig<C, EO, EA, ES>)
    | PlatePluginConfig<C, EO, EA, ES>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    {},
    ES & InferSelectors<C>,
    InferTx<C>
  >
> {
  const plugin = { ...basePlugin } as unknown as PlatePlugin;

  methodsToWrap.forEach((method) => {
    const originalMethod = plugin[method];

    (plugin as any)[method] = (...args: any[]) => {
      const slatePlugin = (
        originalMethod as unknown as (...args: any[]) => EditorPlugin
      )(...args);

      return preserveExtensionArrays(plugin, toPlatePlugin(slatePlugin));
    };
  });

  if (!extendConfig) return plugin as any;

  const extendedPlugin = plugin.extend(extendConfig as any);

  return preserveExtensionArrays(plugin, extendedPlugin as PlatePlugin) as any;
}

type ExtendPluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        Partial<InferOptions<C>>,
        Partial<InferApi<C>>,
        Partial<{}>,
        Partial<InferSelectors<C>>,
        Partial<InferTx<C>>
      >
    >
  >,
  keyof PlatePluginMethods
>;

/**
 * Explicitly typed version of {@link toPlatePlugin}.
 *
 * @remarks
 *   This function requires explicit type parameters for both the base plugin
 *   configuration and the extension configuration. Use this when you need
 *   precise control over the plugin's type structure or when type inference
 *   doesn't provide the desired result.
 * @typeParam C - The type of the extension configuration for the PlatePlugin
 *   (required).
 * @typeParam TContext - The type of the base EditorPlugin configuration
 *   (optional).
 */
export function toTPlatePlugin<
  C extends AnyPluginConfig = PluginConfig,
  TContext extends AnyPluginConfig = AnyPluginConfig,
>(
  basePlugin: EditorPlugin<TContext>,
  extendConfig?:
    | ((ctx: PlatePluginContext<TContext>) => ExtendPluginConfig<C>)
    | ExtendPluginConfig<C>
): PlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    {},
    InferSelectors<C>,
    InferTx<C>
  >
> {
  return toPlatePlugin(basePlugin as any, extendConfig as any);
}
