import merge from 'lodash/merge.js';

import type { PlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  PlatePlugin,
  PlatePluginComponent,
  PlatePluginMethods,
  PlatePlugins,
  PluginConfig,
} from './types/PlatePlugin';

import { isFunction } from '../utils/misc/isFunction';

/**
 * Creates a new Plate plugin with the given configuration.
 *
 * @remarks
 *   - The plugin's key is required and specified by the K generic.
 *   - The `__extensions` array stores functions to be applied when `resolvePlugin`
 *       is called with an editor.
 *   - The `extend` method adds new extensions to be applied later.
 *   - The `extendPlugin` method extends an existing plugin (including nested
 *       plugins) or adds a new one if not found.
 *
 * @example
 *   const myPlugin = createPlugin<
 *     'myPlugin',
 *     MyOptions,
 *     MyApi,
 *     MyTransforms
 *   >({
 *     key: 'myPlugin',
 *     options: { someOption: true },
 *     transforms: { someTransform: () => {} },
 *   });
 *
 *   const extendedPlugin = myPlugin.extend({
 *     options: { anotherOption: false },
 *   });
 *
 *   const pluginWithNestedExtension = extendedPlugin.extendPlugin(
 *     nestedPlugin,
 *     {
 *       options: { nestedOption: true },
 *     }
 *   );
 *
 * @template K - The literal type of the plugin key.
 * @template O - The type of the plugin options.
 * @template A - The type of the plugin utilities.
 * @template T - The type of the plugin transforms.
 * @template S - The type of the plugin storage.
 * @param {Partial<PlatePlugin<K, O, A, T>>} config - The configuration object
 *   for the plugin.
 * @returns {PlatePlugin<K, O, A, T>} A new Plate plugin instance with the
 *   following properties and methods:
 *
 *   - All properties from the input config, merged with default values.
 *   - `configure`: A method to create a new plugin instance with updated options.
 *   - `extend`: A method to create a new plugin instance with additional
 *       configuration.
 *   - `extendPlugin`: A method to extend an existing plugin (including nested
 *       plugins) or add a new one if not found.
 */
export function createPlugin<K extends string = any, O = {}, A = {}, T = {}>(
  config:
    | ((
        editor: PlateEditor
      ) => Omit<
        Partial<PlatePlugin<PluginConfig<K, O, A, T>>>,
        keyof PlatePluginMethods
      >)
    | Omit<
        Partial<PlatePlugin<PluginConfig<K, O, A, T>>>,
        keyof PlatePluginMethods
      > = {}
): PlatePlugin<PluginConfig<K, O, A, T>> {
  let baseConfig: Partial<PlatePlugin<PluginConfig<K, O, A, T>>>;
  let initialExtension:
    | ((
        editor: PlateEditor,
        plugin: PlatePlugin<PluginConfig<K, O, A, T>>
      ) => Partial<PlatePlugin<PluginConfig<K, O, A, T>>>)
    | undefined;

  if (isFunction(config)) {
    baseConfig = { key: '' as K };
    initialExtension = (editor) => config(editor);
  } else {
    baseConfig = config;
  }

  const key = baseConfig.key ?? '';

  const plugin = merge(
    {},
    {
      __configuration: null,
      __extensions: initialExtension ? [initialExtension] : [],
      __methodExtensions: [],
      api: {},
      dependencies: [],
      editor: {},
      handlers: {},
      inject: {},
      key,
      options: {},
      override: {},
      plugins: [],
      priority: 100,
      transforms: {},
      type: key,
    },
    config
  ) as unknown as PlatePlugin<PluginConfig<K, O, A, T>>;

  plugin.configure = (config) => {
    const newPlugin = { ...plugin };
    newPlugin.__configuration = (ctx) =>
      isFunction(config) ? config(ctx) : config;

    return createPlugin(newPlugin) as any;
  };

  plugin.configurePlugin = (p, config) => {
    const newPlugin = { ...plugin };

    const configureNestedPlugin = (
      plugins: PlatePlugins
    ): { found: boolean; plugins: PlatePlugins } => {
      let found = false;

      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return createPlugin({
            ...nestedPlugin,
            __configuration: (ctx: any) =>
              isFunction(config) ? config(ctx) : config,
          } as any);
        }
        if (nestedPlugin.plugins && nestedPlugin.plugins.length > 0) {
          const result = configureNestedPlugin(nestedPlugin.plugins);

          if (result.found) {
            found = true;

            return {
              ...nestedPlugin,
              plugins: result.plugins,
            };
          }
        }

        return nestedPlugin;
      });

      return { found, plugins: updatedPlugins };
    };

    const result = configureNestedPlugin(newPlugin.plugins as any);
    newPlugin.plugins = result.plugins as any;

    // We're not adding a new plugin if not found

    return createPlugin(newPlugin);
  };

  plugin.extendApi = (apiExtension) => {
    const newPlugin = { ...plugin };
    newPlugin.__methodExtensions = [
      ...(newPlugin.__methodExtensions as any),
      apiExtension,
    ];

    return createPlugin(newPlugin) as any;
  };

  plugin.extend = (extendConfig) => {
    const newPlugin = { ...plugin };
    newPlugin.__extensions = [
      ...(newPlugin.__extensions as any),
      (ctx) => (isFunction(extendConfig) ? extendConfig(ctx) : extendConfig),
    ];

    return createPlugin(newPlugin) as any;
  };

  plugin.extendPlugin = (p, extendConfig) => {
    const newPlugin = { ...plugin };

    const extendNestedPlugin = (
      plugins: PlatePlugins
    ): { found: boolean; plugins: PlatePlugins } => {
      let found = false;
      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return createPlugin({
            ...nestedPlugin,
            __extensions: [
              ...(nestedPlugin.__extensions as any),
              (ctx: any) =>
                isFunction(extendConfig) ? extendConfig(ctx) : extendConfig,
            ],
          } as any);
        }
        if (nestedPlugin.plugins && nestedPlugin.plugins.length > 0) {
          const result = extendNestedPlugin(nestedPlugin.plugins);

          if (result.found) {
            found = true;

            return {
              ...nestedPlugin,
              plugins: result.plugins,
            };
          }
        }

        return nestedPlugin;
      });

      return { found, plugins: updatedPlugins };
    };

    const result = extendNestedPlugin(newPlugin.plugins as any);
    newPlugin.plugins = result.plugins as any;

    // If the plugin wasn't found at any level, add it at the top level
    if (!result.found) {
      newPlugin.plugins.push(
        createPlugin({
          __extensions: [
            (ctx: any) =>
              isFunction(extendConfig)
                ? extendConfig(ctx as any)
                : (extendConfig as any),
          ],
          key: p.key,
        } as any)
      );
    }

    return createPlugin(newPlugin);
  };

  plugin.withComponent = (component: PlatePluginComponent) => {
    return plugin.extend({
      component,
    }) as any;
  };

  return plugin;
}

/**
 * Explicitly typed version of `createPlugin`.
 *
 * @remarks
 *   While `createPlugin` uses type inference, this function requires an explicit
 *   type parameter. Use this when you need precise control over the plugin's
 *   type structure or when type inference doesn't provide the desired result.
 */
export function createTPlugin<C extends AnyPluginConfig = PluginConfig>(
  config:
    | ((
        editor: PlateEditor
      ) => Omit<Partial<PlatePlugin<C>>, keyof PlatePluginMethods>)
    | Omit<Partial<PlatePlugin<C>>, keyof PlatePluginMethods> = {}
): PlatePlugin<C> {
  return createPlugin(config as any) as any;
}
