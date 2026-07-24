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
} from './PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
  EditorShortcut,
  PlateEditorExtensionInput,
  PluginShortcutInput,
} from './BasePlugin';

import { isFunction } from '../../internal/utils/isFunction';
import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  isNominalPluginDescriptor,
  mergePlugins,
  registerHtmlCodecSchemaFamilies,
} from '../../internal/utils/mergePlugins';

type PluginInputInject<C extends AnyPluginConfig> = Omit<
  NonNullable<BasePlugin<C>['inject']>,
  'nodeProps'
> & {
  nodeProps?: Record<string, any> &
    NonNullable<BasePlugin<C>['inject']>['nodeProps'];
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
  inputRules?: NoInfer<BasePlugin<C>['inputRules']>;
  override?: NoInfer<BasePlugin<C>['override']>;
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
    key: C['key'];
    options?: InferOptions<C>;
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
  : Omit<TypedBasePluginConfig<NoInferConfig<C>>, 'key' | 'shortcuts'> & {
      key: C['key'];
      shortcuts?: never;
    };

type InferredPluginSchemaFactory<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly PluginReference[],
  Enabled extends boolean,
  TType extends string,
  TDeclaration extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<
    PluginConfig<K, O, A, Tx, S, {}, D, never, {}, Enabled>,
    TType
  >
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
  D extends readonly PluginReference[],
  Enabled extends boolean,
  TType extends string,
  TShortcuts extends InferredBaseShortcutRecord,
> = Omit<
  ContextualPluginInput<
    PluginConfig<K, O, A, Tx, S, {}, D, never, {}, Enabled>
  >,
  | 'api'
  | 'dependencies'
  | 'enabled'
  | 'key'
  | 'options'
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
  selectors?: S;
  shortcuts?: PluginShortcutInput<
    PluginConfig<K, O, A, Tx, S, {}, D, never, {}, Enabled>,
    TShortcuts
  >;
  tx?: Tx;
  type?: TType;
  enabled?: Enabled;
};

const extensionArrayKeys = [
  '__apiExtensions',
  '__codecExtensions',
  '__htmlCodecExtensions',
  '__editorExtensions',
  '__readExtensions',
  '__selectorExtensions',
  '__txExtensions',
] as const;

type ExtensionArrayKey = (typeof extensionArrayKeys)[number];
type ExtensionArrayRecord = Partial<
  Record<ExtensionArrayKey, readonly unknown[]>
>;

type MutableBasePlugin = Omit<
  BasePlugin<AnyPluginConfig>,
  'targetPluginKeys'
> & {
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
      'Plate plugin `node` configuration is unsupported. Use top-level `type`, `schema`, and `render`.'
    );
  }
};

const assertNoBaseCodecField = (configuration: unknown) => {
  if (
    configuration &&
    typeof configuration === 'object' &&
    Object.hasOwn(configuration, 'codecs')
  ) {
    throw new Error(
      'Plate plugin `codecs` configuration is unsupported. Use `.extendCodecs()`.'
    );
  }
};

const assertNoPluginChildren = (configuration: unknown) => {
  if (
    configuration &&
    typeof configuration === 'object' &&
    Object.hasOwn(configuration, 'plugins')
  ) {
    throw new Error(
      'Plate plugin descriptors cannot define top-level `plugins`. Use `dependencies` for required capabilities or include optional plugins in the consumer plugin array.'
    );
  }
};

const assertNoRelationshipMutation = (
  configuration: unknown,
  kind: 'configure' | 'extend'
) => {
  if (!configuration || typeof configuration !== 'object') return;

  for (const key of ['dependencies', 'plugins'] as const) {
    if (Object.hasOwn(configuration, key)) {
      throw new Error(
        `Plate plugin ${kind} cannot define \`${key}\`. Declare relationship membership when creating the plugin or during static Base-to-React conversion.`
      );
    }
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
  assertNoBaseCodecField(value);
  assertNoRelationshipMutation(value, kind === 'extension' ? 'extend' : kind);

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
  assertNoBaseCodecField(configuration);

  // Snapshot model identity here. The complete descriptor graph is snapshotted
  // at editor publication, where nominal plugin references and opaque extension
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

export const normalizePlateEditorExtensions = (
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
 */
export function createBasePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly PluginReference[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TShortcuts extends InferredBaseShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredBasePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    Enabled,
    TType,
    TShortcuts
  > & {
    schema: InferredPluginSchemaFactory<
      K,
      NoInfer<O>,
      NoInfer<A>,
      NoInfer<Tx>,
      NoInfer<S>,
      NoInfer<D>,
      NoInfer<Enabled>,
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
    PluginSchemaModel<
      TType,
      InferredPluginSchemaFactory<
        K,
        O,
        A,
        Tx,
        S,
        D,
        Enabled,
        TType,
        TDeclaration
      >
    >,
    {},
    Enabled
  >
>;
export function createBasePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly PluginReference[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TShortcuts extends InferredBaseShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredBasePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    Enabled,
    TType,
    TShortcuts
  > & {
    schema: TDeclaration;
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
    PluginSchemaModel<TType, TDeclaration>,
    {},
    Enabled
  >
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
  const D extends readonly PluginReference[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TShortcuts extends InferredBaseShortcutRecord = {},
>(
  config: InferredBasePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    Enabled,
    TType,
    TShortcuts
  > & {
    schema?: null;
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
    PluginSchemaModel<TType, null>,
    {},
    Enabled
  >
>;
export function createBasePlugin(config: any): any {
  const baseConfig = config as Partial<AnyBasePlugin>;

  assertNoLegacyNode(baseConfig);
  assertNoBaseCodecField(baseConfig);
  assertNoPluginChildren(baseConfig);

  const key = baseConfig.key;

  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('Plate plugins require a non-empty `key`.');
  }

  const plugin = mergePlugins(
    {
      key,
      __apiExtensions: [],
      __codecExtensions: [],
      __htmlCodecExtensions: [],
      __configurationLayers: [],
      __editorApi: {},
      __editorExtensions: [],
      __extensions: [],
      __readExtensions: [],
      __selectorExtensions: [],
      __txExtensions: [],
      dependencies: [],
      handlers: {},
      inject: {},
      options: {},
      override: {},
      parsers: {},
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
  const recreateBasePlugin = createBasePlugin as (configuration: any) => any;
  const recreatePlugin = (configuration: any) =>
    recreateBasePlugin(brandPluginDescriptor(configuration, plugin));

  (plugin as { targetPluginKeys: readonly string[] }).targetPluginKeys =
    Object.freeze([...plugin.targetPluginKeys]);

  const assertAuthoringOpen = (method: string) => {
    if (!(plugin as any).__configured) return;

    throw new Error(
      `Plate plugin '${plugin.key}' is already configured. Call .${method}() before .configure().`
    );
  };
  const assertNoSchemaMutation = (configuration: unknown, method: string) => {
    if (
      typeof configuration === 'object' &&
      configuration !== null &&
      Object.hasOwn(configuration, 'schema')
    ) {
      throw new Error(
        `Plate plugin '${plugin.key}' cannot define schema through .${method}(). Declare schema when creating the plugin.`
      );
    }
  };

  plugin.configure = (config: any) => {
    assertAuthoringOpen('configure');
    const newPlugin = { ...plugin };
    (newPlugin as any).__configured = true;

    if (isFunction(config)) {
      const value = (ctx: unknown) => {
        const configuration = config(ctx);

        assertRuntimeCallback(configuration, 'configure');
        assertNoSchemaMutation(configuration, 'configure');

        return configuration;
      };

      newPlugin.__configurationLayers = [
        ...newPlugin.__configurationLayers,
        Object.freeze({ kind: 'context' as const, value }),
      ];

      return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
    }
    assertNoSchemaMutation(config, 'configure');
    assertNoRelationshipMutation(config, 'configure');
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
          assertNoSchemaMutation(extension, 'extend');

          return extension;
        },
      ];
    } else {
      assertNoSchemaMutation(extendConfig, 'extend');
      assertNoLegacyNode(extendConfig);
      assertNoBaseCodecField(extendConfig);
      assertNoRelationshipMutation(extendConfig, 'extend');
      newPlugin = mergePlugins(newPlugin, extendConfig as any);
    }

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendCodecs = (extension: any) => {
    assertAuthoringOpen('extendCodecs');

    if (!isFunction(extension)) {
      throw new Error('Plate plugin extendCodecs requires a callback.');
    }

    const newPlugin = { ...plugin };

    newPlugin.__codecExtensions = [
      ...(newPlugin.__codecExtensions as any),
      extension,
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  };

  plugin.extendHtmlCodec = (targetOrExtension: any, maybeExtension?: any) => {
    assertAuthoringOpen('extendHtmlCodec');
    const hasTarget = maybeExtension !== undefined;
    const extension = hasTarget ? maybeExtension : targetOrExtension;

    if (!isFunction(extension)) {
      throw new Error('Plate plugin extendHtmlCodec requires a callback.');
    }
    if (hasTarget && !isNominalPluginDescriptor(targetOrExtension)) {
      throw new Error(
        'Plate plugin extendHtmlCodec requires a plugin descriptor target.'
      );
    }
    if (hasTarget && targetOrExtension.key === plugin.key) {
      throw new Error(
        'Plate plugin extendHtmlCodec requires a different plugin descriptor target.'
      );
    }

    const newPlugin = { ...plugin };
    const storedExtension = registerHtmlCodecSchemaFamilies(
      (context: unknown) => extension(context),
      plugin,
      hasTarget ? targetOrExtension : plugin
    );

    newPlugin.__htmlCodecExtensions = [
      ...(newPlugin.__htmlCodecExtensions as any),
      Object.freeze({
        extension: storedExtension,
        targetKey: hasTarget ? targetOrExtension.key : null,
      }),
    ];

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

  plugin.withComponent = (component) => {
    assertAuthoringOpen('withComponent');

    return plugin.extend({
      render: { node: component },
    }) as any;
  };

  return brandPluginDescriptor(plugin);
}
