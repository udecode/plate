import type { TDescendant, TNodeEntry, Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';
import type { Range } from 'slate';

import type { SlateEditor } from '../editor';
import type { Nullable } from '../types/misc';
import type { GetInjectPropsOptions, GetInjectPropsReturnType } from '../utils';
import type {
  AnyPluginConfig,
  BaseDeserializeHtml,
  BaseInjectProps,
  BasePlugin,
  BaseTransformOptions,
  EditorInsertDataOptions,
  InferApi,
  InferOptions,
  InferTransforms,
  PluginConfig,
  WithAnyKey,
} from './BasePlugin';
import type { HandlerReturnType } from './HandlerReturnType';

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type SlatePlugin<C extends AnyPluginConfig = PluginConfig> = {
  editor: {
    insertData?: EditorInsertData<WithAnyKey<C>>;
  };

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
} & BasePlugin<C> &
  Nullable<{
    decorate?: Decorate<WithAnyKey<C>>;
    deserializeHtml?: Nullable<DeserializeHtml<WithAnyKey<C>>>;
    normalizeInitialValue?: (
      ctx: { value: Value } & SlatePluginContext<WithAnyKey<C>>
    ) => Value;
    withOverrides?: WithOverride<WithAnyKey<C>>;
  }> &
  SlatePluginMethods<C>;

export type SlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiEditorExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __apiExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: SlatePluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];
  __resolved?: boolean;
  __transformEditorExtensions: ((
    ctx: SlatePluginContext<AnyPluginConfig>
  ) => any)[];
  __transformExtensions: ((ctx: SlatePluginContext<AnyPluginConfig>) => any)[];

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

  extendPluginApi: <
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

  // extendPluginTransforms: <
  //   ET extends Record<string, (...args: any[]) => any> = Record<string, never>,
  // >(
  //   extension: (ctx: SlatePluginContext<C>) => ET
  // ) => SlatePlugin<
  //   PluginConfig<
  //     C['key'],
  //     InferOptions<C>,
  //     InferApi<C>,
  //     InferTransforms<C> & Record<C['key'], ET>
  //   >
  // >;

  extendTransforms: <
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
    'api' | 'transforms' | keyof SlatePluginMethods
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
  api: C['api'];
  editor: SlateEditor;
  options: InferOptions<C>;
  plugin: EditorPlugin<C>;
  transforms: C['transforms'];
  type: string;
};

// -----------------------------------------------------------------------------

export type EditorInsertData<C extends AnyPluginConfig = PluginConfig> = {
  format?: string;
  getFragment?: (
    options: EditorInsertDataOptions & SlatePluginContext<C>
  ) => TDescendant[] | undefined;
  preInsert?: (
    options: { fragment: TDescendant[] } & EditorInsertDataOptions &
      SlatePluginContext<C>
  ) => HandlerReturnType;
  query?: (options: EditorInsertDataOptions & SlatePluginContext<C>) => boolean;
  transformData?: (
    options: EditorInsertDataOptions & SlatePluginContext<C>
  ) => string;
  transformFragment?: (
    options: { fragment: TDescendant[] } & EditorInsertDataOptions &
      SlatePluginContext<C>
  ) => TDescendant[];
};

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type WithOverride<C extends AnyPluginConfig = PluginConfig> = (
  ctx: SlatePluginContext<C>
) => SlateEditor;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & SlatePluginContext<C>;

export type DeserializeHtml<C extends AnyPluginConfig = PluginConfig> = {
  getNode?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & SlatePluginContext<C>
  ) => AnyObject | undefined | void;
  query?: (
    options: { element: HTMLElement } & SlatePluginContext<C>
  ) => boolean;
} & BaseDeserializeHtml;

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
