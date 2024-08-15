import type React from 'react';

import type {
  TDescendant,
  TElement,
  TNodeEntry,
  TText,
  Value,
} from '@udecode/slate';
import type { TEditableProps } from '@udecode/slate-react';
import type { AnyObject, DeepPartial } from '@udecode/utils';
import type { Range } from 'slate';

import type { PlateEditor } from '../../editor';
import type { Nullable } from '../../types/misc';
import type {
  GetInjectPropsOptions,
  GetInjectPropsReturnType,
} from '../../utils';
import type { DOMHandlers, HandlerReturnType } from './DOMHandlers';
import type { PlateRenderElementProps } from './PlateRenderElementProps';
import type { PlateRenderLeafProps } from './PlateRenderLeafProps';

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type PlatePlugin<K extends string = any, O = {}, A = {}, T = {}> = {
  api: A;

  /**
   * An array of plugin keys that this plugin depends on. These plugins will be
   * loaded before the current plugin.
   */
  dependencies: string[];

  editor: {
    /**
     * Properties used by the `insertData` core plugin to deserialize inserted
     * data to a slate fragment. The fragment will be inserted to the editor if
     * not empty.
     */
    insertData?: PlatePluginInsertData<PluginContext<O, A, T>>;
  };

  /** Property used by Plate to enable/disable the plugin. */
  enabled?: boolean;
  /**
   * Handlers called whenever the corresponding event occurs in the editor.
   * Event handlers can return a boolean flag to specify whether the event can
   * be treated as being handled. If it returns `true`, the next handlers will
   * not be called.
   */
  handlers: Nullable<
    {
      /** @see {@link OnChange} */
      onChange?: OnChange<PluginContext<O, A, T>>;
    } & DOMHandlers<PluginContext<O, A, T>>
  >;

  /** Inject into Plate. */
  inject: {
    /**
     * Property used by Plate to inject a component above other plugins
     * `component`.
     */
    aboveComponent?: InjectComponent<PluginContext<O, A, T>>;

    /**
     * Property used by Plate to inject a component below other plugins
     * `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent<PluginContext<O, A, T>>;

    /**
     * Property that can be used by a plugin to allow other plugins to inject
     * code. For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for
     * `key=DeserializeHtmlPlugin.key`, `insertData` plugin will call all of
     * these `transformData` for `DeserializeHtmlPlugin.key` plugin. Differs
     * from `override.plugins` as this is not overriding any plugin.
     */
    plugins?: Record<string, Partial<EditorPlugin<AnyPluginContext>>>;

    /** Properties used by Plate to inject props into any node `component`. */
    props?: InjectProps<PluginContext<O, A, T>>;
  };

  /**
   * Property used by Plate to render nodes of this `type` as elements, i.e.
   * `renderElement`.
   */
  isElement?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as
   * inline.
   */
  isInline?: boolean;

  /**
   * Property used by Plate to render nodes of this `type` as leaves, i.e.
   * `renderLeaf`.
   */
  isLeaf?: boolean;

  /**
   * Property used by `isMarkableVoid` core plugin to set void elements of this
   * `type` as markable.
   */
  isMarkableVoid?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as
   * void.
   */
  isVoid?: boolean;

  key: K;

  /** Extended properties used by any plugin as options. */
  options: O;

  override: {
    /** Replace plugin components by key. */
    components?: Record<string, PlatePluginComponent>;

    /** Enable or disable plugins */
    enabled?: Partial<Record<string, boolean>>;

    /** Extend plugins by key. */
    plugins?: Record<string, Partial<EditorPlugin<AnyPluginContext>>>;
  };

  /**
   * Recursive plugin support to allow having multiple plugins in a single
   * plugin. Plate eventually flattens all the plugins into the editor.
   */
  plugins: any[];

  /**
   * Defines the order in which plugins are registered and executed.
   *
   * Plugins with higher priority values are registered and executed before
   * those with lower values. This affects two main aspects:
   *
   * 1. Plugin Order: Plugins with higher priority will be added to the editor
   *    earlier.
   * 2. Execution Order: For operations that involve multiple plugins (e.g., editor
   *    methods), plugins with higher priority will be processed first.
   *
   * @default 100
   */
  priority: number;

  /** Transforms (state-modifying operations) that can be applied to the editor. */
  transforms: T;

  /**
   * Property used by Plate to render a node by type. It requires slate node
   * properties to have a `type` property.
   *
   * @default key
   */
  type: string;
} & Nullable<{
  /**
   * React component rendering a slate element or leaf.
   *
   * @default DefaultElement | DefaultLeaf
   */
  component?: PlatePluginComponent;

  /** @see {@link Decorate} */
  decorate?: Decorate<PluginContext<O, A, T>>;

  /** Properties used by the HTML deserializer core plugin for each HTML element. */
  deserializeHtml?: Nullable<DeserializeHtml<PluginContext<O, A, T>>>;

  /**
   * Normalize initial value before passing it into the editor.
   *
   * @returns Normalized value
   */
  normalizeInitialValue?: (
    ctx: { value: Value } & EditorPluginContext<PluginContext<O, A, T>>
  ) => Value;

  /**
   * Property used by Plate to override node `component` props. If function, its
   * returning value will be shallow merged to the old props, with the old props
   * as parameter. If object, its value will be shallow merged to the old
   * props.
   */
  props?: PlatePluginProps<PluginContext<O, A, T>>;

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
  serializeHtml?: SerializeHtml<PluginContext<O, A, T>>;

  /** Hook called when the editor is initialized. */
  useHooks?: PlatePluginUseHooks<PluginContext<O, A, T>>;

  /** Editor method overriders. */
  withOverrides?: WithOverride<PluginContext<O, A, T>>;
}> &
  PlatePluginMethods<K, O, A, T>;

export type AnyPlatePlugin = PlatePlugin<any, any, any, any>;

export type PlatePlugins = AnyPlatePlugin[];

export type EditorPlugin<C extends AnyPluginContext = PluginContext> = Omit<
  PlatePlugin<any, C['options'], C['api'], C['transforms']>,
  'override' | 'plugins' | keyof PlatePluginMethods
>;

export type AnyEditorPlugin = EditorPlugin<AnyPluginContext>;

export type EditorPlugins = AnyEditorPlugin[];

export type PluginContext<O = {}, A = {}, T = {}> = {
  api: A;
  options: O;
  transforms: T;
};

export type AnyPluginContext = {
  api: any;
  options: any;
  transforms: any;
};

export type EditorPluginContext<C extends AnyPluginContext = PluginContext> = {
  api: C['api'];
  editor: PlateEditor;
  plugin: EditorPlugin<C>;
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
    PlatePlugin<K, Partial<O>, Partial<A>, Partial<T>>,
    'api' | keyof PlatePluginMethods
  >
>;

export type PlatePluginMethods<
  K extends string = any,
  O = {},
  A = {},
  T = {},
> = {
  __configuration: ((ctx: EditorPluginContext<AnyPluginContext>) => any) | null;
  __extensions: ((ctx: EditorPluginContext<AnyPluginContext>) => any)[];
  __methodExtensions: ((ctx: EditorPluginContext<AnyPluginContext>) => any)[];

  configure: (
    config:
      | ((
          ctx: EditorPluginContext<PluginContext<O, A, T>>
        ) => PlatePluginConfig<K, O, A, T>)
      | PlatePluginConfig<K, O, A, T>
  ) => PlatePlugin<K, O, A, T>;

  configurePlugin: <P extends AnyPlatePlugin>(
    plugin: Partial<P>,
    config:
      | ((
          ctx: EditorPluginContext<P>
        ) => PlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>
        >)
      | PlatePluginConfig<any, InferOptions<P>, InferApi<P>, InferTransforms<P>>
  ) => PlatePlugin<K, O, A, T>;

  extend: <EO = {}, EA = {}, ET = {}>(
    extendConfig:
      | ((
          ctx: EditorPluginContext<PluginContext<O, A, T>>
        ) => PlatePluginConfig<K, O, A, T, EO, EA, ET>)
      | PlatePluginConfig<K, O, A, T, EO, EA, ET>
  ) => PlatePlugin<K, EO & O, A & EA, ET & T>;

  extendApi: <EA = {}>(
    extendedApi: (
      ctx: EditorPluginContext<PluginContext<O, A, T>>
    ) => DeepPartial<A> & EA
  ) => PlatePlugin<K, O, A & EA, T>;

  extendPlugin: <P extends AnyPlatePlugin, EO = {}, EA = {}, ET = {}>(
    plugin: Partial<P>,
    extendConfig:
      | ((
          ctx: EditorPluginContext<P>
        ) => PlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          EO,
          EA,
          ET
        >)
      | PlatePluginConfig<
          any,
          InferOptions<P>,
          InferApi<P>,
          InferTransforms<P>,
          EO,
          EA,
          ET
        >
  ) => PlatePlugin<K, O, A, T>;

  /**
   * Set the component for the plugin.
   *
   * @param component The React component to be used for rendering.
   * @returns A new instance of the plugin with the updated component.
   */
  withComponent: (component: PlatePluginComponent) => PlatePlugin<K, O, A, T>;
};

/** PlatePlugin fields */

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};

export type PlatePluginInsertData<C extends AnyPluginContext = PluginContext> =
  {
    /** Format to get data. Example data types are text/plain and text/uri-list. */
    format?: string;

    /** Deserialize data to fragment */
    getFragment?: (
      options: EditorPluginContext<C> & PlatePluginInsertDataOptions
    ) => TDescendant[] | undefined;

    /**
     * Function called on `editor.insertData` just before
     * `editor.insertFragment`. Default: if the block above the selection is
     * empty and the first fragment node type is not inline, set the selected
     * node type to the first fragment node type.
     *
     * @returns If true, the next handlers will be skipped.
     */
    preInsert?: (
      options: { fragment: TDescendant[] } & EditorPluginContext<C> &
        PlatePluginInsertDataOptions
    ) => HandlerReturnType;

    /** Query to skip this plugin. */
    query?: (
      options: EditorPluginContext<C> & PlatePluginInsertDataOptions
    ) => boolean;

    /** Transform the inserted data. */
    transformData?: (
      options: EditorPluginContext<C> & PlatePluginInsertDataOptions
    ) => string;

    /** Transform the fragment to insert. */
    transformFragment?: (
      options: { fragment: TDescendant[] } & EditorPluginContext<C> &
        PlatePluginInsertDataOptions
    ) => TDescendant[];
  };

/** The plate plugin component. */
export type PlatePluginComponent<T = any> = React.FC<T>;

/** Props object or function returning props object. */
export type PlatePluginProps<C extends AnyPluginContext = PluginContext> =
  | ((
      props: PlateRenderElementProps<TElement, EditorPlugin<C>> &
        PlateRenderLeafProps<TText, EditorPlugin<C>>
    ) => AnyObject | undefined)
  | AnyObject;

export type PlatePluginUseHooks<C extends AnyPluginContext = PluginContext> = (
  ctx: EditorPluginContext<C>
) => void;

export type RenderAfterEditable = (
  editableProps: TEditableProps
) => React.ReactElement | null;

export type SerializeHtml<C extends AnyPluginContext = PluginContext> =
  React.FC<
    PlateRenderElementProps<TElement, EditorPlugin<C>> &
      PlateRenderLeafProps<TText, EditorPlugin<C>>
  >;

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type WithOverride<C extends AnyPluginContext = PluginContext> = (
  ctx: EditorPluginContext<C>
) => PlateEditor;

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<C extends AnyPluginContext = PluginContext> = (
  ctx: { value: Value } & EditorPluginContext<C>
) => HandlerReturnType;

export type TransformOptions<C extends AnyPluginContext = PluginContext> = {
  nodeValue?: any;
  value?: any;
} & EditorPluginContext<C> &
  GetInjectPropsOptions;

export interface InjectProps<C extends AnyPluginContext = PluginContext> {
  /**
   * Object whose keys are node values and values are classNames which will be
   * extended.
   */
  classNames?: AnyObject;

  /**
   * Default node value. The node key would be unset if the node value =
   * defaultNodeValue.
   */
  defaultNodeValue?: any;

  /** Node key to map to the styles. */
  nodeKey?: string;

  /** Whether to inject the props. If true, overrides all other checks. */
  query?: (
    options: {
      nodeProps: GetInjectPropsOptions;
    } & EditorPluginContext<C> &
      NonNullable<NonNullable<InjectProps>>
  ) => boolean;

  /**
   * Style key to override.
   *
   * @default nodeKey
   */
  styleKey?: keyof React.CSSProperties;

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
  transformStyle?: (options: TransformOptions<C>) => React.CSSProperties;

  /** List of supported node values. */
  validNodeValues?: any[];

  /**
   * A function that returns a plugin config to be injected into other plugins
   * `inject.plugins` specified by validPlugins.
   */
  validPluginToInjectPlugin?: (
    ctx: { validPlugin: string } & EditorPluginContext<C>
  ) => Partial<PlatePlugin<any, any, any, any>>;

  /**
   * Plugin keys required to inject the props.
   *
   * @default [ParagraphPlugin.key]
   */
  validPlugins?: string[];
}

export interface InjectComponentProps<
  C extends AnyPluginContext = PluginContext,
> extends PlateRenderElementProps<TElement, EditorPlugin<C>> {
  key: string;
}

export type InjectComponentReturnType<
  C extends AnyPluginContext = PluginContext,
> = React.FC<PlateRenderElementProps<TElement, EditorPlugin<C>>> | undefined;

export type InjectComponent<C extends AnyPluginContext = PluginContext> = (
  props: InjectComponentProps<C>
) => InjectComponentReturnType<C>;

export type DeserializeHtml<C extends AnyPluginContext = PluginContext> = {
  /** List of HTML attribute names to store their values in `node.attributes`. */
  attributeNames?: string[];

  /** Deserialize html element to slate node. */
  getNode?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & EditorPluginContext<C>
  ) => AnyObject | undefined | void;

  /**
   * Deserialize an element. Use this instead of plugin.isElement if you don't
   * want the plugin to renderElement.
   *
   * @default plugin.isElement
   */
  isElement?: boolean;

  /**
   * Deserialize a leaf. Use this instead of plugin.isLeaf if you don't want the
   * plugin to renderLeaf.
   *
   * @default plugin.isLeaf
   */
  isLeaf?: boolean;

  query?: (
    options: { element: HTMLElement } & EditorPluginContext<C>
  ) => boolean;

  rules?: {
    /**
     * Deserialize an element:
     *
     * - If this option (string) is in the element attribute names.
     * - If this option (object) values match the element attributes.
     */
    validAttribute?: Record<string, string | string[]> | string;

    /** Valid element `className`. */
    validClassName?: string;

    /** Valid element `nodeName`. Set '*' to allow any node name. */
    validNodeName?: string | string[];

    /**
     * Valid element style values. Can be a list of string (only one match is
     * needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string | string[] | undefined>
    >;
  }[];

  /** Whether or not to include deserialized children on this node */
  withoutChildren?: boolean;
};

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginContext = PluginContext> = (
  ctx: { entry: TNodeEntry } & EditorPluginContext<C>
) => Range[] | undefined;

export type InferOptions<P> = P extends PluginContext ? P['options'] : never;

export type InferApi<P> = P extends PluginContext ? P['api'] : never;

export type InferTransforms<P> = P extends PluginContext
  ? P['transforms']
  : never;

export type WithRequiredKey<P = {}> = { key: string } & Partial<P>;
