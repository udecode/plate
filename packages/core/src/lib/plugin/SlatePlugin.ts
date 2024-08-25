import type { TDescendant, TNodeEntry, Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';
import type { Range } from 'slate';

import type { SlateEditor } from '../editor';
import type { Nullable } from '../types/misc';
import type { GetInjectPropsOptions, GetInjectPropsReturnType } from '../utils';
import type {
  AnyPluginConfig,
  BaseDeserializer,
  BaseHtmlDeserializer,
  BaseInjectProps,
  BasePlugin,
  BasePluginContext,
  BaseSerializer,
  BaseTransformOptions,
  InferApi,
  InferOptions,
  InferTransforms,
  ParserOptions,
  PluginConfig,
  WithAnyKey,
} from './BasePlugin';
import type { HandlerReturnType } from './HandlerReturnType';

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type SlatePlugin<C extends AnyPluginConfig = PluginConfig> = {
  handlers: {};
  inject: {
    plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
    props?: InjectProps<WithAnyKey<C>>;
    targetPluginToInject?: (
      ctx: { targetPlugin: string } & SlatePluginContext<C>
    ) => Partial<SlatePlugin<AnyPluginConfig>>;
  };
  override: {
    plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
  };
  parser: Nullable<Parser<WithAnyKey<C>>>;

  // ast: Nullable<{
  //   /** Function to deserialize AST to Slate nodes. */
  //   deserialize?: DeserializeAst<WithAnyKey<C>>;
  //   /** Function to serialize Slate nodes to AST. */
  //   serialize?: SerializeAst<WithAnyKey<C>>;
  // }>;
  /** Markdown parser configuration. */
  // markdown: Nullable<{
  //   /** Function to deserialize Markdown to Slate nodes. */
  //   deserialize?: DeserializeMarkdown<WithAnyKey<C>>;
  //   /** Function to serialize Slate nodes to Markdown. */
  //   serialize?: SerializeMarkdown<WithAnyKey<C>>;
  // }>;

  // Parsers
  parsers:
    | ({
        [K in string]: {
          deserializer?: Deserializer<WithAnyKey<C>>;
          serializer?: Serializer<WithAnyKey<C>>;
        };
      } & { html?: never })
    | {
        html?: Nullable<{
          deserializer?: HtmlDeserializer<WithAnyKey<C>>;
          serializer?: HtmlSerializer<WithAnyKey<C>>;
        }>;
      };

  shortcuts: {};
} & BasePlugin<C> &
  Nullable<{
    decorate?: Decorate<WithAnyKey<C>>;
    extendEditor?: ExtendEditor<WithAnyKey<C>>;
    normalizeInitialValue?: (
      ctx: { value: Value } & SlatePluginContext<WithAnyKey<C>>
    ) => Value;
  }> &
  SlatePluginMethods<C>;

export type SlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: SlatePluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __optionExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __resolved?: boolean;

  configure: (
    config:
      | ((
          ctx: SlatePluginContext<C>
        ) => SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>
        >)
      | SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>
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
          InferTransforms<P>
        >)
      | SlatePluginConfig<any, InferOptions<P>, InferApi<P>, InferTransforms<P>>
  ) => SlatePlugin<C>;

  create: () => SlatePlugin<C>;

  extend: <EO = {}, EA = {}, ET = {}>(
    extendConfig:
      | ((
          ctx: SlatePluginContext<C>
        ) => SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          EO,
          EA,
          ET
        >)
      | SlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          EO,
          EA,
          ET
        >
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      ET & InferTransforms<C>
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
      InferTransforms<C>
    >
  >;

  extendEditorApi: <
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => {
      [K in keyof InferApi<C>]?: InferApi<C>[K] extends (...args: any[]) => any
        ? (...args: Parameters<InferApi<C>[K]>) => ReturnType<InferApi<C>[K]>
        : InferApi<C>[K] extends Record<string, (...args: any[]) => any>
          ? {
              [N in keyof InferApi<C>[K]]?: (
                ...args: Parameters<InferApi<C>[K][N]>
              ) => ReturnType<InferApi<C>[K][N]>;
            }
          : never;
    } & EA
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
      InferTransforms<C>
    >
  >;

  extendEditorTransforms: <
    ET extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => {
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
    } & ET
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
      }
    >
  >;

  extendOptions: <
    EO extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => EO
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      InferApi<C>,
      InferTransforms<C>
    >
  >;

  extendPlugin: <P extends AnySlatePlugin, EO = {}, EA = {}, ET = {}>(
    plugin: Partial<P>,
    extendConfig:
      | ((
          ctx: SlatePluginContext<P>
        ) => SlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          EO,
          EA,
          ET
        >)
      | SlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          EO,
          EA,
          ET
        >
  ) => SlatePlugin<C>;

  extendTransforms: <
    ET extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: SlatePluginContext<C>) => ET
  ) => SlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTransforms<C> & Record<C['key'], ET>
    >
  >;
};

export type SlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  EO = {},
  EA = {},
  ET = {},
> = Partial<
  { api: EA; options: EO; transforms: ET } & Omit<
    SlatePlugin<PluginConfig<K, Partial<O>, A, T>>,
    'api' | 'optionsStore' | 'transforms' | keyof SlatePluginMethods
  >
>;

// -----------------------------------------------------------------------------

export type AnySlatePlugin = SlatePlugin<AnyPluginConfig>;

export type SlatePlugins = AnySlatePlugin[];

export type EditorPlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  SlatePlugin<C>,
  'override' | 'plugins' | keyof SlatePluginMethods
>;

export type AnyEditorPlugin = EditorPlugin<AnyPluginConfig>;

export type InferConfig<P> = P extends SlatePlugin<infer C> ? C : never;

export type SlatePluginContext<C extends AnyPluginConfig = PluginConfig> = {
  editor: SlateEditor;
  plugin: EditorPlugin<C>;
} & BasePluginContext<C>;

// -----------------------------------------------------------------------------

export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  deserialize?: (
    options: ParserOptions & SlatePluginContext<C>
  ) => TDescendant[] | undefined;
  format?: string | string[];
  mimeTypes?: string[];
  preInsert?: (
    options: { fragment: TDescendant[] } & ParserOptions & SlatePluginContext<C>
  ) => HandlerReturnType;
  query?: (options: ParserOptions & SlatePluginContext<C>) => boolean;
  transformData?: (options: ParserOptions & SlatePluginContext<C>) => string;
  transformFragment?: (
    options: { fragment: TDescendant[] } & ParserOptions & SlatePluginContext<C>
  ) => TDescendant[];
};

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type ExtendEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C>
) => SlateEditor;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & SlatePluginContext<C>;

// -----------------------------------------------------------------------------

export type Deserializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (
    options: { element: any } & AnyObject & SlatePluginContext<C>
  ) => Partial<TDescendant> | undefined | void;

  query?: (
    options: { element: any } & AnyObject & SlatePluginContext<C>
  ) => boolean;
} & BaseDeserializer;

export type Serializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (
    options: { node: TDescendant } & AnyObject & SlatePluginContext<C>
  ) => any;
  query?: (
    options: { node: TDescendant } & AnyObject & SlatePluginContext<C>
  ) => boolean;
} & BaseSerializer;

export type HtmlDeserializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & SlatePluginContext<C>
  ) => Partial<TDescendant> | undefined | void;
  query?: (
    options: { element: HTMLElement } & SlatePluginContext<C>
  ) => boolean;
} & BaseHtmlDeserializer;

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (options: { node: TDescendant } & SlatePluginContext<C>) => string;
  query?: (options: { node: TDescendant } & SlatePluginContext<C>) => boolean;
} & BaseSerializer;

// -----------------------------------------------------------------------------

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: { entry: TNodeEntry } & SlatePluginContext<C>
) => Range[] | undefined;

export type InjectProps<C extends AnyPluginConfig = PluginConfig> = {
  query?: (
    options: {
      nodeProps: GetInjectPropsOptions;
    } & NonNullable<NonNullable<InjectProps>> &
      SlatePluginContext<C>
  ) => boolean;
  transformClassName?: (options: TransformOptions<C>) => any;
  transformNodeValue?: (options: TransformOptions<C>) => any;
  transformProps?: (
    options: {
      props: GetInjectPropsReturnType;
    } & TransformOptions<C>
  ) => AnyObject | undefined;
  transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
} & BaseInjectProps;
