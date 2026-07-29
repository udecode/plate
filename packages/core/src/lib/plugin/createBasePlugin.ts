import type {
  AnyPluginConfig,
  AnyPluginTx,
  InferDependencyConfigs,
  InferDependencies,
  InferEnabled,
  InferApi,
  InferPluginStoreState,
  InferPluginApi,
  InferPluginSchemaModel,
  InferPluginState,
  InferPluginTx,
  InferSelectors,
  InferState,
  InferTx,
  PluginDependencyConfigReferences,
  PluginConfig,
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaModel,
  PluginSelectors,
} from './PluginConfig';
import type { EditorUpdateContext, Value } from '@platejs/plite';
import { clipboardHandler } from '@platejs/plite-dom';
import type {
  BasePlugin,
  BasePluginContext,
  BaseShortcutRecord,
  AuthoringPlateEditorExtensionInput,
  DeclaredPluginShortcutInput,
  EditorShortcut,
  ExtensionApiContribution,
  ExtensionStateContribution,
  ExtensionTxContribution,
  PlateEditorExtension,
  PlateEditorExtensionInput,
  PluginCodecMapDeclaration,
  PluginShortcutInput,
  UnifiedRuntimeBasePluginConfig,
  UnifiedInferredBasePlugin,
} from './BasePlugin';
import type {
  PlatePluginReadState,
  PlatePluginTransaction,
} from '../editor/pluginRuntimeTypes';
import type { BaseEditor } from '../editor';

import { isFunction } from '../../internal/utils/isFunction';
import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  isNominalPluginDescriptor,
  mergePlugins,
} from '../../internal/utils/mergePlugins';

type InitialPluginAuthoringConfig<C extends AnyPluginConfig> = PluginConfig<
  C['key'],
  InferPluginStoreState<C>,
  {},
  {},
  {},
  {},
  InferDependencies<C>,
  never,
  InferPluginApi<C>,
  InferEnabled<C>
>;

type InitialPluginCodecConfig<
  C extends AnyPluginConfig,
  TApi extends object,
> = PluginConfig<
  C['key'],
  InferPluginStoreState<C>,
  {},
  {},
  {},
  {},
  InferDependencies<C>,
  InferPluginSchemaModel<C>,
  InferPluginApi<C> & TApi,
  InferEnabled<C>
>;

type InitialPluginContext<C extends AnyPluginConfig> = Omit<
  BasePluginContext<InitialPluginAuthoringConfig<C>>,
  'defineCodecs' | 'editor' | 'read' | 'update'
> & {
  editor: BaseEditor<Value, InferDependencyConfigs<C>>;
};

type InitialPluginField<C extends AnyPluginConfig, T> =
  | T
  | ((context: InitialPluginContext<C>) => T);

type InitialPluginExtensionInput =
  | object
  | readonly object[]
  | ((...args: never[]) => object | readonly object[]);

type ResolveInitialPluginExtension<T> = T extends (
  ...args: never[]
) => infer TExtension
  ? TExtension extends object | readonly object[]
    ? TExtension
    : {}
  : T extends object | readonly object[]
    ? T
    : {};

type InitialExtensionApi<T> = ExtensionApiContribution<
  ResolveInitialPluginExtension<T>
>;
type InitialExtensionState<T> = ExtensionStateContribution<
  ResolveInitialPluginExtension<T>
>;
type InitialExtensionTx<T> = ExtensionTxContribution<
  ResolveInitialPluginExtension<T>
>;

type InitialPluginCodecsContext<
  C extends AnyPluginConfig,
  TApi extends object,
> = Omit<
  BasePluginContext<InitialPluginCodecConfig<C, TApi>>,
  'editor' | 'read' | 'update'
> & {
  editor: BaseEditor<Value, InferDependencyConfigs<C>>;
};

type CreateBasePluginInput<C extends AnyPluginConfig = PluginConfig> = {
  component?: never;
  dependencies?: C['dependencies'];
  enabled?: C['enabled'];
  key: C['key'];
  initialState?: InitialPluginField<C, InferPluginStoreState<C>>;
  schema?: BasePlugin<C>['schema'];
  targetPluginKeys?: BasePlugin<C>['targetPluginKeys'];
  type?: string;
};

type PluginInputConfig<C extends AnyPluginConfig> = CreateBasePluginInput<C>;

type TypedBasePluginConfig<C extends AnyPluginConfig = PluginConfig> =
  PluginInputConfig<C>;

type NoInferConfig<T> = [T][T extends unknown ? 0 : never];

type InitialPluginCodecs<C extends AnyPluginConfig, TApi extends object = {}> =
  | PluginCodecMapDeclaration
  | ((
      context: InitialPluginCodecsContext<C, TApi>
    ) => PluginCodecMapDeclaration);

type InitialPluginReadContext<C extends AnyPluginConfig> =
  InitialPluginContext<C> & {
    state: PlatePluginReadState<InferDependencyConfigs<C>>;
  };

type InitialPluginUpdateContext<C extends AnyPluginConfig> =
  InitialPluginContext<C> & {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<InferDependencyConfigs<C>>;
  };

type InitialPluginShortcutConfig<
  C extends AnyPluginConfig,
  TApi extends object,
  TUpdate extends object,
> = PluginConfig<
  C['key'],
  InferPluginStoreState<C>,
  InferApi<C>,
  InferTx<C> & {
    [K in C['key']]: InferPluginTx<C> & TUpdate;
  },
  InferSelectors<C>,
  InferState<C>,
  InferDependencies<C>,
  InferPluginSchemaModel<C>,
  InferPluginApi<C> & TApi,
  InferEnabled<C>
>;

type ExplicitTypedBasePluginConfig<C extends AnyPluginConfig> = [C] extends [
  never,
]
  ? never
  : Omit<TypedBasePluginConfig<NoInferConfig<C>>, 'key'> &
      Omit<
        InferredBasePluginDeclaration<
          NoInferConfig<C>,
          InferPluginApi<NoInferConfig<C>> & object,
          InferPluginState<NoInferConfig<C>> & object,
          InferSelectors<NoInferConfig<C>> & object,
          InferPluginTx<NoInferConfig<C>> & object,
          {},
          BaseShortcutRecord
        >,
        'codecs' | 'extension' | 'shortcuts'
      > & {
        codecs?: InitialPluginCodecs<NoInferConfig<C>>;
        extension?: InitialPluginField<
          NoInferConfig<C>,
          AuthoringPlateEditorExtensionInput<NoInferConfig<C>>
        >;
        key: C['key'];
        shortcuts?: DeclaredPluginShortcutInput<
          NoInferConfig<C>,
          EditorShortcut
        >;
      };

type InferredPluginSchemaFactory<
  K extends string,
  StoreState extends object,
  A extends object,
  Tx extends AnyPluginTx,
  S extends object,
  D extends readonly AnyPluginConfig[],
  Enabled extends boolean,
  TType extends string,
  TDeclaration extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<
    PluginConfig<
      K,
      StoreState,
      A,
      Tx,
      S,
      {},
      PluginDependencyConfigReferences<D>,
      never,
      {},
      Enabled
    >,
    TType
  >
) => TDeclaration;

type InferredBasePluginInput<
  K extends string,
  StoreState extends object,
  A extends object,
  Tx extends AnyPluginTx,
  S extends object,
  D extends readonly AnyPluginConfig[],
  Enabled extends boolean,
  TType extends string,
> = {
  component?: never;
  dependencies?: {
    readonly [TIndex in keyof D]: {
      readonly __config: D[TIndex];
    };
  };
  enabled?: Enabled;
  key: K;
  initialState?: InitialPluginField<
    InitialBasePluginConfig<K, StoreState, A, Tx, S, D, never, Enabled>,
    StoreState
  >;
  targetPluginKeys?: readonly string[];
  type?: TType;
};

type InitialBasePluginConfig<
  K extends string,
  StoreState extends object,
  A extends object,
  Tx extends AnyPluginTx,
  S extends object,
  D extends readonly AnyPluginConfig[],
  SchemaModel,
  Enabled extends boolean,
> = PluginConfig<
  K,
  StoreState,
  A,
  Tx,
  S,
  {},
  PluginDependencyConfigReferences<D>,
  SchemaModel,
  {},
  Enabled
>;

type InferredBasePluginDeclaration<
  C extends AnyPluginConfig,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends InitialPluginExtensionInput,
  TShortcuts extends BaseShortcutRecord,
> = Omit<
  UnifiedRuntimeBasePluginConfig<
    C,
    {},
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    ResolveInitialPluginExtension<TExtension>,
    TShortcuts
  >,
  | 'dependencies'
  | 'enabled'
  | 'key'
  | 'initialState'
  | 'schema'
  | 'targetPluginKeys'
  | 'type'
  | 'api'
  | 'codecs'
  | 'extension'
  | 'read'
  | 'selectors'
  | 'shortcuts'
  | 'update'
> & {
  api?: InitialPluginField<C, TApi>;
  codecs?: InitialPluginCodecs<C, TApi>;
  extension?:
    | (TExtension &
        ((
          context: InitialPluginContext<C>
        ) => AuthoringPlateEditorExtensionInput<C>))
    | (TExtension & AuthoringPlateEditorExtensionInput<C>);
  read?: (context: InitialPluginReadContext<C>) => TRead;
  selectors?: TSelectors & PluginSelectors<InferPluginStoreState<C>>;
  update?: (context: InitialPluginUpdateContext<C>) => TUpdate;
  shortcuts?: PluginShortcutInput<
    InitialPluginShortcutConfig<C, NoInfer<TApi>, NoInfer<TUpdate>>,
    TShortcuts,
    EditorShortcut
  >;
};

type InferredCreateBasePluginInput<
  K extends string,
  StoreState extends object,
  A extends object,
  Tx extends AnyPluginTx,
  S extends object,
  D extends readonly AnyPluginConfig[],
  SchemaModel,
  Enabled extends boolean,
  TType extends string,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<StoreState>,
  TUpdate extends object,
  TExtension extends InitialPluginExtensionInput,
  TShortcuts extends BaseShortcutRecord,
> = InferredBasePluginInput<K, StoreState, A, Tx, S, D, Enabled, TType> &
  Omit<
    InferredBasePluginDeclaration<
      InitialBasePluginConfig<K, StoreState, A, Tx, S, D, never, Enabled>,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TExtension,
      TShortcuts
    >,
    'codecs'
  > & {
    codecs?: InitialPluginCodecs<
      InitialBasePluginConfig<K, StoreState, A, Tx, S, D, SchemaModel, Enabled>,
      TApi
    >;
  };

const extensionArrayKeys = [
  '__apiExtensions',
  '__codecExtensions',
  '__htmlCodecExtensions',
  '__editorExtensions',
  '__readExtensions',
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

const assertNoBaseComponent = (configuration: unknown) => {
  if (
    configuration &&
    typeof configuration === 'object' &&
    Object.hasOwn(configuration, 'component')
  ) {
    throw new Error(
      'Base plugin constructors are renderer-neutral. Bind `component` through terminal `.configure()`.'
    );
  }
};

const assertNoTerminalCodecField = (configuration: unknown) => {
  if (
    configuration &&
    typeof configuration === 'object' &&
    Object.hasOwn(configuration, 'codecs')
  ) {
    throw new Error(
      'Plate plugin terminal configuration cannot define `codecs`.'
    );
  }
};

const assertNoRenderNode = (configuration: unknown) => {
  if (!configuration || typeof configuration !== 'object') return;

  const render = Reflect.get(configuration, 'render');

  if (render && typeof render === 'object' && Object.hasOwn(render, 'node')) {
    throw new Error(
      'Plate plugin `render.node` is private. Use top-level `component`.'
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
  assertNoRenderNode(value);
  assertNoRelationshipMutation(value, kind === 'extension' ? 'extend' : kind);

  if (kind === 'configure') {
    for (const key of Object.keys(value)) {
      if (!['handlers', 'initialState', 'render', 'shortcuts'].includes(key)) {
        throw new Error(
          `Plate plugin configure callbacks cannot define \`${key}\`. Use \`.extend\` for additive plugin behavior or an object configuration for model fields.`
        );
      }
    }
  }

  const modelKeys =
    kind === 'configure'
      ? (['parsers', 'schema', 'targetPluginKeys', 'type'] as const)
      : (['schema', 'targetPluginKeys', 'type'] as const);

  for (const key of modelKeys) {
    if (Object.hasOwn(value, key)) {
      throw new Error(
        `Plate plugin ${kind} callbacks cannot define \`${key}\`. Use an object configuration or a schema factory over plugin initial state.`
      );
    }
  }
  const render = Reflect.get(value, 'render');

  if (
    kind === 'configure' &&
    render &&
    typeof render === 'object' &&
    Object.hasOwn(render, 'isDecoration')
  ) {
    throw new Error(
      `Plate plugin ${kind} callbacks cannot define \`render.isDecoration\`. Use an object configuration.`
    );
  }
};

const snapshotModelConfiguration = (configuration: object) => {
  assertNoLegacyNode(configuration);
  assertNoTerminalCodecField(configuration);
  assertNoRenderNode(configuration);

  // Snapshot model identity here. The complete descriptor graph is snapshotted
  // at editor publication, where nominal plugin references and opaque extension
  // resources can be preserved instead of cloned as plain data.
  const snapshot = { ...configuration };

  if (Object.hasOwn(snapshot, 'schema')) {
    Reflect.set(
      snapshot,
      'schema',
      freezePluginDescriptorValue(Reflect.get(snapshot, 'schema'))
    );
  }
  if (Object.hasOwn(snapshot, 'targetPluginKeys')) {
    const targetPluginKeys = Reflect.get(snapshot, 'targetPluginKeys');

    if (Array.isArray(targetPluginKeys)) {
      Reflect.set(
        snapshot,
        'targetPluginKeys',
        Object.freeze(targetPluginKeys)
      );
    }
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
    const {
      clipboard,
      contributions = [],
      ...modelExtension
    } = extensionWithoutKey as PlateEditorExtensionRecord & {
      clipboard?: Parameters<typeof clipboardHandler>[0];
      contributions?: NonNullable<PlateEditorExtension['contributions']>;
    };
    const normalized = {
      ...modelExtension,
      name: hasExplicitName ? extension.name : name,
      ...(clipboard
        ? {
            contributions: [...contributions, clipboardHandler(clipboard)],
          }
        : contributions.length > 0
          ? { contributions }
          : {}),
    };

    return (
      hasExplicitName ? normalized : markImplicitExtensionName(normalized)
    ) as PlateEditorExtension;
  });
};

/**
 * Creates a renderer-neutral Plate plugin descriptor.
 *
 * @remarks
 *   Put every independent author contribution in this constructor, including
 *   `api`, `read`, `selectors`, `update`, `extension`, and `codecs`. Constructor
 *   callbacks receive the typed plugin context. Use `extend` only to adapt an
 *   existing descriptor or consume a capability introduced by an earlier
 *   stage.
 *
 * @example
 *   const myPlugin = createBasePlugin({
 *     api: ({ store }) => ({
 *       isEnabled: () => store.get('enabled'),
 *     }),
 *     key: 'myPlugin',
 *     initialState: { enabled: true },
 *   });
 *
 * @param config - The complete initial plugin declaration.
 * @returns An immutable plugin descriptor with inferred authoring methods.
 */
export function createBasePlugin<C extends AnyPluginConfig = never>(
  config: ExplicitTypedBasePluginConfig<C>
): BasePlugin<C>;
export function createBasePlugin<
  const K extends string,
  TInitialStateFactory extends (
    context: InitialPluginContext<
      InitialBasePluginConfig<K, {}, A, Tx, S, D, never, Enabled>
    >
  ) => object,
  A extends object = {},
  Tx extends AnyPluginTx = {},
  S extends object = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<
    ReturnType<TInitialStateFactory>
  > = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends BaseShortcutRecord = {},
>(
  config: Omit<
    InferredCreateBasePluginInput<
      K,
      ReturnType<TInitialStateFactory>,
      A,
      Tx,
      S,
      D,
      PluginSchemaModel<TType, null>,
      Enabled,
      TType,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TExtension,
      TShortcuts
    >,
    'initialState'
  > & {
    initialState: TInitialStateFactory;
    schema?: null;
  }
): UnifiedInferredBasePlugin<
  InitialBasePluginConfig<
    K,
    ReturnType<TInitialStateFactory>,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, null>,
    Enabled
  >,
  {},
  {},
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  InitialExtensionApi<TExtension>,
  InitialExtensionTx<TExtension>,
  InitialExtensionState<TExtension>
>;
export function createBasePlugin<
  const K extends string,
  StoreState extends object = {},
  A extends object = {},
  Tx extends AnyPluginTx = {},
  S extends object = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<StoreState> = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends BaseShortcutRecord = {},
>(
  config: InferredCreateBasePluginInput<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<
      TType,
      InferredPluginSchemaFactory<
        K,
        StoreState,
        A,
        Tx,
        S,
        D,
        Enabled,
        TType,
        TDeclaration
      >
    >,
    Enabled,
    TType,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TExtension,
    TShortcuts
  > & {
    schema: InferredPluginSchemaFactory<
      K,
      NoInfer<StoreState>,
      NoInfer<A>,
      NoInfer<Tx>,
      NoInfer<S>,
      NoInfer<D>,
      NoInfer<Enabled>,
      TType,
      TDeclaration
    >;
  }
): UnifiedInferredBasePlugin<
  InitialBasePluginConfig<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<
      TType,
      InferredPluginSchemaFactory<
        K,
        StoreState,
        A,
        Tx,
        S,
        D,
        Enabled,
        TType,
        TDeclaration
      >
    >,
    Enabled
  >,
  {},
  {},
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  InitialExtensionApi<TExtension>,
  InitialExtensionTx<TExtension>,
  InitialExtensionState<TExtension>
>;
export function createBasePlugin<
  const K extends string,
  StoreState extends object = {},
  A extends object = {},
  Tx extends AnyPluginTx = {},
  S extends object = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<StoreState> = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends BaseShortcutRecord = {},
>(
  config: InferredCreateBasePluginInput<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, TDeclaration>,
    Enabled,
    TType,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TExtension,
    TShortcuts
  > & {
    schema: TDeclaration;
  }
): UnifiedInferredBasePlugin<
  InitialBasePluginConfig<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, TDeclaration>,
    Enabled
  >,
  {},
  {},
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  InitialExtensionApi<TExtension>,
  InitialExtensionTx<TExtension>,
  InitialExtensionState<TExtension>
>;
export function createBasePlugin<
  const K extends string,
  StoreState extends object = {},
  A extends object = {},
  Tx extends AnyPluginTx = {},
  S extends object = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<StoreState> = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends BaseShortcutRecord = {},
>(
  config: InferredCreateBasePluginInput<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, null>,
    Enabled,
    TType,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TExtension,
    TShortcuts
  > & {
    schema?: null;
  }
): UnifiedInferredBasePlugin<
  InitialBasePluginConfig<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, null>,
    Enabled
  >,
  {},
  {},
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  InitialExtensionApi<TExtension>,
  InitialExtensionTx<TExtension>,
  InitialExtensionState<TExtension>
>;
export function createBasePlugin(config: unknown): unknown {
  return createBasePluginRuntime(config);
}

const createBasePluginRuntime = (config: unknown): MutableBasePlugin => {
  if (!isObjectRecord(config)) {
    throw new Error('Plate plugin configuration must be an object.');
  }
  const baseConfig = config;
  const isRecreatedDescriptor = isNominalPluginDescriptor(baseConfig);

  assertNoLegacyNode(baseConfig);
  assertNoPluginChildren(baseConfig);
  if (!isRecreatedDescriptor) {
    assertNoBaseComponent(baseConfig);
    assertNoRenderNode(baseConfig);
  }

  const key = baseConfig.key;

  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('Plate plugins require a non-empty `key`.');
  }

  let creationConfig: object = config;
  let creationExtensions: readonly ((ctx: unknown) => unknown)[] = [];

  if (!isRecreatedDescriptor) {
    const {
      api,
      codecs,
      extension,
      initialState,
      read,
      selectors,
      update,
      ...staticConfig
    } = config;
    const contextualInitialState =
      typeof initialState === 'function' ? initialState : undefined;

    if (codecs !== undefined && typeof codecs !== 'function') {
      throw new Error(
        'Plate plugin `codecs` must be declared by the constructor callback.'
      );
    }

    creationConfig =
      contextualInitialState === undefined
        ? { ...staticConfig, initialState, selectors }
        : { ...staticConfig, selectors };

    if (
      api !== undefined ||
      codecs !== undefined ||
      extension !== undefined ||
      contextualInitialState !== undefined ||
      read !== undefined ||
      update !== undefined
    ) {
      creationExtensions = [
        (context: unknown) => {
          const pluginContext = context as BasePluginContext<AnyPluginConfig>;

          return Object.freeze({
            api:
              typeof api === 'function'
                ? Reflect.apply(api, undefined, [pluginContext])
                : api,
            codecs:
              typeof codecs === 'function'
                ? Reflect.apply(codecs, undefined, [pluginContext])
                : undefined,
            extension:
              typeof extension === 'function'
                ? Reflect.apply(extension, undefined, [pluginContext])
                : extension,
            initialState: contextualInitialState
              ? Reflect.apply(contextualInitialState, undefined, [
                  pluginContext,
                ])
              : undefined,
            read,
            update,
          });
        },
      ];
    }
  }

  const plugin = mergePlugins(
    {
      key,
      __apiExtensions: [],
      __codecExtensions: [],
      __htmlCodecExtensions: [],
      __configurationLayers: [],
      __editorExtensions: [],
      __extensions: creationExtensions,
      __readExtensions: [],
      __txExtensions: [],
      dependencies: [],
      handlers: {},
      inject: {},
      initialState: {},
      selectors: {},
      override: {},
      parsers: {},
      render: {},
      rules: {},
      schema: null,
      shortcuts: {},
      targetPluginKeys: [],
      inputRules: [],
      tx: {},
      type: key,
    },
    creationConfig
  ) as unknown as MutableBasePlugin;
  const recreatePlugin = (configuration: object) =>
    createBasePluginRuntime(brandPluginDescriptor(configuration, plugin));

  (plugin as { targetPluginKeys: readonly string[] }).targetPluginKeys =
    Object.freeze([...plugin.targetPluginKeys]);

  const assertAuthoringOpen = (method: string) => {
    if (Reflect.get(plugin, '__configured') !== true) return;

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

  Reflect.set(plugin, 'configure', (config: unknown) => {
    assertAuthoringOpen('configure');
    const newPlugin = { ...plugin };
    Reflect.set(newPlugin, '__configured', true);

    if (isFunction(config)) {
      const value = (ctx: unknown) => {
        const configuration = Reflect.apply(config, undefined, [ctx]);

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
    if (!isObjectRecord(config)) {
      throw new Error('Plate plugin configure values must be objects.');
    }
    assertNoSchemaMutation(config, 'configure');
    assertNoRelationshipMutation(config, 'configure');
    assertNoRenderNode(config);
    let normalizedConfig = config;

    if (
      typeof config === 'object' &&
      config !== null &&
      Object.hasOwn(config, 'component')
    ) {
      const { component, ...configWithoutComponent } = config;

      newPlugin.render = mergePlugins(newPlugin.render, {
        node: component,
      });
      normalizedConfig = configWithoutComponent;
    }
    const type = Reflect.get(normalizedConfig, 'type');

    if (typeof type === 'string') {
      newPlugin.type = type;
    }
    newPlugin.__configurationLayers = [
      ...newPlugin.__configurationLayers,
      Object.freeze({
        kind: 'object' as const,
        value: snapshotModelConfiguration(normalizedConfig),
      }),
    ];

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  });

  Reflect.set(plugin, 'extend', (extendConfig: unknown) => {
    assertAuthoringOpen('extend');
    let newPlugin = { ...plugin };

    if (isFunction(extendConfig)) {
      newPlugin.__extensions = [
        ...newPlugin.__extensions,
        (ctx: unknown) => {
          const extension = Reflect.apply(extendConfig, undefined, [ctx]);

          assertRuntimeCallback(extension, 'extension');
          assertNoSchemaMutation(extension, 'extend');

          return extension;
        },
      ];
    } else {
      if (!isObjectRecord(extendConfig)) {
        throw new Error('Plate plugin extension values must be objects.');
      }
      assertNoSchemaMutation(extendConfig, 'extend');
      assertNoLegacyNode(extendConfig);
      assertNoRenderNode(extendConfig);
      assertNoRelationshipMutation(extendConfig, 'extend');

      const { api, codecs, extension, read, update, ...configuration } =
        extendConfig;

      newPlugin = mergePlugins(
        newPlugin,
        configuration
      ) as unknown as MutableBasePlugin;

      if (
        api !== undefined ||
        codecs !== undefined ||
        extension !== undefined ||
        read !== undefined ||
        update !== undefined
      ) {
        const unifiedExtension = Object.freeze({
          api,
          codecs,
          extension,
          read,
          update,
        });

        newPlugin.__extensions = [
          ...newPlugin.__extensions,
          () => unifiedExtension,
        ];
      }
    }

    return preserveExtensionArrays(plugin, recreatePlugin(newPlugin));
  });

  Reflect.set(plugin, 'clone', () => {
    assertAuthoringOpen('clone');

    return preserveExtensionArrays(plugin, recreatePlugin({ ...plugin }));
  });

  return brandPluginDescriptor(plugin);
};
