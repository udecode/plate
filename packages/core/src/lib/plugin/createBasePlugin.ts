import { isDefined } from '@udecode/utils';

import type { BaseEditor } from '../editor/SlateEditor';
import type {
  AnyPluginConfig,
  AnyPluginTx,
  InferApi,
  InferOptions,
  InferSelectors,
  InferTx,
  NodeComponent,
  PluginConfig,
  WithAnyKey,
} from './SlatePlugin';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  BasePlugins,
  NodeStaticProps,
  Parser,
  PlateEditorExtensionInput,
} from './BasePlugin';

import { isFunction } from '../../internal/utils/isFunction';
import { mergePlugins } from '../../internal/utils/mergePlugins';

type PluginInputInject<C extends AnyPluginConfig> = Omit<
  NonNullable<BasePlugin<C>['inject']>,
  'nodeProps' | 'targetPluginToInject'
> & {
  nodeProps?: Record<string, any> &
    NonNullable<BasePlugin<C>['inject']>['nodeProps'];
  targetPluginToInject?: (
    ctx: BasePluginContext<C> & { targetPlugin: string }
  ) => Partial<BasePlugin<AnyPluginConfig>>;
};

type PluginInputRender<C extends AnyPluginConfig> = Omit<
  NonNullable<BasePlugin<C>['render']>,
  'as'
> & {
  as?: keyof HTMLElementTagNameMap | NodeComponent;
};

type CreateBasePluginInput<C extends AnyPluginConfig = PluginConfig> = Record<
  string,
  unknown
> & {
  api?: InferApi<C>;
  extensions?: never;
  inject?: PluginInputInject<C> | null;
  key?: C['key'];
  node?: Record<string, any> & {
    props?: NodeStaticProps<C>;
  };
  options?: InferOptions<C>;
  parser?: Parser<WithAnyKey<C>>;
  parsers?: Record<string, any> & {
    html?: Record<string, any> & {
      deserializer?: Record<string, any> & {
        parse?: (options: any) => any;
        query?: (options: { element: HTMLElement }) => boolean;
      };
    };
  };
  plugins?: readonly unknown[];
  render?: PluginInputRender<C> | null;
  selectors?: InferSelectors<C>;
  tx?: InferTx<C>;
};

type PluginInputConfig<C extends AnyPluginConfig> = CreateBasePluginInput<C>;

type BasePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  State = {},
> = PluginInputConfig<PluginConfig<K, O, A, Tx, S, State>>;

type TypedBasePluginConfig<C extends AnyPluginConfig = PluginConfig> =
  PluginInputConfig<C>;

type NoInferConfig<T> = [T][T extends any ? 0 : never];

type ExplicitTypedBasePluginConfig<C extends AnyPluginConfig> = [C] extends [
  never,
]
  ? never
  : TypedBasePluginConfig<NoInferConfig<C>>;

type InferNestedPluginConfig<P> =
  P extends BasePlugin<infer C> ? C : P extends AnyPluginConfig ? P : never;

type InferNestedPluginConfigs<P> = P extends readonly unknown[]
  ? InferNestedPluginConfig<P[number]>
  : never;

const extensionArrayKeys = [
  '__apiExtensions',
  '__editorExtensions',
  '__selectorExtensions',
  '__txExtensions',
] as const;

type ExtensionArrayKey = (typeof extensionArrayKeys)[number];
type ExtensionArrayRecord = Partial<Record<ExtensionArrayKey, unknown[]>>;

const PLATE_IMPLICIT_EXTENSION_NAME = Symbol.for(
  'plate.core.implicitExtensionName'
);

type PlateEditorExtensionRecord = Record<PropertyKey, unknown> & {
  key?: unknown;
  name?: unknown;
};

const isObjectRecord = (
  extension: unknown
): extension is PlateEditorExtensionRecord =>
  typeof extension === 'object' && extension !== null;

const hasOwnName = (
  extension: unknown
): extension is PlateEditorExtensionRecord & { name: unknown } =>
  isObjectRecord(extension) && Object.hasOwn(extension, 'name');

const hasOwnKey = (
  extension: unknown
): extension is PlateEditorExtensionRecord & { key: unknown } =>
  isObjectRecord(extension) && Object.hasOwn(extension, 'key');

const omitExtensionKey = (extension: PlateEditorExtensionRecord) => {
  const { key: _key, ...extensionWithoutKey } = extension;

  return extensionWithoutKey;
};

const markImplicitExtensionName = <T extends object>(extension: T): T => {
  Object.defineProperty(extension, PLATE_IMPLICIT_EXTENSION_NAME, {
    configurable: true,
    value: true,
  });

  return extension;
};

const preserveExtensionArrays = <P extends object>(
  basePlugin: ExtensionArrayRecord,
  nextPlugin: P
): P => {
  const nextPluginRecord = nextPlugin as P & ExtensionArrayRecord;

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

const normalizePlateEditorExtensions = (
  pluginKey: string,
  input: PlateEditorExtensionInput | undefined,
  extensionKey?: string
) => {
  if (!input) return [];

  const extensions = Array.isArray(input) ? input : [input];

  return extensions.map((extension, index) => {
    const hasExplicitName = hasOwnName(extension);
    const key =
      extensionKey ?? (hasOwnKey(extension) ? extension.key : undefined);
    const name =
      typeof key === 'string'
        ? `${pluginKey}:${key}`
        : extensions.length === 1
          ? pluginKey
          : `${pluginKey}:${index}`;
    const extensionWithoutKey = hasOwnKey(extension)
      ? omitExtensionKey(extension)
      : extension;
    const normalized = {
      ...extensionWithoutKey,
      name: hasExplicitName ? extension.name : name,
    };

    return hasExplicitName ? normalized : markImplicitExtensionName(normalized);
  });
};

/**
 * Creates a new Plate plugin with the given configuration.
 *
 * @remarks
 *   - The plugin's key is required and specified by the K generic.
 *   - The `__extensions` array stores functions to be applied when `resolvePlugin`
 *       is called with an editor.
 *   - The `extendExtension` method installs Plite editor extensions.
 *   - The `extend` method adds plugin configuration to be applied later.
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
 * @template Tx - The plugin tx groups.
 * @template S - The type of the plugin storage.
 * @param {Partial<BasePlugin<K, O, A, Tx, S>>} config - The configuration
 *   object for the plugin.
 * @returns {BasePlugin<K, O, A, Tx, S>} A new Plate plugin instance with the
 *   following properties and methods:
 *
 *   - All properties from the input config, merged with default values.
 *   - `configure`: A method to create a new plugin instance with updated options.
 *   - `extend`: A method to create a new plugin instance with additional
 *       configuration.
 *   - `extendPlugin`: A method to extend an existing plugin (including nested
 *       plugins) or add a new one if not found.
 */
export function createBasePlugin<
  const K extends string,
  O = {},
  const A extends Record<string, any> = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
>(
  config: Omit<BasePluginConfig<K, O, A, Tx, S>, 'api' | 'key' | 'plugins'> & {
    api: A;
    key: K;
    plugins?: P;
  }
): BasePlugin<PluginConfig<K, O, A, Tx, S> | InferNestedPluginConfigs<P>>;
export function createBasePlugin<C extends AnyPluginConfig = never>(
  config:
    | ((editor: BaseEditor) => ExplicitTypedBasePluginConfig<C>)
    | ExplicitTypedBasePluginConfig<C>
): BasePlugin<C>;
export function createBasePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
>(
  config: BasePluginConfig<K, O, A, Tx, S> & {
    key: K;
    plugins?: P;
  }
): BasePlugin<PluginConfig<K, O, A, Tx, S> | InferNestedPluginConfigs<P>>;
export function createBasePlugin<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
>(
  config?:
    | ((editor: BaseEditor) => BasePluginConfig<K, O, A, Tx, S>)
    | BasePluginConfig<K, O, A, Tx, S>
): BasePlugin<PluginConfig<K, O, A, Tx, S>>;
export function createBasePlugin(config: any = {}): any {
  let baseConfig: Partial<BasePlugin>;
  let initialExtension: any;
  const recreatePlugin = createBasePlugin as (config: any) => any;

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
      __editorExtensions: [],
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

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.configurePlugin = ((
    p: BasePlugin<any> | { key: string },
    config: any
  ) => {
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
            recreatePlugin({
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

      return { found, plugins: updatedPlugins as BasePlugins };
    };

    const result = configureNestedPlugin(newPlugin.plugins as any);
    newPlugin.plugins = result.plugins as any;

    // We're not adding a new plugin if not found

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  }) as typeof plugin.configurePlugin;

  plugin.extendEditorApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: false },
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendSelectors = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__selectorExtensions = [
      ...(newPlugin.__selectorExtensions as any),
      extension,
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendApi = (extension) => {
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: true },
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendTx = (extension: any) => {
    const newPlugin = { ...plugin };
    const txExtension = ((ctx: any) => ({
      [ctx.plugin.key]: extension(ctx),
    })) as any;

    txExtension.__plateOwnTxGroup = true;

    newPlugin.__txExtensions = [
      ...(newPlugin.__txExtensions as any),
      txExtension,
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendTxGroup = (key, extension) => {
    const newPlugin = { ...plugin };
    const txExtension = ((ctx: any) => ({
      [key]: extension(ctx),
    })) as any;

    txExtension.__plateTxGroupKey = key;

    newPlugin.__txExtensions = [
      ...(newPlugin.__txExtensions as any),
      txExtension,
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
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

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendExtension = (extensionOrKey: any, maybeExtension?: any) => {
    const newPlugin = { ...plugin };
    const hasKeyArgument = typeof extensionOrKey === 'string';
    const extension = hasKeyArgument ? maybeExtension : extensionOrKey;
    const extensionKey = hasKeyArgument ? extensionOrKey : undefined;

    newPlugin.__editorExtensions = [
      ...(newPlugin.__editorExtensions as any),
      (ctx: any) =>
        normalizePlateEditorExtensions(
          ctx.plugin.key,
          isFunction(extension) ? extension(ctx) : extension,
          extensionKey
        ),
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.clone = () => mergePlugins(plugin);

  plugin.extendPlugin = ((p: AnyBasePlugin | { key: string }, extendConfig) => {
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
            recreatePlugin({
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

      return { found, plugins: updatedPlugins as BasePlugins };
    };

    const result = extendNestedPlugin(newPlugin.plugins as any);
    newPlugin.plugins = result.plugins as any;

    // If the plugin wasn't found at any level, add it at the top level
    if (!result.found) {
      newPlugin.plugins.push(
        recreatePlugin({
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

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  }) as typeof plugin.extendPlugin;

  plugin.withComponent = (component) =>
    plugin.extend({
      node: { component },
      render: { node: component },
    }) as any;

  return plugin;
}
