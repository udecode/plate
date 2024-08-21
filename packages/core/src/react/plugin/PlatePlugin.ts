import type React from 'react';

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
import type { Options } from 'react-hotkeys-hook';
import type { HotkeysEvent } from 'react-hotkeys-hook/src/types';

import type {
  AnyPluginConfig,
  AnySlatePlugin,
  BaseDeserializeHtml,
  BaseInjectProps,
  BasePlugin,
  BaseTransformOptions,
  EditorInsertDataOptions,
  GetInjectPropsOptions,
  GetInjectPropsReturnType,
  HandlerReturnType,
  InferApi,
  InferOptions,
  InferTransforms,
  Nullable,
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

/** The `ReactPlatePlugin` interface is a React interface for all plugins. */
export type PlatePlugin<C extends AnyPluginConfig = PluginConfig> = {
  editor: {
    /**
     * Properties used by the `insertData` core plugin to deserialize inserted
     * data to a slate fragment. The fragment will be inserted to the editor if
     * not empty.
     */
    insertData?: EditorInsertData<WithAnyKey<C>>;
  };

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

  hotkeys: PlateHotkeys;

  /** Plugin injection. */
  inject: {
    /**
     * Property used by Plate to inject a component above other plugins
     * `component`.
     */
    aboveComponent?: InjectComponent<WithAnyKey<C>>;

    /**
     * Property used by Plate to inject a component below other plugins
     * `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent<WithAnyKey<C>>;

    /**
     * Property that can be used by a plugin to allow other plugins to inject
     * code. For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for
     * `key=DeserializeHtmlPlugin.key`, `insertData` plugin will call all of
     * these `transformData` for `DeserializeHtmlPlugin.key` plugin. Differs
     * from `override.plugins` as this is not overriding any plugin.
     */
    plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;

    /** Properties used by Plate to inject props into any node `component`. */
    props?: InjectProps<WithAnyKey<C>>;

    /**
     * A function that returns a plugin config to be injected into other plugins
     * `inject.plugins` specified by targetPlugins.
     */
    targetPluginToInject?: (
      ctx: { targetPlugin: string } & PlatePluginContext<C>
    ) => Partial<PlatePlugin<AnyPluginConfig>>;
  };

  override: {
    /** Replace plugin components by key. */
    components?: Record<string, PlatePluginComponent>;

    /** Extend plugins by key. */
    plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;
  };
} & BasePlugin<C> &
  Nullable<{
    /**
     * React component rendering a slate element or leaf.
     *
     * @default DefaultElement | DefaultLeaf
     */
    component?: PlatePluginComponent;

    /** @see {@link Decorate} */
    decorate?: Decorate<WithAnyKey<C>>;

    /**
     * Properties used by the HTML deserializer core plugin for each HTML
     * element.
     */
    deserializeHtml?: Nullable<DeserializeHtml<WithAnyKey<C>>>;

    /**
     * Normalize initial value before passing it into the editor.
     *
     * @returns Normalized value
     */
    normalizeInitialValue?: (
      ctx: { value: Value } & PlatePluginContext<WithAnyKey<C>>
    ) => Value;

    /**
     * Property used by Plate to override node `component` props. If function,
     * its returning value will be shallow merged to the old props, with the old
     * props as parameter. If object, its value will be shallow merged to the
     * old props.
     */
    props?: PlatePluginProps<WithAnyKey<C>>;

    /** Render a component above `Editable`. */
    renderAboveEditable?: React.FC<{ children: React.ReactNode }>;

    /** Render a component above `Slate`. */
    renderAboveSlate?: React.FC<{ children: React.ReactNode }>;

    /** Render a component after `Editable`. */
    renderAfterEditable?: RenderAfterEditable;

    /** Render a component before `Editable`. */
    renderBeforeEditable?: RenderAfterEditable;

    /**
     * Property used by `serializeHtml` util to replace `renderElement` and
     * `renderLeaf` when serializing a node of this `type`.
     */
    serializeHtml?: SerializeHtml<WithAnyKey<C>>;

    /** Hook called when the editor is initialized. */
    useHooks?: PlatePluginUseHooks<WithAnyKey<C>>;

    /** Editor method overriders. */
    withOverrides?: WithOverride<WithAnyKey<C>>;
  }> &
  PlatePluginMethods<C>;

export type PlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiEditorExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __apiExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __configuration: ((ctx: PlatePluginContext<AnyPluginConfig>) => any) | null;
  __extensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __resolved?: boolean;
  __transformEditorExtensions: ((
    ctx: PlatePluginContext<AnyPluginConfig>
  ) => any)[];
  __transformExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];

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

  // extendHotkeys: (
  //   hotkeys: ((ctx: PlatePluginContext<C>) => PlateHotkeys) | PlateHotkeys
  // ) => PlatePlugin<C>;

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

  // extendPluginTransforms: <
  //   ET extends Record<string, (...args: any[]) => any> = Record<string, never>,
  // >(
  //   extension: (ctx: PlatePluginContext<C>) => ET
  // ) => PlatePlugin<
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

  /**
   * Set the component for the plugin.
   *
   * @param component The React component to be used for rendering.
   * @returns A new instance of the plugin with the updated component.
   */
  withComponent: (component: PlatePluginComponent) => PlatePlugin<C>;
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
  { api: EA; options: EO; transforms: ET } & Omit<
    PlatePlugin<PluginConfig<K, Partial<O>, A, T>>,
    'api' | 'transforms' | keyof PlatePluginMethods
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

export type PlatePluginContext<C extends AnyPluginConfig = PluginConfig> = {
  api: C['api'];
  editor: PlateEditor;
  options: InferOptions<C>;
  plugin: EditorPlatePlugin<C>;
  transforms: C['transforms'];
  type: string;
};

// -----------------------------------------------------------------------------

export type EditorInsertData<C extends AnyPluginConfig = PluginConfig> = {
  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string;

  /** Deserialize data to fragment */
  getFragment?: (
    options: EditorInsertDataOptions & PlatePluginContext<C>
  ) => TDescendant[] | undefined;

  /**
   * Function called on `editor.insertData` just before `editor.insertFragment`.
   * Default: if the block above the selection is empty and the first fragment
   * node type is not inline, set the selected node type to the first fragment
   * node type.
   *
   * @returns If true, the next handlers will be skipped.
   */
  preInsert?: (
    options: { fragment: TDescendant[] } & EditorInsertDataOptions &
      PlatePluginContext<C>
  ) => HandlerReturnType;

  /** Query to skip this plugin. */
  query?: (options: EditorInsertDataOptions & PlatePluginContext<C>) => boolean;

  /** Transform the inserted data. */
  transformData?: (
    options: EditorInsertDataOptions & PlatePluginContext<C>
  ) => string;

  /** Transform the fragment to insert. */
  transformFragment?: (
    options: { fragment: TDescendant[] } & EditorInsertDataOptions &
      PlatePluginContext<C>
  ) => TDescendant[];
};

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type WithOverride<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => PlateEditor;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & PlatePluginContext<C>;

export type DeserializeHtml<C extends AnyPluginConfig = PluginConfig> = {
  /** Deserialize html element to slate node. */
  getNode?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & PlatePluginContext<C>
  ) => AnyObject | undefined | void;

  query?: (
    options: { element: HTMLElement } & PlatePluginContext<C>
  ) => boolean;
} & BaseDeserializeHtml;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: { entry: TNodeEntry } & PlatePluginContext<C>
) => TRange[] | undefined;

export type InjectProps<C extends AnyPluginConfig = PluginConfig> = {
  /** Whether to inject the props. If true, overrides all other checks. */
  query?: (
    options: {
      nodeProps: GetInjectPropsOptions;
    } & NonNullable<NonNullable<InjectProps>> &
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
      props: GetInjectPropsReturnType;
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

/** The plate plugin component. */
export type PlatePluginComponent<T = any> = React.FC<T>;

/** Props object or function returning props object. */
export type PlatePluginProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: PlateRenderElementProps<TElement, C> &
        PlateRenderLeafProps<TText, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type PlatePluginUseHooks<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => void;

export type RenderAfterEditable = (
  editableProps: TEditableProps
) => React.ReactElement | null;

export interface InjectComponentProps<C extends AnyPluginConfig = PluginConfig>
  extends PlateRenderElementProps<TElement, C> {
  key: string;
}

export type InjectComponentReturnType<
  C extends AnyPluginConfig = PluginConfig,
> = React.FC<PlateRenderElementProps<TElement, C>> | undefined;

export type InjectComponent<C extends AnyPluginConfig = PluginConfig> = (
  props: InjectComponentProps<C>
) => InjectComponentReturnType<C>;

export type SerializeHtml<C extends AnyPluginConfig = PluginConfig> = React.FC<
  PlateRenderElementProps<TElement, C> & PlateRenderLeafProps<TText, C>
>;

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: { value: Value } & PlatePluginContext<C>
) => HandlerReturnType;

export type PlateHotkey = {
  callback: (
    ctx: {
      event: KeyboardEvent;
      handler: HotkeysEvent;
    } & PlatePluginContext
  ) => void;
  hotkey: string | string[];
  options?: Options;
};

export type PlateHotkeys = Record<string, PlateHotkey | null>;
