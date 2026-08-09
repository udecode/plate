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
  InternalEditorExtensionTypeProviderOf,
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
  ConfiguredPluginDescriptor,
  DefinePluginCodecs,
  EditOnlyConfig,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  InferApi,
  InferConflicts,
  InferDependencies,
  InferPluginStoreState,
  InferPlugins,
  InferRuntimePlugins,
  InferRead,
  InferSelectors,
  InferUpdate,
  NodeComponent,
  NormalizePluginSelectors,
  NormalizePluginState,
  PlatePluginReadState,
  PlatePluginRead,
  PlatePluginTransaction,
  PlatePluginUpdate,
  PluginBaseContext,
  PluginPortalContext,
  PluginCodecMapDeclaration,
  PluginDefinitionWitness,
  PluginReference,
  PluginSelectorMethods,
  PluginSelectors,
  PluginShortcutInput,
  WithAnyName,
} from '../../lib';
import type {
  InferPluginNodeTypeProvider,
  InferPluginSchema,
  InferPluginSchemaContribution,
} from '../../lib/plugin/pluginSchemaModel.internal';
import type { PlateElementProps, PlateLeafProps } from '../components';
import type {
  InternalPlateEditorWithInstalledPlugins,
  PlateEditor,
} from '../editor/PlateEditor';
import type { DOMHandlers } from './DOMHandlers';
import type { MergePluginDefinitions } from '../../lib/plugin/pluginDefinitionMerge.internal';
import type {
  BasePluginDependencyDescriptors,
  BasePluginInstalledCapabilityWitness,
  LowerBasePlugin,
} from '../../lib/plugin/basePluginCompiler.internal';
import type { InternalEditorExtensionWitnessFor } from '@platejs/plite/internal';

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
} & PluginReference;

export type AnyPlatePlugin = AnyPlatePluginRuntime;
export type AnyResolvedPlatePlugin = Omit<
  AnyPlatePluginRuntime,
  'configure' | 'extend'
>;

/** Type-erased React consumer portal for name-only runtime lookups. */
export type AnyPlatePluginPortal = Omit<
  AnyResolvedPlatePlugin,
  'api' | 'read' | 'schema' | 'update'
> &
  Pick<
    AnyBasePluginPortal,
    'api' | 'installed' | 'read' | 'schema' | 'store' | 'update'
  >;

/** Runtime-checked React portal returned for name-only plugin lookups. */
export type DynamicPlatePluginPortal = Omit<AnyPlatePluginPortal, 'schema'> & {
  readonly schema: Readonly<{ key: string; type: string }>;
};

export type PlatePluginPortal<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<ResolvedPlatePlugin<C>, keyof PluginPortalContext<C> | 'schema'> &
  Omit<PluginPortalContext<C>, 'read' | 'update'> & {
    /** State-bound reads scoped directly to this plugin. */
    read: PlatePluginRead<C>;
    /** One-shot updates scoped directly to this plugin. */
    update: PlatePluginUpdate<C>;
  };

/** Type-erased React authoring context used while compiling callbacks. */
export type AnyPlatePluginContext = Omit<DynamicPlatePluginPortal, 'schema'> & {
  readonly defineCodecs: AnyBasePluginContext['defineCodecs'];
  readonly editor: PlateEditor;
  readonly plugin: AnyResolvedPlatePlugin;
  readonly schema: AnyBasePluginContext['schema'];
};

export type PlatePluginContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<PlatePluginPortal<C>, keyof PluginBaseContext<C>> &
  PluginBaseContext<C> & {
    defineCodecs: DefinePluginCodecs<C>;
    editor: PlatePluginContextEditor<C>;
    plugin: ResolvedPlatePlugin<C>;
  };

type PlatePluginContextEditor<C extends AnyBasePluginDefinition> =
  InternalPlateEditorWithInstalledPlugins<
    Value,
    InferRuntimePlugins<readonly [C]>,
    InferPlugins<readonly [C]>
  >;

export type Decorate<C extends AnyBasePluginDefinition = BasePluginDefinition> =
  (
    context: PlatePluginContext<C> & { entry: NodeEntry }
  ) => DecoratedRange[] | undefined;

export type InjectNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
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
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = ((props: PlateLeafProps<Text, C>) => AnyObject | undefined) | AnyObject;

export type NodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((
      props: PlateElementProps<Element, C> & PlateLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type TextNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = ((props: PlateLeafProps<Text, C>) => AnyObject | undefined) | AnyObject;

export type TransformInitialValue<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (context: PlatePluginContext<C> & { value: Value }) => Value;

export type UseHooks<C extends AnyBasePluginDefinition = BasePluginDefinition> =
  (context: PlatePluginContext<C>) => void;

export type OnNodeChange<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  context: PlatePluginContext<C> & Omit<EditorNodeChangeContext, 'editor'>
) => void;

export type OnTextChange<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  context: PlatePluginContext<C> & Omit<EditorTextChangeContext, 'editor'>
) => void;

type PlateLifecycleContext<
  C extends AnyBasePluginDefinition,
  TContext extends { editor: object },
> = Omit<TContext, 'editor'> & PlatePluginContext<C>;

export type PlatePluginOn<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
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
  PlateElementProps<Element, C>;

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
  C extends AnyBasePluginDefinition = BasePluginDefinition,
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
  TTargetPlugins extends readonly (PluginReference | string)[],
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
    targetPlugins?: TTargetPlugins;
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
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  BasePlugin<C>,
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
  | 'targetPlugins'
  | 'update'
>;

/** One exact React descriptor layered over one Base/Plite extension. */
export interface PlatePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> extends PlatePluginRuntime,
    PlatePluginMethods<C>,
    InternalEditorExtensionWitnessFor<LowerBasePlugin<C>>,
    BasePluginInstalledCapabilityWitness<C>,
    InferPluginNodeTypeProvider<C>,
    EditorSchemaSourceProvider<InferPluginSchemaContribution<C>>,
    PluginReference<C['name']>,
    PluginDefinitionWitness<C> {
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
  readonly targetPlugins: C extends {
    targetPlugins: infer TTargetPlugins extends readonly (
      | PluginReference
      | string
    )[];
  }
    ? TTargetPlugins
    : readonly [];
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
  | 'targetPlugins'
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
  TTargetPlugins extends readonly (PluginReference | string)[],
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
  ('targetPlugins' extends TKeys
    ? Readonly<{ targetPlugins: TTargetPlugins }>
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
  TTargetPlugins extends readonly (PluginReference | string)[] = readonly [],
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
    TTargetPlugins
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
    TTargetPlugins
  >
>;

export type ResolvedPlatePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PlatePluginDescriptor<C>;

interface PlatePluginMethods<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> {
  configure<const TShortcuts extends PlateShortcutRecord = {}>(
    config: (
      context: PlatePluginContext<C>
    ) => WithValidatedPlateShortcuts<C, PlatePluginConfiguration<C>, TShortcuts>
  ): ConfiguredPlatePlugin<C>;
  configure<const TShortcuts extends PlateShortcutRecord>(
    config: Omit<PlatePluginConfiguration<C>, 'shortcuts'> &
      Readonly<{
        apply?: never;
        shortcuts: ValidatedPlateShortcuts<C, TShortcuts>;
      }>
  ): ConfiguredPlatePlugin<C>;
  configure(
    config: Omit<PlatePluginConfiguration<C>, 'shortcuts'> &
      Readonly<{ apply?: never; shortcuts?: never }>
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
    const TTargetPlugins extends readonly (
      | PluginReference
      | string
    )[] = readonly [],
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
      TTargetPlugins,
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
      TTargetPlugins
    >
  > &
    InternalEditorExtensionTypeProviderOf<this>;
  extend<const TExtension extends EditorExtensionReference>(
    extension: (context: PlatePluginContext<C>) => TExtension
  ): PlatePlugin<
    MergePluginDefinitions<
      C,
      PlateExtensionResult<TExtension>,
      PlateExtensionResult<TExtension>
    >
  > &
    InternalEditorExtensionTypeProviderOf<this> &
    InternalEditorExtensionTypeProviderOf<TExtension>;
  extend<const TExtension extends EditorExtensionReference>(
    extension: NonCallbackPlateExtension<TExtension>
  ): PlatePlugin<
    MergePluginDefinitions<
      C,
      PlateExtensionResult<TExtension>,
      PlateExtensionResult<TExtension>
    >
  > &
    InternalEditorExtensionTypeProviderOf<this> &
    InternalEditorExtensionTypeProviderOf<TExtension>;
  extend<
    const TKeys extends keyof PlatePluginExtensionObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends readonly (
      | PluginReference
      | string
    )[] = readonly [],
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
      TTargetPlugins,
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
      TTargetPlugins
    >
  > &
    InternalEditorExtensionTypeProviderOf<this>;
}

export type ConfiguredPlatePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PlatePluginDescriptor<C> &
  ConfiguredPluginDescriptor & {
    configure: never;
    extend: never;
  };

export type PlatePlugins = AnyPlatePlugin[];

export type TransformOptions<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BaseTransformOptions & PlatePluginContext<C>;

export type ValidatedPlateShortcuts<
  C extends AnyBasePluginDefinition,
  TShortcuts extends PlateShortcutRecord,
> = PluginShortcutInput<C, TShortcuts, Shortcut>;
