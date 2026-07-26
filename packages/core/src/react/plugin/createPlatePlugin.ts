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
  type InferOptions,
  type InferPluginApi,
  type InferPluginSchemaModel,
  type InferPluginState,
  type InferPluginTx,
  type InferSelectors,
  type InferState,
  type NodeComponent,
  type PlatePluginReadState,
  type PlatePluginTransaction,
  type PluginCodecMapDeclaration,
  type PluginDependencyConfigReferences,
  type PluginConfig,
  type PluginSchemaContext,
  type PluginSchemaDeclaration,
  type PluginSchemaModel,
  createBasePlugin,
} from '../../lib';
import type { EditorUpdateContext } from '@platejs/plite';
import type { Deep2Partial } from '@udecode/utils';
import type { PlateEditor } from '../editor/PlateEditor';
import { toPlatePlugin } from './toPlatePlugin';

type InitialPluginAuthoringConfig<C extends AnyPluginConfig> = PluginConfig<
  C['key'],
  InferOptions<C>,
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
  InferOptions<C>,
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

type InitialPluginCodecsContext<C extends AnyPluginConfig> = Omit<
  PlatePluginContext<InitialPluginCodecConfig<C>>,
  'editor' | 'read' | 'update'
> & {
  editor: PlateEditor<any, InferDependencyConfigs<C>>;
};

type PlatePluginConfig<
  K extends string = any,
  O = {},
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
  options?: O;
  targetPluginKeys?: readonly string[];
  type?: string;
};

type CreatePlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = {
  component?: NodeComponent;
  dependencies?: C['dependencies'];
  enabled?: C['enabled'];
  key: C['key'];
  options?: InitialPluginField<C, C['options']>;
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
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly AnyPluginConfig[],
  Enabled extends boolean,
  TType extends string,
> = Omit<PlatePluginConfig<K, O, A, Tx, S, D, Enabled>, 'options' | 'type'> & {
  options?: InitialPluginField<
    InitialPlatePluginConfig<K, O, A, Tx, S, D, never, Enabled>,
    O
  >;
  type?: TType;
};

type InitialPlatePluginConfig<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly AnyPluginConfig[],
  SchemaModel,
  Enabled extends boolean,
> = PluginConfig<
  K,
  O,
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
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
  TShortcuts extends PlateShortcutRecord,
> = Omit<
  UnifiedRuntimePlatePluginConfig<
    C,
    {},
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TExtension,
    TShortcuts
  >,
  | 'component'
  | 'dependencies'
  | 'enabled'
  | 'key'
  | 'options'
  | 'schema'
  | 'targetPluginKeys'
  | 'type'
  | 'api'
  | 'codecs'
  | 'extension'
  | 'read'
  | 'selectors'
  | 'update'
> & {
  api?: InitialPluginField<C, TApi & Deep2Partial<InferPluginApi<C>>>;
  codecs?: InitialPluginCodecs<C>;
  component?: NodeComponent;
  extension?: InitialPluginField<
    C,
    NoInfer<AuthoringPlateEditorExtensionInput<C>> & TExtension
  >;
  read?: (
    context: InitialPluginReadContext<C>
  ) => TRead &
    Partial<
      InferState<C> extends Record<C['key'], infer TState extends object>
        ? TState
        : {}
    >;
  selectors?: InitialPluginField<C, TSelectors & Partial<InferSelectors<C>>>;
  update?: (context: InitialPluginUpdateContext<C>) => TUpdate;
};

type InferredCreatePlatePluginInput<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly AnyPluginConfig[],
  SchemaModel,
  Enabled extends boolean,
  TType extends string,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
  TShortcuts extends PlateShortcutRecord,
> = InferredPlatePluginInput<K, O, A, Tx, S, D, Enabled, TType> &
  Omit<
    InferredPlatePluginDeclaration<
      InitialPlatePluginConfig<K, O, A, Tx, S, D, never, Enabled>,
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
      InitialPlatePluginConfig<K, O, A, Tx, S, D, SchemaModel, Enabled>
    >;
  };

type CreatedPlatePlugin<
  C extends AnyPluginConfig,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
> = UnifiedStageExtendedPlatePlugin<
  C,
  {},
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  TExtension
>;

type InferredPlatePluginSchemaFactory<
  K extends string,
  O,
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
      O,
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
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends object = {},
  const TUpdate extends object = {},
  const TExtension extends object | readonly object[] = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  config: InferredCreatePlatePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<
      TType,
      InferredPlatePluginSchemaFactory<
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
): CreatedPlatePlugin<
  InitialPlatePluginConfig<
    K,
    O,
    A,
    Tx,
    S,
    D,
    PluginSchemaModel<
      TType,
      InferredPlatePluginSchemaFactory<
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
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends object = {},
  const TUpdate extends object = {},
  const TExtension extends object | readonly object[] = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  config: InferredCreatePlatePluginInput<
    K,
    O,
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
    O,
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
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly AnyPluginConfig[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TApi extends object = {},
  const TRead extends object = {},
  const TSelectors extends object = {},
  const TUpdate extends object = {},
  const TExtension extends object | readonly object[] = {},
  const TShortcuts extends PlateShortcutRecord = {},
>(
  config: InferredCreatePlatePluginInput<
    K,
    O,
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
    O,
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

  return toPlatePlugin(
    plugin as any,
    component === undefined ? undefined : { component }
  ) as any;
}
