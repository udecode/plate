import type React from 'react';

import type {
  HotkeysEvent,
  HotkeysOptions,
  Keys,
} from '@udecode/react-hotkeys';
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
import type { TCreatedStoreType } from 'zustand-x';

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
  EditableProps,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  HandlerReturnType,
  InferApi,
  InferOptions,
  InferSelectors,
  InferTransforms,
  NodeComponent,
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

export type Deserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseDeserializer & {
    parse?: (
      options: PlatePluginContext<C> & { element: any }
    ) => Partial<Descendant> | undefined | void;
    query?: (options: PlatePluginContext<C> & { element: any }) => boolean;
  };

export type EditableSiblingComponent = (
  editableProps: EditableProps
) => React.ReactElement<any> | null;

// -----------------------------------------------------------------------------

export type EditorPlatePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  PlatePlugin<C>,
  keyof PlatePluginMethods | 'override' | 'plugins'
>;

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type ExtendEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => PlateEditor;

export type ExtendEditorApi<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: PlatePluginContext<C>) => EA &
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
  ET = {},
> = (ctx: PlatePluginContext<C>) => ET &
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
    parse?: (
      options: PlatePluginContext<C> & {
        element: HTMLElement;
        node: AnyObject;
      }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: PlatePluginContext<C> & { element: HTMLElement }
    ) => boolean;
  };

export type HtmlReactSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: React.FC<
    PlateRenderElementProps<TElement, C> & PlateRenderLeafProps<TText, C>
  >;
  query?: (options: PlateRenderElementProps) => boolean;
};

// -----------------------------------------------------------------------------

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (options: PlatePluginContext<C> & { node: Descendant }) => string;
  query?: (options: PlatePluginContext<C> & { node: Descendant }) => boolean;
};

export type InferConfig<P> = P extends
  | PlatePlugin<infer C>
  | SlatePlugin<infer C>
  ? C
  : never;

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

/** @deprecated Use {@link RenderNodeWrapper} instead. */
export type NodeWrapperComponent<C extends AnyPluginConfig = PluginConfig> = (
  props: NodeWrapperComponentProps<C>
) => NodeWrapperComponentReturnType<C>;

/** @deprecated Use {@link RenderNodeWrapperProps} instead. */
export interface NodeWrapperComponentProps<
  C extends AnyPluginConfig = PluginConfig,
> extends PlateRenderElementProps<TElement, C> {
  key: string;
}

/** @deprecated Use {@link RenderNodeWrapperFunction} instead. */
export type NodeWrapperComponentReturnType<
  C extends AnyPluginConfig = PluginConfig,
> = React.FC<PlateRenderElementProps<TElement, C>> | undefined;

export type NormalizeInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & { value: Value }
) => void;

// -----------------------------------------------------------------------------

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & { value: Value }
) => HandlerReturnType;

export type OverrideEditor<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
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

/**
 * Used by parser plugins like html to deserialize inserted data to a slate
 * fragment. The fragment will be inserted to the editor if not empty.
 */
export type Parser<C extends AnyPluginConfig = PluginConfig> = {
  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string[] | string;
  mimeTypes?: string[];
  /** Deserialize data to fragment */
  deserialize?: (
    options: ParserOptions & PlatePluginContext<C>
  ) => Descendant[] | undefined;
  /**
   * Function called on `editor.tf.insertData` just before
   * `editor.tf.insertFragment`. Default: if the block above the selection is
   * empty and the first fragment node type is not inline, set the selected node
   * type to the first fragment node type.
   *
   * @returns If true, the next handlers will be skipped.
   */
  preInsert?: (
    options: ParserOptions & PlatePluginContext<C> & { fragment: Descendant[] }
  ) => HandlerReturnType;
  /** Query to skip this plugin. */
  query?: (options: ParserOptions & PlatePluginContext<C>) => boolean;
  /** Transform the inserted data. */
  transformData?: (options: ParserOptions & PlatePluginContext<C>) => string;
  /** Transform the fragment to insert. */
  transformFragment?: (
    options: ParserOptions & PlatePluginContext<C> & { fragment: Descendant[] }
  ) => Descendant[];
};

// -----------------------------------------------------------------------------

/** The `PlatePlugin` interface is a React interface for all plugins. */
export type PlatePlugin<C extends AnyPluginConfig = PluginConfig> =
  BasePlugin<C> &
    Nullable<{
      /** @see {@link Decorate} */
      decorate?: Decorate<WithAnyKey<C>>;
      /** @see {@link ExtendEditor} */
      extendEditor?: ExtendEditor<WithAnyKey<C>>;
      /** Normalize initial value before passing it into the editor. */
      normalizeInitialValue?: NormalizeInitialValue<WithAnyKey<C>>;
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
          /** @see {@link OnChange} */
          onChange?: OnChange<WithAnyKey<C>>;
        }
      >;
      /** Plugin injection. */
      inject: Nullable<{
        nodeProps?: InjectNodeProps<WithAnyKey<C>>;
        /**
         * Property that can be used by a plugin to allow other plugins to
         * inject code. For example, if multiple plugins have defined
         * `inject.editor.tf.insertData.transformData` for `key=HtmlPlugin.key`,
         * `insertData` plugin will call all of these `transformData` for
         * `HtmlPlugin.key` plugin. Differs from `override.plugins` as this is
         * not overriding any plugin.
         */
        plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;
        /**
         * A function that returns a plugin config to be injected into other
         * plugins `inject.plugins` specified by targetPlugins.
         */
        targetPluginToInject?: (
          ctx: PlatePluginContext<C> & { targetPlugin: string }
        ) => Partial<PlatePlugin<AnyPluginConfig>>;
      }>;
      node: {
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
        | (Record<
            string,
            {
              /** @see {@link Deserializer} */
              deserializer?: Deserializer<WithAnyKey<C>>;
              /** @see {@link Serializer} */
              serializer?: Serializer<WithAnyKey<C>>;
            }
          > & { html?: never; htmlReact?: never })
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
         * When other plugins' `node` components are rendered, this function can
         * return an optional wrapper function that turns a `node`'s props to a
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
         * When other plugins' `node` components are rendered, this function can
         * return an optional wrapper function that turns a `node`'s props to a
         * wrapper React node. The wrapper node is the `node`'s child and its
         * original children's parent. Useful for wrapping or decorating nodes
         * with additional UI elements.
         *
         * NOTE: The function can run React hooks. NOTE: Do not run React hooks
         * in the wrapper function. It is not equivalent to a React component.
         */
        belowNodes?: RenderNodeWrapper<WithAnyKey<C>>;
        /** @see {@link NodeComponent} */
        node?: NodeComponent;
        /**
         * Function to render content below the root element but above its
         * children. Similar to belowNodes but renders directly in the element
         * rather than wrapping. Multiple plugins can provide this, and all
         * their content will be rendered in sequence.
         *
         * NOTE: This is implemented in PlateElement (@udecode/plate-utils), not
         * in plate-core.
         */
        belowRootNodes?: (
          props: PlateRenderElementProps<TElement, C>
        ) => React.ReactNode;
      }>;
      /** @see {@link Shortcuts} */
      shortcuts: Shortcuts;
      useOptionsStore: TCreatedStoreType<
        C['options'],
        [['zustand/mutative-x', never]]
      >;
    };

export type PlatePluginConfig<
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
    PlatePlugin<PluginConfig<K, Partial<O>, A, T, S>>,
    | keyof PlatePluginMethods
    | 'api'
    | 'node'
    | 'optionsStore'
    | 'transforms'
    | 'useOptionsStore'
  > & {
    api: EA;
    node: Partial<PlatePlugin<PluginConfig<K, O, A, T, S>>['node']>;
    options: EO;
    selectors: ES;
    transforms: ET;
  }
>;

export type PlatePluginContext<
  C extends AnyPluginConfig = PluginConfig,
  E extends PlateEditor = PlateEditor,
> = BasePluginContext<C> & {
  editor: E;
  plugin: EditorPlatePlugin<C>;
};

export type PlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: PlatePluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __selectorExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  clone: () => PlatePlugin<C>;
  configure: (
    config:
      | ((
          ctx: PlatePluginContext<C>
        ) => PlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          InferSelectors<C>
        >)
      | PlatePluginConfig<
          C['key'],
          InferOptions<C>,
          InferApi<C>,
          InferTransforms<C>,
          InferSelectors<C>
        >
  ) => PlatePlugin<C>;
  configurePlugin: <P extends AnyPlatePlugin | AnySlatePlugin>(
    plugin: Partial<P>,
    config:
      | (P extends AnyPlatePlugin
          ? PlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              InferSelectors<P>
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              InferSelectors<P>
            >)
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
              InferSelectors<P>
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              InferSelectors<P>
            >)
  ) => PlatePlugin<C>;
  extend: <EO = {}, EA = {}, ET = {}, ES = {}>(
    extendConfig:
      | ((
          ctx: PlatePluginContext<C>
        ) => PlatePluginConfig<
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
      | PlatePluginConfig<
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
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      EO & InferOptions<C>,
      EA & InferApi<C>,
      ET & InferTransforms<C>,
      InferSelectors<C>
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
      InferTransforms<C>,
      InferSelectors<C>
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
    extension: ExtendEditorApi<C, EA>
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
      },
      InferSelectors<C>
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
      | (P extends AnyPlatePlugin
          ? PlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              InferSelectors<P>,
              EO,
              EA,
              ET
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              InferSelectors<P>,
              EO,
              EA,
              ET
            >)
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
              InferSelectors<P>,
              EO,
              EA,
              ET
            >
          : SlatePluginConfig<
              any,
              InferOptions<P>,
              InferApi<P>,
              InferTransforms<P>,
              InferSelectors<P>,
              EO,
              EA,
              ET
            >)
  ) => PlatePlugin<C>;
  extendSelectors: <
    ES extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: PlatePluginContext<C>) => ES
  ) => PlatePlugin<
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
    extension: (ctx: PlatePluginContext<C>) => ET
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTransforms<C> & Record<C['key'], ET>,
      InferSelectors<C>
    >
  >;
  overrideEditor: (override: OverrideEditor<C>) => PlatePlugin<C>;
  /**
   * Set {@link NodeComponent} for the plugin.
   *
   * @param component {@link NodeComponent}.
   * @returns A new instance of the plugin with the updated
   *   {@link NodeComponent}.
   */
  withComponent: (component: NodeComponent) => PlatePlugin<C>;
  __resolved?: boolean;
};

export type PlatePlugins = AnyPlatePlugin[];

export type RenderNodeWrapper<C extends AnyPluginConfig = PluginConfig> = (
  props: RenderNodeWrapperProps<C>
) => RenderNodeWrapperFunction;

export type RenderNodeWrapperFunction =
  | ((elementProps: PlateRenderElementProps) => React.ReactNode)
  | undefined;

export interface RenderNodeWrapperProps<
  C extends AnyPluginConfig = PluginConfig,
> extends PlateRenderElementProps<TElement, C> {
  key: string;
}

export type Serializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parser?: (options: PlatePluginContext<C> & { node: Descendant }) => any;
    query?: (options: PlatePluginContext<C> & { node: Descendant }) => boolean;
  };

export type Shortcut = HotkeysOptions & {
  keys?: Keys;
  priority?: number;
  handler?: (ctx: {
    editor: PlateEditor;
    event: KeyboardEvent;
    eventDetails: HotkeysEvent;
  }) => void;
};

export type Shortcuts = Record<string, Shortcut | null>;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & PlatePluginContext<C>;

/** Hook called when the editor is initialized. */
export type UseHooks<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => void;
