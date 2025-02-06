import type {
  DecoratedRange,
  Descendant,
  EditorApi,
  EditorTransforms,
  NodeEntry,
  TElement,
  TText,
  Value,
} from '@udecode/slate';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type { SlateEditor } from '../editor';
import type { SlateRenderElementProps, SlateRenderLeafProps } from '../static';
import type {
  AnyPluginConfig,
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
  InferSelectors,
  InferTransforms,
  ParserOptions,
  PluginConfig,
  WithAnyKey,
} from './BasePlugin';
import type { HandlerReturnType } from './HandlerReturnType';

export type AnyEditorPlugin = EditorPlugin<AnyPluginConfig>;

export type AnySlatePlugin = SlatePlugin<AnyPluginConfig>;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

// -----------------------------------------------------------------------------

export type Deserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseDeserializer & {
    parse?: (
      options: AnyObject & SlatePluginContext<C> & { element: any }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: AnyObject & SlatePluginContext<C> & { element: any }
    ) => boolean;
  };

export type EditorPlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  SlatePlugin<C>,
  keyof SlatePluginMethods | 'override' | 'plugins'
>;

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type ExtendEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C>
) => SlateEditor;

export type ExtendEditorApi<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: SlatePluginContext<C>) => EA &
  Deep2Partial<EditorApi> & {
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

export type ExtendEditorTransforms<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: SlatePluginContext<C>) => EA &
  Deep2Partial<EditorTransforms> & {
    [K in keyof InferTransforms<C>]?: InferTransforms<C>[K] extends (
      ...args: any[]
    ) => any
      ? (
          ...args: Parameters<InferTransforms<C>[K]>
        ) => ReturnType<InferTransforms<C>[K]>
      : InferTransforms<C>[K] extends Record<string, (...args: any[]) => any>
        ? {
            [N in keyof InferTransforms<C>[K]]?: (
              ...args: Parameters<InferTransforms<C>[K][N]>
            ) => ReturnType<InferTransforms<C>[K][N]>;
          }
        : never;
  };

export type HtmlDeserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseHtmlDeserializer & {
    /**
     * Whether to disable the default node props parsing logic. By default, all
     * data-slate-* attributes will be parsed into node props.
     *
     * @default false
     */
    disableDefaultNodeProps?: boolean;
    parse?: (
      options: SlatePluginContext<C> & {
        element: HTMLElement;
        node: AnyObject;
      }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: SlatePluginContext<C> & { element: HTMLElement }
    ) => boolean;
    toNodeProps?: (
      options: SlatePluginContext<C> & { element: HTMLElement }
    ) => Partial<Descendant> | undefined | void;
  };

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (options: SlatePluginContext<C> & { node: Descendant }) => string;
    query?: (options: SlatePluginContext<C> & { node: Descendant }) => boolean;
  };

export type InferConfig<P> = P extends SlatePlugin<infer C> ? C : never;

export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        SlatePluginContext<C> & {
          nodeProps: GetInjectNodePropsOptions;
        }
    ) => boolean;
    transformClassName?: (options: TransformOptions<C>) => any;
    transformNodeValue?: (options: TransformOptions<C>) => any;
    transformProps?: (
      options: TransformOptions<C> & {
        props: GetInjectNodePropsReturnType;
      }
    ) => AnyObject | undefined;
    transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
  };

// -----------------------------------------------------------------------------

export type NodeStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: SlateRenderElementProps<TElement, C> &
        SlateRenderLeafProps<TText, C>
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
> extends SlateRenderElementProps<TElement, C> {
  key: string;
}

// -----------------------------------------------------------------------------

/** @deprecated Use {@link RenderStaticNodeWrapperFunction} instead. */
export type NodeStaticWrapperComponentReturnType<
  C extends AnyPluginConfig = PluginConfig,
> = React.FC<SlateRenderElementProps<TElement, C>> | undefined;

export type NormalizeInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C> & { value: Value }
) => void;

export type OverrideEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C>
) => {
  api?: Deep2Partial<EditorApi> & {
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
  transforms?: Deep2Partial<EditorTransforms> & {
    [K in keyof InferTransforms<C>]?: InferTransforms<C>[K] extends (
      ...args: any[]
    ) => any
      ? (
          ...args: Parameters<InferTransforms<C>[K]>
        ) => ReturnType<InferTransforms<C>[K]>
      : InferTransforms<C>[K] extends Record<string, (...args: any[]) => any>
        ? {
            [N in keyof InferTransforms<C>[K]]?: (
              ...args: Parameters<InferTransforms<C>[K][N]>
            ) => ReturnType<InferTransforms<C>[K][N]>;
          }
        : never;
  };
};

export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  format?: string[] | string;
  mimeTypes?: string[];
  deserialize?: (
    options: ParserOptions & SlatePluginContext<C>
  ) => Descendant[] | undefined;
  preInsert?: (
    options: ParserOptions & SlatePluginContext<C> & { fragment: Descendant[] }
  ) => HandlerReturnType;
  query?: (options: ParserOptions & SlatePluginContext<C>) => boolean;
  transformData?: (options: ParserOptions & SlatePluginContext<C>) => string;
  transformFragment?: (
    options: ParserOptions & SlatePluginContext<C> & { fragment: Descendant[] }
  ) => Descendant[];
};

// -----------------------------------------------------------------------------

export type RenderStaticNodeWrapper<C extends AnyPluginConfig = PluginConfig> =
  (props: RenderStaticNodeWrapperProps<C>) => RenderStaticNodeWrapperFunction;

export type RenderStaticNodeWrapperFunction =
  | ((hocProps: SlateRenderElementProps) => React.ReactNode)
  | undefined;

export interface RenderStaticNodeWrapperProps<
  C extends AnyPluginConfig = PluginConfig,
> extends SlateRenderElementProps<TElement, C> {
  key: string;
}

export type Serializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (
      options: AnyObject & SlatePluginContext<C> & { node: Descendant }
    ) => any;
    query?: (
      options: AnyObject & SlatePluginContext<C> & { node: Descendant }
    ) => boolean;
  };

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type SlatePlugin<C extends AnyPluginConfig = PluginConfig> =
  BasePlugin<C> &
    Nullable<{
      decorate?: Decorate<WithAnyKey<C>>;
      extendEditor?: ExtendEditor<WithAnyKey<C>>;
      normalizeInitialValue?: NormalizeInitialValue<WithAnyKey<C>>;
    }> &
    SlatePluginMethods<C> & {
      handlers: Nullable<{}>;
      inject: Nullable<{
        nodeProps?: InjectNodeProps<WithAnyKey<C>>;
        plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
        targetPluginToInject?: (
          ctx: SlatePluginContext<C> & { targetPlugin: string }
        ) => Partial<SlatePlugin<AnyPluginConfig>>;
      }>;
      node: {
        props?: NodeStaticProps<WithAnyKey<C>>;
      };
      override: {
        plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
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
        node?: React.FC;
        /**
         * Renders a component after the `Editable` component. This is the last
         * render position within the editor structure.
         */
        afterEditable?: () => React.ReactElement<any> | null;
        /** Renders a component before the `Editable` component. */
        beforeEditable?: () => React.ReactElement<any> | null;
      }>;
      shortcuts: {};
    };

export type SlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
  EO = {},
  EA = {},
  ET = {},
  ES = {},
> = Partial<
  Omit<
    SlatePlugin<PluginConfig<K, Partial<O>, A, T, S>>,
    keyof SlatePluginMethods | 'api' | 'node' | 'optionsStore' | 'transforms'
  > & {
    api: EA;
    node: Partial<SlatePlugin['node']>;
    options: EO;
    selectors: ES;
    transforms: ET;
  }
>;

export type SlatePluginContext<C extends AnyPluginConfig = PluginConfig> =
  BasePluginContext<C> & {
    editor: SlateEditor;
    plugin: EditorPlugin<C>;
  };

export type SlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: SlatePluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __selectorExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  clone: () => SlatePlugin<C>;
  configure: (
    config:
      | ((
          ctx: SlatePluginContext<C>
        ) => SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          InferSelectors<C>
        >)
      | SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          InferSelectors<C>
        >
  ) => SlatePlugin<C>;
  configurePlugin: <P extends AnySlatePlugin>(
    plugin: Partial<P>,
    config:
      | ((
          ctx: SlatePluginContext<P>
        ) => SlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          InferSelectors<P>
        >)
      | SlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          InferSelectors<P>
        >
  ) => SlatePlugin<C>;
  extend: <EO = {}, EA = {}, ET = {}, ES = {}>(
    extendConfig:
      | ((
          ctx: SlatePluginContext<C>
        ) => SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          InferSelectors<C>,
          EO,
          EA,
          ET,
          ES
        >)
      | SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          InferSelectors<C>,
          EO,
          EA,
          ET,
          ES
        >
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      ET & InferTransforms<C>,
      ES & InferSelectors<C>
    >
  >;
  extendApi: <
    EA extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => EA
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C> & Record<C['key'], EA>,
      InferTransforms<C>,
      InferSelectors<C>
    >
  >;
  extendEditorApi: <
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: ExtendEditorApi<C, EA>
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      {
        [K in keyof (EA & InferApi<C>)]: (EA & InferApi<C>)[K] extends (
          ...args: any[]
        ) => any
          ? (EA & InferApi<C>)[K]
          : {
              [N in keyof (EA & InferApi<C>)[K]]: (EA & InferApi<C>)[K][N];
            };
      },
      InferTransforms<C>,
      InferSelectors<C>
    >
  >;
  extendEditorTransforms: <
    ET extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: ExtendEditorTransforms<C, ET>
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      {
        [K in keyof (ET & InferTransforms<C>)]: (ET &
          InferTransforms<C>)[K] extends (...args: any[]) => any
          ? (ET & InferTransforms<C>)[K]
          : {
              [N in keyof (ET & InferTransforms<C>)[K]]: (ET &
                InferTransforms<C>)[K][N];
            };
      },
      InferSelectors<C>
    >
  >;
  extendPlugin: <P extends AnySlatePlugin, EO = {}, EA = {}, ET = {}, ES = {}>(
    plugin: Partial<P>,
    extendConfig:
      | ((
          ctx: SlatePluginContext<P>
        ) => SlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          InferSelectors<P>,
          EO,
          EA,
          ET,
          ES
        >)
      | SlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          InferSelectors<P>,
          EO,
          EA,
          ET,
          ES
        >
  ) => SlatePlugin<C>;
  extendSelectors: <
    ES extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => ES
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTransforms<C>,
      ES & InferSelectors<C>
    >
  >;
  extendTransforms: <
    ET extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => ET
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTransforms<C> & Record<C['key'], ET>,
      InferSelectors<C>
    >
  >;
  overrideEditor: (override: OverrideEditor<C>) => SlatePlugin<C>;
  __resolved?: boolean;
};

export type SlatePlugins = AnySlatePlugin[];

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & SlatePluginContext<C>;
