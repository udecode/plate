import type {
  DecoratedRange,
  Descendant,
  Element,
  NodeEntry,
  NodeOperation,
  Path,
  TextOperation,
  Text,
  Value,
  EditorExtensionInput,
  EditorUpdateContext,
  EditorUpdateOptions,
  EditorUpdateTransaction,
} from '@platejs/plite';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type { CurrentRuntimeEditorApi as EditorApi } from '../../internal/currentRuntimeBridge';
import type {
  PliteElementProps,
  SlateRenderElementProps,
  SlateRenderLeafProps,
  SlateRenderTextProps,
} from '../../static';
import type { BasePlateEditor } from '../editor';
import type { CorePluginApi } from '../plugins';
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
  BasePlugin,
  BasePluginContext,
  BaseSerializer,
  BaseTransformOptions,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  InferApi,
  InferOptions,
  InferPluginApi,
  InferPluginTx,
  InferSelectors,
  InferTx,
  MatchRules,
  NodeComponent,
  NodeComponents,
  ParserOptions,
  PluginConfig,
  WithAnyKey,
} from './BasePlugin';
import type { HandlerReturnType } from './HandlerReturnType';

export type AnyEditorPlugin = EditorPlugin<AnyPluginConfig>;
export type AnyResolvedEditorPlugin = ResolvedEditorPlugin<AnyPluginConfig>;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: EditorPluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

// -----------------------------------------------------------------------------

export type Deserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseDeserializer & {
    parse?: (
      options: AnyObject & EditorPluginContext<C> & { element: any }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: AnyObject & EditorPluginContext<C> & { element: any }
    ) => boolean;
  };

export type ResolvedEditorPlugin<C extends AnyPluginConfig = PluginConfig> =
  Omit<EditorPlugin<C>, keyof EditorPluginMethods | 'override' | 'plugins'>;

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type ExtendEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: EditorPluginContext<C>
) => BasePlateEditor;

export type ExtendEditorApi<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: EditorPluginContext<C>) => EA &
  Deep2Partial<EditorApi & CorePluginApi> & {
    [K in keyof InferApi<C>]?: InferApi<C>[K] extends (...args: any[]) => any
      ? (...args: Parameters<InferApi<C>[K]>) => ReturnType<InferApi<C>[K]>
      : InferApi<C>[K] extends Record<string, (...args: any[]) => any>
        ? {
            [N in keyof InferApi<C>[K]]?: (
              ...args: Parameters<InferApi<C>[K][N]>
            ) => ReturnType<InferApi<C>[K][N]>;
          }
        : never;
  };

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
      options: EditorPluginContext<C> & {
        element: HTMLElement;
        node: AnyObject;
      }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: EditorPluginContext<C> & { element: HTMLElement }
    ) => boolean;
    toNodeProps?: (
      options: EditorPluginContext<C> & { element: HTMLElement }
    ) => Partial<Descendant> | undefined | void;
  };

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (options: EditorPluginContext<C> & { node: Descendant }) => string;
    query?: (options: EditorPluginContext<C> & { node: Descendant }) => boolean;
  };

export type InferConfig<P> = P extends EditorPlugin<infer C> ? C : never;

export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        EditorPluginContext<C> & { nodeProps: GetInjectNodePropsOptions }
    ) => boolean;
    transformClassName?: (options: TransformOptions<C>) => any;
    transformNodeValue?: (options: TransformOptions<C>) => any;
    transformProps?: (
      options: TransformOptions<C> & { props: GetInjectNodePropsReturnType }
    ) => AnyObject | undefined;
    transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
  };

export type LeafStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: SlateRenderLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type NodeStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: SlateRenderElementProps<Element, C> & SlateRenderLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

/** @deprecated Use {@link RenderStaticNodeWrapper} instead. */
export type NodeStaticWrapperComponent<
  C extends AnyPluginConfig = PluginConfig,
> = (
  props: NodeStaticWrapperComponentProps<C>
) => NodeStaticWrapperComponentReturnType<C>;

/** @deprecated Use {@link RenderStaticNodeWrapperProps} instead. */
export interface NodeStaticWrapperComponentProps<
  C extends AnyPluginConfig = PluginConfig,
> extends SlateRenderElementProps<Element, C> {
  key: string;
}

// -----------------------------------------------------------------------------

/** @deprecated Use {@link RenderStaticNodeWrapperFunction} instead. */
export type NodeStaticWrapperComponentReturnType<
  C extends AnyPluginConfig = PluginConfig,
> = React.FC<SlateRenderElementProps<Element, C>> | undefined;

export type TransformInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: EditorPluginContext<C> & { value: Value }
) => Value;

/** @deprecated Use {@link TransformInitialValue} instead. */
export type NormalizeInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: EditorPluginContext<C> & { value: Value }
) => Value | void;

export type EditorExtensionFactory<C extends AnyPluginConfig = PluginConfig> = (
  ctx: EditorPluginContext<C>
) => EditorExtensionInput | readonly EditorExtensionInput[] | undefined;

export type OverrideEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: EditorPluginContext<C>
) => {
  api?: Deep2Partial<EditorApi & CorePluginApi> & {
    [K in keyof InferApi<C>]?: InferApi<C>[K] extends (...args: any[]) => any
      ? (...args: Parameters<InferApi<C>[K]>) => ReturnType<InferApi<C>[K]>
      : InferApi<C>[K] extends Record<string, (...args: any[]) => any>
        ? {
            [N in keyof InferApi<C>[K]]?: (
              ...args: Parameters<InferApi<C>[K][N]>
            ) => ReturnType<InferApi<C>[K][N]>;
          }
        : never;
  };
};

export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  format?: string[] | string;
  mimeTypes?: string[];
  deserialize?: (
    options: ParserOptions & EditorPluginContext<C>
  ) => Descendant[] | undefined;
  preInsert?: (
    options: ParserOptions & EditorPluginContext<C> & { fragment: Descendant[] }
  ) => HandlerReturnType;
  query?: (options: ParserOptions & EditorPluginContext<C>) => boolean;
  transformData?: (options: ParserOptions & EditorPluginContext<C>) => string;
  transformFragment?: (
    options: ParserOptions & EditorPluginContext<C> & { fragment: Descendant[] }
  ) => Descendant[];
};

export type PartialEditorPlugin<C extends AnyPluginConfig = PluginConfig> =
  Omit<Partial<EditorPlugin<C>>, 'node'> & {
    node?: Partial<EditorPlugin<C>['node']>;
  };

export type RenderStaticNodeWrapper<C extends AnyPluginConfig = PluginConfig> =
  (props: RenderStaticNodeWrapperProps<C>) => RenderStaticNodeWrapperFunction;

export type RenderStaticNodeWrapperFunction =
  | ((hocProps: SlateRenderElementProps) => React.ReactNode)
  | undefined;

export interface RenderStaticNodeWrapperProps<
  C extends AnyPluginConfig = PluginConfig,
> extends SlateRenderElementProps<Element, C> {
  key: string;
}

export type Serializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (
      options: AnyObject & EditorPluginContext<C> & { node: Descendant }
    ) => any;
    query?: (
      options: AnyObject & EditorPluginContext<C> & { node: Descendant }
    ) => boolean;
  };

export type PlatePluginTxGroup<TGroup extends object = object> = (
  transaction: EditorUpdateTransaction,
  editor: BasePlateEditor,
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
> = (ctx: EditorPluginContext<C>) => TGroup;

export type ExtendTxGroups<
  C extends AnyPluginConfig = PluginConfig,
  ETx extends PlatePluginTxGroups = PlatePluginTxGroups,
> = (ctx: EditorPluginContext<C>) => ETx;

export type InferTxGroup<TGroup extends PlatePluginTxGroup> =
  ReturnType<TGroup>;

export type EditorPluginContextEditor<
  C extends AnyPluginConfig = PluginConfig,
> = {
  update: <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction & InferTx<C> & TTx,
      context: EditorUpdateContext
    ) => void,
    options?: EditorUpdateOptions
  ) => void;
} & BasePlateEditor;

/** Base interface for non-React Plate editor plugins. */
export type EditorPlugin<C extends AnyPluginConfig = PluginConfig> =
  BasePlugin<C> &
    Nullable<{
      decorate?: Decorate<WithAnyKey<C>>;
      extendEditor?: ExtendEditor<WithAnyKey<C>>;
      editorExtensions?:
        | readonly EditorExtensionInput[]
        | EditorExtensionFactory<WithAnyKey<C>>;
      transformInitialValue?: TransformInitialValue<WithAnyKey<C>>;
      /** @deprecated Use `transformInitialValue` instead. */
      normalizeInitialValue?: NormalizeInitialValue<WithAnyKey<C>>;
    }> &
    EditorPluginMethods<C> & {
      handlers: Nullable<{
        onNodeChange?: (
          ctx: EditorPluginContext<C> & {
            node: Descendant;
            operation: NodeOperation;
            prevNode: Descendant;
          }
        ) => HandlerReturnType;
        onTextChange?: (
          ctx: EditorPluginContext<C> & {
            node: Descendant;
            operation: TextOperation;
            prevText: string;
            text: string;
          }
        ) => HandlerReturnType;
      }>;
      inject: Nullable<{
        nodeProps?: InjectNodeProps<WithAnyKey<C>>;
        plugins?: Record<string, PartialEditorPlugin<AnyPluginConfig>>;
        targetPluginToInject?: (
          ctx: EditorPluginContext<C> & { targetPlugin: string }
        ) => Partial<EditorPlugin<AnyPluginConfig>>;
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
        plugins?: Record<string, PartialEditorPlugin<AnyPluginConfig>>;
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
          props: PliteElementProps<Element, AnyEditorPlugin>
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
          } & EditorPluginContext<C>
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

export type EditorPluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
  Tx extends AnyPluginTx = {},
  EO = {},
  EA = {},
  ES = {},
> = Partial<
  Omit<
    EditorPlugin<PluginConfig<K, Partial<O>, A, T, S, Tx>>,
    keyof EditorPluginMethods | 'api' | 'node' | 'optionsStore'
  > & {
    api: EA;
    node: Partial<EditorPlugin['node']>;
    options: EO;
    selectors: ES;
  }
>;

export type EditorPluginContext<C extends AnyPluginConfig = PluginConfig> =
  BasePluginContext<C> & {
    editor: EditorPluginContextEditor<C>;
    plugin: EditorPlugin<C>;
  };

export type EditorPluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: EditorPluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: EditorPluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: EditorPluginContext<AnyPluginConfig>) => any)[];
  __selectorExtensions: ((ctx: EditorPluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: ExtendTxGroups<AnyPluginConfig>[];
  clone: () => EditorPlugin<C>;
  configure: (
    config:
      | ((
          ctx: EditorPluginContext<C>
        ) => EditorPluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          {},
          InferSelectors<C>,
          InferTx<C>
        >)
      | EditorPluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          {},
          InferSelectors<C>,
          InferTx<C>
        >
  ) => EditorPlugin<C>;
  configurePlugin: <P extends AnyEditorPlugin>(
    plugin: Partial<P>,
    config:
      | ((
          ctx: EditorPluginContext<P>
        ) => EditorPluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          {},
          InferSelectors<P>,
          InferTx<P>
        >)
      | EditorPluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          {},
          InferSelectors<P>,
          InferTx<P>
        >
  ) => EditorPlugin<C>;
  extend: <EO = {}, EA = {}, ES = {}>(
    extendConfig:
      | ((
          ctx: EditorPluginContext<C>
        ) => EditorPluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          {},
          InferSelectors<C>,
          InferTx<C>,
          EO,
          EA,
          ES
        >)
      | EditorPluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          {},
          InferSelectors<C>,
          InferTx<C>,
          EO,
          EA,
          ES
        >
  ) => EditorPlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      {},
      ES & InferSelectors<C>,
      InferTx<C>
    >
  >;
  extendApi: <
    EA extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: EditorPluginContext<C>) => EA
  ) => EditorPlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C> & Record<C['key'], EA>,
      {},
      InferSelectors<C>,
      InferTx<C>
    >
  >;
  extendEditorApi: <
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: ExtendEditorApi<C, EA>
  ) => EditorPlugin<
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
      {},
      InferSelectors<C>,
      InferTx<C>
    >
  >;
  extendPlugin: <P extends AnyEditorPlugin, EO = {}, EA = {}, ES = {}>(
    plugin: Partial<P>,
    extendConfig:
      | ((
          ctx: EditorPluginContext<P>
        ) => EditorPluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          {},
          InferSelectors<P>,
          InferTx<P>,
          EO,
          EA,
          ES
        >)
      | EditorPluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          {},
          InferSelectors<P>,
          InferTx<P>,
          EO,
          EA,
          ES
        >
  ) => EditorPlugin<C>;
  extendSelectors: <
    ES extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: EditorPluginContext<C>) => ES
  ) => EditorPlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      {},
      ES & InferSelectors<C>,
      InferTx<C>
    >
  >;
  extendTx: <TGroup extends PlatePluginTxGroup = PlatePluginTxGroup>(
    extension: ExtendTx<C, TGroup>
  ) => EditorPlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      {},
      InferSelectors<C>,
      InferTx<C> & PluginTx<C['key'], InferTxGroup<TGroup>>
    >
  >;
  extendTxGroup: <
    K extends string,
    TGroup extends PlatePluginTxGroup = PlatePluginTxGroup,
  >(
    key: K,
    extension: ExtendTx<C, TGroup>
  ) => EditorPlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      {},
      InferSelectors<C>,
      InferTx<C> & PluginTx<K, InferTxGroup<TGroup>>
    >
  >;
  overrideEditor: (override: OverrideEditor<C>) => EditorPlugin<C>;
  /** Returns a new instance of the plugin with the component. */
  withComponent: (component: NodeComponent) => EditorPlugin<C>;
  __resolved?: boolean;
};

export type EditorPlugins = AnyEditorPlugin[];

export type TextStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: SlateRenderTextProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & EditorPluginContext<C>;

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
    editor: BasePlateEditor;
    event: KeyboardEvent;
    eventDetails: any;
  }) => boolean | void;
  ignoreEventWhen?: (e: KeyboardEvent) => boolean;
};

type Trigger =
  | ((keyboardEvent: KeyboardEvent, hotkeysEvent: any) => boolean)
  | boolean;
