import type { TDescendant, TNodeEntry, Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';
import type { Range } from 'slate';

import type { SlateEditor } from '../editor';
import type { Nullable } from '../types/misc';
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
  InferTransforms,
  ParserOptions,
  PluginConfig,
  WithAnyKey,
} from './BasePlugin';
import type { HandlerReturnType } from './HandlerReturnType';

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type SlatePlugin<C extends AnyPluginConfig = PluginConfig> =
  BasePlugin<C> &
    Nullable<{
      normalizeInitialValue?: (
        ctx: SlatePluginContext<WithAnyKey<C>> & { value: Value }
      ) => Value;
      decorate?: Decorate<WithAnyKey<C>>;
      extendEditor?: ExtendEditor<WithAnyKey<C>>;
    }> &
    SlatePluginMethods<C> & {
      inject: Nullable<{
        targetPluginToInject?: (
          ctx: SlatePluginContext<C> & { targetPlugin: string }
        ) => Partial<SlatePlugin<AnyPluginConfig>>;
        nodeProps?: InjectNodeProps<WithAnyKey<C>>;
        plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
      }>;
      override: {
        plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
      };
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
      parser: Nullable<Parser<WithAnyKey<C>>>;

      shortcuts: {};

      handlers: Nullable<{}>;
    };

export type SlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
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
    extension: (ctx: SlatePluginContext<C>) => EA & {
      [K in keyof InferApi<C>]?: InferApi<C>[K] extends (...args: any[]) => any
        ? (...args: Parameters<InferApi<C>[K]>) => ReturnType<InferApi<C>[K]>
        : InferApi<C>[K] extends Record<string, (...args: any[]) => any>
          ? {
              [N in keyof InferApi<C>[K]]?: (
                ...args: Parameters<InferApi<C>[K][N]>
              ) => ReturnType<InferApi<C>[K][N]>;
            }
          : never;
    }
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
    extension: (ctx: SlatePluginContext<C>) => ET & {
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
    }
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

  __apiExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];

  __configuration: ((ctx: SlatePluginContext<AnyPluginConfig>) => any) | null;

  __extensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];

  __optionExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];

  clone: () => SlatePlugin<C>;

  __resolved?: boolean;
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
  Omit<
    SlatePlugin<PluginConfig<K, Partial<O>, A, T>>,
    keyof SlatePluginMethods | 'api' | 'node' | 'optionsStore' | 'transforms'
  > & {
    api: EA;
    node: Partial<SlatePlugin['node']>;
    options: EO;
    transforms: ET;
  }
>;

// -----------------------------------------------------------------------------

export type AnySlatePlugin = SlatePlugin<AnyPluginConfig>;

export type SlatePlugins = AnySlatePlugin[];

export type EditorPlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  SlatePlugin<C>,
  keyof SlatePluginMethods | 'override' | 'plugins'
>;

export type AnyEditorPlugin = EditorPlugin<AnyPluginConfig>;

export type InferConfig<P> = P extends SlatePlugin<infer C> ? C : never;

export type SlatePluginContext<C extends AnyPluginConfig = PluginConfig> =
  BasePluginContext<C> & {
    editor: SlateEditor;
    plugin: EditorPlugin<C>;
  };

// -----------------------------------------------------------------------------

export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  deserialize?: (
    options: ParserOptions & SlatePluginContext<C>
  ) => TDescendant[] | undefined;
  preInsert?: (
    options: ParserOptions & SlatePluginContext<C> & { fragment: TDescendant[] }
  ) => HandlerReturnType;
  transformFragment?: (
    options: ParserOptions & SlatePluginContext<C> & { fragment: TDescendant[] }
  ) => TDescendant[];
  format?: string[] | string;
  mimeTypes?: string[];
  query?: (options: ParserOptions & SlatePluginContext<C>) => boolean;
  transformData?: (options: ParserOptions & SlatePluginContext<C>) => string;
};

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type ExtendEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C>
) => SlateEditor;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & SlatePluginContext<C>;

// -----------------------------------------------------------------------------

export type Deserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseDeserializer & {
    parse?: (
      options: AnyObject & SlatePluginContext<C> & { element: any }
    ) => Partial<TDescendant> | undefined | void;

    query?: (
      options: AnyObject & SlatePluginContext<C> & { element: any }
    ) => boolean;
  };

export type Serializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (
      options: AnyObject & SlatePluginContext<C> & { node: TDescendant }
    ) => any;
    query?: (
      options: AnyObject & SlatePluginContext<C> & { node: TDescendant }
    ) => boolean;
  };

export type HtmlDeserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseHtmlDeserializer & {
    parse?: (
      options: SlatePluginContext<C> & {
        element: HTMLElement;
        node: AnyObject;
      }
    ) => Partial<TDescendant> | undefined | void;
    query?: (
      options: SlatePluginContext<C> & { element: HTMLElement }
    ) => boolean;
  };

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parse?: (options: SlatePluginContext<C> & { node: TDescendant }) => string;
    query?: (options: SlatePluginContext<C> & { node: TDescendant }) => boolean;
  };

// -----------------------------------------------------------------------------

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C> & { entry: TNodeEntry }
) => Range[] | undefined;

export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        SlatePluginContext<C> & {
          nodeProps: GetInjectNodePropsOptions;
        }
    ) => boolean;
    transformProps?: (
      options: TransformOptions<C> & {
        props: GetInjectNodePropsReturnType;
      }
    ) => AnyObject | undefined;
    transformClassName?: (options: TransformOptions<C>) => any;
    transformNodeValue?: (options: TransformOptions<C>) => any;
    transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
  };
