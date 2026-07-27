import type {
  PlatePlugin,
  PlatePluginContext,
  PlateShortcutRecord,
  Shortcut,
  UnifiedRuntimePlatePluginConfig,
  UnifiedStageExtendedPlatePlugin,
} from './PlatePlugin';

import {
  type AnyPluginConfig,
  type AnyPluginTx,
  type AuthoringPlateEditorExtensionInput,
  type DeclaredPluginShortcutInput,
  type InferDependencyConfigs,
  type InferDependencies,
  type InferEnabled,
  type InferApi,
  type InferPluginStoreState,
  type InferPluginApi,
  type InferPluginSchemaModel,
  type InferPluginState,
  type InferPluginTx,
  type InferSelectors,
  type InferState,
  type InferTx,
  type NodeComponent,
  type PlatePluginReadState,
  type PlatePluginTransaction,
  type PluginCodecMapDeclaration,
  type PluginDependencyConfigReferences,
  type PluginConfig,
  type PluginSchemaContext,
  type PluginSchemaDeclaration,
  type PluginSchemaModel,
  type PluginSelectors,
  type PluginShortcutInput,
  createBasePlugin,
} from '../../lib';
import type { EditorUpdateContext } from '@platejs/plite';
import type { PlateEditor } from '../editor/PlateEditor';
import { toPlatePlugin } from './toPlatePlugin';

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

type InitialPluginCodecConfig<C extends AnyPluginConfig> = PluginConfig<
  C['key'],
  InferPluginStoreState<C>,
  {},
  {},
  {},
  {},
  InferDependencies<C>,
  InferPluginSchemaModel<C>,
  InferPluginApi<C>,
  InferEnabled<C>
>;

type InitialPluginContext<C extends AnyPluginConfig> = Omit<
  PlatePluginContext<InitialPluginAuthoringConfig<C>>,
  'defineCodecs' | 'editor' | 'read' | 'update'
> & {
  editor: PlateEditor<any, InferDependencyConfigs<C>>;
};

type InitialPluginField<C extends AnyPluginConfig, T> =
  | T
  | ((context: InitialPluginContext<C>) => T);

type InitialPluginExtensionInput =
  | object
  | readonly object[]
  | ((context: any) => object | readonly object[]);

type ResolveInitialPluginExtension<T> = T extends (
  ...args: any[]
) => infer TExtension
  ? TExtension extends object | readonly object[]
    ? TExtension
    : {}
  : T extends object | readonly object[]
    ? T
    : {};

type InitialPluginCodecsContext<C extends AnyPluginConfig> = Omit<
  PlatePluginContext<InitialPluginCodecConfig<C>>,
  'editor' | 'read' | 'update'
> & {
  editor: PlateEditor<any, InferDependencyConfigs<C>>;
};

type PlatePluginConfig<
  K extends string = any,
  StoreState extends object = {},
  _A = {},
  _Tx extends AnyPluginTx = {},
  _S = {},
  D extends readonly AnyPluginConfig[] = readonly [],
  Enabled extends boolean = boolean,
> = {
  component?: NodeComponent;
  dependencies?: {
    readonly [TIndex in keyof D]: {
      readonly __config: D[TIndex];
    };
  };
  enabled?: Enabled;
  key: K;
  initialState?: StoreState;
  targetPluginKeys?: readonly string[];
  type?: string;
};

type CreatePlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = {
  component?: NodeComponent;
  dependencies?: C['dependencies'];
  enabled?: C['enabled'];
  key: C['key'];
  initialState?: InitialPluginField<C, C['initialState']>;
  schema?: PlatePlugin<C>['schema'];
  targetPluginKeys?: PlatePlugin<C>['targetPluginKeys'];
  type?: string;
};

type NoInferConfig<T> = [T][T extends any ? 0 : never];

type InitialPluginCodecs<C extends AnyPluginConfig> =
  | PluginCodecMapDeclaration
  | ((context: InitialPluginCodecsContext<C>) => PluginCodecMapDeclaration);

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

type ExplicitTypedPlatePluginConfig<C extends AnyPluginConfig> = [C] extends [
  never,
]
  ? never
  : CreatePlatePluginConfig<NoInferConfig<C>> &
      Omit<
        InferredPlatePluginDeclaration<
          NoInferConfig<C>,
          InferPluginApi<NoInferConfig<C>> & object,
          InferPluginState<NoInferConfig<C>> & object,
          InferSelectors<NoInferConfig<C>> & object,
          InferPluginTx<NoInferConfig<C>> & object,
          {},
          PlateShortcutRecord
        >,
        'codecs' | 'extension' | 'shortcuts'
      > & {
        codecs?: InitialPluginCodecs<NoInferConfig<C>>;
        extension?: InitialPluginField<
          NoInferConfig<C>,
          AuthoringPlateEditorExtensionInput<NoInferConfig<C>>
        >;
        shortcuts?: DeclaredPluginShortcutInput<NoInferConfig<C>, Shortcut>;
      };

type InferredPlatePluginInput<
  K extends string,
  StoreState extends object,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly AnyPluginConfig[],
  Enabled extends boolean,
  TType extends string,
> = Omit<
  PlatePluginConfig<K, StoreState, A, Tx, S, D, Enabled>,
  'initialState' | 'type'
> & {
  initialState?: InitialPluginField<
    InitialPlatePluginConfig<K, StoreState, A, Tx, S, D, never, Enabled>,
    StoreState
  >;
  type?: TType;
};

type InitialPlatePluginConfig<
  K extends string,
  StoreState extends object,
  A,
  Tx extends AnyPluginTx,
  S,
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

type InferredPlatePluginDeclaration<
  C extends AnyPluginConfig,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<any>,
  TUpdate extends object,
  TExtension extends InitialPluginExtensionInput,
  TShortcuts extends PlateShortcutRecord,
> = Omit<
  UnifiedRuntimePlatePluginConfig<
    C,
    {},
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    ResolveInitialPluginExtension<TExtension>,
    TShortcuts
  >,
  | 'component'
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
  codecs?: InitialPluginCodecs<C>;
  component?: NodeComponent;
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
    Shortcut
  >;
};

type InferredCreatePlatePluginInput<
  K extends string,
  StoreState extends object,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly AnyPluginConfig[],
  SchemaModel,
  Enabled extends boolean,
  TType extends string,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<StoreState>,
  TUpdate extends object,
  TExtension extends InitialPluginExtensionInput,
  TShortcuts extends PlateShortcutRecord,
> = InferredPlatePluginInput<K, StoreState, A, Tx, S, D, Enabled, TType> &
  Omit<
    InferredPlatePluginDeclaration<
      InitialPlatePluginConfig<K, StoreState, A, Tx, S, D, never, Enabled>,
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
      InitialPlatePluginConfig<K, StoreState, A, Tx, S, D, SchemaModel, Enabled>
    >;
  };

type CreatedPlatePlugin<
  C extends AnyPluginConfig,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<any>,
  TUpdate extends object,
  TExtension extends InitialPluginExtensionInput,
> = UnifiedStageExtendedPlatePlugin<
  C,
  {},
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  ResolveInitialPluginExtension<TExtension>
>;

type InferredPlatePluginSchemaFactory<
  K extends string,
  StoreState extends object,
  A,
  Tx extends AnyPluginTx,
  S,
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

export function createPlatePlugin<C extends AnyPluginConfig = never>(
  config: ExplicitTypedPlatePluginConfig<C>
): PlatePlugin<C>;

export function createPlatePlugin<
  const K extends string,
  StoreState extends object = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<StoreState> = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  config: InferredCreatePlatePluginInput<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<
      TType,
      InferredPlatePluginSchemaFactory<
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
    schema: InferredPlatePluginSchemaFactory<
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
): CreatedPlatePlugin<
  InitialPlatePluginConfig<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<
      TType,
      InferredPlatePluginSchemaFactory<
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
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  TExtension
>;
export function createPlatePlugin<
  const K extends string,
  StoreState extends object = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<StoreState> = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  config: InferredCreatePlatePluginInput<
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
): CreatedPlatePlugin<
  InitialPlatePluginConfig<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, TDeclaration>,
    Enabled
  >,
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  TExtension
>;

export function createPlatePlugin<
  const K extends string,
  StoreState extends object = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends PluginSelectors<StoreState> = {},
  const TUpdate extends object = {},
  const TExtension extends InitialPluginExtensionInput = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  config: InferredCreatePlatePluginInput<
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
): CreatedPlatePlugin<
  InitialPlatePluginConfig<
    K,
    StoreState,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<TType, null>,
    Enabled
  >,
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  TExtension
>;

export function createPlatePlugin(config: any): any {
  const { component, ...baseConfig } = config;
  const plugin = createBasePlugin(baseConfig as any);

  return (
    component === undefined
      ? toPlatePlugin(plugin as any)
      : toPlatePlugin(plugin as any, { component })
  ) as any;
}
