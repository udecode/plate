import type React from 'react';

import type {
  DefinitionOf as RuntimeDefinitionOf,
  EditorDocumentValue,
  EditorCommitContext,
  RuntimePluginReference,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorTransactionChangeContext,
  EditorUpdateContext,
  Element,
  NodeEntry,
  NodeKey,
  Path,
  Text,
  Value,
  EditorSchemaSourceProvider,
  RuntimePluginTypeProviderOf,
  RuntimePluginWitnessFor,
} from '../../facade';
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
  EditorShortcut,
  HotkeysEvent,
  InferApi,
  InferConflicts,
  InferDependencies,
  InferPluginStoreState,
  InferRuntimePlugins,
  InferRead,
  InferSelectors,
  InferUpdate,
  NodeComponent,
  NormalizePluginSelectors,
  NormalizePluginState,
  PluginReadState,
  PluginReadCapability,
  PluginTransaction,
  PluginUpdate,
  PluginBaseContext,
  PluginPortalContext,
  PluginCodecMapDeclaration,
  PluginDefinitionWitness,
  PluginReference,
  PluginSelectorMethods,
  PluginSelectors,
  PluginShortcutInput,
  RenderElementProps,
  RenderLeafProps,
  WithAnyName,
} from '../../lib';
import type {
  BasePluginDependencyDescriptors,
  BasePluginInstalledCapabilityWitness,
  LowerBasePlugin,
} from '../../lib/plugin/basePluginCompiler.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type {
  MergePluginDefinitions,
  PluginCompatibilityArguments,
  PluginContributionCompatibility,
} from '../../lib/plugin/pluginDefinitionMerge.internal';
import type { RequiredPluginState } from '../../lib/plugin/pluginInitialState.internal';
import type { ElementWith } from '../../lib/plugin/pluginNodeTypes';
import type {
  InferPluginNodeTypeProvider,
  InferPluginSchema,
  InferPluginSchemaContribution,
} from '../../lib/plugin/pluginSchemaModel.internal';
import type { AnyObject } from '../../lib/types/AnyObject';
import type { Nullable } from '../../lib/types/Nullable';
import type { EditorNodeProps } from '../components';
import type {
  InternalReactEditorWithInstalledPlugins,
  Editor,
} from '../editor/Editor';
import type {
  Decoration,
  DecorationAttributes,
  DecorationRefresh,
  RootEditor,
} from '../plite-react';
import type { DOMHandlers } from './DOMHandlers';

/** Props passed to components rendered beside the Editable. */
export type EditableSiblingProps = {
  /** The mounted Editable element owned by this Plate view. */
  readonly editableRef: React.RefObject<HTMLDivElement | null>;
};

export type EditableSiblingComponent = (
  props: EditableSiblingProps
) => React.ReactElement | null;

/** Props passed to components rendered beside the Plate container. */
export type ContainerSiblingProps = {
  /** The mounted container element owned by this Plate view. */
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
};

export type ContainerSiblingComponent = (
  props: ContainerSiblingProps
) => React.ReactElement | null;

type ErasedCallback<TResult = unknown> = {
  bivarianceHack(context: unknown): TResult;
}['bivarianceHack'];

declare const pluginRuntimeIdentity: unique symbol;

interface PluginRuntimeWitness {
  readonly [pluginRuntimeIdentity]: true;
}

type ErasedRenderNodeWrapper = ErasedCallback<
  ErasedCallback<React.ReactNode> | undefined
>;
type ErasedRenderNodeWrapperDescriptor = Readonly<{
  component: React.ComponentType<any>;
  match?: ErasedCallback<boolean>;
}>;

type ViewElementAttributePrimitive = boolean | number | string | undefined;

export type ViewElementAttributes = Readonly<
  {
    className?: string;
    placeholder?: string;
    style?: Readonly<
      React.CSSProperties & {
        [name: `--${string}`]: number | string | undefined;
      }
    >;
  } & {
    [name: `aria-${string}`]: ViewElementAttributePrimitive;
    [name: `data-${string}`]: ViewElementAttributePrimitive;
  }
>;

export type ViewElementAttributeEntry = Readonly<{
  attributes: ViewElementAttributes;
  key: NodeKey;
}>;

type AnyPluginRender = AnyBasePlugin['render'] & {
  useViewElementAttributes?: ErasedCallback<
    readonly ViewElementAttributeEntry[]
  > | null;
};

type AnyPluginSlots = Omit<
  AnyBasePlugin['slots'],
  | 'afterContainer'
  | 'afterEditable'
  | 'afterNodeChildren'
  | 'beforeContainer'
  | 'beforeEditable'
  | 'wrapNode'
  | 'wrapNodeChildren'
  | 'wrapRoot'
> & {
  afterContainer?: ContainerSiblingComponent | null;
  afterEditable?: EditableSiblingComponent | null;
  afterNodeChildren?: ErasedCallback<React.ReactNode> | null;
  beforeContainer?: ContainerSiblingComponent | null;
  beforeEditable?: EditableSiblingComponent | null;
  wrapNode?: ErasedRenderNodeWrapper | ErasedRenderNodeWrapperDescriptor | null;
  wrapNodeChildren?: ErasedRenderNodeWrapper | null;
  wrapRoot?:
    | ((
        props: EditableSiblingProps & { children: React.ReactNode }
      ) => React.ReactNode)
    | null;
};

type AnyPluginRuntime = Omit<
  AnyBasePlugin,
  'editOnly' | 'render' | 'slots' | 'prepareDocument'
> &
  PluginRuntimeWitness & {
    editOnly?: EditOnlyConfig | boolean;
    render: AnyPluginRender;
    slots: AnyPluginSlots;
    prepareDocument?: ErasedCallback<EditorDocumentValue> | null;
  } & PluginReference;

export type AnyPlugin = AnyPluginRuntime;
export type AnyResolvedPlugin = Omit<AnyPluginRuntime, 'configure' | 'extend'>;

/** Type-erased React consumer portal for name-only runtime lookups. */
export type AnyPluginPortal = Omit<
  AnyResolvedPlugin,
  'api' | 'read' | 'schema' | 'update' | typeof pluginRuntimeIdentity
> &
  Pick<
    AnyBasePluginPortal,
    'api' | 'installed' | 'read' | 'schema' | 'store' | 'update'
  >;

/** Runtime-checked React portal returned for name-only plugin lookups. */
export type DynamicPluginPortal = Omit<AnyPluginPortal, 'schema'> & {
  readonly schema: Readonly<{ key: string; type: string }>;
};

export type PluginPortal<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  S = C,
> = Omit<ResolvedPlugin<C>, keyof PluginPortalContext<C> | 'schema'> &
  PluginReference<C['name']> &
  Omit<PluginPortalContext<C>, 'read' | 'update'> & {
    /** State-bound reads scoped directly to this plugin. */
    read: PluginReadCapability<C>;
    /** One-shot updates scoped directly to this plugin. */
    update: PluginUpdate<C, S>;
  };

/** Type-erased React authoring context used while compiling callbacks. */
export type AnyPluginContext = Omit<DynamicPluginPortal, 'schema'> & {
  readonly defineCodecs: AnyBasePluginContext['defineCodecs'];
  readonly editor: Editor;
  readonly plugin: AnyResolvedPlugin;
  readonly schema: AnyBasePluginContext['schema'];
};

export type PluginContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<PluginPortal<C>, keyof PluginBaseContext<C>> &
  PluginBaseContext<C> & {
    defineCodecs: DefinePluginCodecs<C>;
    editor: PluginContextEditor<C> &
      Readonly<{
        api: Readonly<Record<C['name'], InferApi<C>>>;
      }>;
    plugin: ResolvedPlugin<C>;
  };

type PluginContextEditor<C extends AnyBasePluginDefinition> =
  InternalReactEditorWithInstalledPlugins<
    Value,
    InferRuntimePlugins<readonly [C]>,
    InferRuntimePlugins<readonly [C]>
  >;

export type Decorate<C extends AnyBasePluginDefinition = BasePluginDefinition> =
  Readonly<{
    /** Pure presentation applied after read. Observation remains owned by observe. */
    attributes?:
      | DecorationAttributes
      | ((
          context: PluginContext<C> & {
            decoration: Decoration;
            entry: NodeEntry;
          }
        ) => DecorationAttributes)
      | null;
    observe?: (
      context: PluginContext<C> & {
        refresh: (input: DecorationRefresh) => void;
      }
    ) => () => void;
    read: (
      context: PluginContext<C> & { entry: NodeEntry }
    ) => readonly Decoration[];
  }>;

type DecorateInput<C extends AnyBasePluginDefinition> = Omit<
  Decorate<C>,
  'read'
> &
  (C extends { decorate: true }
    ? Partial<Pick<Decorate<C>, 'read'>>
    : Pick<Decorate<C>, 'read'>);

export type InjectNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BaseInjectProps & {
  query?: (
    context: NonNullable<InjectNodeProps<C>> &
      PluginContext<C> & {
        nodeProps: GetInjectNodePropsOptions;
      }
  ) => boolean;
  transformClassName?: (context: TransformOptions<C>) => string | undefined;
  transformNodeValue?: (context: TransformOptions<C>) => unknown;
  /** Pure render transform. React hooks are not supported. */
  transformProps?: (
    context: TransformOptions<C> & {
      props: GetInjectNodePropsReturnType;
    }
  ) => AnyObject | undefined;
  transformStyle?: (context: TransformOptions<C>) => CSSStyleDeclaration;
};

export type LeafNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((
      props: EditorNodeProps<C> & RenderLeafProps<Text, Text>
    ) => AnyObject | undefined)
  | AnyObject;

/** Static attributes or a pure per-node callback. React hooks are not supported. */
export type NodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((
      props: EditorNodeProps<C> &
        RenderElementProps<ElementWith<C>> &
        RenderLeafProps<Text, Text>
    ) => AnyObject | undefined)
  | AnyObject;

export type TextNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((
      props: EditorNodeProps<C> & RenderLeafProps<Text, Text>
    ) => AnyObject | undefined)
  | AnyObject;

export type PrepareDocument<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  context: PluginContext<C> & { document: EditorDocumentValue }
) => EditorDocumentValue;

export type UseViewElementAttributes<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  context: PluginContext<C> & { view: RootEditor }
) => readonly ViewElementAttributeEntry[];

export type OnNodeChange<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  context: PluginContext<C> & Omit<EditorNodeChangeContext, 'editor'>
) => void;

export type OnTextChange<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  context: PluginContext<C> & Omit<EditorTextChangeContext, 'editor'>
) => void;

type LifecycleContext<
  C extends AnyBasePluginDefinition,
  TContext extends { editor: object },
> = Omit<TContext, 'editor'> & PluginContext<C>;

export type PluginOn<C extends AnyBasePluginDefinition = BasePluginDefinition> =
  Readonly<
    DOMHandlers<C> & {
      commit?: (context: LifecycleContext<C, EditorCommitContext>) => void;
      nodeChange?: OnNodeChange<C>;
      textChange?: OnTextChange<C>;
      transactionChange?: (
        context: LifecycleContext<C, EditorTransactionChangeContext>
      ) => void;
    }
  >;

type RenderNodeWrapperSource = AnyBasePluginDefinition | AnyBasePlugin;

type RenderNodeWrapperDefinition<TSource extends RenderNodeWrapperSource> = [
  TSource,
] extends [never]
  ? never
  : TSource extends AnyBasePluginDefinition
    ? TSource
    : Extract<InternalPluginDefinitionOf<TSource>, AnyBasePluginDefinition>;

export type RenderNodeWrapper<TSource extends RenderNodeWrapperSource = never> =
  {
    bivarianceHack(
      props: RenderNodeWrapperProps<TSource>
    ): RenderNodeWrapperFunction<TSource>;
  }['bivarianceHack'];

export type RenderNodeWrapperDescriptor<
  TSource extends RenderNodeWrapperSource = never,
> = Readonly<{
  component: React.ComponentType<RenderNodeWrapperProps<TSource>>;
  /** Cheap hook-free eligibility check run before wrapper props are composed. */
  match?: (
    props: Pick<
      RenderNodeWrapperProps<TSource>,
      'editor' | 'element' | 'renderPath'
    >
  ) => boolean;
}>;

export type RenderNodeWrapperConfig<
  TSource extends RenderNodeWrapperSource = never,
> = RenderNodeWrapper<TSource> | RenderNodeWrapperDescriptor<TSource>;

export type RenderNodeWrapperFunction<
  TSource extends RenderNodeWrapperSource = never,
> =
  | {
      bivarianceHack(
        elementProps: RenderNodeWrapperProps<TSource>
      ): React.ReactNode;
    }['bivarianceHack']
  | undefined;

export type RenderNodeWrapperProps<
  TSource extends RenderNodeWrapperSource = never,
> =
  RenderNodeWrapperDefinition<TSource> extends infer C extends
    AnyBasePluginDefinition
    ? EditorNodeProps<C> &
        Omit<
          RenderElementProps<
            [TSource] extends [never]
              ? Element
              : ElementWith<NoInfer<WithAnyName<C>>>
          >,
          'path'
        > & { renderPath: Path }
    : never;

type ReactRenderFields<C extends AnyBasePluginDefinition> = {
  attributes?: NodeProps<WithAnyName<C>>;
  mark?:
    | Readonly<{
        leafAttributes?: LeafNodeProps<WithAnyName<C>>;
        leafComponent?: never;
        placement?: 'leaf';
        textAttributes?: TextNodeProps<WithAnyName<C>>;
      }>
    | Readonly<{
        leafAttributes?: LeafNodeProps<WithAnyName<C>>;
        leafComponent?: NodeComponent;
        placement: 'text';
        textAttributes?: TextNodeProps<WithAnyName<C>>;
      }>;
  /**
   * Mounts one hook host per enabled plugin and view. Use React hooks here to
   * return sparse, view-local attributes for exact element keys.
   */
  useViewElementAttributes?: UseViewElementAttributes<WithAnyName<C>>;
};

type ReactSlotFields<C extends AnyBasePluginDefinition> = {
  afterContainer?: ContainerSiblingComponent;
  afterEditable?: EditableSiblingComponent;
  afterNodeChildren?: (props: RenderNodeWrapperProps<C>) => React.ReactNode;
  beforeContainer?: ContainerSiblingComponent;
  beforeEditable?: EditableSiblingComponent;
  wrapNode?: RenderNodeWrapperConfig<C>;
  wrapNodeChildren?: RenderNodeWrapper<C>;
  /** Wraps this view, including read-only views, with its exact Editable ref. */
  wrapRoot?: (
    props: EditableSiblingProps & { children: React.ReactNode }
  ) => React.ReactNode;
};

type PluginInject<C extends AnyBasePluginDefinition> = Omit<
  BasePlugin<C>['inject'],
  'nodeProps'
> &
  Nullable<{ nodeProps?: InjectNodeProps<C> }>;

type PluginRender<C extends AnyBasePluginDefinition> = Omit<
  BasePlugin<C>['render'],
  keyof ReactRenderFields<C>
> &
  Nullable<ReactRenderFields<C>>;

type PluginAuthorRender<C extends AnyBasePluginDefinition> = PluginRender<C>;

type PluginSlots<C extends AnyBasePluginDefinition> = Omit<
  BasePlugin<C>['slots'],
  keyof ReactSlotFields<C>
> &
  Nullable<ReactSlotFields<C>>;

export type Shortcut = Omit<EditorShortcut, 'handler' | 'target'> &
  (
    | {
        handler: (context: {
          editor: Editor;
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

type PluginAuthorFields<C extends AnyBasePluginDefinition> = Omit<
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
  | 'slots'
  | 'shortcuts'
  | 'prepareDocument'
  | 'update'
> & {
  api?: (context: PluginContext<C>) => InferApi<C>;
  codecs?:
    | PluginCodecMapDeclaration
    | ((context: PluginContext<C>) => PluginCodecMapDeclaration);
  component?: NodeComponent;
  decorate?: Decorate<C>;
  dependencies?: AnyBasePlugin['dependencies'];
  initialState?:
    | Partial<InferPluginStoreState<C>>
    | ((context: PluginContext<C>) => InferPluginStoreState<C>);
  inject?: PluginInject<C>;
  on?: PluginOn<C>;
  read?: (
    context: PluginContext<C> & {
      state: PluginReadState<C>;
    }
  ) => InferRead<C>;
  render?: PluginAuthorRender<C>;
  slots?: PluginSlots<C>;
  shortcuts?: Shortcuts;
  prepareDocument?: PrepareDocument<WithAnyName<C>>;
  update?: (
    context: PluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => InferUpdate<C>;
};

export type PluginDefinitionInput<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PluginAuthorFields<C>;

type PluginStageResult<TInput> = TInput extends (
  ...args: never[]
) => infer TResult
  ? PluginStageResult<TResult>
  : TInput extends RuntimePluginReference
    ? Omit<RuntimeDefinitionOf<TInput>, 'conflicts' | 'dependencies' | 'name'>
    : TInput;

type NonCallbackPlugin<TPlugin> = TPlugin extends (...args: never[]) => unknown
  ? never
  : TPlugin;

type PluginStageObject<C extends AnyBasePluginDefinition> = Omit<
  PluginAuthorFields<C>,
  | 'api'
  | 'component'
  | 'decorate'
  | 'dependencies'
  | 'initialState'
  | 'name'
  | 'read'
  | 'schema'
  | 'selectors'
  | 'update'
> & {
  api?: (context: PluginContext<C>) => object;
  decorate?: DecorateInput<C>;
  initialState?: object | ((context: PluginContext<C>) => object);
  read?: (
    context: PluginContext<C> & {
      state: PluginReadState<C>;
    }
  ) => object;
  selectors?: PluginSelectors<InferPluginStoreState<C>>;
  update?: (
    context: PluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => object;
};

/**
 * Store shape used while inferring one Plate author stage.
 *
 * @internal
 */
export type InternalPluginAuthorState<C extends AnyBasePluginDefinition> =
  InferPluginStoreState<C> extends infer TState extends object ? TState : {};

type PluginStageConflictInput<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: (
    | RuntimePluginReference
    | PluginReference
  ) &
    Readonly<{ name: TNames[TIndex] }>;
};

type PluginStageInput<
  C extends AnyBasePluginDefinition,
  TKeys extends keyof PluginStageObject<C>,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<InternalPluginAuthorState<C>>,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TShortcuts extends Shortcuts,
> = Readonly<Record<TKeys, unknown>> &
  Pick<PluginStageObject<C>, Exclude<TKeys, PluginStageSpecialKey>> &
  Readonly<{
    api?: (context: PluginContext<C>) => TApi;
    conflicts?: PluginStageConflictInput<TConflictNames>;
    decorate?: DecorateInput<C>;
    enabled?: TEnabled;
    initialState?:
      | (S & RequiredPluginState<NoInfer<S>>)
      | ((context: PluginContext<C>) => S & RequiredPluginState<NoInfer<S>>);
    read?: (
      context: PluginContext<C> & {
        state: PluginReadState<C>;
      }
    ) => TRead;
    selectors?: TSelectors & PluginSelectors<InternalPluginAuthorState<C>>;
    shortcuts?: ValidatedShortcuts<C, TShortcuts>;
    targetPlugins?: TTargetPlugins;
    update?: (
      context: PluginContext<C> & {
        context: EditorUpdateContext;
        tx: PluginTransaction<C>;
      }
    ) => TUpdate;
  }>;

type PluginStageCompatibility<
  C extends AnyBasePluginDefinition,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = PluginContributionCompatibility<InferApi<C>, TApi> &
  PluginContributionCompatibility<InferPluginStoreState<C>, S> &
  PluginContributionCompatibility<InferRead<C>, TRead> &
  PluginContributionCompatibility<InferSelectors<C>, TSelectors> &
  PluginContributionCompatibility<InferUpdate<C>, TUpdate>;

type PluginRuntimeCompatibility<
  C extends AnyBasePluginDefinition,
  TPlugin extends RuntimePluginReference,
> = PluginContributionCompatibility<
  InferApi<C>,
  InferApi<PluginStageResult<TPlugin>>
> &
  PluginContributionCompatibility<
    InferRead<C>,
    InferRead<PluginStageResult<TPlugin>>
  > &
  PluginContributionCompatibility<
    InferUpdate<C>,
    InferUpdate<PluginStageResult<TPlugin>>
  >;

export type PluginExtendInput<C extends AnyBasePluginDefinition> =
  | PluginStageObject<C>
  | RuntimePluginReference
  | ((
      context: PluginContext<C>
    ) => PluginStageObject<C> | RuntimePluginReference);

type WithValidatedShortcuts<
  C extends AnyBasePluginDefinition,
  TInput,
  TShortcuts extends Shortcuts,
> = Omit<TInput, 'shortcuts'> & {
  shortcuts?: ValidatedShortcuts<C, TShortcuts>;
};

export type PluginConfiguration<C extends AnyBasePluginDefinition> = Omit<
  BasePluginConfiguration<C>,
  | 'component'
  | 'decorate'
  | 'inject'
  | 'on'
  | 'render'
  | 'slots'
  | 'shortcuts'
  | 'prepareDocument'
> & {
  component?: NodeComponent;
  decorate?: DecorateInput<C> | null;
  inject?: PluginInject<C>;
  on?: PluginOn<C> | null;
  render?: PluginAuthorRender<C>;
  slots?: PluginSlots<C>;
  shortcuts?: Shortcuts;
  prepareDocument?: PrepareDocument<WithAnyName<C>> | null;
};

type PluginContextualFields<C extends AnyBasePluginDefinition> = {
  decorate?: Decorate<C>;
  inject: PluginInject<C>;
  on: PluginOn<C>;
  render: PluginRender<C>;
  slots: PluginSlots<C>;
  prepareDocument?: PrepareDocument<WithAnyName<C>>;
};

type ProjectPluginContextualFields<C extends AnyBasePluginDefinition> =
  Readonly<{
    [TKey in Extract<keyof C, keyof PluginContextualFields<C>>]-?: Exclude<
      PluginContextualFields<C>[TKey],
      undefined
    >;
  }>;

type PluginRuntimeShell = {
  inject: AnyBasePlugin['inject'];
  on: AnyBasePlugin['on'];
  render: AnyPluginRuntime['render'];
  slots: AnyBasePlugin['slots'] & AnyPluginRuntime['slots'];
};

type PluginDescriptor<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  BasePlugin<C>,
  | 'configure'
  | 'decorate'
  | 'extend'
  | 'inject'
  | 'on'
  | 'render'
  | 'slots'
  | 'prepareDocument'
> &
  PluginRuntimeWitness &
  PluginRuntimeShell &
  ProjectPluginContextualFields<C> &
  PluginReference<C['name']> &
  PluginDefinitionWitness<C>;

type PluginRuntime = Omit<
  AnyPluginRuntime,
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
  | 'slots'
  | 'schema'
  | 'selectors'
  | 'targetPlugins'
  | 'update'
>;

/** One exact React descriptor layered over one Base plugin. */
export interface Plugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
>
  extends
    PluginRuntime,
    PluginMethods<C>,
    RuntimePluginWitnessFor<() => LowerBasePlugin<C>>,
    BasePluginInstalledCapabilityWitness<C>,
    InferPluginNodeTypeProvider<C>,
    EditorSchemaSourceProvider<() => InferPluginSchemaContribution<C>>,
    PluginReference<C['name']>,
    PluginDefinitionWitness<C> {
  api?: (context: PluginContext<C>) => InferApi<C>;
  readonly conflicts: BasePluginDependencyDescriptors<InferConflicts<C>>;
  dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
  readonly initialState: InferPluginStoreState<C>;
  readonly name: C['name'];
  readonly on: PluginOn<C>;
  read?: (
    context: PluginContext<C> & {
      state: PluginReadState<C>;
    }
  ) => InferRead<C>;
  readonly render: PluginRender<C>;
  readonly slots: PluginSlots<C>;
  readonly schema: InferPluginSchema<C>;
  readonly selectors: InferSelectors<C>;
  readonly targetPlugins: C extends {
    targetPlugins: infer TTargetPlugins extends ReadonlyArray<
      PluginReference | string
    >;
  }
    ? TTargetPlugins
    : readonly [];
  update?: (
    context: PluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => InferUpdate<C>;
}

type PluginStageSpecialKey =
  | 'api'
  | 'conflicts'
  | 'decorate'
  | 'enabled'
  | 'initialState'
  | 'read'
  | 'selectors'
  | 'shortcuts'
  | 'targetPlugins'
  | 'update';

type PluginStageConflictReferences<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: PluginReference<
    Extract<TNames[TIndex], string>
  >;
};

type PluginStageContribution<
  TKeys extends PropertyKey,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = Readonly<{
  [TKey in Exclude<TKeys, PluginStageSpecialKey>]: true;
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
  ('decorate' extends TKeys
    ? Readonly<{ decorate: true }>
    : Readonly<Record<never, never>>) &
  ('conflicts' extends TKeys
    ? Readonly<{
        conflicts: PluginStageConflictReferences<TConflictNames>;
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

type PluginStageDefinition<
  C extends AnyBasePluginDefinition,
  TKeys extends PropertyKey,
  S extends object = {},
  TApi extends object = {},
  TRead extends object = {},
  TSelectors extends object = {},
  TUpdate extends object = {},
  TConflictNames extends readonly string[] = readonly [],
  TEnabled extends boolean = boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string> = readonly [],
> = MergePluginDefinitions<
  C,
  PluginStageContribution<
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
  PluginStageContribution<
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

/**
 * Keys accepted by one inferred Plate author stage.
 *
 * @internal
 */
export type InternalPluginAuthorStageKeys<C extends AnyBasePluginDefinition> =
  keyof PluginStageObject<C>;

/**
 * Input accepted by one inferred Plate author stage.
 *
 * @internal
 */
export type InternalPluginAuthorStageInput<
  C extends AnyBasePluginDefinition,
  TKeys extends InternalPluginAuthorStageKeys<C>,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<InternalPluginAuthorState<C>>,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TShortcuts extends Shortcuts,
> = PluginStageInput<
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
>;

/**
 * Compatibility gate shared by descriptor and factory author stages.
 *
 * @internal
 */
export type InternalPluginAuthorStageCompatibility<
  C extends AnyBasePluginDefinition,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = PluginCompatibilityArguments<
  PluginStageCompatibility<C, S, TApi, TRead, TSelectors, TUpdate>
>;

/**
 * Exact result shared by descriptor .extend() and factory .map().
 *
 * @internal
 */
export type InternalPluginAuthorExtension<
  TSource,
  C extends AnyBasePluginDefinition,
  TKeys extends PropertyKey,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = Plugin<
  PluginStageDefinition<
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
  RuntimePluginTypeProviderOf<TSource>;

export type ResolvedPlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PluginDescriptor<C>;

interface PluginMethods<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> {
  configure<const TShortcuts extends Shortcuts = {}>(
    config: (
      context: PluginContext<C>
    ) => WithValidatedShortcuts<C, PluginConfiguration<C>, TShortcuts>
  ): ConfiguredPlugin<C>;
  configure<const TShortcuts extends Shortcuts>(
    config: Omit<PluginConfiguration<C>, 'shortcuts'> &
      Readonly<{
        apply?: never;
        shortcuts: ValidatedShortcuts<C, TShortcuts>;
      }>
  ): ConfiguredPlugin<C>;
  configure(
    config: Omit<PluginConfiguration<C>, 'shortcuts'> &
      Readonly<{ apply?: never; shortcuts?: never }>
  ): ConfiguredPlugin<C>;
  /** Must precede the runtime-plugin callback overload to preserve nested contextual typing. */
  // Callback overload must precede the runtime-plugin overload for contextual inference.
  extend<
    const TKeys extends keyof PluginStageObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InternalPluginAuthorState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
      readonly [],
    const TShortcuts extends Shortcuts = {},
  >(
    stage: (
      context: PluginContext<C>
    ) => PluginStageInput<
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
    >,
    ...compatibility: PluginCompatibilityArguments<
      PluginStageCompatibility<C, S, TApi, TRead, TSelectors, TUpdate>
    >
  ): InternalPluginAuthorExtension<
    this,
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
  >;
  extend<const TPlugin extends RuntimePluginReference>(
    plugin: (
      context: PluginContext<C>
    ) => TPlugin & Readonly<{ decorate?: never }>,
    ...compatibility: PluginCompatibilityArguments<
      PluginRuntimeCompatibility<C, TPlugin>
    >
  ): Plugin<
    MergePluginDefinitions<
      C,
      PluginStageResult<TPlugin>,
      PluginStageResult<TPlugin>
    >
  > &
    RuntimePluginTypeProviderOf<this> &
    RuntimePluginTypeProviderOf<TPlugin>;
  extend<const TPlugin extends RuntimePluginReference>(
    plugin: NonCallbackPlugin<TPlugin>,
    ...compatibility: PluginCompatibilityArguments<
      PluginRuntimeCompatibility<C, TPlugin>
    >
  ): Plugin<
    MergePluginDefinitions<
      C,
      PluginStageResult<TPlugin>,
      PluginStageResult<TPlugin>
    >
  > &
    RuntimePluginTypeProviderOf<this> &
    RuntimePluginTypeProviderOf<TPlugin>;
  extend<
    const TKeys extends keyof PluginStageObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InternalPluginAuthorState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
      readonly [],
    const TShortcuts extends Shortcuts = {},
  >(
    // Invalid callbacks must not fall through to the object overload.
    stage: Readonly<{ call?: never }> &
      PluginStageInput<
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
      >,
    ...compatibility: PluginCompatibilityArguments<
      PluginStageCompatibility<C, S, TApi, TRead, TSelectors, TUpdate>
    >
  ): InternalPluginAuthorExtension<
    this,
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
  >;
}

export type ConfiguredPlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PluginDescriptor<C> &
  ConfiguredPluginDescriptor & {
    configure: never;
    extend: never;
  } & PluginReference<C['name']>;

export type PlatePlugins = AnyPlugin[];

export type TransformOptions<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BaseTransformOptions & PluginContext<C>;

export type ValidatedShortcuts<
  C extends AnyBasePluginDefinition,
  TShortcuts extends Shortcuts,
> = PluginShortcutInput<C, TShortcuts, Shortcut>;
