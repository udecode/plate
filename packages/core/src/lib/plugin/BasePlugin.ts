import type { AnyObject } from '@udecode/utils';

import type { Nullable } from '../types';
import type { GetInjectPropsOptions } from '../utils';
import type { EditorPlugin } from './SlatePlugin';

export type BasePlugin<C extends AnyPluginConfig = PluginConfig> = {
  api: InferApi<C>;

  /**
   * An array of plugin keys that this plugin depends on. These plugins will be
   * loaded before this plugin.
   */
  dependencies: string[];

  /** Property used by Plate to enable/disable the plugin. */
  enabled?: boolean;

  inject: {
    /**
     * Plugin keys used by inject.props and inject.targetPluginToInject. For
     * plugin injection by key, use inject.plugins.
     *
     * @default [ParagraphPlugin.key]
     */
    targetPlugins?: string[];
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

  key: C['key'];

  /** Extended properties used by any plugin as options. */
  options: InferOptions<C>;

  override: {
    /** Enable or disable plugins */
    enabled?: Partial<Record<string, boolean>>;

    /** Extend plugins by key. */
    plugins?: Record<string, Partial<EditorPlugin<AnyPluginConfig>>>;
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
  transforms: InferTransforms<C>;

  /**
   * Property used by Plate to render a node by type. It requires slate node
   * properties to have a `type` property.
   *
   * @default key
   */
  type: string;
} & Nullable<{}>;

export type BaseDeserializeHtml = {
  /** List of HTML attribute names to store their values in `node.attributes`. */
  attributeNames?: string[];

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

export type BaseInjectProps = {
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

  /**
   * Style key to override.
   *
   * @default nodeKey
   */
  styleKey?: keyof CSSStyleDeclaration;

  /** List of supported node values. */
  validNodeValues?: any[];
};

export type BaseTransformOptions = {
  nodeValue?: any;
  value?: any;
} & GetInjectPropsOptions;

// -----------------------------------------------------------------------------

export type PluginConfig<K extends string = any, O = {}, A = {}, T = {}> = {
  api: A;
  key: K;
  options: O;
  transforms: T;
};

export type ExtendConfig<C extends PluginConfig, EO = {}, EA = {}, ET = {}> = {
  api: C['api'] & EA;
  key: C['key'];
  options: C['options'] & EO;
  transforms: C['transforms'] & ET;
};

export type AnyPluginConfig = {
  api: any;
  key: any;
  options: any;
  transforms: any;
};

export type WithAnyKey<C extends AnyPluginConfig = PluginConfig> = PluginConfig<
  any,
  InferOptions<C>,
  InferApi<C>,
  InferTransforms<C>
>;

export type WithRequiredKey<P = {}> =
  | { key: string }
  | (P extends { key: string } ? P : never);

export type InferOptions<P> = P extends PluginConfig ? P['options'] : never;

export type InferApi<P> = P extends PluginConfig ? P['api'] : never;

export type InferTransforms<P> = P extends PluginConfig
  ? P['transforms']
  : never;

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};
