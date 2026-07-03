import type {
  DecoratedRange,
  Descendant,
  Element,
  EditorExtension,
  EditorInstalledApiGroups,
  EditorInstalledStateGroups,
  EditorInstalledTxGroups,
  NodeEntry,
  NodeOperation,
  Path,
  TextOperation,
  Text,
  Value,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdateOptions,
  EditorUpdateTransaction,
} from '@platejs/plite';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type {
  PliteElementProps,
  SlateRenderElementProps,
  SlateRenderLeafProps,
  SlateRenderTextProps,
} from '../../static';
import type { BaseEditor } from '../editor';
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
  InferOptions,
  InferPluginApi,
  InferPluginTx,
  InferSelectors,
  InferState,
  InferTx,
  MatchRules,
  NodeComponent,
  NodeComponents,
  ParserOptions,
  PluginConfig,
  WithAnyKey,
} from './SlatePlugin';
import type { HandlerReturnType } from './HandlerReturnType';

export type AnyBasePlugin = BasePlugin<AnyPluginConfig>;
export type AnyResolvedBasePlugin = ResolvedBasePlugin<AnyPluginConfig>;

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
> = (ctx: BasePluginContext<C>) => PlateEditorExtensionInput | undefined;

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
      options: BasePluginContext<C> & {
        element: HTMLElement;
        node: AnyObject;
      }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: BasePluginContext<C> & { element: HTMLElement }
    ) => boolean;
    toNodeProps?: (
      options: BasePluginContext<C> & { element: HTMLElement }
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
  | ((props: SlateRenderLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type NodeStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: SlateRenderElementProps<Element, C> & SlateRenderLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type TransformInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: BasePluginContext<C> & { value: Value }
) => Value;

export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  format?: string[] | string;
  mimeTypes?: string[];
  deserialize?: (
    options: ParserOptions & BasePluginContext<C>
  ) => Descendant[] | undefined;
  preInsert?: (
    options: ParserOptions & BasePluginContext<C> & { fragment: Descendant[] }
  ) => HandlerReturnType;
  query?: (options: ParserOptions & BasePluginContext<C>) => boolean;
  transformData?: (options: ParserOptions & BasePluginContext<C>) => string;
  transformFragment?: (
    options: ParserOptions & BasePluginContext<C> & { fragment: Descendant[] }
  ) => Descendant[];
};

export type PartialBasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<BasePlugin<C>>,
  'node'
> & {
  node?: Partial<BasePlugin<C>['node']>;
};

export type RenderStaticNodeWrapper<C extends AnyPluginConfig = PluginConfig> =
  (props: RenderStaticNodeWrapperProps<C>) => RenderStaticNodeWrapperFunction;

export type RenderStaticNodeWrapperFunction =
  | ((hocProps: SlateRenderElementProps) => React.ReactNode)
  | null
  | undefined;

export interface RenderStaticNodeWrapperProps<
  C extends AnyPluginConfig = PluginConfig,
> extends SlateRenderElementProps<Element, C> {
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

export type PlatePluginTxGroup<TGroup extends object = object> = (
  transaction: EditorUpdateTransaction,
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
  TGroup extends PlatePluginTxGroup = PlatePluginTxGroup,
> = (ctx: BasePluginContext<C>) => TGroup;

export type ExtendTxGroups<
  C extends AnyPluginConfig = PluginConfig,
  ETx extends PlatePluginTxGroups = PlatePluginTxGroups,
> = (ctx: BasePluginContext<C>) => ETx;

export type InferTxGroup<TGroup extends PlatePluginTxGroup> =
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

export type BasePluginContextEditor<C extends AnyPluginConfig = PluginConfig> =
  {
    update: (<TTx extends object = {}>(
      fn: (
        transaction: EditorUpdateTransaction & InferTx<C> & TTx,
        context: EditorUpdateContext
      ) => void,
      options?: EditorUpdateOptions
    ) => void) &
      EditorUpdateMethods;
  } & BaseEditor;

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
            node: Descendant;
            operation: NodeOperation;
            prevNode: Descendant;
          }
        ) => HandlerReturnType;
        onTextChange?: (
          ctx: BasePluginContext<C> & {
            node: Descendant;
            operation: TextOperation;
            prevText: string;
            text: string;
          }
        ) => HandlerReturnType;
      }>;
      inject: Nullable<{
        nodeProps?: InjectNodeProps<WithAnyKey<C>>;
        plugins?: Record<string, PartialBasePlugin<AnyPluginConfig>>;
        targetPluginToInject?: (
          ctx: BasePluginContext<C> & { targetPlugin: string }
        ) => Partial<BasePlugin<AnyPluginConfig>>;
      }>;
      node: {
        /** Override `data-plite-leaf` element attributes */
        leafProps?: LeafStaticProps<WithAnyKey<C>>;
        /** Override node attributes */
        props?: NodeStaticProps<WithAnyKey<C>>;
        /** Override `data-plite-node="text"` element attributes */
        textProps?: TextStaticProps<WithAnyKey<C>>;
      };
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
      plugins: any[];
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
        /** Renders a component above the main Plite component, as its sibling. */
        abovePlite?: () => React.ReactElement<any> | null;
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
          props: PliteElementProps<Element, AnyBasePlugin>
        ) => React.ReactNode;
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
       * combinations and handlers. Each shortcut can link to a transform
       * method, an API method, or use a custom handler function.
       */
      shortcuts: Partial<
        Record<
          (string & {}) | keyof InferPluginApi<C> | keyof InferPluginTx<C>,
          EditorShortcut | null
        >
      >;
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
  EO = {},
  EA = {},
  ES = {},
> = Partial<
  Omit<
    BasePlugin<PluginConfig<K, Partial<O>, A, Tx, S, State>>,
    keyof BasePluginMethods | 'api' | 'node' | 'optionsStore'
  > & {
    api: Deep2Partial<A> & EA;
    node: Partial<
      BasePlugin<PluginConfig<K, Partial<O>, A, Tx, S, State>>['node']
    >;
    options: EO;
    selectors: Partial<S> & ES;
  }
>;

export type BasePluginContext<C extends AnyPluginConfig = PluginConfig> =
  PluginBaseContext<C> & {
    editor: BasePluginContextEditor<C>;
    plugin: BasePlugin<C>;
  };

type BasePluginMethodContext<C extends AnyPluginConfig = PluginConfig> =
  PluginBaseContext<C> & {
    editor: BasePluginContextEditor<C>;
    plugin: BasePlugin<C>;
  };

type BasePluginMethodConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
> = Record<string, unknown> & {
  api?: Deep2Partial<InferApi<C>> & EA;
  options?: Partial<InferOptions<C>> & EO;
  selectors?: Partial<InferSelectors<C>> & ES;
};

type BasePluginMethodConfigFromPlugin<P, EO = {}, EA = {}, ES = {}> = Record<
  string,
  unknown
> & {
  api?: Deep2Partial<P extends { api: infer A } ? A : {}> & EA;
  options?: Partial<P extends { options: infer O } ? O : {}> & EO;
  selectors?: Partial<P extends { selectors: infer S } ? S : {}> & ES;
};

export type BasePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: BasePluginContext<AnyPluginConfig>) => any) | null;
  __editorExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __extensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __selectorExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: ExtendTxGroups<AnyPluginConfig>[];
  clone(): BasePlugin<C>;
  configure(
    config:
      | ((
          ctx: BasePluginContext<C>
        ) => BasePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTx<C>,
          InferSelectors<C>,
          InferState<C>
        >)
      | BasePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTx<C>,
          InferSelectors<C>,
          InferState<C>
        >
  ): BasePlugin<C>;
  configurePlugin<P extends AnyBasePlugin | { key: string }>(
    plugin: P,
    config:
      | ((
          ctx: BasePluginMethodContext<InferConfig<P>>
        ) => BasePluginMethodConfigFromPlugin<P>)
      | BasePluginMethodConfigFromPlugin<P>
  ): BasePlugin<C>;
  extend<EO = {}, EA = {}, ES = {}>(
    extendConfig:
      | ((
          ctx: BasePluginContext<C>
        ) => BasePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTx<C>,
          InferSelectors<C>,
          InferState<C>,
          EO,
          EA,
          ES
        >)
      | BasePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTx<C>,
          InferSelectors<C>,
          InferState<C>,
          EO,
          EA,
          ES
        >
  ): BasePlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>
    >
  >;
  extendExtension<const TExtension>(
    extension: TExtension &
      (ExtendPlateEditorExtension<C> | PlateEditorExtensionInput)
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C> & ExtensionApiFromArgument<TExtension>,
      InferTx<C> & ExtensionTxFromArgument<TExtension>,
      InferSelectors<C>,
      InferState<C> & ExtensionStateFromArgument<TExtension>
    >
  >;
  extendExtension<const TKey extends string, const TExtension>(
    key: TKey,
    extension: TExtension &
      (ExtendPlateEditorExtension<C> | PlateEditorExtensionInput)
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C> & ExtensionApiFromArgument<TExtension>,
      InferTx<C> & ExtensionTxFromArgument<TExtension>,
      InferSelectors<C>,
      InferState<C> & ExtensionStateFromArgument<TExtension>
    >
  >;
  extendApi<
    EA extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: BasePluginContext<C>) => EA
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C> & Record<C['key'], EA>,
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>
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
        [K in keyof (EA & InferApi<C>)]: (EA & InferApi<C>)[K] extends (
          ...args: any[]
        ) => any
          ? (EA & InferApi<C>)[K]
          : { [N in keyof (EA & InferApi<C>)[K]]: (EA & InferApi<C>)[K][N] };
      },
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>
    >
  >;
  extendPlugin<
    P extends AnyBasePlugin | { key: string },
    EO = {},
    EA = {},
    ES = {},
  >(
    plugin: P,
    extendConfig:
      | ((
          ctx: BasePluginMethodContext<InferConfig<P>>
        ) => BasePluginMethodConfig<InferConfig<P>, EO, EA, ES>)
      | BasePluginMethodConfig<InferConfig<P>, EO, EA, ES>
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
      InferState<C>
    >
  >;
  extendTx(
    extension: HasOwnPluginTx<C> extends true
      ? ExtendTx<C, PlatePluginTxGroup<OwnPluginTx<C>>>
      : never
  ): BasePlugin<C>;
  extendTx<TGroup extends PlatePluginTxGroup>(
    extension: ExtendTx<C, TGroup>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> & PluginTx<C['key'], InferTxGroup<TGroup>>,
      InferSelectors<C>,
      InferState<C>
    >
  >;
  extendTxGroup<
    K extends string,
    TGroup extends PlatePluginTxGroup = PlatePluginTxGroup,
  >(
    key: K,
    extension: ExtendTx<C, TGroup>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> & PluginTx<K, InferTxGroup<TGroup>>,
      InferSelectors<C>,
      InferState<C>
    >
  >;
  /** Returns a new instance of the plugin with the component. */
  withComponent(component: NodeComponent): BasePlugin<C>;
  __resolved?: boolean;
};

export type BasePlugins = AnyBasePlugin[];

export type TextStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: SlateRenderTextProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & BasePluginContext<C>;

export type EditorShortcut = {
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
  handler?: (ctx: {
    editor: BaseEditor;
    event: KeyboardEvent;
    eventDetails: any;
  }) => boolean | void;
  ignoreEventWhen?: (e: KeyboardEvent) => boolean;
};

type Trigger =
  | ((keyboardEvent: KeyboardEvent, hotkeysEvent: any) => boolean)
  | boolean;
