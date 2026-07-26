import type React from 'react';

import type {
  DecoratedRange,
  EditorClipboardMiddlewareMap,
  Element,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorInstalledApiGroups,
  EditorInstalledStateGroups,
  EditorInstalledTxGroups,
  EditorUpdateContext,
  EditorExtension,
  EditorExtensionApiFactory,
  NodeEntry,
  Path,
  Text,
  Value,
} from '@platejs/plite';
import type { TxReadMethod } from '@platejs/plite/internal';
import type {
  HotkeysEvent,
  HotkeysOptions,
  Keys,
} from '@udecode/react-hotkeys';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type {
  AnyPluginConfig,
  BasePluginExtensionContract,
  BaseInjectProps,
  PluginBase,
  PluginBaseContext,
  BaseTransformOptions,
  BasePluginOverride,
  EditableProps,
  AnyPluginTx,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  HandlerReturnType,
  HtmlParser,
  InferApi,
  InferDependencies,
  InferEnabled,
  InferOptions,
  InferPluginApi,
  InferPluginConfigTree,
  InferPluginSchemaModel,
  InferSelectors,
  InferState,
  InferTx,
  MatchRules,
  NodeComponent,
  NodeComponents,
  PlatePluginExtensionEditor,
  PlatePluginTxGroups,
  PluginConfig,
  PluginReference,
  PluginSchema,
  PluginSchemaModel,
  PluginShortcutInput,
  BasePlugin,
  DefineEditorExtension,
  DefinePluginCodecs,
  PluginCodecMapDeclaration,
  PlatePluginReadState,
  PlatePluginTransaction,
  WithAnyKey,
} from '../../lib';
import type {
  InputRulesConfig,
  InputRulesDefinition,
} from '../../lib/plugins/input-rules/types';
import type { PlateElementProps, PlateLeafProps } from '../components';
import type { PlateEditor } from '../editor/PlateEditor';
import type { DOMHandlers } from './DOMHandlers';

export type AnyEditorPlatePlugin = EditorPlatePlugin<AnyPluginConfig>;

export type AnyPlatePlugin = PlatePlugin<AnyPluginConfig>;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

export type EditableSiblingComponent = (
  editableProps: EditableProps
) => React.ReactElement<any> | null;

// -----------------------------------------------------------------------------

export type EditorPlatePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  PlatePlugin<C>,
  keyof PlatePluginMethods
>;

export type PlateEditorExtension<C extends AnyPluginConfig = PluginConfig> =
  Omit<EditorExtension<any, any>, 'clipboard' | 'name'> & {
    clipboard?: EditorClipboardMiddlewareMap<PlateEditor<Value, C>>;
    key?: string;
    name?: string;
  };

export type PlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> = PlateEditorExtension<C> | readonly PlateEditorExtension<C>[];

type ContextualPlateEditorExtension<C extends AnyPluginConfig = PluginConfig> =
  Omit<
    EditorExtension<PlatePluginExtensionEditor<C>>,
    'api' | 'clipboard' | 'name'
  > & {
    api?:
      | (Record<string, unknown | readonly unknown[]> &
          Deep2Partial<InferApi<C>>)
      | EditorExtensionApiFactory<PlatePluginExtensionEditor<C>>;
    clipboard?: EditorClipboardMiddlewareMap<PlateEditor<Value, C>>;
    key?: string;
    name?: string;
  };

type ContextualPlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> =
  | ContextualPlateEditorExtension<C>
  | readonly ContextualPlateEditorExtension<C>[];

type AuthoringPlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> = ContextualPlateEditorExtensionInput<C>;

type UnifiedEditorExtensionInput<
  C extends AnyPluginConfig,
  TExtension extends object | readonly object[],
> = TExtension &
  (TExtension extends { api: (...args: any[]) => any }
    ? {}
    : NoInfer<AuthoringPlateEditorExtensionInput<C>>);

type ExtensionInputFromArgument<TExtension> = TExtension extends (
  ...args: any[]
) => infer TResult
  ? NonNullable<TResult>
  : TExtension;

type ExtensionTuple<TExtension> = TExtension extends readonly unknown[]
  ? TExtension
  : readonly [TExtension];

type ExtensionItemWithImplicitName<TExtension> = TExtension extends object
  ? TExtension extends { name: infer TName }
    ? TExtension & { name: TName }
    : TExtension & { name: string }
  : TExtension;

type ExtensionInputWithImplicitNames<TExtension> =
  ExtensionInputFromArgument<TExtension> extends infer TInput
    ? TInput extends readonly unknown[]
      ? { [K in keyof TInput]: ExtensionItemWithImplicitName<TInput[K]> }
      : ExtensionItemWithImplicitName<TInput>
    : never;

type ExtensionApiFromArgument<TExtension> = EditorInstalledApiGroups<
  ExtensionTuple<ExtensionInputWithImplicitNames<TExtension>>
>;

type ExtensionStateFromArgument<TExtension> = EditorInstalledStateGroups<
  Value,
  ExtensionTuple<ExtensionInputWithImplicitNames<TExtension>>
>;

type ExtensionTxFromArgument<TExtension> = EditorInstalledTxGroups<
  Value,
  ExtensionTuple<ExtensionInputWithImplicitNames<TExtension>>
>;

type NormalizeExtensionContribution<TContribution> = [TContribution] extends [
  never,
]
  ? {}
  : unknown extends TContribution
    ? {}
    : string extends keyof TContribution
      ? {}
      : TContribution;

type ExtensionApiContribution<TExtension> = [keyof TExtension] extends [never]
  ? {}
  : NormalizeExtensionContribution<ExtensionApiFromArgument<TExtension>>;
type ExtensionStateContribution<TExtension> = [keyof TExtension] extends [never]
  ? {}
  : NormalizeExtensionContribution<ExtensionStateFromArgument<TExtension>>;
type ExtensionTxContribution<TExtension> = [keyof TExtension] extends [never]
  ? {}
  : NormalizeExtensionContribution<ExtensionTxFromArgument<TExtension>>;

export type InferConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends PlatePlugin<infer C> | BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : PluginConfig;

/** Properties used by Plate to inject props into any {@link NodeComponent}. */
export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    /** Whether to inject the props. If true, overrides all other checks. */
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        PlatePluginContext<C> & {
          nodeProps: GetInjectNodePropsOptions;
        }
    ) => boolean;
    /**
     * Transform the className.
     *
     * @default clsx(className, classNames[value])
     */
    transformClassName?: (options: TransformOptions<C>) => any;
    /**
     * Transform the node value for the style or className.
     *
     * @default nodeValue
     */
    transformNodeValue?: (options: TransformOptions<C>) => any;
    /** Transform the injected props. */
    transformProps?: (
      options: TransformOptions<C> & {
        props: GetInjectNodePropsReturnType;
      }
    ) => AnyObject | undefined;
    /**
     * Transform the style.
     *
     * @default { ...style, [styleKey]: value }
     */
    transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
  };

// -----------------------------------------------------------------------------

export type LeafNodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PlateLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

/**
 * Property used by Plate to override node `component` props. If function, its
 * returning value will be shallow merged to the old props, with the old props
 * as parameter. If object, its value will be shallow merged to the old props.
 */
export type NodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: PlateElementProps<Element, C> & PlateLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type TransformInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & { value: Value }
) => Value;

// -----------------------------------------------------------------------------

/**
 * Function called whenever a canonical node change occurs. Return `true`
 * to prevent calling the next plugin handler.
 */
export type OnNodeChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & Omit<EditorNodeChangeContext, 'editor'>
) => HandlerReturnType;

/**
 * Function called whenever a canonical text change occurs. Return `true`
 * to prevent calling the next plugin handler.
 */
export type OnTextChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & Omit<EditorTextChangeContext, 'editor'>
) => HandlerReturnType;

type PlatePluginDependencyDescriptors<D extends readonly PluginReference[]> = {
  readonly [TIndex in keyof D]: D[TIndex] extends {
    readonly __config: infer C extends AnyPluginConfig;
  }
    ? PlatePlugin<C>
    : D[TIndex];
};

/**
 * Used by parser plugins like html to deserialize inserted data to a Plite
 * fragment. The fragment will be inserted to the editor if not empty.
 */
// -----------------------------------------------------------------------------

/** The `PlatePlugin` interface is a React interface for all plugins. */
export type PlatePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  PluginBase<C>,
  'dependencies'
> & {
  dependencies: PlatePluginDependencyDescriptors<InferDependencies<C>>;
} & Nullable<{
    /** @see {@link Decorate} */
    decorate?: Decorate<C>;
    /** Transform the initial value before the editor is ready. */
    transformInitialValue?: TransformInitialValue<WithAnyKey<C>>;
    /** @see {@link UseHooks} */
    useHooks?: UseHooks<WithAnyKey<C>>;
  }> &
  PlatePluginMethods<C> & {
    /**
     * Handlers called whenever the corresponding event occurs in the editor.
     * Event handlers can return a boolean flag to specify whether the event
     * can be treated as being handled. If it returns `true`, the next
     * handlers will not be called.
     */
    handlers: Nullable<
      DOMHandlers<WithAnyKey<C>> & {
        /** @see {@link OnNodeChange} */
        onNodeChange?: OnNodeChange<WithAnyKey<C>>;
        /** @see {@link OnTextChange} */
        onTextChange?: OnTextChange<WithAnyKey<C>>;
      }
    >;
    /** Plugin injection. */
    inject: Nullable<{
      nodeProps?: InjectNodeProps<WithAnyKey<C>>;
    }>;
    override: {
      /** Replace plugin {@link NodeComponent} by key. */
      components?: NodeComponents;
      /**
       * Weakly adapts already-installed foreign plugins by key.
       *
       * Missing targets are ignored. Configure an imported target descriptor
       * directly when exact target inference is required.
       */
      plugins?: Record<string, BasePluginOverride>;
    };
    parsers: {
      html?: Nullable<HtmlParser<WithAnyKey<C>>>;
    };
    render: Nullable<{
      /**
       * When other plugins' node components are rendered, this function can
       * return an optional wrapper function that turns a node's props to a
       * wrapper React node as its parent. Useful for wrapping or decorating
       * nodes with additional UI elements.
       *
       * NOTE: The function can run React hooks. NOTE: Do not run React hooks
       * in the wrapper function. It is not equivalent to a React component.
       */
      aboveNodes?: RenderNodeWrapper<WithAnyKey<C>>;
      /** Renders a component after the `Container` component. */
      afterContainer?: EditableSiblingComponent;
      /**
       * Renders a component after the `Editable` component. This is the last
       * render position within the editor structure.
       */
      afterEditable?: EditableSiblingComponent;
      /** Renders a component before the `Container` component. */
      beforeContainer?: EditableSiblingComponent;
      /** Renders a component before the `Editable` component. */
      beforeEditable?: EditableSiblingComponent;
      /**
       * When other plugins' node components are rendered, this function can
       * return an optional wrapper function that turns a node's props to a
       * wrapper React node. The wrapper node is the node's child and its
       * original children's parent. Useful for wrapping or decorating nodes
       * with additional UI elements.
       *
       * NOTE: The function can run React hooks. NOTE: Do not run React hooks
       * in the wrapper function. It is not equivalent to a React component.
       */
      belowNodes?: RenderNodeWrapper<WithAnyKey<C>>;
      /**
       * Function to render content below the root element but above its
       * children. Similar to belowNodes but renders directly in the element
       * rather than wrapping. Multiple plugins can provide this, and all
       * their content will be rendered in sequence.
       */
      belowRootNodes?: (
        props: PlateElementProps<Element, C>
      ) => React.ReactNode;
      /** Override `data-plite-leaf` element attributes. */
      leafProps?: LeafNodeProps<WithAnyKey<C>>;
      /** Override rendered element/text/leaf attributes. */
      nodeProps?: NodeProps<WithAnyKey<C>>;
      /** Override `data-plite-node="text"` element attributes. */
      textProps?: TextNodeProps<WithAnyKey<C>>;
    }>;
    rules: {
      /**
       * Function to determine if this plugin's rules should apply to a node.
       * Used to override behavior based on node properties beyond just type
       * matching.
       *
       * Example: List plugin sets `match: ({ node }) => !!node.listStyleType`
       * to override paragraph behavior when the paragraph is a list item.
       *
       * @default type === node.type
       */
      match?: (
        options: {
          node: Element;
          path: Path;
          rule: MatchRules;
        } & PlatePluginContext<C>
      ) => boolean;
    };
    /**
     * Keyboard shortcuts configuration mapping shortcut names to their key
     * combinations and handlers. Each shortcut can link to a public update
     * command, an API method, or use a custom handler function.
     */
    shortcuts: Record<string, Shortcut | null | undefined>;
    inputRules: InputRulesDefinition | InputRulesConfig;
    tx: PlatePluginTxGroups;
  };

export type PlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  D extends readonly PluginReference[] = readonly [],
  EO = {},
  EA = {},
  ES = {},
  SchemaModel = never,
  PluginApi = {},
  Enabled extends boolean = boolean,
> = Partial<
  Omit<
    PlatePlugin<
      PluginConfig<K, O, A, Tx, S, {}, D, SchemaModel, PluginApi, Enabled>
    >,
    keyof PlatePluginMethods | 'api' | 'options' | 'render' | 'schema'
  > & {
    api: EA;
    options: Partial<O> & EO;
    render: Omit<
      NonNullable<
        PlatePlugin<
          PluginConfig<K, O, A, Tx, S, {}, D, SchemaModel, PluginApi, Enabled>
        >['render']
      >,
      'node'
    > | null;
    schema: PluginSchema<
      PluginConfig<K, O, A, Tx, S, {}, D, SchemaModel, PluginApi, Enabled>
    > | null;
    selectors: ES;
  }
>;

export type PlatePluginContext<
  C extends AnyPluginConfig = PluginConfig,
  E extends PlateEditor<any, C> = PlateEditor<any, C>,
> = PluginBaseContext<C> & {
  defineCodecs: DefinePluginCodecs<C>;
  defineEditorExtension: DefineEditorExtension<C>;
  editor: E;
  plugin: EditorPlatePlugin<C>;
};

type RuntimePlatePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
> = Omit<
  PlatePluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferDependencies<C>,
    EO,
    EA,
    ES,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    InferEnabled<C>
  >,
  'codecs' | 'component' | 'dependencies' | 'render' | 'schema' | 'type'
> & {
  render?: Omit<NonNullable<PlatePlugin<C>['render']>, 'node'> | null;
};

type PlateExtensionContractField<
  TContract extends BasePluginExtensionContract,
  TKey extends keyof BasePluginExtensionContract,
> = TKey extends keyof TContract
  ? TContract[TKey] extends object
    ? TContract[TKey]
    : {}
  : {};

type PlateContractExtension<
  _C extends AnyPluginConfig,
  T extends BasePluginExtensionContract,
> = 'extension' extends keyof T
  ? T['extension'] extends object | readonly object[]
    ? T['extension']
    : {}
  : {};

type PlateTransactionReadGroup<TGroup extends object> = {
  [TKey in keyof TGroup]: TGroup[TKey] extends (...args: any[]) => any
    ? TxReadMethod<TGroup[TKey]>
    : TGroup[TKey];
};

type PlateAdditive<TCurrent, TAddition> = [keyof TAddition] extends [never]
  ? TCurrent
  : [keyof TCurrent] extends [never]
    ? TAddition
    : Omit<TAddition, keyof TCurrent> & TCurrent;

type EffectivePlateContractField<
  TContract extends BasePluginExtensionContract,
  TKey extends Exclude<keyof BasePluginExtensionContract, 'extension'>,
  TInferred extends object,
> = [keyof PlateExtensionContractField<TContract, TKey>] extends [never]
  ? TInferred
  : PlateExtensionContractField<TContract, TKey>;

type EffectivePlateExtension<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
  TExtension extends object | readonly object[],
> = [keyof PlateContractExtension<C, TContract>] extends [never]
  ? TExtension
  : PlateContractExtension<C, TContract>;

type PlateWithGroup<TGroups, TKey extends string, TGroup extends object> = [
  keyof TGroups,
] extends [never]
  ? Record<TKey, TGroup>
  : Omit<TGroups, TKey> & Record<TKey, TGroup>;

type ExistingPlatePluginTx<C extends AnyPluginConfig> =
  InferTx<C> extends Record<C['key'], infer TTx extends object> ? TTx : {};
type ExistingPlatePluginState<C extends AnyPluginConfig> =
  InferState<C> extends Record<C['key'], infer TState extends object>
    ? TState
    : {};

type PlateExtendedTx<
  C extends AnyPluginConfig,
  TRead extends object,
  TUpdate extends object,
> = [keyof (TRead & TUpdate)] extends [never]
  ? InferTx<C>
  : PlateWithGroup<
      InferTx<C>,
      C['key'],
      PlateAdditive<
        ExistingPlatePluginTx<C>,
        PlateTransactionReadGroup<TRead> & TUpdate
      >
    >;

type PlateExtendedState<C extends AnyPluginConfig, TRead extends object> = [
  keyof TRead,
] extends [never]
  ? InferState<C>
  : PlateWithGroup<
      InferState<C>,
      C['key'],
      PlateAdditive<ExistingPlatePluginState<C>, TRead>
    >;

export type UnifiedRuntimePlatePluginConfig<
  C extends AnyPluginConfig,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
  TShortcuts extends PlateShortcutRecord,
> = {
  api?: TApi & Deep2Partial<InferPluginApi<C>>;
  codecs?: PluginCodecMapDeclaration;
  extension?: UnifiedEditorExtensionInput<C, TExtension>;
  options?: TOptions & Partial<InferOptions<C>>;
  read?: (context: {
    state: PlatePluginReadState<InferPluginConfigTree<C>>;
  }) => TRead & Partial<ExistingPlatePluginState<C>>;
  selectors?: TSelectors & Partial<InferSelectors<C>>;
  update?: (context: {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<InferPluginConfigTree<C>>;
  }) => TUpdate;
} & Omit<
  WithValidatedPlateShortcuts<
    C,
    RuntimePlatePluginConfig<C, TOptions, {}, {}>,
    TShortcuts
  >,
  'api' | 'options' | 'selectors'
>;

type PortableRuntimePlatePluginConfig<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
  TShortcuts extends PlateShortcutRecord,
> = Omit<
  UnifiedRuntimePlatePluginConfig<
    C,
    PlateExtensionContractField<TContract, 'options'>,
    PlateExtensionContractField<TContract, 'api'>,
    PlateExtensionContractField<TContract, 'read'>,
    PlateExtensionContractField<TContract, 'selectors'>,
    PlateExtensionContractField<TContract, 'update'>,
    EffectivePlateExtension<C, TContract, {}>,
    TShortcuts
  >,
  'extension'
> & {
  /**
   * Accepts an already-built Plite extension without claiming undeclared
   * editor-wide capabilities in this plugin's contract.
   */
  extension?: PlateEditorExtensionInput;
};

type UnifiedExtendedPlatePluginConfig<
  C extends AnyPluginConfig,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = PluginConfig<
  C['key'],
  PlateAdditive<InferOptions<C>, TOptions>,
  InferApi<C>,
  PlateExtendedTx<C, TRead, TUpdate>,
  PlateAdditive<InferSelectors<C>, TSelectors>,
  PlateExtendedState<C, TRead>,
  InferDependencies<C>,
  InferPluginSchemaModel<C>,
  PlateAdditive<InferPluginApi<C>, TApi>,
  InferEnabled<C>
>;

/** @internal Nameable boundary for downstream declaration emit. */
export type ExtendedPlatePluginWithExtension<
  C extends AnyPluginConfig,
  TExtensionApi,
  TExtensionTx,
  TExtensionState,
> = PlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C> & TExtensionApi,
    InferTx<C> & TExtensionTx,
    InferSelectors<C>,
    InferState<C> & TExtensionState,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    InferEnabled<C>
  >
>;

export type UnifiedExtendedPlatePlugin<
  C extends AnyPluginConfig,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtensionApi = {},
  TExtensionTx = {},
  TExtensionState = {},
> = ExtendedPlatePluginWithExtension<
  UnifiedExtendedPlatePluginConfig<
    C,
    TOptions,
    TApi,
    TRead,
    TSelectors,
    TUpdate
  >,
  TExtensionApi,
  TExtensionTx,
  TExtensionState
>;

export type UnifiedStageExtendedPlatePlugin<
  C extends AnyPluginConfig,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
> = UnifiedExtendedPlatePlugin<
  C,
  TOptions,
  TApi,
  TRead,
  TSelectors,
  TUpdate,
  ExtensionApiContribution<TExtension>,
  ExtensionTxContribution<TExtension>,
  ExtensionStateContribution<TExtension>
>;

type AuthoringPlatePluginContextConfig<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = InferConfig<
  UnifiedExtendedPlatePlugin<
    C,
    PlateExtensionContractField<TContract, 'options'>,
    PlateExtensionContractField<TContract, 'api'>,
    PlateExtensionContractField<TContract, 'read'>,
    PlateExtensionContractField<TContract, 'selectors'>,
    PlateExtensionContractField<TContract, 'update'>,
    ExtensionApiContribution<EffectivePlateExtension<C, TContract, {}>>,
    ExtensionTxContribution<EffectivePlateExtension<C, TContract, {}>>,
    ExtensionStateContribution<EffectivePlateExtension<C, TContract, {}>>
  >
>;

type AuthoringPlatePluginContext<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = Omit<PlatePluginContext<C>, 'api' | 'editor' | 'read' | 'update'> & {
  api: PlatePluginContext<
    AuthoringPlatePluginContextConfig<C, TContract>
  >['api'];
  editor: Omit<PlatePluginContext<C>['editor'], 'api' | 'update'> & {
    readonly api: PlatePluginContext<
      AuthoringPlatePluginContextConfig<C, TContract>
    >['editor']['api'];
    update: PlatePluginContext<
      AuthoringPlatePluginContextConfig<C, TContract>
    >['editor']['update'];
  };
  read: PlatePluginContext<
    AuthoringPlatePluginContextConfig<C, TContract>
  >['read'];
  update: PlatePluginContext<
    AuthoringPlatePluginContextConfig<C, TContract>
  >['update'];
};

type UnifiedStaticExtendedPlatePlugin<
  C extends AnyPluginConfig,
  EO,
  EA,
  ES,
  Enabled extends boolean,
  TExtension extends object | readonly object[],
> = ExtendedPlatePluginWithExtension<
  InferConfig<ExtendedPlatePlugin<C, EO, EA, ES, Enabled>>,
  ExtensionApiContribution<TExtension>,
  ExtensionTxContribution<TExtension>,
  ExtensionStateContribution<TExtension>
>;

type StaticPlatePluginConfigBase<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<
  PlatePluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferDependencies<C>,
    EO,
    EA,
    ES,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >,
  'component' | 'dependencies'
>;

type StaticPlatePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<StaticPlatePluginConfigBase<C, EO, EA, ES, Enabled>, 'schema'> & {
  schema?: never;
};

type TerminalPlatePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<StaticPlatePluginConfig<C, EO, EA, ES, Enabled>, 'schema'> & {
  component?: NodeComponent;
  schema?: never;
};

type ContextualPlatePluginConfig<C extends AnyPluginConfig> = Omit<
  Pick<
    RuntimePlatePluginConfig<C>,
    'handlers' | 'options' | 'render' | 'shortcuts'
  >,
  'render'
> & {
  render?: Omit<
    NonNullable<PlatePlugin<C>['render']>,
    'isDecoration' | 'node'
  > | null;
};

export type PlateShortcutRecord = Record<string, Shortcut | null | undefined>;

type WithValidatedPlateShortcuts<
  C extends AnyPluginConfig,
  TConfig,
  TShortcuts extends PlateShortcutRecord,
> = Omit<TConfig, 'shortcuts'> & {
  shortcuts?: PluginShortcutInput<C, TShortcuts, Shortcut>;
};

/** Plugin descriptor returned by `extend`, with its inferred additions merged. */
export type ExtendedPlatePlugin<
  C extends AnyPluginConfig,
  EO,
  EA,
  ES,
  Enabled extends boolean = InferEnabled<C>,
> = PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >
>;

type PlatePluginAuthoringMethod = 'clone' | 'configure' | 'extend';

type TerminalPlatePluginAuthoringMethods = {
  [K in PlatePluginAuthoringMethod]: never;
};

/** Plate plugin descriptor after its single consumer configuration. */
export type ConfiguredPlatePlugin<C extends AnyPluginConfig = PluginConfig> =
  PlatePlugin<C> &
    TerminalPlatePluginAuthoringMethods & {
      /** @internal Prevents authoring after consumer configuration. */
      readonly __configured: true;
    };

type ConfiguredPlatePluginType<
  C extends AnyPluginConfig,
  TType extends string,
  Enabled extends boolean = InferEnabled<C>,
> = ConfiguredPlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    [InferPluginSchemaModel<C>] extends [never]
      ? PluginSchemaModel<TType, null>
      : InferPluginSchemaModel<C> extends PluginSchemaModel<
            string,
            infer TSchema
          >
        ? PluginSchemaModel<TType, TSchema>
        : PluginSchemaModel<TType, null>,
    InferPluginApi<C>,
    Enabled
  >
>;

type ConfiguredPlatePluginEnabled<
  C extends AnyPluginConfig,
  Enabled extends boolean,
> = ConfiguredPlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >
>;

export type PlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: BasePlugin<C>['__apiExtensions'];
  __codecExtensions: BasePlugin<C>['__codecExtensions'];
  __htmlCodecExtensions: BasePlugin<C>['__htmlCodecExtensions'];
  __configurationLayers: BasePlugin<C>['__configurationLayers'];
  __editorExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __extensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __readExtensions: BasePlugin<C>['__readExtensions'];
  __selectorExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: BasePlugin<C>['__txExtensions'];
  clone: () => PlatePlugin<C>;
  /**
   * Applies this descriptor's single terminal consumer configuration.
   *
   * Declare reusable behavior with `extend` before this call. Contextual
   * callbacks can override existing options, handlers, renderers, and
   * shortcuts without widening the plugin contract. Extensions read the
   * configured values, while this configuration remains the final override.
   */
  // biome-ignore lint/style/useUnifiedTypeSignatures: Distinct overloads preserve contextual callback and literal static inference.
  configure<const TShortcuts extends PlateShortcutRecord = {}>(
    config: (
      ctx: PlatePluginContext<C>
    ) => WithValidatedPlateShortcuts<
      C,
      ContextualPlatePluginConfig<C>,
      TShortcuts
    >
  ): ConfiguredPlatePlugin<C>;
  configure<
    const TType extends string,
    const Enabled extends boolean,
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    config: WithValidatedPlateShortcuts<
      C,
      TerminalPlatePluginConfig<C, {}, {}, {}, Enabled> & {
        enabled: Enabled;
        type: TType;
      },
      TShortcuts
    >
  ): ConfiguredPlatePluginType<C, TType, Enabled>;
  configure<
    const TType extends string,
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    config: WithValidatedPlateShortcuts<
      C,
      TerminalPlatePluginConfig<C> & { type: TType },
      TShortcuts
    >
  ): ConfiguredPlatePluginType<C, TType>;
  configure<
    const Enabled extends boolean,
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    config: WithValidatedPlateShortcuts<
      C,
      TerminalPlatePluginConfig<C, {}, {}, {}, Enabled> & {
        enabled: Enabled;
      },
      TShortcuts
    >
  ): ConfiguredPlatePluginEnabled<C, Enabled>;
  configure<const TShortcuts extends PlateShortcutRecord = {}>(
    config: WithValidatedPlateShortcuts<
      C,
      TerminalPlatePluginConfig<C>,
      TShortcuts
    >
  ): ConfiguredPlatePlugin<C>;
  extend<
    const TContract extends BasePluginExtensionContract = {},
    const TOptions extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends object = {},
    const TUpdate extends object = {},
    const TExtension extends object | readonly object[] = {},
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    extendConfig: (
      ctx: AuthoringPlatePluginContext<C, TContract>
    ) => UnifiedRuntimePlatePluginConfig<
      C,
      EffectivePlateContractField<TContract, 'options', TOptions>,
      EffectivePlateContractField<TContract, 'api', TApi>,
      EffectivePlateContractField<TContract, 'read', TRead>,
      EffectivePlateContractField<TContract, 'selectors', TSelectors>,
      EffectivePlateContractField<TContract, 'update', TUpdate>,
      EffectivePlateExtension<C, TContract, TExtension>,
      TShortcuts
    >
  ): UnifiedExtendedPlatePlugin<
    C,
    EffectivePlateContractField<TContract, 'options', TOptions>,
    EffectivePlateContractField<TContract, 'api', TApi>,
    EffectivePlateContractField<TContract, 'read', TRead>,
    EffectivePlateContractField<TContract, 'selectors', TSelectors>,
    EffectivePlateContractField<TContract, 'update', TUpdate>,
    ExtensionApiContribution<EffectivePlateExtension<C, TContract, TExtension>>,
    ExtensionTxContribution<EffectivePlateExtension<C, TContract, TExtension>>,
    ExtensionStateContribution<
      EffectivePlateExtension<C, TContract, TExtension>
    >
  >;
  extend<
    const TContract extends BasePluginExtensionContract,
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    extendConfig: (
      ctx: AuthoringPlatePluginContext<C, TContract>
    ) => PortableRuntimePlatePluginConfig<C, TContract, TShortcuts>
  ): UnifiedExtendedPlatePlugin<
    C,
    PlateExtensionContractField<TContract, 'options'>,
    PlateExtensionContractField<TContract, 'api'>,
    PlateExtensionContractField<TContract, 'read'>,
    PlateExtensionContractField<TContract, 'selectors'>,
    PlateExtensionContractField<TContract, 'update'>,
    ExtensionApiContribution<EffectivePlateExtension<C, TContract, {}>>,
    ExtensionTxContribution<EffectivePlateExtension<C, TContract, {}>>,
    ExtensionStateContribution<EffectivePlateExtension<C, TContract, {}>>
  >;
  extend<const TExtension extends PlateEditorExtensionInput>(
    extendConfig: StaticPlatePluginConfig<C> & {
      extension: TExtension;
    }
  ): UnifiedStaticExtendedPlatePlugin<
    C,
    {},
    {},
    {},
    InferEnabled<C>,
    TExtension
  >;
  extend<
    EO = {},
    EA = {},
    ES = {},
    const TShortcuts extends PlateShortcutRecord = {},
    const Enabled extends boolean = InferEnabled<C>,
  >(
    extendConfig: WithValidatedPlateShortcuts<
      PluginConfig<
        C['key'],
        InferOptions<C>,
        EA & InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        Enabled
      >,
      StaticPlatePluginConfig<C, EO, EA, ES, Enabled>,
      TShortcuts
    >
  ): ExtendedPlatePlugin<C, EO, EA, ES, Enabled>;
  __resolved?: boolean;
};

export type PlatePlugins = AnyPlatePlugin[];

export type RenderNodeWrapper<C extends AnyPluginConfig = any> = (
  props: RenderNodeWrapperProps<C>
) => RenderNodeWrapperFunction;

export type RenderNodeWrapperFunction =
  | ((elementProps: PlateElementProps) => React.ReactNode)
  | undefined;

export interface RenderNodeWrapperProps<C extends AnyPluginConfig = any>
  extends PlateElementProps<Element, C> {
  key: string;
}

type ShortcutOptions = HotkeysOptions & {
  keys?: Keys | null;
  priority?: number;
};

export type Shortcut = ShortcutOptions &
  (
    | {
        handler: (ctx: {
          editor: PlateEditor;
          event: KeyboardEvent;
          eventDetails: HotkeysEvent;
        }) => boolean | void;
        target?: never;
      }
    | {
        handler?: never;
        /** Disambiguates a command name present in both public namespaces. */
        target?: 'api' | 'update';
      }
  );

export type Shortcuts = Record<string, Shortcut | null | undefined>;

export type TextNodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PlateLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & PlatePluginContext<C>;

/** Hook called when the editor is initialized. */
export type UseHooks<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => void;
