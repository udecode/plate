import merge from 'lodash/merge';

import type { PlatePlugin } from '../types';

import { isFunction } from './misc';

/**
 * Creates a new Plate plugin with the given configuration.
 *
 * @remarks
 *   - The plugin's key defaults to 'unnamed' if not provided in the config.
 *   - The `__extensions` array stores functions to be applied when `resolvePlugin`
 *       is called with an editor.
 *   - The `extend` method adds new extensions to be applied later.
 *   - The `extendPlugin` method extends an existing plugin (including nested
 *       plugins) or adds a new one if not found.
 *
 * @example
 *   const myPlugin = createPlugin({
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
 * @template O - The type of the plugin options.
 * @template T - The type of the plugin transforms.
 * @template Q - The type of the plugin queries.
 * @template S - The type of the plugin storage.
 * @param {Partial<PlatePlugin<O, T, Q, S>>} config - The configuration object
 *   for the plugin.
 * @returns {PlatePlugin<O, T, Q, S>} A new Plate plugin instance with the
 *   following properties and methods:
 *
 *   - All properties from the input config, merged with default values.
 *   - `configure`: A method to create a new plugin instance with updated options.
 *   - `extend`: A method to create a new plugin instance with additional
 *       configuration.
 *   - `extendPlugin`: A method to extend an existing plugin (including nested
 *       plugins) or add a new one if not found.
 */
export function createPlugin<O = {}, T = {}, Q = {}, S = {}>(
  config: Partial<PlatePlugin<O, T, Q, S>>
): PlatePlugin<O, T, Q, S> {
  const key = config.key ?? 'unnamed';

  const plugin = merge(
    {},
    {
      __extensions: [],
      editor: {},
      inject: {},
      key,
      options: {},
      plugins: [],
      queries: {},
      transforms: {},
      type: key,
    },
    config
  ) as PlatePlugin<O, T, Q, S>;

  plugin.configure = (opt) => createPlugin(merge({}, plugin, { options: opt }));

  plugin.extend = (extendConfig) => {
    const newPlugin = { ...plugin };
    newPlugin.__extensions = [
      ...(newPlugin.__extensions as any),
      (editor, p) =>
        isFunction(extendConfig) ? extendConfig(editor, p) : extendConfig,
    ];

    return createPlugin(newPlugin) as any;
  };

  plugin.extendPlugin = (key, extendConfig) => {
    const newPlugin = { ...plugin };

    const extendNestedPlugin = (
      plugins: PlatePlugin[]
    ): { found: boolean; plugins: PlatePlugin[] } => {
      let found = false;
      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === key) {
          found = true;

          return createPlugin({
            ...nestedPlugin,
            __extensions: [
              ...(nestedPlugin.__extensions as any),
              (editor, p) =>
                isFunction(extendConfig)
                  ? extendConfig(editor, p as any)
                  : extendConfig,
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
            (editor, p) =>
              isFunction(extendConfig)
                ? extendConfig(editor, p)
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
