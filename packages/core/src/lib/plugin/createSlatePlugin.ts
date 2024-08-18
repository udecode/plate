import cloneDeep from 'lodash/cloneDeep.js';
import merge from 'lodash/merge.js';

import type { PlatePluginComponent } from '../../react';
import type { SlateEditor } from '../editor';
import type { AnyPluginConfig, PluginConfig } from './BasePlugin';
import type {
  SlatePlugin,
  SlatePluginMethods,
  SlatePlugins,
} from './SlatePlugin';

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
 *   const myPlugin = createSlatePlugin<
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
 * @param {Partial<SlatePlugin<K, O, A, T>>} config - The configuration object
 *   for the plugin.
 * @returns {SlatePlugin<K, O, A, T>} A new Plate plugin instance with the
 *   following properties and methods:
 *
 *   - All properties from the input config, merged with default values.
 *   - `configure`: A method to create a new plugin instance with updated options.
 *   - `extend`: A method to create a new plugin instance with additional
 *       configuration.
 *   - `extendPlugin`: A method to extend an existing plugin (including nested
 *       plugins) or add a new one if not found.
 */
export function createSlatePlugin<
  K extends string = any,
  O = {},
  A = {},
  T = {},
>(
  config:
    | ((
        editor: SlateEditor
      ) => Omit<
        Partial<SlatePlugin<PluginConfig<K, O, A, T>>>,
        keyof SlatePluginMethods
      >)
    | Omit<
        Partial<SlatePlugin<PluginConfig<K, O, A, T>>>,
        keyof SlatePluginMethods
      > = {}
): SlatePlugin<PluginConfig<K, O, A, T>> {
  let baseConfig: Partial<SlatePlugin<PluginConfig<K, O, A, T>>>;
  let initialExtension:
    | ((
        editor: SlateEditor,
        plugin: SlatePlugin<PluginConfig<K, O, A, T>>
      ) => Partial<SlatePlugin<PluginConfig<K, O, A, T>>>)
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
      __apiExtensions: [],
      __configuration: null,
      __extensions: initialExtension ? [initialExtension] : [],
      __transformExtensions: [],
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
    cloneDeep(config)
  ) as unknown as SlatePlugin<PluginConfig<K, O, A, T>>;

  plugin.configure = (config) => {
    const newPlugin = { ...plugin };
    newPlugin.__configuration = (ctx) =>
      isFunction(config) ? config(ctx as any) : config;

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.configurePlugin = (p, config) => {
    const newPlugin = { ...plugin };

    const configureNestedPlugin = (
      plugins: SlatePlugins
    ): { found: boolean; plugins: SlatePlugins } => {
      let found = false;

      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return createSlatePlugin({
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

    return createSlatePlugin(newPlugin);
  };

  plugin.extendApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      extension,
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extendTransforms = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__transformExtensions = [
      ...(newPlugin.__transformExtensions as any),
      extension,
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extend = (extendConfig) => {
    const newPlugin = { ...plugin };
    newPlugin.__extensions = [
      ...(newPlugin.__extensions as any),
      (ctx) =>
        isFunction(extendConfig) ? extendConfig(ctx as any) : extendConfig,
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extendPlugin = (p, extendConfig) => {
    const newPlugin = { ...plugin };

    const extendNestedPlugin = (
      plugins: SlatePlugins
    ): { found: boolean; plugins: SlatePlugins } => {
      let found = false;
      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return createSlatePlugin({
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
        createSlatePlugin({
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

    return createSlatePlugin(newPlugin);
  };

  // TODO react
  (plugin as any).withComponent = (component: PlatePluginComponent) => {
    return plugin.extend({
      component,
      // TODO react
    } as any) as any;
  };

  return plugin;
}

/**
 * Explicitly typed version of `createSlatePlugin`.
 *
 * @remarks
 *   While `createSlatePlugin` uses type inference, this function requires an
 *   explicit type parameter. Use this when you need precise control over the
 *   plugin's type structure or when type inference doesn't provide the desired
 *   result.
 */
export function createTSlatePlugin<C extends AnyPluginConfig = PluginConfig>(
  config:
    | ((
        editor: SlateEditor
      ) => Omit<Partial<SlatePlugin<C>>, keyof SlatePluginMethods>)
    | Omit<Partial<SlatePlugin<C>>, keyof SlatePluginMethods> = {}
): SlatePlugin<C> {
  return createSlatePlugin(config as any) as any;
}
