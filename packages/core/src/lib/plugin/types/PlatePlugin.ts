import type React from 'react';

import type {
  TDescendant,
  TElement,
  TNodeEntry,
  TText,
  Value,
} from '@udecode/slate';
import type { TEditableProps } from '@udecode/slate-react';
import type { AnyObject } from '@udecode/utils';
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
export type PlatePlugin<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
> = {
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
    insertData?: PlatePluginInsertData<O, A, T, S>;
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
      onChange?: OnChange<O, A, T, S>;
    } & DOMHandlers<O, A, T, S>
  >;

  /** Inject into Plate. */
  inject: {
    /**
     * Property used by Plate to inject a component above other plugins
     * `component`.
     */
    aboveComponent?: InjectComponent<O, A, T, S>;

    /**
     * Property used by Plate to inject a component below other plugins
     * `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent<O, A, T, S>;

    /**
     * Property that can be used by a plugin to allow other plugins to inject
     * code. For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=DeserializeHtmlPlugin.key`,
     * `insertData` plugin will call all of these `transformData` for
     * `DeserializeHtmlPlugin.key` plugin. Differs from `override.plugins` as this is
     * not overriding any plugin.
     */
    plugins?: Record<PluginKey, Partial<EditorPlugin<any, any, any, any>>>;

    /** Properties used by Plate to inject props into any node `component`. */
    props?: InjectProps<O, A, T, S>;
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
    components?: Record<PluginKey, PlatePluginComponent>;

    /** Enable or disable plugins */
    enabled?: Partial<Record<string, boolean>>;

    /** Extend plugins by key. */
    plugins?: Record<PluginKey, Partial<EditorPlugin<any, any, any, any>>>;
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
  decorate?: Decorate<O, A, T, S>;

  /** Properties used by the HTML deserializer core plugin for each HTML element. */
  deserializeHtml?: Nullable<DeserializeHtml<O, A, T, S>>;

  /**
   * Normalize initial value before passing it into the editor.
   *
   * @returns Normalized value
   */
  normalizeInitialValue?: (
    ctx: { value: Value } & EditorPluginContext<O, A, T, S>
  ) => Value;

  /**
   * Property used by Plate to override node `component` props. If function, its
   * returning value will be shallow merged to the old props, with the old props
   * as parameter. If object, its value will be shallow merged to the old
   * props.
   */
  props?: PlatePluginProps<O, A, T, S>;

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
  serializeHtml?: SerializeHtml<O, A, T, S>;

  /** Hook called when the editor is initialized. */
  useHooks?: PlatePluginUseHooks<O, A, T, S>;

  /** Editor method overriders. */
  withOverrides?: WithOverride<O, A, T, S>;
}> &
  PlatePluginMethods<K, O, A, T, S>;

export type AnyPlatePlugin = PlatePlugin<any, any, any, any, any>;

export type PlatePlugins = AnyPlatePlugin[];

export type EditorPlugin<O = {}, A = {}, T = {}, S = {}> = Omit<
  PlatePlugin<any, O, A, T, S>,
  'override' | 'plugins' | keyof PlatePluginMethods
>;

export type AnyEditorPlugin = EditorPlugin<any, any, any, any>;

export type EditorPlugins = AnyEditorPlugin[];

export type EditorPluginContext<O = {}, A = {}, T = {}, S = {}> = {
  editor: PlateEditor;
  plugin: EditorPlugin<O, A, T, S>;
};

export type PlatePluginMethods<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
> = {
  __extensions: ((ctx: EditorPluginContext<O, A, T, S>) => any)[];
  __methodExtensions: ((ctx: EditorPluginContext<O, A, T, S>) => any)[];

  configure: (
    options: ((ctx: EditorPluginContext<O, A, T, S>) => Partial<O>) | Partial<O>
  ) => PlatePlugin<K, O, A, T, S>;

  configurePlugin: <EO = {}>(
    key: string,
    options:
      | ((ctx: EditorPluginContext<O, A, T, S>) => Partial<EO>)
      | Partial<EO>
  ) => PlatePlugin<K, O, A, T, S>;

  extend: <EO = {}, EA = {}, ET = {}, ES = {}>(
    extendConfig:
      | ((
          ctx: EditorPluginContext<O, A, T, S>
        ) => Partial<
          Omit<
            PlatePlugin<
              K,
              EO & Partial<O>,
              EA & Partial<A>,
              ET & Partial<T>,
              ES & Partial<S>
            >,
            'api' | keyof PlatePluginMethods
          >
        >)
      | Partial<
          Omit<
            PlatePlugin<
              K,
              EO & Partial<O>,
              EA & Partial<A>,
              ET & Partial<T>,
              ES & Partial<S>
            >,
            'api' | keyof PlatePluginMethods
          >
        >
  ) => PlatePlugin<K, EO & O, A & EA, ET & T, ES & S>;

  extendApi: <EA = {}>(
    extendedApi: (ctx: EditorPluginContext<O, A, T, S>) => EA
  ) => PlatePlugin<K, O, A & EA, T, S>;

  extendPlugin: <EO = {}, EA = {}, ET = {}, ES = {}>(
    key: string,
    extendConfig:
      | ((
          ctx: EditorPluginContext<O, A, T, S>
        ) => Omit<
          Partial<PlatePlugin<K, EO, EA, ET, ES>>,
          'api' | keyof PlatePluginMethods
        >)
      | Omit<
          Partial<PlatePlugin<K, EO, EA, ET, ES>>,
          'api' | keyof PlatePluginMethods
        >
  ) => PlatePlugin<K, O, A, T, S>;

  /**
   * Set the component for the plugin.
   *
   * @param component The React component to be used for rendering.
   * @returns A new instance of the plugin with the updated component.
   */
  withComponent: (
    component: PlatePluginComponent
  ) => PlatePlugin<K, O, A, T, S>;
};

/** PlatePlugin fields */

/** Unique key to store the plugins by key. */
export type PluginKey = string;

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};

export type PlatePluginInsertData<O = {}, A = {}, T = {}, S = {}> = {
  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string;

  /** Deserialize data to fragment */
  getFragment?: (
    options: EditorPluginContext<O, A, T, S> & PlatePluginInsertDataOptions
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
    options: { fragment: TDescendant[] } & EditorPluginContext<O, A, T, S> &
      PlatePluginInsertDataOptions
  ) => HandlerReturnType;

  /** Query to skip this plugin. */
  query?: (
    options: EditorPluginContext<O, A, T, S> & PlatePluginInsertDataOptions
  ) => boolean;

  /** Transform the inserted data. */
  transformData?: (
    options: EditorPluginContext<O, A, T, S> & PlatePluginInsertDataOptions
  ) => string;

  /** Transform the fragment to insert. */
  transformFragment?: (
    options: { fragment: TDescendant[] } & EditorPluginContext<O, A, T, S> &
      PlatePluginInsertDataOptions
  ) => TDescendant[];
};

/** The plate plugin component. */
export type PlatePluginComponent<T = any> = React.FC<T>;

/** Props object or function returning props object. */
export type PlatePluginProps<O = {}, A = {}, T = {}, S = {}> =
  | ((
      props: PlateRenderElementProps<TElement, EditorPlugin<O, A, T, S>> &
        PlateRenderLeafProps<TText, EditorPlugin<O, A, T, S>>
    ) => AnyObject | undefined)
  | AnyObject;

export type PlatePluginUseHooks<O = {}, A = {}, T = {}, S = {}> = (
  ctx: EditorPluginContext<O, A, T, S>
) => void;

export type RenderAfterEditable = (
  editableProps: TEditableProps
) => React.ReactElement | null;

export type SerializeHtml<O = {}, A = {}, T = {}, S = {}> = React.FC<
  PlateRenderElementProps<TElement, EditorPlugin<O, A, T, S>> &
    PlateRenderLeafProps<TText, EditorPlugin<O, A, T, S>>
>;

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type WithOverride<O = {}, A = {}, T = {}, S = {}> = (
  ctx: EditorPluginContext<O, A, T, S>
) => PlateEditor;

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<O = {}, A = {}, T = {}, S = {}> = (
  ctx: { value: Value } & EditorPluginContext<O, A, T, S>
) => HandlerReturnType;

export type TransformOptions<O = {}, A = {}, T = {}, S = {}> = {
  nodeValue?: any;
  value?: any;
} & EditorPluginContext<O, A, T, S> &
  GetInjectPropsOptions;

export interface InjectProps<O = {}, A = {}, T = {}, S = {}> {
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
    } & EditorPluginContext<O, A, T, S> &
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
  transformClassName?: (options: TransformOptions<O, A, T, S>) => any;

  /**
   * Transform the node value for the style or className.
   *
   * @default nodeValue
   */
  transformNodeValue?: (options: TransformOptions<O, A, T, S>) => any;

  /** Transform the injected props. */
  transformProps?: (
    options: {
      props: GetInjectPropsReturnType;
    } & TransformOptions<O, A, T, S>
  ) => AnyObject | undefined;

  /**
   * Transform the style.
   *
   * @default { ...style, [styleKey]: value }
   */
  transformStyle?: (
    options: TransformOptions<O, A, T, S>
  ) => React.CSSProperties;

  /** List of supported node values. */
  validNodeValues?: any[];

  /**
   * A function that returns a plugin config to be injected into other plugins
   * `inject.plugins` specified by validPlugins.
   */
  validPluginToInjectPlugin?: (
    ctx: { validPlugin: string } & EditorPluginContext<O, A, T, S>
  ) => Partial<PlatePlugin<any, any, any, any, any>>;

  /**
   * Plugin keys required to inject the props.
   *
   * @default [ParagraphPlugin.key]
   */
  validPlugins?: string[];
}

export interface InjectComponentProps<O = {}, A = {}, T = {}, S = {}>
  extends PlateRenderElementProps<TElement, EditorPlugin<O, A, T, S>> {
  key: string;
}

export type InjectComponentReturnType<O = {}, A = {}, T = {}, S = {}> =
  | React.FC<PlateRenderElementProps<TElement, EditorPlugin<O, A, T, S>>>
  | undefined;

export type InjectComponent<O = {}, A = {}, T = {}, S = {}> = (
  props: InjectComponentProps<O, A, T, S>
) => InjectComponentReturnType<O, A, T, S>;

export type DeserializeHtml<O = {}, A = {}, T = {}, S = {}> = {
  /** List of HTML attribute names to store their values in `node.attributes`. */
  attributeNames?: string[];

  /** Deserialize html element to slate node. */
  getNode?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & EditorPluginContext<O, A, T, S>
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
    options: { element: HTMLElement } & EditorPluginContext<O, A, T, S>
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
export type Decorate<O = {}, A = {}, T = {}, S = {}> = (
  ctx: { entry: TNodeEntry } & EditorPluginContext<O, A, T, S>
) => Range[] | undefined;

export type InferPluginOptions<P> =
  P extends PlatePlugin<any, infer O, any, any, any> ? O : never;

export type InferPluginApi<P> =
  P extends PlatePlugin<any, any, infer A, any, any> ? A : never;

export type InferPluginTransforms<P> =
  P extends PlatePlugin<any, any, any, infer T, any> ? T : never;
