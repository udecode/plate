import merge from 'lodash/merge';

import type { PlateEditor, PlatePlugin, PlatePluginList } from '../types';

import { isFunction } from './misc';

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
 *     'nestedPlugin',
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
 * @param {Partial<PlatePlugin<K, O, A, T, S>>} config - The configuration
 *   object for the plugin.
 * @returns {PlatePlugin<K, O, A, T, S>} A new Plate plugin instance with the
 *   following properties and methods:
 *
 *   - All properties from the input config, merged with default values.
 *   - `configure`: A method to create a new plugin instance with updated options.
 *   - `extend`: A method to create a new plugin instance with additional
 *       configuration.
 *   - `extendPlugin`: A method to extend an existing plugin (including nested
 *       plugins) or add a new one if not found.
 */
export function createPlugin<
  K extends string = '',
  O = {},
  A = {},
  T = {},
  S = {},
>(
  config:
    | ((editor: PlateEditor) => Partial<PlatePlugin<K, O, A, T, S>>)
    | Partial<PlatePlugin<K, O, A, T, S>>
): PlatePlugin<K, O, A, T, S> {
  let baseConfig: Partial<PlatePlugin<K, O, A, T, S>>;
  let initialExtension:
    | ((
        editor: PlateEditor,
        plugin: PlatePlugin<K, O, A, T, S>
      ) => Partial<PlatePlugin<K, O, A, T, S>>)
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
      __extensions: initialExtension ? [initialExtension] : [],
      api: {},
      dependencies: [],
      editor: {},
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
  ) as PlatePlugin<K, O, A, T, S>;

  plugin.configure = (opt) => createPlugin(merge({}, plugin, { options: opt }));

  plugin.configurePlugin = (key, options) => {
    const newPlugin = { ...plugin };

    const configureNestedPlugin = (
      plugins: PlatePluginList
    ): { found: boolean; plugins: PlatePluginList } => {
      let found = false;
      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === key) {
          found = true;

          return createPlugin({
            ...nestedPlugin,
            options: merge({}, nestedPlugin.options, options),
          });
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

  plugin.extend = (extendConfig) => {
    const newPlugin = { ...plugin };
    newPlugin.__extensions = [
      ...(newPlugin.__extensions as any),
      (ctx) => (isFunction(extendConfig) ? extendConfig(ctx) : extendConfig),
    ];

    return createPlugin(newPlugin) as any;
  };

  plugin.extendPlugin = (key, extendConfig) => {
    const newPlugin = { ...plugin };

    const extendNestedPlugin = (
      plugins: PlatePluginList
    ): { found: boolean; plugins: PlatePluginList } => {
      let found = false;
      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === key) {
          found = true;

          return createPlugin({
            ...nestedPlugin,
            __extensions: [
              ...(nestedPlugin.__extensions as any),
              (ctx) =>
                isFunction(extendConfig) ? extendConfig(ctx) : extendConfig,
            ],
          });
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
            (ctx) =>
              isFunction(extendConfig)
                ? extendConfig(ctx as any)
                : (extendConfig as any),
          ],
          key,
        })
      );
    }

    return createPlugin(newPlugin);
  };

  return plugin;
}
