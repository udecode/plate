import type { Modify } from '@udecode/utils';

import type { SlateEditor } from '../editor/SlateEditor';
import type { AnyPluginConfig, PluginConfig } from './BasePlugin';
import type {
  SlatePlugin,
  SlatePluginMethods,
  SlatePlugins,
} from './SlatePlugin';

import { mergeWithoutArray } from '../../internal/mergeWithoutArray';
import { isFunction } from '../utils/misc/isFunction';

type SlatePluginConfig<K extends string = any, O = {}, A = {}, T = {}> = Omit<
  Partial<
    Modify<
      SlatePlugin<PluginConfig<K, O, A, T>>,
      {
        node?: Partial<SlatePlugin<PluginConfig<K, O, A, T>>['node']>;
      }
    >
  >,
  'optionsStore' | keyof SlatePluginMethods
>;

type TSlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<
    Modify<
      SlatePlugin<C>,
      {
        node?: Partial<SlatePlugin<C>['node']>;
      }
    >
  >,
  'optionsStore' | keyof SlatePluginMethods
>;

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
    | ((editor: SlateEditor) => SlatePluginConfig<K, O, A, T>)
    | SlatePluginConfig<K, O, A, T> = {}
): SlatePlugin<PluginConfig<K, O, A, T>> {
  let baseConfig: Partial<SlatePlugin<PluginConfig<K, O, A, T>>>;
  let initialExtension: any;

  if (isFunction(config)) {
    baseConfig = { key: '' as K };
    initialExtension = (editor: any) => config(editor);
  } else {
    baseConfig = config as any;
  }

  const key = baseConfig.key ?? '';

  const plugin = mergeWithoutArray(
    {
      __apiExtensions: [],
      __configuration: null,
      __extensions: initialExtension ? [initialExtension] : [],
      __optionExtensions: [],
      api: {},
      dependencies: [],
      editor: {},
      handlers: {},
      inject: {},
      key,
      node: { type: key },
      options: {},
      override: {},
      parser: {},
      parsers: {},
      plugins: [],
      priority: 100,
      render: {},
      shortcuts: {},
      transforms: {},
    },
    config
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

  plugin.extendEditorApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: false },
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extendOptions = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__optionExtensions = [
      ...(newPlugin.__optionExtensions as any),
      extension,
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extendApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: true },
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extendEditorTransforms = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: false, isTransform: true },
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extendTransforms = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: true, isTransform: true },
    ];

    return createSlatePlugin(newPlugin) as any;
  };

  plugin.extend = (extendConfig) => {
    let newPlugin = { ...plugin };

    if (isFunction(extendConfig)) {
      newPlugin.__extensions = [
        ...(newPlugin.__extensions as any),
        extendConfig,
      ];
    } else {
      newPlugin = mergeWithoutArray({}, newPlugin, extendConfig);
    }

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
    | ((editor: SlateEditor) => TSlatePluginConfig<C>)
    | TSlatePluginConfig<C> = {}
): SlatePlugin<C> {
  return createSlatePlugin(config as any) as any;
}
