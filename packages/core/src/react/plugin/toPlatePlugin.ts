import type {
  AnyPluginConfig,
  InferApi,
  InferOptions,
  InferTransforms,
  PluginConfig,
  SlatePlugin,
} from '../../lib';
import type {
  PlatePlugin,
  PlatePluginContext,
  PlatePluginMethods,
} from './PlatePlugin';

type PlatePluginConfig<C extends AnyPluginConfig, EO = {}, EA = {}, ET = {}> = {
  api?: EA & Partial<InferApi<C>>;
  options?: EO & Partial<InferOptions<C>>;
  transforms?: ET & Partial<InferTransforms<C>>;
} & Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        EO & InferOptions<C>,
        EA & InferApi<C>,
        ET & InferTransforms<C>
      >
    >
  >,
  'api' | 'options' | 'transforms' | keyof PlatePluginMethods
>;

const methodsToWrap: (keyof SlatePlugin)[] = [
  'configure',
  'configurePlugin',
  'extendEditorApi',
  'extendApi',
  'extendTransforms',
  'extend',
  'extendPlugin',
];

/**
 * Extends a SlatePlugin to create a React PlatePlugin.
 *
 * @remarks
 *   This function transforms a SlatePlugin into a React PlatePlugin, allowing for
 *   React-specific functionality to be added.
 * @param basePlugin - The base SlatePlugin to be extended.
 * @param extendConfig - A function or object that provides the extension
 *   configuration. If a function, it receives the plugin context and should
 *   return a partial PlatePlugin. If an object, it should be a partial
 *   PlatePlugin configuration.
 * @returns A new PlatePlugin that combines the base SlatePlugin functionality
 *   with React-specific features defined in the extension configuration.
 */
export function toPlatePlugin<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ET = {},
>(
  basePlugin: SlatePlugin<C>,
  extendConfig?:
    | ((ctx: PlatePluginContext<C>) => PlatePluginConfig<C, EO, EA, ET>)
    | PlatePluginConfig<C, EO, EA, ET>
): PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    ET & InferTransforms<C>
  >
> {
  const plugin = { ...basePlugin } as unknown as PlatePlugin;

  methodsToWrap.forEach((method) => {
    const originalMethod = plugin[method];

    (plugin as any)[method] = (...args: any[]) => {
      const slatePlugin = originalMethod(...args);

      return toPlatePlugin(slatePlugin);
    };
  });

  plugin.withComponent = (component) => {
    return plugin.extend({ component }) as any;
  };

  if (!extendConfig) return plugin as any;

  const extendedPlugin = plugin.extend(extendConfig as any);

  return extendedPlugin as any;
}

type ExtendPluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<
    PlatePlugin<
      PluginConfig<
        C['key'],
        Partial<InferOptions<C>>,
        Partial<InferApi<C>>,
        Partial<InferTransforms<C>>
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
 * @typeParam TContext - The type of the base SlatePlugin configuration
 *   (optional).
 */
export function toTPlatePlugin<
  C extends AnyPluginConfig = PluginConfig,
  TContext extends AnyPluginConfig = AnyPluginConfig,
>(
  basePlugin: SlatePlugin<TContext>,
  extendConfig?:
    | ((ctx: PlatePluginContext<TContext>) => ExtendPluginConfig<C>)
    | ExtendPluginConfig<C>
): PlatePlugin<
  PluginConfig<C['key'], InferOptions<C>, InferApi<C>, InferTransforms<C>>
> {
  return toPlatePlugin(basePlugin as any, extendConfig as any);
}
