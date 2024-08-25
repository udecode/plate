import type React from 'react';

import type {
  HotkeysEvent,
  HotkeysOptions,
  Keys,
} from '@udecode/react-hotkeys';
import type {
  TDescendant,
  TElement,
  TNodeEntry,
  TRange,
  TText,
  Value,
} from '@udecode/slate';
import type { TEditableProps } from '@udecode/slate-react';
import type { AnyObject } from '@udecode/utils';
import type { StoreApi } from 'zustand-x';

import type {
  AnyPluginConfig,
  AnySlatePlugin,
  BaseDeserializer,
  BaseHtmlDeserializer,
  BaseInjectProps,
  BasePlugin,
  BasePluginContext,
  BaseSerializer,
  BaseTransformOptions,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  HandlerReturnType,
  InferApi,
  InferOptions,
  InferTransforms,
  Nullable,
  ParserOptions,
  PluginConfig,
  SlatePlugin,
  SlatePluginConfig,
  SlatePluginContext,
  WithAnyKey,
} from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { DOMHandlers } from './DOMHandlers';
import type { PlateRenderElementProps } from './PlateRenderElementProps';
import type { PlateRenderLeafProps } from './PlateRenderLeafProps';

/** The `PlatePlugin` interface is a React interface for all plugins. */
export type PlatePlugin<C extends AnyPluginConfig = PluginConfig> = {
  /**
   * Handlers called whenever the corresponding event occurs in the editor.
   * Event handlers can return a boolean flag to specify whether the event can
   * be treated as being handled. If it returns `true`, the next handlers will
   * not be called.
   */
  handlers: Nullable<
    {
      /** @see {@link OnChange} */
      onChange?: OnChange<WithAnyKey<C>>;
    } & DOMHandlers<WithAnyKey<C>>
  >;

  /** Plugin injection. */
  inject: Nullable<{
    nodeProps?: InjectNodeProps<WithAnyKey<C>>;

    /**
     * Property that can be used by a plugin to allow other plugins to inject
     * code. For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=HtmlPlugin.key`,
     * `insertData` plugin will call all of these `transformData` for
     * `HtmlPlugin.key` plugin. Differs from `override.plugins` as this is not
     * overriding any plugin.
     */
    plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;

    /**
     * A function that returns a plugin config to be injected into other plugins
     * `inject.plugins` specified by targetPlugins.
     */
    targetPluginToInject?: (
      ctx: { targetPlugin: string } & PlatePluginContext<C>
    ) => Partial<PlatePlugin<AnyPluginConfig>>;
  }>;

  node: {
    /** @see {@link NodeComponent} */
    component?: NodeComponent | null;

    /** @see {@link NodeProps} */
    props?: NodeProps<WithAnyKey<C>>;
  };

  override: {
    /** Replace plugin {@link NodeComponent} by key. */
    components?: Record<string, NodeComponent>;

    /** Extend {@link PlatePlugin} by key. */
    plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;
  };

  /** @see {@link Parser} */
  parser: Nullable<Parser<WithAnyKey<C>>>;

  parsers:
    | ({
        [K in string]: {
          /** @see {@link Deserializer} */
          deserializer?: Deserializer<WithAnyKey<C>>;
          /** @see {@link Serializer} */
          serializer?: Serializer<WithAnyKey<C>>;
        };
      } & { html?: never; htmlReact?: never })
    | {
        html?: Nullable<{
          /** @see {@link HtmlDeserializer} */
          deserializer?: HtmlDeserializer<WithAnyKey<C>>;
          /** @see {@link HtmlSerializer} */
          serializer?: HtmlSerializer<WithAnyKey<C>>;
        }>;

        htmlReact?: Nullable<{
          /** Function to deserialize HTML to Slate nodes using React. */
          serializer?: HtmlReactSerializer<WithAnyKey<C>>;
        }>;
      };

  render: Nullable<{
    /**
     * Renders a component above the `Editable` component but within the `Slate`
     * wrapper. Useful for adding UI elements that should appear above the
     * editable area.
     */
    aboveEditable?: React.FC<{ children: React.ReactNode }>;

    /**
     * Renders a component above all other plugins' `node` components. Useful
     * for wrapping or decorating nodes with additional UI elements.
     */
    aboveNodes?: NodeWrapperComponent<WithAnyKey<C>>;

    /**
     * Renders a component above the `Slate` wrapper. This is the outermost
     * render position in the editor structure.
     */
    aboveSlate?: React.FC<{ children: React.ReactNode }>;

    /**
     * Renders a component after the `Editable` component. This is the last
     * render position within the editor structure.
     */
    afterEditable?: EditableSiblingComponent;

    /** Renders a component before the `Editable` component. */
    beforeEditable?: EditableSiblingComponent;

    /**
     * Renders a component below all other plugins' `node` components, but above
     * their `children`. This allows for injecting content or UI elements within
     * nodes but before their child content.
     */
    belowNodes?: NodeWrapperComponent<WithAnyKey<C>>;

    /** @see {@link NodeComponent} */
    node?: NodeComponent;
  }>;

  /** @see {@link Shortcuts} */
  shortcuts: Shortcuts;

  useOptionsStore: StoreApi<C['key'], C['options']>;
} & BasePlugin<C> &
  Nullable<{
    /** @see {@link Decorate} */
    decorate?: Decorate<WithAnyKey<C>>;

    /** @see {@link ExtendEditor} */
    extendEditor?: ExtendEditor<WithAnyKey<C>>;

    /** Normalize initial value before passing it into the editor. */
    normalizeInitialValue?: (
      ctx: { value: Value } & PlatePluginContext<WithAnyKey<C>>
    ) => Value;

    /** @see {@link UseHooks} */
    useHooks?: UseHooks<WithAnyKey<C>>;
  }> &
  PlatePluginMethods<C>;

export type PlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: PlatePluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __optionExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __resolved?: boolean;

  configure: (
    config:
      | ((
          ctx: PlatePluginContext<C>
        ) => PlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>
        >)
      | PlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>
        >
  ) => PlatePlugin<C>;

  configurePlugin: <P extends AnyPlatePlugin | AnySlatePlugin>(
    plugin: Partial<P>,
    config:
      | ((
          ctx: P extends AnyPlatePlugin
            ? PlatePluginContext<P>
            : SlatePluginContext<P>
        ) => P extends AnyPlatePlugin
          ? PlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>
            >)
      | (P extends AnyPlatePlugin
          ? PlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>
            >)
  ) => PlatePlugin<C>;

  create: () => PlatePlugin<C>;

  extend: <EO = {}, EA = {}, ET = {}>(
    extendConfig:
      | ((
          ctx: PlatePluginContext<C>
        ) => PlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          EO,
          EA,
          ET
        >)
      | PlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          EO,
          EA,
          ET
        >
  ) => PlatePlugin<
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
    extension: (ctx: PlatePluginContext<C>) => EA
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C> & Record<C['key'], EA>,
      InferTransforms<C>
    >
  >;

  /**
   * Extends the plugin's API with new methods or nested objects.
   *
   * This method allows you to add new functionality to the plugin's API or
   * extend existing ones. You can add top-level methods, nested objects with
   * methods, or extend existing nested objects. The types of existing methods
   * and nested objects are preserved, while new ones are inferred.
   *
   * @remarks
   *   - New methods can be added at the top level or within nested objects.
   *   - Existing methods can be overridden, but their parameter and return types
   *       must match the original.
   *   - When extending nested objects, you don't need to specify all existing
   *       properties; they will be preserved.
   *   - Only one level of nesting is supported for API objects.
   *
   * @example
   *   ```typescript
   *   const extendedPlugin = basePlugin.extendEditorApi(({ plugin }) => ({
   *     newMethod: (param: string) => param.length,
   *     existingMethod: (n) => n * 2, // Must match original signature
   *     nested: {
   *       newNestedMethod: () => 'new nested method',
   *     },
   *   }));
   *   ```;
   *
   * @template EA - The type of the extended API, inferred from the returned
   *   object.
   * @param extendedApi - A function that returns an object with the new or
   *   extended API methods.
   * @returns A new instance of the plugin with the extended API.
   */
  extendEditorApi: <
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: (ctx: PlatePluginContext<C>) => {
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
  ) => PlatePlugin<
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
    extension: (ctx: PlatePluginContext<C>) => {
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
  ) => PlatePlugin<
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
    extension: (ctx: PlatePluginContext<C>) => EO
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      InferApi<C>,
      InferTransforms<C>
    >
  >;

  extendPlugin: <
    P extends AnyPlatePlugin | AnySlatePlugin,
    EO = {},
    EA = {},
    ET = {},
  >(
    plugin: Partial<P>,
    extendConfig:
      | ((
          ctx: P extends AnyPlatePlugin
            ? PlatePluginContext<P>
            : SlatePluginContext<P>
        ) => P extends AnyPlatePlugin
          ? PlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              EO,
              EA,
              ET
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              EO,
              EA,
              ET
            >)
      | (P extends AnyPlatePlugin
          ? PlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              EO,
              EA,
              ET
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              EO,
              EA,
              ET
            >)
  ) => PlatePlugin<C>;

  extendTransforms: <
    ET extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: PlatePluginContext<C>) => ET
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTransforms<C> & Record<C['key'], ET>
    >
  >;

  /**
   * Set {@link NodeComponent} for the plugin.
   *
   * @param component {@link NodeComponent}.
   * @returns A new instance of the plugin with the updated
   *   {@link NodeComponent}.
   */
  withComponent: (component: NodeComponent) => PlatePlugin<C>;
};

export type PlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  EO = {},
  EA = {},
  ET = {},
> = Partial<
  {
    api: EA;
    node: Partial<PlatePlugin<PluginConfig<K, O, A, T>>['node']>;
    options: EO;
    transforms: ET;
  } & Omit<
    PlatePlugin<PluginConfig<K, Partial<O>, A, T>>,
    | 'api'
    | 'node'
    | 'optionsStore'
    | 'transforms'
    | 'useOptionsStore'
    | keyof PlatePluginMethods
  >
>;

// -----------------------------------------------------------------------------

export type AnyPlatePlugin = PlatePlugin<AnyPluginConfig>;

export type PlatePlugins = AnyPlatePlugin[];

export type EditorPlatePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  PlatePlugin<C>,
  'override' | 'plugins' | keyof PlatePluginMethods
>;

export type AnyEditorPlatePlugin = EditorPlatePlugin<AnyPluginConfig>;

export type InferConfig<P> = P extends
  | PlatePlugin<infer C>
  | SlatePlugin<infer C>
  ? C
  : never;

export type PlatePluginContext<
  C extends AnyPluginConfig = PluginConfig,
  E extends PlateEditor = PlateEditor,
> = {
  editor: E;
  plugin: EditorPlatePlugin<C>;

  useOption: {
    <
      K extends keyof InferOptions<C>,
      F extends InferOptions<C>[K],
      Args extends Parameters<((...args: any[]) => any) & F>,
    >(
      optionKey: K,
      ...args: Args
    ): F extends (...args: any[]) => any ? ReturnType<F> : F;

    <K extends keyof InferOptions<C>, F extends InferOptions<C>[K]>(
      optionKey: K
    ): F extends (...args: any[]) => any ? never : F;
  };
} & BasePluginContext<C>;

// -----------------------------------------------------------------------------

/**
 * Used by parser plugins like html to deserialize inserted data to a slate
 * fragment. The fragment will be inserted to the editor if not empty.
 */
export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  /** Deserialize data to fragment */
  deserialize?: (
    options: ParserOptions & PlatePluginContext<C>
  ) => TDescendant[] | undefined;

  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string | string[];

  mimeTypes?: string[];

  /**
   * Function called on `editor.insertData` just before `editor.insertFragment`.
   * Default: if the block above the selection is empty and the first fragment
   * node type is not inline, set the selected node type to the first fragment
   * node type.
   *
   * @returns If true, the next handlers will be skipped.
   */
  preInsert?: (
    options: { fragment: TDescendant[] } & ParserOptions & PlatePluginContext<C>
  ) => HandlerReturnType;

  /** Query to skip this plugin. */
  query?: (options: ParserOptions & PlatePluginContext<C>) => boolean;

  /** Transform the inserted data. */
  transformData?: (options: ParserOptions & PlatePluginContext<C>) => string;

  /** Transform the fragment to insert. */
  transformFragment?: (
    options: { fragment: TDescendant[] } & ParserOptions & PlatePluginContext<C>
  ) => TDescendant[];
};

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type ExtendEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => PlateEditor;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & PlatePluginContext<C>;

// -----------------------------------------------------------------------------

export type Deserializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (
    options: { element: any } & PlatePluginContext<C>
  ) => Partial<TDescendant> | undefined | void;

  query?: (options: { element: any } & PlatePluginContext<C>) => boolean;
} & BaseDeserializer;

export type Serializer<C extends AnyPluginConfig = PluginConfig> = {
  parser?: (options: { node: TDescendant } & PlatePluginContext<C>) => any;
  query?: (options: { node: TDescendant } & PlatePluginContext<C>) => boolean;
} & BaseSerializer;

export type HtmlDeserializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & PlatePluginContext<C>
  ) => Partial<TDescendant> | undefined | void;
  query?: (
    options: { element: HTMLElement } & PlatePluginContext<C>
  ) => boolean;
} & BaseHtmlDeserializer;

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (options: { node: TDescendant } & PlatePluginContext<C>) => string;
  query?: (options: { node: TDescendant } & PlatePluginContext<C>) => boolean;
};

export type HtmlReactSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: React.FC<
    PlateRenderElementProps<TElement, C> & PlateRenderLeafProps<TText, C>
  >;

  query?: (options: PlateRenderElementProps) => boolean;
};

// -----------------------------------------------------------------------------

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: { entry: TNodeEntry } & PlatePluginContext<C>
) => TRange[] | undefined;

/** Properties used by Plate to inject props into any {@link NodeComponent}. */
export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> = {
  /** Whether to inject the props. If true, overrides all other checks. */
  query?: (
    options: {
      nodeProps: GetInjectNodePropsOptions;
    } & NonNullable<NonNullable<InjectNodeProps>> &
      PlatePluginContext<C>
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
    options: {
      props: GetInjectNodePropsReturnType;
    } & TransformOptions<C>
  ) => AnyObject | undefined;

  /**
   * Transform the style.
   *
   * @default { ...style, [styleKey]: value }
   */
  transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
} & BaseInjectProps;

// -----------------------------------------------------------------------------

/**
 * Renders a component for Slate Nodes (elements if `isElement: true` or leaves
 * if `isLeaf: true`) that match this plugin's type. This is the primary render
 * method for plugin-specific node content.
 *
 * @default DefaultElement for elements, DefaultLeaf for leaves
 */
export type NodeComponent<T = any> = React.FC<T>;

/**
 * Property used by Plate to override node `component` props. If function, its
 * returning value will be shallow merged to the old props, with the old props
 * as parameter. If object, its value will be shallow merged to the old props.
 */
export type NodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: PlateRenderElementProps<TElement, C> &
        PlateRenderLeafProps<TText, C>
    ) => AnyObject | undefined)
  | AnyObject;

/** Hook called when the editor is initialized. */
export type UseHooks<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => void;

export type EditableSiblingComponent = (
  editableProps: TEditableProps
) => React.ReactElement | null;

export interface NodeWrapperComponentProps<
  C extends AnyPluginConfig = PluginConfig,
> extends PlateRenderElementProps<TElement, C> {
  key: string;
}

export type NodeWrapperComponentReturnType<
  C extends AnyPluginConfig = PluginConfig,
> = React.FC<PlateRenderElementProps<TElement, C>> | undefined;

export type NodeWrapperComponent<C extends AnyPluginConfig = PluginConfig> = (
  props: NodeWrapperComponentProps<C>
) => NodeWrapperComponentReturnType<C>;

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: { value: Value } & PlatePluginContext<C>
) => HandlerReturnType;

export type Shortcut = {
  handler?: (ctx: {
    editor: PlateEditor;
    event: KeyboardEvent;
    eventDetails: HotkeysEvent;
  }) => void;
  keys?: Keys;
  priority?: number;
} & HotkeysOptions;

export type Shortcuts = Record<string, Shortcut | null>;
