import type {
  AnyPluginConfig,
  AnyPluginTx,
  InferApi,
  InferOptions,
  InferSelectors,
  InferTx,
  PluginConfig,
  PluginReference,
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaModel,
  WithAnyKey,
} from './PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  BasePlugins,
  EditorShortcut,
  Parser,
  PlateEditorExtensionInput,
  PluginShortcutInput,
} from './BasePlugin';

import { isFunction } from '../../internal/utils/isFunction';
import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  mergePlugins,
} from '../../internal/utils/mergePlugins';

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

type PluginInputRender<C extends AnyPluginConfig> = NonNullable<
  BasePlugin<C>['render']
>;

type ContextualPluginInput<C extends AnyPluginConfig> = {
  decorate?: NoInfer<BasePlugin<C>['decorate']>;
  editOnly?: NoInfer<BasePlugin<C>['editOnly']>;
  enabled?: NoInfer<BasePlugin<C>['enabled']>;
  extensions?: never;
  handlers?: NoInfer<BasePlugin<C>['handlers']>;
  inject?: NoInfer<PluginInputInject<C> | null>;
  host?: NoInfer<BasePlugin<C>['host']>;
  inputRules?: NoInfer<BasePlugin<C>['inputRules']>;
  override?: NoInfer<BasePlugin<C>['override']>;
  parser?: NoInfer<Parser<WithAnyKey<C>>>;
  parsers?: NoInfer<BasePlugin<C>['parsers']>;
  priority?: number;
  render?: NoInfer<PluginInputRender<C> | null>;
  rules?: NoInfer<BasePlugin<C>['rules']>;
  shortcuts?: NoInfer<BasePlugin<C>['shortcuts']>;
  targetPluginKeys?: NoInfer<BasePlugin<C>['targetPluginKeys']>;
  transformInitialValue?: NoInfer<BasePlugin<C>['transformInitialValue']>;
};

type CreateBasePluginInput<C extends AnyPluginConfig = PluginConfig> =
  ContextualPluginInput<C> & {
    api?: InferApi<C>;
    dependencies?: C['dependencies'];
    key?: C['key'];
    options?: InferOptions<C>;
    plugins?: NonNullable<C['plugins']>;
    schema?: BasePlugin<C>['schema'];
    selectors?: InferSelectors<C>;
    tx?: InferTx<C>;
    type?: string;
  };

type PluginInputConfig<C extends AnyPluginConfig> = CreateBasePluginInput<C>;

type TypedBasePluginConfig<C extends AnyPluginConfig = PluginConfig> =
  PluginInputConfig<C>;

type NoInferConfig<T> = [T][T extends any ? 0 : never];

type ExplicitTypedBasePluginConfig<C extends AnyPluginConfig> = [C] extends [
  never,
]
  ? never
  : Omit<TypedBasePluginConfig<NoInferConfig<C>>, 'shortcuts'> & {
      shortcuts?: never;
    };

type InferredPluginSchemaFactory<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly unknown[],
  TType extends string,
  TDeclaration extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<PluginConfig<K, O, A, Tx, S, {}, D>, TType>
) => TDeclaration;

type InferredBaseShortcutRecord = Record<
  string,
  EditorShortcut | null | undefined
>;

type InferredBasePluginInput<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  P extends readonly unknown[],
  D extends readonly unknown[],
  TType extends string,
  TShortcuts extends InferredBaseShortcutRecord,
> = Omit<
  ContextualPluginInput<
    PluginConfig<K, O, A, Tx, S, {}, D, readonly PluginReference[]>
  >,
  | 'api'
  | 'dependencies'
  | 'key'
  | 'options'
  | 'plugins'
  | 'schema'
  | 'selectors'
  | 'shortcuts'
  | 'tx'
  | 'type'
> & {
  api?: A;
  dependencies?: D;
  key: K;
  options?: O;
  plugins?: P;
  selectors?: S;
  shortcuts?: PluginShortcutInput<
    PluginConfig<K, O, A, Tx, S, {}, D>,
    TShortcuts
  >;
  tx?: Tx;
  type?: TType;
};

const extensionArrayKeys = [
  '__apiExtensions',
  '__editorExtensions',
  '__selectorExtensions',
  '__txExtensions',
] as const;

type ExtensionArrayKey = (typeof extensionArrayKeys)[number];
type ExtensionArrayRecord = Partial<Record<ExtensionArrayKey, unknown[]>>;

type MutableBasePlugin = Omit<
  BasePlugin<AnyPluginConfig>,
  'plugins' | 'targetPluginKeys'
> & {
  plugins: BasePlugins;
  targetPluginKeys: readonly string[];
};

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

const assertNoLegacyNode = (configuration: unknown) => {
  if (
    configuration &&
    typeof configuration === 'object' &&
    Object.hasOwn(configuration, 'node')
  ) {
    throw new Error(
      'Plate plugin `node` configuration is unsupported. Use top-level `type`, `schema`, `render`, and `host`.'
    );
  }
};

const assertRuntimeCallback = (
  value: unknown,
  kind: 'configure' | 'extension'
) => {
  if (!value || typeof value !== 'object') {
    throw new Error(`Plate plugin ${kind} callbacks must return an object.`);
  }

  assertNoLegacyNode(value);

  if (kind === 'configure') {
    for (const key of Object.keys(value)) {
      if (!['handlers', 'options', 'render', 'shortcuts'].includes(key)) {
        throw new Error(
          `Plate plugin configure callbacks cannot define \`${key}\`. Use \`.extend\` for additive plugin behavior or an object configuration for model fields.`
        );
      }
    }
  }

  for (const key of [
    'host',
    'parser',
    'parsers',
    'schema',
    'targetPluginKeys',
    'type',
  ] as const) {
    if (Object.hasOwn(value, key)) {
      throw new Error(
        `Plate plugin ${kind} callbacks cannot define \`${key}\`. Use an object configuration or a schema factory over plugin options.`
      );
    }
  }
  const render = Reflect.get(value, 'render');

  if (
    render &&
    typeof render === 'object' &&
    Object.hasOwn(render, 'isDecoration')
  ) {
    throw new Error(
      `Plate plugin ${kind} callbacks cannot define \`render.isDecoration\`. Use an object configuration.`
    );
  }
};

const snapshotModelConfiguration = (configuration: any) => {
  assertNoLegacyNode(configuration);

  // Snapshot model identity here. The complete descriptor graph is snapshotted
  // at editor publication, where nominal plugin references and opaque host
  // resources can be preserved instead of cloned as plain data.
  const snapshot = { ...configuration };

  if (Object.hasOwn(snapshot, 'schema')) {
    snapshot.schema = freezePluginDescriptorValue(snapshot.schema);
  }
  if (Object.hasOwn(snapshot, 'targetPluginKeys')) {
    snapshot.targetPluginKeys = Object.freeze([...snapshot.targetPluginKeys]);
  }

  return Object.freeze(snapshot);
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
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
  const D extends readonly unknown[] = readonly [],
  const TType extends string = K,
  const TShortcuts extends InferredBaseShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredBasePluginInput<K, O, A, Tx, S, P, D, TType, TShortcuts> & {
    schema: InferredPluginSchemaFactory<
      K,
      NoInfer<O>,
      NoInfer<A>,
      NoInfer<Tx>,
      NoInfer<S>,
      NoInfer<D>,
      TType,
      TDeclaration
    >;
  }
): BasePlugin<
  PluginConfig<
    K,
    O,
    A,
    Tx,
    S,
    {},
    D,
    P,
    PluginSchemaModel<
      TType,
      InferredPluginSchemaFactory<K, O, A, Tx, S, D, TType, TDeclaration>
    >
  >
>;
export function createBasePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
  const D extends readonly unknown[] = readonly [],
  const TType extends string = K,
  const TShortcuts extends InferredBaseShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredBasePluginInput<K, O, A, Tx, S, P, D, TType, TShortcuts> & {
    schema: TDeclaration;
  }
): BasePlugin<
  PluginConfig<K, O, A, Tx, S, {}, D, P, PluginSchemaModel<TType, TDeclaration>>
>;
export function createBasePlugin<C extends AnyPluginConfig = never>(
  config: ExplicitTypedBasePluginConfig<C>
): BasePlugin<C>;
export function createBasePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
  const D extends readonly unknown[] = readonly [],
  const TType extends string = K,
  const TShortcuts extends InferredBaseShortcutRecord = {},
>(
  config: InferredBasePluginInput<K, O, A, Tx, S, P, D, TType, TShortcuts> & {
    schema?: null;
  }
): BasePlugin<
  PluginConfig<K, O, A, Tx, S, {}, D, P, PluginSchemaModel<TType, null>>
>;
export function createBasePlugin(config: any = {}): any {
  const recreatePlugin = createBasePlugin as (config: any) => any;
  const baseConfig = config as Partial<AnyBasePlugin>;

  assertNoLegacyNode(baseConfig);

  const key = baseConfig.key ?? '';

  const plugin = mergePlugins(
    {
      key,
      __apiExtensions: [],
      __configurationLayers: [],
      __editorApi: {},
      __editorExtensions: [],
      __extensions: [],
      __selectorExtensions: [],
      __txExtensions: [],
      dependencies: [],
      handlers: {},
      inject: {},
      host: {},
      options: {},
      override: {},
      parser: {},
      parsers: {},
      plugins: [],
      priority: 100,
      render: {},
      rules: {},
      schema: null,
      shortcuts: {},
      targetPluginKeys: [],
      inputRules: [],
      tx: {},
      type: key,
    },
    config
  ) as unknown as MutableBasePlugin;

  plugin.schema = freezePluginDescriptorValue(plugin.schema);
  (plugin as { targetPluginKeys: readonly string[] }).targetPluginKeys =
    Object.freeze([...plugin.targetPluginKeys]);

  const assertAuthoringOpen = (method: string) => {
    if (!(plugin as any).__configured) return;

    throw new Error(
      `Plate plugin '${plugin.key}' is already configured. Call .${method}() before .configure().`
    );
  };

  plugin.configure = (config: any) => {
    assertAuthoringOpen('configure');
    const newPlugin = { ...plugin };
    (newPlugin as any).__configured = true;

    if (isFunction(config)) {
      const value = (ctx: unknown) => {
        const configuration = config(ctx);

        assertRuntimeCallback(configuration, 'configure');

        return configuration;
      };

      newPlugin.__configurationLayers = [
        ...newPlugin.__configurationLayers,
        Object.freeze({ kind: 'context' as const, value }),
      ];

      return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
    }
    if (typeof config.type === 'string') {
      newPlugin.type = config.type;
    }
    newPlugin.__configurationLayers = [
      ...newPlugin.__configurationLayers,
      Object.freeze({
        kind: 'object' as const,
        value: snapshotModelConfiguration(config),
      }),
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.configurePlugin = ((
    p: BasePlugin<any> | { key: string },
    config: any
  ) => {
    assertAuthoringOpen('configurePlugin');
    const newPlugin = { ...plugin };

    const configureNestedPlugin = (
      plugins: readonly AnyBasePlugin[]
    ): { found: boolean; plugins: BasePlugins } => {
      let found = false;

      const updatedPlugins = plugins.map((nestedPlugin) => {
        if (nestedPlugin.key === p.key) {
          found = true;

          return preserveExtensionArrays(
            nestedPlugin,
            recreatePlugin({
              ...nestedPlugin,
              __configurationLayers: [
                ...nestedPlugin.__configurationLayers,
                Object.freeze({
                  kind: 'object' as const,
                  value: snapshotModelConfiguration(config),
                }),
              ],
            } as any)
          );
        }
        if (nestedPlugin.plugins && nestedPlugin.plugins.length > 0) {
          const result = configureNestedPlugin(nestedPlugin.plugins);

          if (result.found) {
            found = true;

            return preserveExtensionArrays(
              nestedPlugin,
              recreatePlugin({
                ...nestedPlugin,
                plugins: result.plugins,
              })
            );
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
    assertAuthoringOpen('extendEditorApi');
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: false },
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendSelectors = (extension) => {
    assertAuthoringOpen('extendSelectors');
    const newPlugin = { ...plugin };
    newPlugin.__selectorExtensions = [
      ...(newPlugin.__selectorExtensions as any),
      extension,
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendApi = (extension) => {
    assertAuthoringOpen('extendApi');
    const newPlugin = { ...plugin };
    newPlugin.__apiExtensions = [
      ...(newPlugin.__apiExtensions as any),
      { extension, isPluginSpecific: true },
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendTx = (extension: any) => {
    assertAuthoringOpen('extendTx');
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
    assertAuthoringOpen('extendTxGroup');
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

  plugin.extend = (extendConfig: any) => {
    assertAuthoringOpen('extend');
    let newPlugin = { ...plugin };

    if (isFunction(extendConfig)) {
      newPlugin.__extensions = [
        ...(newPlugin.__extensions as any),
        (ctx: unknown) => {
          const extension = extendConfig(ctx as never);

          assertRuntimeCallback(extension, 'extension');

          return extension;
        },
      ];
    } else {
      assertNoLegacyNode(extendConfig);
      newPlugin = mergePlugins(newPlugin, extendConfig as any);
    }

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendExtension = (extensionOrKey: any, maybeExtension?: any) => {
    assertAuthoringOpen('extendExtension');
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

  plugin.clone = () => {
    assertAuthoringOpen('clone');

    return preserveExtensionArrays(plugin, recreatePlugin({ ...plugin }));
  };

  plugin.extendPlugin = ((p: AnyBasePlugin | { key: string }, extendConfig) => {
    assertAuthoringOpen('extendPlugin');
    const newPlugin = { ...plugin };

    const extendNestedPlugin = (
      plugins: readonly AnyBasePlugin[]
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
                () => snapshotModelConfiguration(extendConfig),
              ],
            } as any)
          );
        }
        if (nestedPlugin.plugins && nestedPlugin.plugins.length > 0) {
          const result = extendNestedPlugin(nestedPlugin.plugins);

          if (result.found) {
            found = true;

            return preserveExtensionArrays(
              nestedPlugin,
              recreatePlugin({
                ...nestedPlugin,
                plugins: result.plugins,
              })
            );
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
          __extensions: [() => snapshotModelConfiguration(extendConfig)],
        } as any)
      );
    }

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  }) as typeof plugin.extendPlugin;

  plugin.withComponent = (component) => {
    assertAuthoringOpen('withComponent');

    return plugin.extend({
      render: { node: component },
    }) as any;
  };

  return brandPluginDescriptor(plugin);
}
