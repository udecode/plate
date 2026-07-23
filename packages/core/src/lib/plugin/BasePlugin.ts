import type {
  DecoratedRange,
  Descendant,
  Element,
  EditorCommit,
  EditorExtension,
  EditorInstalledApiGroups,
  EditorInstalledStateGroups,
  EditorInstalledTxGroups,
  EditorNodeChangeKind,
  EditorUpdateContext,
  NamedRootKey,
  NodeEntry,
  Path,
  Text,
  Value,
} from '@platejs/plite';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type {
  PliteElementProps,
  PliteRenderElementProps,
  PliteRenderLeafProps,
  PliteRenderTextProps,
} from '../../static';
import type { BaseEditor } from '../editor';
import type {
  PlatePluginOwnUpdate,
  PlatePluginTransaction,
} from '../editor/pluginRuntimeTypes';
import type {
  InputRulesConfig,
  InputRulesDefinition,
} from '../plugins/input-rules/types';
import type {
  AnyPluginConfig,
  AnyPluginTx,
  BaseDeserializer,
  BaseHtmlDeserializer,
  BaseInjectProps,
  PluginBase,
  PluginBaseContext,
  BaseSerializer,
  BaseTransformOptions,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  InferApi,
  InferDependencies,
  InferNestedPlugins,
  InferOptions,
  InferPluginBehaviorConfig,
  InferPluginApi,
  InferPluginConfigTree,
  InferPluginTx,
  InferPluginSchemaModel,
  InferSelectors,
  InferState,
  InferTx,
  MatchRules,
  NodeComponent,
  NodeComponents,
  ParserOptions,
  ParserPluginContext,
  PluginConfig,
  PluginReference,
  PluginSchema,
  PluginSchemaModel,
  WithAnyKey,
} from './PluginConfig';
import type { HandlerReturnType } from './HandlerReturnType';

type ErasedBasePlugin = BasePlugin<any>;
type ErasedPluginInject = Omit<
  ErasedBasePlugin['inject'],
  'nodeProps' | 'targetPluginToInject'
> & {
  nodeProps?: any;
  targetPluginToInject?:
    | ((ctx: any) => Partial<BasePlugin<AnyPluginConfig>>)
    | null;
};
type ErasedPluginHandlers = {
  onNodeChange?: ((ctx: any) => HandlerReturnType) | null;
  onTextChange?: ((ctx: any) => HandlerReturnType) | null;
};
type ErasedPluginInvariantKey =
  | '__apiExtensions'
  | '__configurationLayers'
  | '__editorApi'
  | '__editorExtensions'
  | '__extensions'
  | '__resolved'
  | '__selectorExtensions'
  | '__txExtensions'
  | 'clone'
  | 'configure'
  | 'configurePlugin'
  | 'decorate'
  | 'extend'
  | 'extendApi'
  | 'extendEditorApi'
  | 'extendExtension'
  | 'extendPlugin'
  | 'extendSelectors'
  | 'extendTx'
  | 'extendTxGroup'
  | 'handlers'
  | 'host'
  | 'inject'
  | 'options'
  | 'parser'
  | 'parsers'
  | 'plugins'
  | 'render'
  | 'rules'
  | 'schema'
  | 'transformInitialValue'
  | 'withComponent';

/** Type-erased boundary for heterogeneous plugin collections. */
export type AnyBasePlugin = Omit<ErasedBasePlugin, ErasedPluginInvariantKey> & {
  __apiExtensions: ErasedBasePlugin['__apiExtensions'];
  __configurationLayers: readonly any[];
  __editorApi: ErasedBasePlugin['__editorApi'];
  __editorExtensions: ErasedBasePlugin['__editorExtensions'];
  __extensions: ErasedBasePlugin['__extensions'];
  __resolved?: boolean;
  __selectorExtensions: ErasedBasePlugin['__selectorExtensions'];
  __txExtensions: ErasedBasePlugin['__txExtensions'];
  clone: any;
  configure: any;
  configurePlugin: any;
  decorate?: any;
  extend: any;
  extendApi: any;
  extendEditorApi: any;
  extendExtension: any;
  extendPlugin: any;
  extendSelectors: any;
  extendTx: any;
  extendTxGroup: any;
  handlers: ErasedPluginHandlers;
  host: any;
  inject: ErasedPluginInject;
  options: any;
  parser: any;
  parsers: any;
  plugins: ErasedBasePlugin['plugins'];
  render: any;
  rules: any;
  schema: any;
  transformInitialValue?: any;
  withComponent: any;
};
export type AnyResolvedBasePlugin = Omit<
  ResolvedBasePlugin<AnyPluginConfig>,
  ErasedPluginInvariantKey
> & {
  decorate?: any;
  handlers: ErasedPluginHandlers;
  host: any;
  inject: ErasedPluginInject;
  options: any;
  parser: any;
  parsers: any;
  render: any;
  rules: any;
  transformInitialValue?: any;
};

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: BasePluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

// -----------------------------------------------------------------------------

export type Deserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseDeserializer & {
    parse?: (
      options: AnyObject & BasePluginContext<C> & { element: any }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: AnyObject & BasePluginContext<C> & { element: any }
    ) => boolean;
  };

export type ResolvedBasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  BasePlugin<C>,
  keyof BasePluginMethods | 'override' | 'plugins'
>;

export type PlateEditorExtension = Omit<EditorExtension<any, any>, 'name'> & {
  key?: string;
  name?: string;
};

export type PlateEditorExtensionInput =
  | PlateEditorExtension
  | readonly PlateEditorExtension[];

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

export type ExtendPlateEditorExtension<
  C extends AnyPluginConfig = PluginConfig,
> = (
  ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
) => PlateEditorExtensionInput | undefined;

export type ExtendEditorApi<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: BasePluginContext<C>) => EA & Deep2Partial<InferApi<C>>;

export type HtmlDeserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseHtmlDeserializer & {
    /**
     * Whether to disable the default node props parsing logic. By default, all
     * data-plite-* attributes will be parsed into node props.
     *
     * @default false
     */
    disableDefaultNodeProps?: boolean;
    parse?: (
      options: ParserPluginContext<C> & {
        element: HTMLElement;
        node: Readonly<AnyObject>;
      }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: ParserPluginContext<C> & { element: HTMLElement }
    ) => boolean;
    toNodeProps?: (
      options: ParserPluginContext<C> & { element: HTMLElement }
    ) => Partial<Descendant> | undefined | void;
  };

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (options: BasePluginContext<C> & { node: Descendant }) => string;
    query?: (options: BasePluginContext<C> & { node: Descendant }) => boolean;
  };

export type InferConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : PluginConfig;

export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        BasePluginContext<C> & { nodeProps: GetInjectNodePropsOptions }
    ) => boolean;
    transformClassName?: (options: TransformOptions<C>) => any;
    transformNodeValue?: (options: TransformOptions<C>) => any;
    transformProps?: (
      options: TransformOptions<C> & { props: GetInjectNodePropsReturnType }
    ) => AnyObject | undefined;
    transformStyle?: (options: TransformOptions<C>) => AnyObject;
  };

export type LeafStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PliteRenderLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type NodeStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: PliteRenderElementProps<Element, C> & PliteRenderLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type TransformInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: BasePluginContext<C> & { value: Value }
) => Value;

export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  format?: readonly string[] | string;
  deserialize?: (
    options: ParserOptions & ParserPluginContext<C>
  ) => readonly Descendant[] | undefined;
  query?: (options: ParserOptions & ParserPluginContext<C>) => boolean;
  /** Stable compiled schema resources owned by this parser. */
  /** Whole-schema ownership for document-level codecs such as HTML/Markdown. */
  schema?: readonly Readonly<{ kind: 'schema' }>[];
  transformData?: (options: ParserOptions & ParserPluginContext<C>) => string;
  transformFragment?: (
    options: ParserOptions &
      ParserPluginContext<C> & { fragment: readonly Descendant[] }
  ) => readonly Descendant[];
};

export type PartialBasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<BasePlugin<C>>,
  'host' | 'render'
> & {
  host?: Partial<NonNullable<BasePlugin<C>['host']>>;
  render?: Partial<NonNullable<BasePlugin<C>['render']>>;
};

export type RenderStaticNodeWrapper<C extends AnyPluginConfig = any> = (
  props: RenderStaticNodeWrapperProps<C>
) => RenderStaticNodeWrapperFunction;

export type RenderStaticNodeWrapperFunction =
  | ((hocProps: PliteRenderElementProps) => React.ReactNode)
  | null
  | undefined;

export interface RenderStaticNodeWrapperProps<C extends AnyPluginConfig = any>
  extends PliteRenderElementProps<Element, C> {
  key: string;
}

export type Serializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (
      options: AnyObject & BasePluginContext<C> & { node: Descendant }
    ) => any;
    query?: (
      options: AnyObject & BasePluginContext<C> & { node: Descendant }
    ) => boolean;
  };

export type PlatePluginTxGroup<
  TGroup extends object = object,
  C extends AnyPluginConfig = AnyPluginConfig,
> = (
  transaction: PlatePluginTransaction<InferPluginConfigTree<C>>,
  editor: BaseEditor,
  context: EditorUpdateContext
) => TGroup;

export type PlatePluginTxGroups = Record<
  string,
  PlatePluginTxGroup | undefined
>;

export type PluginTx<K extends string, Group extends object> = Record<K, Group>;

export type ExtendTx<
  C extends AnyPluginConfig = PluginConfig,
  TGroup extends PlatePluginTxGroup<object, C> = PlatePluginTxGroup<object, C>,
> = (ctx: BasePluginImplementationContext<C>) => TGroup;

export type ExtendTxGroups<
  C extends AnyPluginConfig = PluginConfig,
  ETx extends PlatePluginTxGroups = PlatePluginTxGroups,
> = (ctx: BasePluginImplementationContext<C>) => ETx;

export type PlatePluginTxExtension = ExtendTxGroups<AnyPluginConfig> & {
  __plateOwnTxGroup?: true;
  __plateTxGroupKey?: string;
};

export type InferTxGroup<TGroup extends (...args: any[]) => any> =
  ReturnType<TGroup>;

type OwnPluginTx<C extends AnyPluginConfig> =
  InferPluginTx<C> extends object ? InferPluginTx<C> : never;

type HasOwnPluginTx<C extends AnyPluginConfig> = [OwnPluginTx<C>] extends [
  never,
]
  ? false
  : keyof OwnPluginTx<C> extends never
    ? false
    : true;

type ResolvedPluginTxGroup<
  C extends AnyPluginConfig,
  K extends string,
  TGroup extends PlatePluginTxGroup<any, any>,
> = K extends keyof InferTx<C>
  ? PlatePluginTxGroup<Extract<InferTx<C>[K], object>, C>
  : TGroup;

export type BasePluginContextEditor<C extends AnyPluginConfig = PluginConfig> =
  Omit<BaseEditor, 'api' | 'update'> & {
    readonly api: BaseEditor<Value, InferPluginConfigTree<C>>['api'];
    update: PlatePluginOwnUpdate<C>;
  };

export type BasePluginImplementationContext<
  C extends AnyPluginConfig = PluginConfig,
> = PluginBaseContext<C> & {
  editor: {
    readonly api: BaseEditor<Value, InferPluginConfigTree<C>>['api'];
    update: BaseEditor<Value, InferPluginConfigTree<C>>['update'];
  } & BasePluginContextEditor<C>;
  plugin: BasePlugin<C>;
};

/** Base interface for non-React Plate editor plugins. */
export type BasePlugin<C extends AnyPluginConfig = PluginConfig> =
  PluginBase<C> &
    Nullable<{
      decorate?: Decorate<WithAnyKey<C>>;
      transformInitialValue?: TransformInitialValue<WithAnyKey<C>>;
    }> &
    BasePluginMethods<C> & {
      handlers: Nullable<{
        onNodeChange?: (
          ctx: BasePluginContext<C> & {
            commit: EditorCommit;
            kind: EditorNodeChangeKind;
            node: Descendant | null;
            path: Path;
            previousPath: Path | null;
            prevNode: Descendant | null;
            root: NamedRootKey | undefined;
          }
        ) => HandlerReturnType;
        onTextChange?: (
          ctx: BasePluginContext<C> & {
            commit: EditorCommit;
            node: Descendant | null;
            path: Path;
            previousPath: Path;
            prevText: string;
            root: NamedRootKey | undefined;
            text: string;
          }
        ) => HandlerReturnType;
      }>;
      inject: Nullable<{
        nodeProps?: InjectNodeProps<C>;
        plugins?: Record<string, PartialBasePlugin<AnyPluginConfig>>;
        targetPluginToInject?: (
          ctx: BasePluginContext<C> & { targetPlugin: string }
        ) => Partial<BasePlugin<AnyPluginConfig>>;
      }>;
      override: {
        components?: NodeComponents;
        plugins?: Record<string, PartialBasePlugin<AnyPluginConfig>>;
      };
      parser: Nullable<Parser<WithAnyKey<C>>>;
      parsers:
        | (Record<
            string,
            {
              deserializer?: Deserializer<WithAnyKey<C>>;
              serializer?: Serializer<WithAnyKey<C>>;
            }
          > & { html?: never })
        | {
            html?: Nullable<{
              deserializer?: HtmlDeserializer<WithAnyKey<C>>;
              serializer?: HtmlSerializer<WithAnyKey<C>>;
            }>;
          };
      /**
       * Recursive plugin support to allow having multiple plugins in a single
       * plugin. Plate eventually flattens all the plugins into the editor.
       */
      plugins: NonNullable<C['plugins']>;
      render: Nullable<{
        /**
         * When other plugins' `node` components are rendered, this function can
         * return an optional wrapper function that turns a `node`'s props to a
         * wrapper React node as its parent. Useful for wrapping or decorating
         * nodes with additional UI elements.
         *
         * NOTE: The function can run React hooks. NOTE: Do not run React hooks
         * in the wrapper function. It is not equivalent to a React component.
         */
        aboveNodes?: RenderStaticNodeWrapper<WithAnyKey<C>>;
        /**
         * When other plugins' `node` components are rendered, this function can
         * return an optional wrapper function that turns a `node`'s props to a
         * wrapper React node. The wrapper node is the `node`'s child and its
         * original children's parent. Useful for wrapping or decorating nodes
         * with additional UI elements.
         *
         * NOTE: The function can run React hooks. NOTE: Do not run React hooks
         * in the wrapper function. It is not equivalent to a React component.
         */
        belowNodes?: RenderStaticNodeWrapper<WithAnyKey<C>>;
        /** Renders a component after the main editor container. */
        afterContainer?: () => React.ReactElement<any> | null;
        /**
         * Renders a component after the `Editable` component. This is the last
         * render position within the editor structure.
         */
        afterEditable?: () => React.ReactElement<any> | null;
        /** Renders a component before the main editor container. */
        beforeContainer?: () => React.ReactElement<any> | null;
        /** Renders a component before the `Editable` component. */
        beforeEditable?: () => React.ReactElement<any> | null;
        /**
         * Function to render content below the root element but above its
         * children. Similar to belowNodes but renders directly in the element
         * rather than wrapping. Multiple plugins can provide this, and all
         * their content will be rendered in sequence.
         */
        belowRootNodes?: (
          props: PliteElementProps<Element, WithAnyKey<C>>
        ) => React.ReactNode;
        /** Override `data-plite-leaf` element attributes. */
        leafProps?: LeafStaticProps<WithAnyKey<C>>;
        /** Override rendered element/text/leaf attributes. */
        nodeProps?: NodeStaticProps<WithAnyKey<C>>;
        /** Override `data-plite-node="text"` element attributes. */
        textProps?: TextStaticProps<WithAnyKey<C>>;
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
          } & BasePluginContext<C>
        ) => boolean;
      };
      /**
       * Keyboard shortcuts configuration mapping shortcut names to their key
       * combinations and handlers. Each shortcut can link to a public update
       * command, an API method, or use a custom handler function.
       */
      shortcuts: Record<string, EditorShortcut | null | undefined>;
      inputRules: InputRulesDefinition | InputRulesConfig;
      tx: PlatePluginTxGroups;
    };

export type BasePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  State = {},
  D extends readonly unknown[] = readonly [],
  EO = {},
  EA = {},
  ES = {},
  P extends readonly unknown[] = readonly PluginReference[],
  SchemaModel = never,
  PluginApi = {},
> = Partial<
  Omit<
    BasePlugin<
      PluginConfig<K, O, A, Tx, S, State, D, P, SchemaModel, PluginApi>
    >,
    keyof BasePluginMethods | 'api' | 'options' | 'schema' | 'type'
  > & {
    api: Deep2Partial<A> & EA;
    options: Partial<O> & EO;
    schema: PluginSchema<
      PluginConfig<K, O, A, Tx, S, State, D, P, SchemaModel, PluginApi>
    > | null;
    selectors: Partial<S> & ES;
    type: string;
  }
>;

type RuntimeBasePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
> = Omit<
  BasePluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    EO,
    EA,
    ES,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >,
  'host' | 'parser' | 'parsers' | 'plugins' | 'render' | 'schema' | 'type'
> & {
  plugins?: readonly AnyBasePlugin[];
  render?: Omit<NonNullable<BasePlugin<C>['render']>, 'isDecoration'> | null;
};

type ContextualBasePluginConfig<C extends AnyPluginConfig> = Pick<
  RuntimeBasePluginConfig<C>,
  'handlers' | 'options' | 'render' | 'shortcuts'
>;

type BaseShortcutRecord = Record<string, EditorShortcut | null | undefined>;

type WithValidatedBaseShortcuts<
  C extends AnyPluginConfig,
  TConfig,
  TShortcuts extends BaseShortcutRecord,
> = Omit<TConfig, 'shortcuts'> & {
  shortcuts?: PluginShortcutInput<C, TShortcuts>;
};

type PluginConfigurationLayer<C extends AnyPluginConfig> =
  | Readonly<{
      kind: 'context';
      value: (ctx: BasePluginContext<C>) => ContextualBasePluginConfig<C>;
    }>
  | Readonly<{
      kind: 'object';
      value: BasePluginConfig<
        C['key'],
        InferOptions<C>,
        InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        {},
        {},
        {},
        InferNestedPlugins<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>
      >;
    }>;

/** Plugin descriptor returned by `extend`, with its inferred additions merged. */
export type ExtendedBasePlugin<
  C extends AnyPluginConfig,
  EO,
  EA,
  ES,
> = BasePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >
>;

/** @internal Nameable boundary for downstream declaration emit. */
export type ExtendedBasePluginWithExtension<
  C extends AnyPluginConfig,
  TExtensionApi,
  TExtensionTx,
  TExtensionState,
> = BasePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C> & TExtensionApi,
    InferTx<C> & TExtensionTx,
    InferSelectors<C>,
    InferState<C> & TExtensionState,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >
>;

type PluginAuthoringMethod =
  | 'clone'
  | 'configure'
  | 'configurePlugin'
  | 'extend'
  | 'extendApi'
  | 'extendEditorApi'
  | 'extendExtension'
  | 'extendPlugin'
  | 'extendSelectors'
  | 'extendTx'
  | 'extendTxGroup'
  | 'withComponent';

type TerminalPluginAuthoringMethods = {
  [K in PluginAuthoringMethod]: never;
};

/** Plugin descriptor after its single consumer configuration. */
export type ConfiguredBasePlugin<C extends AnyPluginConfig = PluginConfig> =
  BasePlugin<C> &
    TerminalPluginAuthoringMethods & {
      /** @internal Prevents authoring after consumer configuration. */
      readonly __configured: true;
    };

type ConfiguredBasePluginType<
  C extends AnyPluginConfig,
  TType extends string,
> = ConfiguredBasePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    [InferPluginSchemaModel<C>] extends [never]
      ? PluginSchemaModel<TType, null>
      : InferPluginSchemaModel<C> extends PluginSchemaModel<
            string,
            infer TSchema
          >
        ? PluginSchemaModel<TType, TSchema>
        : PluginSchemaModel<TType, null>,
    InferPluginApi<C>
  >
>;

export type BasePluginContext<C extends AnyPluginConfig = PluginConfig> =
  PluginBaseContext<C> & {
    editor: BasePluginContextEditor<C>;
    plugin: BasePlugin<C>;
  };

type BasePluginMethodConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
> = {
  api?: Deep2Partial<InferApi<C>> & EA;
  options?: Partial<InferOptions<C>> & EO;
  selectors?: Partial<InferSelectors<C>> & ES;
};

type BasePluginMethodConfigFromPlugin<P, EO = {}, EA = {}, ES = {}> = {
  api?: Deep2Partial<InferApi<InferConfig<P>>> & EA;
  options?: Partial<P extends { options: infer O } ? O : {}> & EO;
  selectors?: Partial<P extends { selectors: infer S } ? S : {}> & ES;
};

export type BasePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __configurationLayers: readonly PluginConfigurationLayer<C>[];
  /** @internal Root editor API declarations carried by this descriptor. */
  __editorApi: InferApi<C>;
  __editorExtensions: ExtendPlateEditorExtension<AnyPluginConfig>[];
  __extensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __selectorExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: PlatePluginTxExtension[];
  clone(): BasePlugin<C>;
  /**
   * Applies this descriptor's single terminal consumer configuration.
   *
   * Declare reusable behavior with `extend*` before this call. Contextual
   * callbacks can override existing options, handlers, renderers, and
   * shortcuts without widening the plugin contract. Extensions read the
   * configured values, while this configuration remains the final override.
   */
  configure<const TShortcuts extends BaseShortcutRecord = {}>(
    config: (
      ctx: BasePluginContext<C>
    ) => WithValidatedBaseShortcuts<
      C,
      ContextualBasePluginConfig<C>,
      TShortcuts
    >
  ): ConfiguredBasePlugin<C>;
  configure<
    const TType extends string,
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    config: WithValidatedBaseShortcuts<
      C,
      BasePluginConfig<
        C['key'],
        InferOptions<C>,
        InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        {},
        {},
        {},
        InferNestedPlugins<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>
      > & { type: TType },
      TShortcuts
    >
  ): ConfiguredBasePluginType<C, TType>;
  configure<
    const TShortcuts extends BaseShortcutRecord = {},
    const TConfiguration extends BasePluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      {},
      {},
      {},
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    > = BasePluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      {},
      {},
      {},
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >,
  >(
    config: WithValidatedBaseShortcuts<C, TConfiguration, TShortcuts>
  ): TConfiguration extends Readonly<{
    type: infer TType extends string;
  }>
    ? ConfiguredBasePluginType<C, TType>
    : ConfiguredBasePlugin<C>;
  configurePlugin<P extends AnyBasePlugin | { key: string }>(
    plugin: P,
    config: BasePluginMethodConfigFromPlugin<P>
  ): BasePlugin<C>;
  extend<
    EO = {},
    EA = {},
    ES = {},
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    extendConfig:
      | ((
          ctx: BasePluginContext<C>
        ) => WithValidatedBaseShortcuts<
          C,
          RuntimeBasePluginConfig<C, EO, EA, ES>,
          TShortcuts
        >)
      | WithValidatedBaseShortcuts<
          PluginConfig<
            C['key'],
            InferOptions<C>,
            EA & InferApi<C>,
            InferTx<C>,
            InferSelectors<C>,
            InferState<C>,
            InferDependencies<C>,
            InferNestedPlugins<C>,
            InferPluginSchemaModel<C>,
            InferPluginApi<C>
          >,
          BasePluginConfig<
            C['key'],
            InferOptions<C>,
            InferApi<C>,
            InferTx<C>,
            InferSelectors<C>,
            InferState<C>,
            InferDependencies<C>,
            EO,
            EA,
            ES,
            InferNestedPlugins<C>,
            InferPluginSchemaModel<C>,
            InferPluginApi<C>
          >,
          TShortcuts
        >
  ): ExtendedBasePlugin<C, EO, EA, ES>;
  extendExtension<const TExtension extends PlateEditorExtensionInput>(
    extension:
      | TExtension
      | ((
          ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
        ) => TExtension | undefined)
  ): ExtendedBasePluginWithExtension<
    C,
    ExtensionApiFromArgument<TExtension>,
    ExtensionTxFromArgument<TExtension>,
    ExtensionStateFromArgument<TExtension>
  >;
  extendExtension<
    const TKey extends string,
    const TExtension extends PlateEditorExtensionInput,
  >(
    key: TKey,
    extension:
      | TExtension
      | ((
          ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
        ) => TExtension | undefined)
  ): ExtendedBasePluginWithExtension<
    C,
    ExtensionApiFromArgument<TExtension>,
    ExtensionTxFromArgument<TExtension>,
    ExtensionStateFromArgument<TExtension>
  >;
  extendApi<
    EA extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: BasePluginContext<C>) => EA
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C> & EA
    >
  >;
  extendEditorApi<
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: ExtendEditorApi<C, EA>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      {
        [TApiKey in keyof (EA & InferApi<C>)]: (EA &
          InferApi<C>)[TApiKey] extends (...args: any[]) => any
          ? (EA & InferApi<C>)[TApiKey]
          : {
              [TMethodKey in keyof (EA & InferApi<C>)[TApiKey]]: (EA &
                InferApi<C>)[TApiKey][TMethodKey];
            };
      },
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  extendPlugin<
    P extends AnyBasePlugin | { key: string },
    EO = {},
    EA = {},
    ES = {},
  >(
    plugin: P,
    extendConfig: BasePluginMethodConfig<InferConfig<P>, EO, EA, ES>
  ): BasePlugin<C>;
  extendSelectors<
    ES extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: BasePluginContext<C>) => ES
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  extendTx(
    extension: HasOwnPluginTx<C> extends true
      ? ExtendTx<C, PlatePluginTxGroup<OwnPluginTx<C>, C>>
      : never
  ): BasePlugin<C>;
  extendTx<TGroup extends object>(
    extension: ExtendTx<C, PlatePluginTxGroup<TGroup, C>>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> & PluginTx<C['key'], TGroup>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  extendTxGroup<
    K extends string,
    TGroup extends PlatePluginTxGroup<any, any> = PlatePluginTxGroup,
  >(
    key: K,
    extension: (
      ctx: BasePluginImplementationContext<C>
    ) => ResolvedPluginTxGroup<C, K, TGroup>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> &
        PluginTx<K, InferTxGroup<ResolvedPluginTxGroup<C, K, TGroup>>>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  /** Returns a new instance of the plugin with the component. */
  withComponent(component: NodeComponent): BasePlugin<C>;
  __resolved?: boolean;
};

export type BasePlugins = AnyBasePlugin[];

export type TextStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PliteRenderTextProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & BasePluginContext<C>;

type EditorShortcutOptions = {
  keys?: (({} & string)[][] | readonly string[] | string) | null;
  delimiter?: string;
  description?: string;
  document?: Document;
  enabled?: Trigger;
  enableOnContentEditable?: boolean;
  enableOnFormTags?: boolean;
  ignoreEventWhenPrevented?: boolean;
  ignoreModifiers?: boolean;
  keydown?: boolean;
  keyup?: boolean;
  preventDefault?: Trigger;
  priority?: number;
  scopes?: readonly string[] | string;
  splitKey?: string;
  useKey?: boolean;
  ignoreEventWhen?: (e: KeyboardEvent) => boolean;
};

export type EditorShortcut = EditorShortcutOptions &
  (
    | {
        handler: (ctx: {
          editor: BaseEditor<any, any>;
          event: KeyboardEvent;
          eventDetails: any;
        }) => boolean | void;
        target?: never;
      }
    | {
        handler?: never;
        /** Disambiguates a command name present in both public namespaces. */
        target?: 'api' | 'update';
      }
  );

type ShortcutFunctionKey<T> = {
  [K in keyof T]-?: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T] &
  string;

type PluginShortcutUpdateKey<C extends AnyPluginConfig> = ShortcutFunctionKey<
  InferPluginTx<C>
>;

type PluginShortcutPluginApiKey<C extends AnyPluginConfig> =
  ShortcutFunctionKey<InferPluginApi<C>>;

type PluginShortcutEditorApiKey<C extends AnyPluginConfig> =
  ShortcutFunctionKey<InferApi<C>>;

type PluginShortcutApiKey<C extends AnyPluginConfig> =
  | PluginShortcutEditorApiKey<C>
  | PluginShortcutPluginApiKey<C>;

type PluginShortcutApiScopeCollisionKey<C extends AnyPluginConfig> = Extract<
  PluginShortcutEditorApiKey<C>,
  PluginShortcutPluginApiKey<C>
>;

type ShortcutWithHandler<TShortcut> = Extract<
  TShortcut,
  { handler: (...args: any[]) => any }
>;

type ShortcutWithoutHandler<TShortcut> = Exclude<
  TShortcut,
  ShortcutWithHandler<TShortcut>
>;

type PluginShortcutForKey<
  C extends AnyPluginConfig,
  K extends string,
  TShortcut,
> =
  K extends PluginShortcutApiScopeCollisionKey<C>
    ? ShortcutWithHandler<TShortcut>
    : K extends PluginShortcutUpdateKey<C>
      ? K extends PluginShortcutApiKey<C>
        ?
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & {
                target: 'api' | 'update';
              })
        :
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & { target?: 'update' })
      : K extends PluginShortcutApiKey<C>
        ?
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & { target?: 'api' })
        : ShortcutWithHandler<TShortcut>;

/**
 * Validate inferred shortcut object keys against callable plugin commands.
 * Unknown names require a custom handler; ambiguous names require an explicit
 * route, except plugin/editor API collisions which require a custom handler.
 */
export type PluginShortcutInput<
  C extends AnyPluginConfig,
  TShortcuts extends Record<string, TShortcut | null | undefined>,
  TShortcut = EditorShortcut,
> = TShortcuts & {
  [K in keyof TShortcuts]: K extends string
    ?
        | Extract<TShortcuts[K], null | undefined>
        | (Exclude<TShortcuts[K], null | undefined> extends never
            ? never
            : PluginShortcutForKey<C, K, TShortcut>)
    : never;
};

type Trigger =
  | ((keyboardEvent: KeyboardEvent, hotkeysEvent: any) => boolean)
  | boolean;
