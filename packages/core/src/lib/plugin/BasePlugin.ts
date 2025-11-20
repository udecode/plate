import type {
  EditorApi,
  EditorTransforms,
  TElement,
  TText,
} from '@platejs/slate';
import type { AnyObject, Nullable } from '@udecode/utils';
import type { Draft } from 'mutative';
import type { TStateApi } from 'zustand-x';

import type { CorePluginApi, CorePluginTransforms } from '../plugins';

export type AnyPluginConfig = {
  key: any;
  api: any;
  options: any;
  selectors: any;
  transforms: any;
};

export type BaseDeserializer = AnyObject & {
  /**
   * Deserialize an element. Overrides plugin.isElement.
   *
   * @default plugin.isElement
   */
  isElement?: boolean;
  /**
   * Deserialize a leaf. Overrides plugin.isLeaf.
   *
   * @default plugin.isLeaf
   */
  isLeaf?: boolean;
};

export type BaseHtmlDeserializer = BaseDeserializer & {
  /** List of HTML attribute names to store their values in `node.attributes`. */
  attributeNames?: string[];
  rules?: {
    /**
     * Deserialize an element:
     *
     * - If this option (string) is in the element attribute names.
     * - If this option (object) values match the element attributes.
     */
    validAttribute?: Record<string, string[] | string> | string;
    /** Valid element `className`. */
    validClassName?: string;
    /** Valid element `nodeName`. Set '*' to allow any node name. */
    validNodeName?: string[] | string;
    /**
     * Valid element style values. Can be a list of string (only one match is
     * needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string[] | string | undefined>
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

export type BasePlugin<C extends AnyPluginConfig = PluginConfig> = {
  /** Unique identifier for this plugin. */
  key: C['key'];
  /** API methods provided by this plugin. */
  api: InferApi<C>;
  /**
   * An array of plugin keys that this plugin depends on. These plugins will be
   * loaded before this plugin.
   */
  dependencies: string[];
  inject: Nullable<{
    /** Plugin keys of elements to exclude the children from */
    excludeBelowPlugins?: string[];
    /** Plugin keys of elements to exclude */
    excludePlugins?: string[];
    /** Whether to filter blocks */
    isBlock?: boolean;
    /** Whether to filter elements */
    isElement?: boolean;
    /** Whether to filter leaves */
    isLeaf?: boolean;
    /** Filter nodes with path above this level. */
    maxLevel?: number;
    /**
     * Plugin keys used by {@link InjectNodeProps} and the targetPluginToInject
     * function. For plugin injection by key, use the inject.plugins property.
     *
     * @default [ParagraphPlugin.key]
     */
    targetPlugins?: string[];
  }>;
  /** Node-specific configuration for this plugin. */
  node: BasePluginNode<C>;
  /** Extended properties used by any plugin as options. */
  options: InferOptions<C>;
  /** Store for managing plugin options. */
  optionsStore: TStateApi<
    C['options'],
    [['zustand/mutative-x', never]],
    {},
    C['selectors']
  >;
  override: {
    /** Enable or disable plugins */
    enabled?: Partial<Record<string, boolean>>;
  };
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
  render: Nullable<{
    /**
     * Renders a component above the `Editable` component but within the `Slate`
     * wrapper. Useful for adding UI elements that should appear above the
     * editable area.
     */
    aboveEditable?: React.FC<{ children: React.ReactNode }>;
    /**
     * Renders a component above the `Slate` wrapper. This is the outermost
     * render position in the editor structure.
     */
    aboveSlate?: React.FC<{ children: React.ReactNode }>;
    /**
     * Specifies the HTML tag name to use when rendering the node component.
     * Only used when no custom `component` is provided for the plugin.
     *
     * @default 'div' for elements, 'span' for leaves
     */
    as?: keyof HTMLElementTagNameMap;
    /**
     * Renders a component below leaf nodes when `isLeaf: true` and
     * `isDecoration: false`. Use `render.node` instead when `isDecoration:
     * true`.
     */
    leaf?: NodeComponent;
    /**
     * Renders a component for:
     *
     * - Elements nodes if `isElement: true`
     * - Below text nodes if `isLeaf: true` and `isDecoration: false`
     * - Below leaf if `isLeaf: true` and `isDecoration: true`
     */
    node?: NodeComponent;
  }>;
  rules: {
    /**
     * Defines actions on insert break based on block state.
     *
     * - `'default'`: Default behavior
     * - `'exit'`: Exit the current block
     * - `'reset'`: Reset block to default paragraph type
     * - `'lineBreak'`: Insert newline character
     * - `'deleteExit'`: Delete backward then exit
     */
    break?: BreakRules;
    /**
     * Defines actions on delete based on block state.
     *
     * - `'default'`: Default behavior
     * - `'reset'`: Reset block to default paragraph type
     */
    delete?: DeleteRules;
    /** Defines the behavior of merging nodes. */
    merge?: MergeRules;
    /** Defines the behavior of normalizing nodes. */
    normalize?: NormalizeRules;
    /** Defines the behavior of selection. */
    selection?: SelectionRules;
  };
  /** Selectors for the plugin. */
  selectors: InferSelectors<C>;
  /** Transforms (state-modifying operations) that can be applied to the editor. */
  transforms: InferTransforms<C>;
  /**
   * Configures edit-only behavior for various plugin functionalities.
   *
   * - If `true` (boolean):
   *
   *   - `render`, `handlers`, and `inject.nodeProps` are active only when the
   *       editor is NOT read-only.
   * - If an object ({@link EditOnlyConfig}): Allows fine-grained control:
   *
   *   - `render`: Edit-only by default (true if not specified). Set to `false` to
   *       always be active.
   *   - `handlers`: Edit-only by default (true if not specified). Set to `false` to
   *       always be active.
   *   - `inject` (for `inject.nodeProps`): Edit-only by default (true if not
   *       specified). Set to `false` to always be active.
   *   - `normalizeInitialValue`: NOT edit-only by default (false if not specified).
   *       Set to `true` to make it edit-only.
   */
  editOnly?: EditOnlyConfig | boolean;
  /**
   * Enables or disables the plugin. Used by Plate to determine if the plugin
   * should be used.
   */
  enabled?: boolean;
};

export type BasePluginContext<C extends AnyPluginConfig = PluginConfig> = {
  api: C['api'] & EditorApi & CorePluginApi;
  setOptions: (
    options:
      | ((state: Draft<Partial<InferOptions<C>>>) => void)
      | Partial<InferOptions<C>>
  ) => void;
  tf: C['transforms'] & EditorTransforms & CorePluginTransforms;
  type: string;
  getOption: <
    K extends keyof InferOptions<C> | keyof InferSelectors<C> | 'state',
  >(
    key: K,
    ...args: K extends keyof InferSelectors<C>
      ? Parameters<InferSelectors<C>[K]>
      : unknown[]
  ) => K extends 'state'
    ? InferOptions<C>
    : K extends keyof InferSelectors<C>
      ? ReturnType<InferSelectors<C>[K]>
      : K extends keyof InferOptions<C>
        ? InferOptions<C>[K]
        : never;
  getOptions: () => InferOptions<C>;
  setOption: <K extends keyof InferOptions<C>>(
    optionKey: K,
    value: InferOptions<C>[K]
  ) => void;
};

export type BasePluginNode<C extends AnyPluginConfig = PluginConfig> = {
  /**
   * Specifies the type identifier for this plugin's nodes.
   *
   * For elements (when {@link isElement} is `true`):
   *
   * - The {@link NodeComponent} will be used for any node where `node.type ===
   *   type`.
   *
   * For leaves/marks (when {@link isLeaf} is `true`):
   *
   * - The {@link NodeComponent} will be used for any leaf where `node[type] ===
   *   true`.
   *
   * This property is crucial for Plate to correctly match nodes to their
   * respective plugins.
   *
   * @default plugin.key
   */
  type: string;
  component?: NodeComponent | null;
  /**
   * Controls which (if any) attribute names in the `attributes` property of an
   * element will be passed as `nodeProps` to the {@link NodeComponent}, and
   * subsequently rendered as DOM attributes.
   *
   * WARNING: If used improperly, this property WILL make your application
   * vulnerable to cross-site scripting (XSS) or information exposure attacks.
   *
   * For example, if the `href` attribute is allowed and the component passes
   * `nodeProps` to an `<a>` element, then attackers can direct users to open a
   * document containing a malicious link element:
   *
   * { type: 'link', url: 'https://safesite.com/', attributes: { href:
   * 'javascript:alert("xss")' }, children: [{ text: 'Click me' }], }
   *
   * The same is true of the `src` attribute when passed to certain HTML
   * elements, such as `<iframe>`.
   *
   * If the `style` attribute (or another attribute that can load URLs, such as
   * `background`) is allowed, then attackers can direct users to open a
   * document that will send a HTTP request to an arbitrary URL. This can leak
   * the victim's IP address or confirm to the attacker that the victim opened
   * the document.
   *
   * Before allowing any attribute name, ensure that you thoroughly research and
   * assess any potential risks associated with it.
   *
   * @default [ ]
   */
  dangerouslyAllowAttributes?: string[];
  /**
   * Indicates if this plugin's elements are primarily containers for other
   * content. Container elements are typically unwrapped when querying
   * fragments.
   *
   * Examples: table, tr, td, column, column_group
   *
   * @default false
   */
  isContainer?: boolean;
  /**
   * Indicates if this plugin's nodes can be rendered as decorated leaf. Set to
   * false to render node component only once per text node.
   *
   * @default true
   */
  isDecoration?: boolean;
  /**
   * Indicates if this plugin's nodes should be rendered as elements. Used by
   * Plate for {@link NodeComponent} rendering as elements.
   */
  isElement?: boolean;
  /**
   * Indicates if this plugin's elements should be treated as inline. Used by
   * the inlineVoid core plugin.
   */
  isInline?: boolean;
  /**
   * Indicates if this plugin's nodes should be rendered as leaves. Used by
   * Plate for {@link NodeComponent} rendering as leaves.
   */
  isLeaf?: boolean;
  /**
   * Indicates if this plugin's void elements should be markable. Used by the
   * inlineVoid core plugin.
   */
  isMarkableVoid?: boolean;
  /**
   * Whether the node is selectable.
   *
   * @default true
   */
  isSelectable?: boolean;
  /**
   * Indicates whether this element enforces strict sibling type constraints.
   * Set to true `true` when the element only allows specific siblings (e.g.,
   * `td` can only have `td` siblings, `column` can only have `column` siblings)
   * and prevents standard text blocks like paragraphs from being inserted as
   * siblings.
   */
  isStrictSiblings?: boolean;
  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as
   * void.
   */
  isVoid?: boolean;
  /**
   * Function that returns an object of data attributes to be added to the
   * element.
   */
  toDataAttributes?: (
    options: BasePluginContext<C> & { node: TElement }
  ) => AnyObject | undefined;
};

export type BaseSerializer = AnyObject;

export type BaseTransformOptions = GetInjectNodePropsOptions & {
  nodeValue?: any;
  value?: any;
};

// -----------------------------------------------------------------------------

export type BreakRules = {
  /** Action when Enter is pressed in an empty block. */
  empty?: 'default' | 'deleteExit' | 'exit' | 'reset';
  /**
   * Action when Enter is pressed at the end of an empty line. This is typically
   * used with `default: 'lineBreak'`.
   *
   * Example:
   *
   * ```tsx
   *     <blockquote>
   *     This is some text\n
   *     |
   *     </blockquote>
   * ```
   */
  emptyLineEnd?: 'default' | 'deleteExit' | 'exit';
  /** Default action when Enter is pressed. Defaults to splitting the block. */
  default?: 'default' | 'deleteExit' | 'exit' | 'lineBreak';
  /** If true, the new block after splitting will be reset to the default type. */
  splitReset?: boolean;
};

export type MergeRules = {
  /** Whether to remove the node when it's empty. */
  removeEmpty?: boolean;
};

export type NormalizeRules = {
  /** Whether to remove nodes with empty text. */
  removeEmpty?: boolean;
};

export type DeleteRules = {
  /**
   * Action when Backspace is pressed at the start of the block. This applies
   * whether the block is empty or not.
   *
   * Example:
   *
   * ```tsx
   *     <blockquote>
   *     |Text
   *     </blockquote>
   * ```
   */
  start?: 'default' | 'reset';
  /** Action when Backspace is pressed and the block is empty. */
  empty?: 'default' | 'reset';
};

export type SelectionRules = {
  /**
   * Defines the selection behavior at the boundaries of nodes.
   *
   * - `directional`: Selection affinity is determined by the direction of cursor
   *   movement. Maintains inward or outward affinity based on approach.
   * - `outward`: Forces outward affinity. Typing at the edge of a mark will not
   *   apply the mark to new text.
   * - `hard`: Creates a 'hard' edge that requires two key presses to move across.
   *   Uses offset-based navigation.
   * - `default`: Uses Slate's default behavior.
   */
  affinity?: 'default' | 'directional' | 'hard' | 'outward';
};

export type MatchRules =
  | 'break.default'
  | 'break.empty'
  | 'break.emptyLineEnd'
  | 'break.splitReset'
  | 'delete.empty'
  | 'delete.start'
  | 'merge.removeEmpty'
  | 'normalize.removeEmpty'
  | 'selection.affinity';

export type EditOnlyConfig = {
  /**
   * If true, `handlers` are only active when the editor is not read-only.
   *
   * @default true (when `editOnly` is an object or `true` boolean)
   */
  handlers?: boolean;
  /**
   * If true, `inject.nodeProps` is only active when the editor is not
   * read-only.
   *
   * @default true (when `editOnly` is an object or `true` boolean)
   */
  inject?: boolean;
  /**
   * If true, `normalizeInitialValue` is only called when the editor is not
   * read-only.
   *
   * @default false (This is an exception. It's not edit-only by default, even if `editOnly` is true or an object, unless explicitly set to true here).
   */
  normalizeInitialValue?: boolean;
  /**
   * If true, `render` functions are only active when the editor is not
   * read-only.
   *
   * @default true (when `editOnly` is an object or `true` boolean)
   */
  render?: boolean;
};

export type ExtendConfig<
  C extends PluginConfig,
  EO = {},
  EA = {},
  ET = {},
  ES = {},
> = {
  key: C['key'];
  api: C['api'] & EA;
  options: C['options'] & EO;
  selectors: C['selectors'] & ES;
  transforms: C['transforms'] & ET;
};

export type GetInjectNodePropsOptions = {
  /** Existing className. */
  className?: string;

  /** Style value or className key. */
  element?: TElement;

  /** Existing style. */
  style?: CSSStyleDeclaration;

  /** Style value or className key. */
  text?: TText;
};

export type GetInjectNodePropsReturnType = AnyObject & {
  className?: string;
  style?: CSSStyleDeclaration;
};

export type InferKey<P> = P extends PluginConfig ? P['key'] : never;

export type InferApi<P> = P extends PluginConfig ? P['api'] : never;

export type InferOptions<P> = P extends PluginConfig ? P['options'] : never;

export type InferSelectors<P> = P extends PluginConfig ? P['selectors'] : never;

export type InferTransforms<P> = P extends PluginConfig
  ? P['transforms']
  : never;

/**
 * Renders a component for Slate Nodes (elements if `isElement: true` or leaves
 * if `isLeaf: true`) that match this plugin's type. This is the primary render
 * method for plugin-specific node content.
 *
 * @default DefaultElement for elements, DefaultLeaf for leaves
 */
export type NodeComponent<T = any> = React.FC<T>;

export type NodeComponents = Record<string, NodeComponent>;

export type ParserOptions = {
  data: string;
  dataTransfer: DataTransfer;
  mimeType: string;
};

export type PluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
> = { key: K; api: A; options: O; selectors: S; transforms: T };

export type WithAnyKey<C extends AnyPluginConfig = PluginConfig> = PluginConfig<
  any,
  InferOptions<C>,
  InferApi<C>,
  InferTransforms<C>,
  InferSelectors<C>
>;

export type WithRequiredKey<P = {}> =
  | (P extends { key: string } ? P : never)
  | { key: string };
