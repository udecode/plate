import { type Modify, isDefined } from '@udecode/utils';

import type { BaseEditor } from '../editor/BaseEditor';
import type { AnyPluginConfig, PluginConfig } from './PluginBase';
import type { BasePlugin, BasePluginMethods, BasePlugins } from './BasePlugin';

import { isFunction } from '../../internal/utils/isFunction';
import { mergePlugins } from '../../internal/utils/mergePlugins';

type BasePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
> = Omit<
  Partial<
    Modify<
      BasePlugin<PluginConfig<K, O, A, T, S>>,
      { node?: Partial<BasePlugin<PluginConfig<K, O, A, T, S>>['node']> }
    >
  >,
  keyof BasePluginMethods | 'optionsStore'
>;

type TypedBasePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<
    Modify<
      BasePlugin<C>,
      {
        node?: Partial<BasePlugin<C>['node']>;
      }
    >
  >,
  keyof BasePluginMethods | 'optionsStore'
>;

const extensionArrayKeys = [
  '__apiExtensions',
  '__selectorExtensions',
  '__txExtensions',
] as const;

const preserveExtensionArrays = <P>(basePlugin: any, nextPlugin: P): P => {
  const nextPluginRecord = nextPlugin as any;

  for (const key of extensionArrayKeys) {
    const baseExtensions = basePlugin[key] ?? [];
    const nextExtensions = nextPluginRecord[key] ?? [];

    if (baseExtensions.length === 0) continue;

    nextPluginRecord[key] = [
      ...baseExtensions,
      ...nextExtensions.filter(
        (extension: unknown) => !baseExtensions.includes(extension as never)
      ),
    ];
  }

  return nextPlugin;
};

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
 *   const myPlugin = createBasePlugin<
 *     'myPlugin',
 *     MyOptions,
 *     MyApi,
 *   >({
 *     key: 'myPlugin',
 *     options: { someOption: true },
 *   });
 *
 *   const extendedPlugin = myPlugin.extend({
 *     options: { anotherOption: false },
 *   });
 *
 *   const pluginWithNestedExtension = extendedPlugin.extendPlugin(
 *     nestedPlugin,
 *     { options: { nestedOption: true } }
 *   );
 *
 * @template K - The literal type of the plugin key.
 * @template O - The type of the plugin options.
 * @template A - The type of the plugin utilities.
 * @template T - Reserved legacy generic slot. New plugin commands use `tx`.
 * @template S - The type of the plugin storage.
 * @param {Partial<BasePlugin<K, O, A, T, S>>} config - The configuration
 *   object for the plugin.
 * @returns {BasePlugin<K, O, A, T, S>} A new Plate plugin instance with the
 *   following properties and methods:
 *
 *   - All properties from the input config, merged with default values.
 *   - `configure`: A method to create a new plugin instance with updated options.
 *   - `extend`: A method to create a new plugin instance with additional
 *       configuration.
 *   - `extendPlugin`: A method to extend an existing plugin (including nested
 *       plugins) or add a new one if not found.
 */
export function createBasePlugin<C extends AnyPluginConfig>(
  config:
    | ((editor: BaseEditor) => TypedBasePluginConfig<C>)
    | TypedBasePluginConfig<C>
): BasePlugin<C>;
export function createBasePlugin<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
>(
  config?:
    | ((editor: BaseEditor) => BasePluginConfig<K, O, A, T, S>)
    | BasePluginConfig<K, O, A, T, S>
): BasePlugin<PluginConfig<K, O, A, T, S>>;
export function createBasePlugin(config: any = {}): any {
  let baseConfig: Partial<BasePlugin>;
  let initialExtension: any;

  if (isFunction(config)) {
    baseConfig = { key: '' };
    initialExtension = (editor: any) => config(editor);
  } else {
    baseConfig = config as any;
  }

  const key = baseConfig.key ?? '';

  const plugin = mergePlugins(
    {
      key,
      __apiExtensions: [],
      __configuration: null,
      __extensions: initialExtension ? [initialExtension] : [],
      __selectorExtensions: [],
      __txExtensions: [],
      api: {},
      dependencies: [],
      editor: {},
      handlers: {},
      inject: {},
      node: { type: key },
      options: {},
      override: {},
      parser: {},
      parsers: {},
      plugins: [],
      priority: 100,
      render: {},
      rules: {},
      shortcuts: {},
      editorExtensions: [],
      inputRules: [],
      tx: {},
    },
    config
  ) as unknown as BasePlugin;

  if (plugin.node.isLeaf && !isDefined(plugin.node.isDecoration)) {
    plugin.node.isDecoration = true;
  }

  plugin.configure = (config) => {
    const newPlugin = { ...plugin };
    newPlugin.__configuration = (ctx) =>
      isFunction(config) ? config(ctx as any) : config;

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.configurePlugin = (p, config) => {
    const newPlugin = { ...plugin };

    const configureNestedPlugin = (
      plugins: BasePlugins
    ): { found: boolean; plugins: BasePlugins } => {
      let found = false;

      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return preserveExtensionArrays(
            nestedPlugin,
            createBasePlugin({
              ...nestedPlugin,
              __configuration: (ctx: any) =>
                isFunction(config) ? config(ctx) : config,
            } as any)
          );
        }
        if (nestedPlugin.plugins && nestedPlugin.plugins.length > 0) {
          const result = configureNestedPlugin(nestedPlugin.plugins);

          if (result.found) {
            found = true;

            return { ...nestedPlugin, plugins: result.plugins };
          }
        }

        return nestedPlugin;
      });

      return { found, plugins: updatedPlugins };
    };

    const result = configureNestedPlugin(newPlugin.plugins as any);
    newPlugin.plugins = result.plugins as any;

    // We're not adding a new plugin if not found

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin));
  };

  plugin.extendEditorApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: false },
    ];

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.extendSelectors = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__selectorExtensions = [
      ...(newPlugin.__selectorExtensions as any),
      extension,
    ];

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.extendApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: true },
    ];

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.extendTx = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__txExtensions = [
      ...(newPlugin.__txExtensions as any),
      (ctx) => ({
        [ctx.plugin.key]: extension(ctx),
      }),
    ];

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.extendTxGroup = (key, extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__txExtensions = [
      ...(newPlugin.__txExtensions as any),
      (ctx) => ({
        [key]: extension(ctx),
      }),
    ];

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.overrideEditor = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      {
        extension,
        isOverride: true,
        isLegacyTransform: false,
        isPluginSpecific: false,
      },
    ];

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.extend = (extendConfig) => {
    let newPlugin = { ...plugin };

    if (isFunction(extendConfig)) {
      newPlugin.__extensions = [
        ...(newPlugin.__extensions as any),
        extendConfig,
      ];
    } else {
      newPlugin = mergePlugins(newPlugin, extendConfig as any);
    }

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin) as any);
  };

  plugin.clone = () => mergePlugins(plugin);

  plugin.extendPlugin = (p, extendConfig) => {
    const newPlugin = { ...plugin };

    const extendNestedPlugin = (
      plugins: BasePlugins
    ): { found: boolean; plugins: BasePlugins } => {
      let found = false;
      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return preserveExtensionArrays(
            nestedPlugin,
            createBasePlugin({
              ...nestedPlugin,
              __extensions: [
                ...(nestedPlugin.__extensions as any),
                (ctx: any) =>
                  isFunction(extendConfig) ? extendConfig(ctx) : extendConfig,
              ],
            } as any)
          );
        }
        if (nestedPlugin.plugins && nestedPlugin.plugins.length > 0) {
          const result = extendNestedPlugin(nestedPlugin.plugins);

          if (result.found) {
            found = true;

            return { ...nestedPlugin, plugins: result.plugins };
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
        createBasePlugin({
          key: p.key,
          __extensions: [
            (ctx: any) =>
              isFunction(extendConfig)
                ? extendConfig(ctx as any)
                : (extendConfig as any),
          ],
        } as any)
      );
    }

    return preserveExtensionArrays(plugin, createBasePlugin(newPlugin));
  };

  plugin.withComponent = (component) =>
    plugin.extend({
      node: { component },
      render: { node: component },
    }) as any;

  return plugin;
}
