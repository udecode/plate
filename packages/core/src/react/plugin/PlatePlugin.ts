import type React from 'react';

import type {
  DecoratedRange,
  DefinitionOf as PliteDefinitionOf,
  EditorCommitContext,
  EditorExtensionReference,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorTransactionChangeContext,
  EditorUpdateContext,
  Element,
  NodeEntry,
  Text,
  Value,
} from '@platejs/plite';
import type {
  EditorSchemaSourceProvider,
  InternalEditorStateViewProvider,
  InternalEditorUpdateTransactionProvider,
} from '@platejs/plite/internal';
import type {
  HotkeysEvent,
  HotkeysOptions,
  Keys,
} from '@udecode/react-hotkeys';
import type { EditableProps as PliteEditableProps } from '@platejs/plite-react';
import type { AnyObject, Nullable } from '@udecode/utils';

import type {
  AnyBasePlugin,
  AnyBasePluginContext,
  AnyBasePluginDefinition,
  AnyBasePluginPortal,
  BaseInjectProps,
  BasePlugin,
  BasePluginConfiguration,
  BasePluginDefinition,
  BasePluginDefinitionInput,
  BaseTransformOptions,
  DefinePluginCodecs,
  EditOnlyConfig,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  HandlerReturnType,
  InferApi,
  InferConflicts,
  InferDependencies,
  InferPluginStoreState,
  InferRead,
  InferSelectors,
  InferUpdate,
  NodeComponent,
  NormalizePluginSelectors,
  NormalizePluginState,
  PlatePluginReadState,
  PlatePluginState,
  PlatePluginTransaction,
  PluginBaseContext,
  PluginCodecMapDeclaration,
  PluginReference,
  PluginSelectorMethods,
  PluginSelectors,
  PluginShortcutInput,
  WithAnyName,
} from '../../lib';
import type {
  InferPluginDocumentType,
  InferPluginSchema,
  InferPluginSchemaContribution,
} from '../../lib/plugin/pluginSchemaModel.internal';
import type { PlateElementProps, PlateLeafProps } from '../components';
import type { PlateEditor } from '../editor/PlateEditor';
import type { DOMHandlers } from './DOMHandlers';
import type { MergePluginDefinitions } from '../../lib/plugin/pluginDefinitionMerge.internal';
import type {
  BasePluginDependencyDescriptors,
  BasePluginInstalledCapabilityWitness,
  LowerBasePlugin,
} from '../../lib/plugin/basePluginCompiler.internal';
import type { PluginDefinitionCarrier } from '../../lib/plugin/pluginDefinitionCarrier.internal';
import type { InternalEditorExtensionWitnessFor } from '@platejs/plite/internal';

/** Compact normalized definition carried by every React Plate descriptor. */
export type PlatePluginDefinition = BasePluginDefinition;

export type EditableSiblingComponent = (
  editableProps: PliteEditableProps
) => React.ReactElement | null;

type ErasedPlateCallback<TResult = unknown> = {
  bivarianceHack(context: unknown): TResult;
}['bivarianceHack'];

type ErasedRenderNodeWrapper = ErasedPlateCallback<
  ErasedPlateCallback<React.ReactNode> | undefined
>;

type AnyPlatePluginRender = Omit<
  AnyBasePlugin['render'],
  | 'aboveNodes'
  | 'afterContainer'
  | 'afterEditable'
  | 'beforeContainer'
  | 'beforeEditable'
  | 'belowNodes'
  | 'belowRootNodes'
> & {
  aboveNodes?: ErasedRenderNodeWrapper | null;
  afterContainer?: EditableSiblingComponent | null;
  afterEditable?: EditableSiblingComponent | null;
  beforeContainer?: EditableSiblingComponent | null;
  beforeEditable?: EditableSiblingComponent | null;
  belowNodes?: ErasedRenderNodeWrapper | null;
  belowRootNodes?: ErasedPlateCallback<React.ReactNode> | null;
};

type AnyPlatePluginRuntime = Omit<
  AnyBasePlugin,
  'editOnly' | 'render' | 'transformInitialValue' | 'useHooks'
> & {
  editOnly?: EditOnlyConfig | boolean;
  render: AnyPlatePluginRender;
  transformInitialValue?: ErasedPlateCallback<Value> | null;
  useHooks?: ErasedPlateCallback<void> | null;
};

export type AnyPlatePlugin = AnyPlatePluginRuntime;
export type AnyEditorPlatePlugin = Omit<
  AnyPlatePluginRuntime,
  | '__configurationLayers'
  | '__htmlCodecContributions'
  | '__resolved'
  | '__stages'
  | 'configure'
  | 'extend'
>;

/** Type-erased React consumer portal for name-only runtime lookups. */
export type AnyPlatePluginPortal = Omit<AnyBasePluginPortal, 'plugin'> & {
  readonly plugin: AnyEditorPlatePlugin;
};

export type PlatePluginPortal<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = PluginBaseContext<C> & {
  plugin: EditorPlatePlugin<C>;
};

/** Type-erased React authoring context used while compiling callbacks. */
export type AnyPlatePluginContext = Omit<
  AnyBasePluginContext,
  'editor' | 'plugin'
> & {
  readonly editor: PlateEditor;
  readonly plugin: AnyEditorPlatePlugin;
};

export type PlatePluginContext<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = PlatePluginPortal<C> & {
  defineCodecs: DefinePluginCodecs<C>;
  editor: PlatePluginContextEditor<C>;
};

type PlatePluginContextEditor<C extends AnyBasePluginDefinition> = Omit<
  PlateEditor<Value, C>,
  '__editorStateViewTypes' | '__editorUpdateTransactionTypes'
> &
  InternalEditorStateViewProvider<PlatePluginState<C>> &
  InternalEditorUpdateTransactionProvider<PlatePluginTransaction<C>>;

export type Decorate<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = (
  context: PlatePluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

export type InjectNodeProps<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = BaseInjectProps & {
  query?: (
    context: NonNullable<InjectNodeProps<C>> &
      PlatePluginContext<C> & {
        nodeProps: GetInjectNodePropsOptions;
      }
  ) => boolean;
  transformClassName?: (context: TransformOptions<C>) => string | undefined;
  transformNodeValue?: (context: TransformOptions<C>) => unknown;
  transformProps?: (
    context: TransformOptions<C> & {
      props: GetInjectNodePropsReturnType;
    }
  ) => AnyObject | undefined;
  transformStyle?: (context: TransformOptions<C>) => CSSStyleDeclaration;
};

export type LeafNodeProps<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = ((props: PlateLeafProps<Text, C>) => AnyObject | undefined) | AnyObject;

export type NodeProps<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> =
  | ((
      props: PlateElementProps<Element, C> & PlateLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type TextNodeProps<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = ((props: PlateLeafProps<Text, C>) => AnyObject | undefined) | AnyObject;

export type TransformInitialValue<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = (context: PlatePluginContext<C> & { value: Value }) => Value;

export type UseHooks<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = (context: PlatePluginContext<C>) => void;

export type OnNodeChange<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = (
  context: PlatePluginContext<C> & Omit<EditorNodeChangeContext, 'editor'>
) => HandlerReturnType;

export type OnTextChange<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = (
  context: PlatePluginContext<C> & Omit<EditorTextChangeContext, 'editor'>
) => HandlerReturnType;

type PlateLifecycleContext<
  C extends AnyBasePluginDefinition,
  TContext extends { editor: object },
> = Omit<TContext, 'editor'> & PlatePluginContext<C>;

export type PlatePluginOn<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = Readonly<
  DOMHandlers<C> & {
    commit?: (context: PlateLifecycleContext<C, EditorCommitContext>) => void;
    nodeChange?: OnNodeChange<C>;
    textChange?: OnTextChange<C>;
    transactionChange?: (
      context: PlateLifecycleContext<C, EditorTransactionChangeContext>
    ) => void;
  }
>;

export type RenderNodeWrapper<C extends AnyBasePluginDefinition = never> = (
  props: RenderNodeWrapperProps<C>
) => RenderNodeWrapperFunction;

export type RenderNodeWrapperFunction =
  | ((elementProps: PlateElementProps) => React.ReactNode)
  | undefined;

export type RenderNodeWrapperProps<C extends AnyBasePluginDefinition = never> =
  PlateElementProps<Element, C> & {
    pluginName: string;
  };

type PlateReactRenderFields<C extends AnyBasePluginDefinition> = {
  aboveNodes?: RenderNodeWrapper<WithAnyName<C>>;
  afterContainer?: EditableSiblingComponent;
  afterEditable?: EditableSiblingComponent;
  beforeContainer?: EditableSiblingComponent;
  beforeEditable?: EditableSiblingComponent;
  belowNodes?: RenderNodeWrapper<WithAnyName<C>>;
  belowRootNodes?: (
    props: PlateElementProps<Element, WithAnyName<C>>
  ) => React.ReactNode;
  leafProps?: LeafNodeProps<WithAnyName<C>>;
  nodeProps?: NodeProps<WithAnyName<C>>;
  textProps?: TextNodeProps<WithAnyName<C>>;
};

type PlatePluginInject<C extends AnyBasePluginDefinition> = Omit<
  BasePlugin<C>['inject'],
  'nodeProps'
> &
  Nullable<{ nodeProps?: InjectNodeProps<C> }>;

type PlatePluginRender<C extends AnyBasePluginDefinition> = Omit<
  BasePlugin<C>['render'],
  keyof PlateReactRenderFields<C>
> &
  Nullable<PlateReactRenderFields<C>>;

type PlatePluginAuthorRender<C extends AnyBasePluginDefinition> = Omit<
  PlatePluginRender<C>,
  'node'
> &
  Readonly<{ node?: never }>;

type ShortcutOptions = HotkeysOptions & {
  keys?: Keys | null;
  priority?: number;
};

export type Shortcut = ShortcutOptions &
  (
    | {
        handler: (context: {
          editor: PlateEditor;
          event: KeyboardEvent;
          eventDetails: HotkeysEvent;
        }) => boolean | void;
        target?: never;
      }
    | {
        handler?: never;
        target?: 'api' | 'update';
      }
  );

export type Shortcuts = Record<string, Shortcut | null | undefined>;
export type PlateShortcutRecord = Shortcuts;

type PlatePluginAuthorFields<C extends AnyBasePluginDefinition> = Omit<
  BasePluginDefinitionInput<C>,
  | 'api'
  | 'codecs'
  | 'component'
  | 'decorate'
  | 'dependencies'
  | 'initialState'
  | 'inject'
  | 'on'
  | 'read'
  | 'render'
  | 'shortcuts'
  | 'transformInitialValue'
  | 'update'
  | 'useHooks'
> & {
  api?: (context: PlatePluginContext<C>) => InferApi<C>;
  codecs?:
    | PluginCodecMapDeclaration
    | ((context: PlatePluginContext<C>) => PluginCodecMapDeclaration);
  component?: NodeComponent;
  decorate?: Decorate<C>;
  dependencies?: AnyBasePlugin['dependencies'];
  initialState?:
    | Partial<InferPluginStoreState<C>>
    | ((context: PlatePluginContext<C>) => InferPluginStoreState<C>);
  inject?: PlatePluginInject<C>;
  on?: PlatePluginOn<C>;
  read?: (
    context: PlatePluginContext<C> & {
      state: PlatePluginReadState<C>;
    }
  ) => InferRead<C>;
  render?: PlatePluginAuthorRender<C>;
  shortcuts?: PlateShortcutRecord;
  transformInitialValue?: TransformInitialValue<WithAnyName<C>>;
  update?: (
    context: PlatePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
    }
  ) => InferUpdate<C>;
  useHooks?: UseHooks<WithAnyName<C>>;
};

export type PlatePluginDefinitionInput<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = PlatePluginAuthorFields<C>;

type PlateExtensionResult<TInput> = TInput extends (
  ...args: never[]
) => infer TResult
  ? PlateExtensionResult<TResult>
  : TInput extends EditorExtensionReference
    ? Omit<PliteDefinitionOf<TInput>, 'conflicts' | 'dependencies' | 'name'>
    : TInput;

type NonCallbackPlateExtension<TExtension> = TExtension extends (
  ...args: never[]
) => unknown
  ? never
  : TExtension;

type PlatePluginExtensionObject<C extends AnyBasePluginDefinition> = Omit<
  PlatePluginAuthorFields<C>,
  | 'api'
  | 'component'
  | 'dependencies'
  | 'initialState'
  | 'name'
  | 'read'
  | 'schema'
  | 'selectors'
  | 'type'
  | 'update'
> & {
  api?: (context: PlatePluginContext<C>) => object;
  initialState?: object | ((context: PlatePluginContext<C>) => object);
  read?: (
    context: PlatePluginContext<C> & {
      state: PlatePluginReadState<C>;
    }
  ) => object;
  selectors?: PluginSelectors<InferPluginStoreState<C>>;
  update?: (
    context: PlatePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
    }
  ) => object;
};

type PlatePluginStageConflictInput<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: (
    | EditorExtensionReference
    | PluginReference
  ) &
    Readonly<{ name: TNames[TIndex] }>;
};

type PlatePluginStageInput<
  C extends AnyBasePluginDefinition,
  TKeys extends keyof PlatePluginExtensionObject<C>,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<InferPluginStoreState<C>>,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPluginNames extends readonly string[],
  TShortcuts extends PlateShortcutRecord,
> = Readonly<Record<TKeys, unknown>> &
  Pick<
    PlatePluginExtensionObject<C>,
    Exclude<TKeys, PlatePluginStageSpecialKey>
  > &
  Readonly<{
    api?: (context: PlatePluginContext<C>) => TApi;
    conflicts?: PlatePluginStageConflictInput<TConflictNames>;
    enabled?: TEnabled;
    initialState?: S | ((context: PlatePluginContext<C>) => S);
    read?: (
      context: PlatePluginContext<C> & {
        state: PlatePluginReadState<C>;
      }
    ) => TRead;
    selectors?: TSelectors & PluginSelectors<InferPluginStoreState<C>>;
    shortcuts?: ValidatedPlateShortcuts<C, TShortcuts>;
    targetPluginNames?: TTargetPluginNames;
    update?: (
      context: PlatePluginContext<C> & {
        context: EditorUpdateContext;
        tx: PlatePluginTransaction<C>;
      }
    ) => TUpdate;
  }>;

export type PlatePluginExtendInput<C extends AnyBasePluginDefinition> =
  | PlatePluginExtensionObject<C>
  | EditorExtensionReference
  | ((
      context: PlatePluginContext<C>
    ) => PlatePluginExtensionObject<C> | EditorExtensionReference);

type PlatePluginConfigurationKey =
  keyof PlatePluginConfiguration<AnyBasePluginDefinition>;

type PlatePluginConfigurationDefinedFieldInput<
  C extends AnyBasePluginDefinition,
  TKey extends PlatePluginConfigurationKey,
  TShortcuts extends PlateShortcutRecord,
> = TKey extends 'component'
  ? NodeComponent
  : TKey extends 'decorate'
    ? Decorate<C> | null
    : TKey extends 'enabled'
      ? boolean
      : TKey extends 'initialState'
        ? Partial<InferPluginStoreState<C>>
        : TKey extends 'inject'
          ? PlatePluginInject<C>
          : TKey extends 'on'
            ? PlatePluginOn<C> | null
            : TKey extends 'render'
              ? PlatePluginAuthorRender<C>
              : TKey extends 'shortcuts'
                ? ValidatedPlateShortcuts<C, TShortcuts>
                : TKey extends 'targetPluginNames'
                  ? readonly string[]
                  : TKey extends 'transformInitialValue'
                    ? TransformInitialValue<WithAnyName<C>> | null
                    : TKey extends 'useHooks'
                      ? UseHooks<WithAnyName<C>> | null
                      : TKey extends keyof BasePluginConfiguration<C>
                        ? BasePluginConfiguration<C>[TKey]
                        : never;

type PlatePluginConfigurationFieldInput<
  C extends AnyBasePluginDefinition,
  TKey extends PlatePluginConfigurationKey,
  TShortcuts extends PlateShortcutRecord,
> = PlatePluginConfigurationDefinedFieldInput<C, TKey, TShortcuts> | undefined;

type PlatePluginConfigurationInput<
  C extends AnyBasePluginDefinition,
  TKeys extends PlatePluginConfigurationKey,
  TShortcuts extends PlateShortcutRecord,
> = Readonly<Record<TKeys, unknown>> &
  Readonly<{
    [TKey in Exclude<TKeys, 'shortcuts'>]: PlatePluginConfigurationFieldInput<
      C,
      TKey,
      TShortcuts
    >;
  }> &
  ('shortcuts' extends TKeys
    ? Readonly<{
        shortcuts: ValidatedPlateShortcuts<C, TShortcuts> | undefined;
      }>
    : Readonly<Record<never, never>>);

type WithValidatedPlateShortcuts<
  C extends AnyBasePluginDefinition,
  TInput,
  TShortcuts extends PlateShortcutRecord,
> = Omit<TInput, 'shortcuts'> & {
  shortcuts?: ValidatedPlateShortcuts<C, TShortcuts>;
};

export type PlatePluginConfiguration<C extends AnyBasePluginDefinition> = Omit<
  BasePluginConfiguration<C>,
  | 'component'
  | 'decorate'
  | 'inject'
  | 'on'
  | 'render'
  | 'shortcuts'
  | 'transformInitialValue'
  | 'useHooks'
> & {
  component?: NodeComponent;
  decorate?: Decorate<C> | null;
  inject?: PlatePluginInject<C>;
  on?: PlatePluginOn<C> | null;
  render?: PlatePluginAuthorRender<C>;
  shortcuts?: PlateShortcutRecord;
  transformInitialValue?: TransformInitialValue<WithAnyName<C>> | null;
  useHooks?: UseHooks<WithAnyName<C>> | null;
};

type PlatePluginContextualFields<C extends AnyBasePluginDefinition> = {
  decorate?: Decorate<C>;
  inject: PlatePluginInject<C>;
  on: PlatePluginOn<C>;
  render: PlatePluginRender<C>;
  transformInitialValue?: TransformInitialValue<WithAnyName<C>>;
  useHooks?: UseHooks<WithAnyName<C>>;
};

type ProjectPlatePluginContextualFields<C extends AnyBasePluginDefinition> =
  Readonly<{
    [TKey in Extract<keyof C, keyof PlatePluginContextualFields<C>>]-?: Exclude<
      PlatePluginContextualFields<C>[TKey],
      undefined
    >;
  }>;

type PlatePluginRuntimeShell = {
  inject: AnyBasePlugin['inject'] & AnyPlatePluginRuntime['inject'];
  on: AnyBasePlugin['on'] & AnyPlatePluginRuntime['on'];
  render: AnyBasePlugin['render'] & AnyPlatePluginRuntime['render'];
};

type PlatePluginDescriptor<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = Omit<
  BasePlugin<C>,
  | '__configured'
  | 'configure'
  | 'decorate'
  | 'extend'
  | 'inject'
  | 'on'
  | 'render'
  | 'transformInitialValue'
  | 'useHooks'
> &
  PlatePluginRuntimeShell &
  ProjectPlatePluginContextualFields<C>;

type PlatePluginRuntime = Omit<
  AnyPlatePluginRuntime,
  | '__configured'
  | '__configurationLayers'
  | '__htmlCodecContributions'
  | '__resolved'
  | '__stages'
  | 'api'
  | 'configure'
  | 'conflicts'
  | 'dependencies'
  | 'enabled'
  | 'extend'
  | 'initialState'
  | 'name'
  | 'on'
  | 'read'
  | 'render'
  | 'schema'
  | 'selectors'
  | 'targetPluginNames'
  | 'type'
  | 'update'
>;

/** One exact React descriptor layered over one Base/Plite extension. */
export interface PlatePlugin<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> extends PlatePluginRuntime,
    PlatePluginMethods<C>,
    InternalEditorExtensionWitnessFor<LowerBasePlugin<C>>,
    BasePluginInstalledCapabilityWitness<C>,
    EditorSchemaSourceProvider<InferPluginSchemaContribution<C>>,
    PluginReference<C['name'], InferPluginDocumentType<C>>,
    PluginDefinitionCarrier<C> {
  readonly __configured?: never;
  api?: (context: PlatePluginContext<C>) => InferApi<C>;
  readonly conflicts: BasePluginDependencyDescriptors<InferConflicts<C>>;
  dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
  readonly initialState: InferPluginStoreState<C>;
  readonly name: C['name'];
  readonly on: PlatePluginOn<C>;
  read?: (
    context: PlatePluginContext<C> & {
      state: PlatePluginReadState<C>;
    }
  ) => InferRead<C>;
  readonly render: PlatePluginRender<C>;
  readonly schema: InferPluginSchema<C>;
  readonly selectors: InferSelectors<C>;
  readonly targetPluginNames: C extends {
    targetPluginNames: infer TTargetPluginNames extends readonly string[];
  }
    ? TTargetPluginNames
    : readonly [];
  readonly type: InferPluginDocumentType<C>;
  update?: (
    context: PlatePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
    }
  ) => InferUpdate<C>;
}

type PlatePluginStageSpecialKey =
  | 'api'
  | 'conflicts'
  | 'enabled'
  | 'initialState'
  | 'read'
  | 'selectors'
  | 'shortcuts'
  | 'targetPluginNames'
  | 'update';

type PlatePluginStageConflictReferences<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: PluginReference<
    Extract<TNames[TIndex], string>
  >;
};

type PlatePluginStageContribution<
  TKeys extends PropertyKey,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPluginNames extends readonly string[],
> = Readonly<{
  [TKey in Exclude<TKeys, PlatePluginStageSpecialKey>]: true;
}> &
  ('initialState' extends TKeys
    ? Readonly<{ initialState: NormalizePluginState<S> }>
    : Readonly<Record<never, never>>) &
  ('api' extends TKeys
    ? Readonly<{ api: TApi }>
    : Readonly<Record<never, never>>) &
  ('read' extends TKeys
    ? Readonly<{ read: TRead }>
    : Readonly<Record<never, never>>) &
  ('selectors' extends TKeys
    ? Readonly<{ selectors: TSelectors }>
    : Readonly<Record<never, never>>) &
  ('update' extends TKeys
    ? Readonly<{ update: TUpdate }>
    : Readonly<Record<never, never>>) &
  ('conflicts' extends TKeys
    ? Readonly<{
        conflicts: PlatePluginStageConflictReferences<TConflictNames>;
      }>
    : Readonly<Record<never, never>>) &
  ('enabled' extends TKeys
    ? Readonly<{ enabled: TEnabled }>
    : Readonly<Record<never, never>>) &
  ('targetPluginNames' extends TKeys
    ? Readonly<{ targetPluginNames: TTargetPluginNames }>
    : Readonly<Record<never, never>>) &
  ('shortcuts' extends TKeys
    ? Readonly<{ shortcuts: true }>
    : Readonly<Record<never, never>>);

type PlatePluginStageDefinition<
  C extends AnyBasePluginDefinition,
  TKeys extends PropertyKey,
  S extends object = {},
  TApi extends object = {},
  TRead extends object = {},
  TSelectors extends object = {},
  TUpdate extends object = {},
  TConflictNames extends readonly string[] = readonly [],
  TEnabled extends boolean = boolean,
  TTargetPluginNames extends readonly string[] = readonly [],
> = MergePluginDefinitions<
  C,
  PlatePluginStageContribution<
    TKeys,
    S,
    TApi,
    TRead,
    NormalizePluginSelectors<
      NormalizePluginState<
        (InferPluginStoreState<C> & object) &
          Omit<S, keyof (InferPluginStoreState<C> & object)>
      >,
      PluginSelectorMethods<TSelectors>
    >,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPluginNames
  >,
  PlatePluginStageContribution<
    TKeys,
    S,
    TApi,
    TRead,
    NormalizePluginSelectors<
      NormalizePluginState<
        (InferPluginStoreState<C> & object) &
          Omit<S, keyof (InferPluginStoreState<C> & object)>
      >,
      PluginSelectorMethods<TSelectors>
    >,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPluginNames
  >
>;

export type EditorPlatePlugin<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = PlatePluginDescriptor<C>;

interface PlatePluginMethods<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> extends Pick<
    BasePlugin<C>,
    | '__configurationLayers'
    | '__htmlCodecContributions'
    | '__resolved'
    | '__stages'
  > {
  configure<const TShortcuts extends PlateShortcutRecord = {}>(
    config: (
      context: PlatePluginContext<C>
    ) => WithValidatedPlateShortcuts<C, PlatePluginConfiguration<C>, TShortcuts>
  ): ConfiguredPlatePlugin<C>;
  configure<
    const TKeys extends PlatePluginConfigurationKey,
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    config: PlatePluginConfigurationInput<C, TKeys, TShortcuts> &
      Readonly<{ apply?: never }>
  ): ConfiguredPlatePlugin<C>;
  /** Must precede the raw-extension callback overload to preserve nested contextual typing. */
  // biome-ignore lint/style/useUnifiedTypeSignatures: Callback overload must precede the raw-extension overload for contextual inference.
  extend<
    const TKeys extends keyof PlatePluginExtensionObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPluginNames extends readonly string[] = readonly [],
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    extension: (
      context: PlatePluginContext<C>
    ) => PlatePluginStageInput<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPluginNames,
      TShortcuts
    >
  ): PlatePlugin<
    PlatePluginStageDefinition<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPluginNames
    >
  > &
    Pick<this, Extract<'__editorExtensionTypes', keyof this>>;
  extend<const TExtension extends EditorExtensionReference>(
    extension: (context: PlatePluginContext<C>) => TExtension
  ): PlatePlugin<
    MergePluginDefinitions<
      C,
      PlateExtensionResult<TExtension>,
      PlateExtensionResult<TExtension>
    >
  > &
    Pick<this, Extract<'__editorExtensionTypes', keyof this>> &
    Pick<TExtension, Extract<'__editorExtensionTypes', keyof TExtension>>;
  extend<const TExtension extends EditorExtensionReference>(
    extension: NonCallbackPlateExtension<TExtension>
  ): PlatePlugin<
    MergePluginDefinitions<
      C,
      PlateExtensionResult<TExtension>,
      PlateExtensionResult<TExtension>
    >
  > &
    Pick<this, Extract<'__editorExtensionTypes', keyof this>> &
    Pick<TExtension, Extract<'__editorExtensionTypes', keyof TExtension>>;
  extend<
    const TKeys extends keyof PlatePluginExtensionObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPluginNames extends readonly string[] = readonly [],
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    extension: PlatePluginStageInput<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPluginNames,
      TShortcuts
    >
  ): PlatePlugin<
    PlatePluginStageDefinition<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPluginNames
    >
  > &
    Pick<this, Extract<'__editorExtensionTypes', keyof this>>;
}

export type ConfiguredPlatePlugin<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = PlatePluginDescriptor<C> & {
  readonly __configured: true;
  configure: never;
  extend: never;
};

export type PlatePlugins = AnyPlatePlugin[];

export type TransformOptions<
  C extends AnyBasePluginDefinition = PlatePluginDefinition,
> = BaseTransformOptions & PlatePluginContext<C>;

export type ValidatedPlateShortcuts<
  C extends AnyBasePluginDefinition,
  TShortcuts extends PlateShortcutRecord,
> = PluginShortcutInput<C, TShortcuts, Shortcut>;
