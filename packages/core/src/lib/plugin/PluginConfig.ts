/** Shared type contracts for Plate plugin configuration. */
import type {
  EditorCoreStateView,
  EditorSchemaContribution,
  EditorSchemaSourceProvider,
  Element,
  Path,
  PropertyValueDescriptor,
  SchemaContent,
  SchemaContentOptions,
  SchemaContentRoot,
  SchemaContentRootContribution,
  SchemaContentRootOwnership,
  SchemaElementTarget,
  SchemaElementProperty,
  SchemaElementPropertyOptions,
  SchemaElement,
  SchemaProperty,
  SchemaTextProperty,
  SchemaTextPropertyOptions,
  SchemaTarget,
  Text,
} from '@platejs/plite';
import type { TxReadMethod } from '@platejs/plite/internal';
import type { AnyObject, Nullable } from '@udecode/utils';
import type { Draft } from 'mutative';

export type AnyPluginTx = Record<string, unknown>;

export type AnyPluginConfig = {
  key: any;
  options: any;
  api: any;
  enabled?: any;
  pluginApi?: any;
  dependencies?: any;
  state?: any;
  tx: any;
  selectors: any;
  schemaModel?: any;
};

/** Optional plugin-key allowlist shared by schema and render targeting. */
export interface PluginSchemaModel<TType extends string, TSchema> {
  readonly schema: TSchema;
  readonly type: TType;
}

type IsAny<T> = 0 extends 1 & T ? true : false;

export type InferPluginSchemaModel<C extends AnyPluginConfig> =
  IsAny<C> extends true
    ? never
    : C extends unknown
      ? Exclude<C['schemaModel'], undefined> extends infer TModel
        ? IsAny<TModel> extends true
          ? never
          : [TModel] extends [never]
            ? never
            : TModel extends PluginSchemaModel<infer TType, infer TSchema>
              ? Readonly<{ schema: TSchema; type: TType }>
              : never
        : never
      : never;

export type InferPluginDocumentType<C extends AnyPluginConfig> = [
  InferPluginSchemaModel<C>,
] extends [never]
  ? string
  : InferPluginSchemaModel<C>['type'];

export type InferPluginSchema<C extends AnyPluginConfig> = [
  InferPluginSchemaModel<C>,
] extends [never]
  ? PluginSchema<C> | null
  : InferPluginSchemaModel<C>['schema'] & (PluginSchema<C> | null);

type ResolvePluginSchemaDeclaration<TSchema> = TSchema extends (
  ...args: any[]
) => infer TDeclaration
  ? Extract<TDeclaration, PluginSchemaDeclaration>
  : Extract<TSchema, PluginSchemaDeclaration>;

type PluginDeclarationProperties<TDeclaration> =
  TDeclaration extends Readonly<{
    properties: infer TProperties extends readonly SchemaProperty[];
  }>
    ? readonly Extract<TProperties[number], SchemaProperty>[]
    : readonly [];

type PluginDeclarationContentRoots<TDeclaration> =
  TDeclaration extends Readonly<{
    contentRoots: infer TContentRoots extends
      readonly SchemaContentRootContribution[];
  }>
    ? TContentRoots
    : readonly [];

type PluginMarkDescriptor<TMark> = TMark extends PropertyValueDescriptor
  ? TMark
  : TMark extends Readonly<{
        property: infer TDescriptor extends PropertyValueDescriptor;
      }>
    ? TDescriptor
    : never;

type PluginMarkTarget<TMark> =
  TMark extends Readonly<{
    target: infer TTarget extends SchemaTarget;
  }>
    ? TTarget
    : undefined;

type PluginMarkProperties<TDeclaration, TType extends string> =
  TDeclaration extends Readonly<{ mark: infer TMark }>
    ? readonly [
        SchemaTextProperty<
          TType,
          PluginMarkDescriptor<TMark>,
          PluginMarkTarget<TMark>
        >,
      ]
    : readonly [];

type LowerPluginSchemaDeclaration<
  TDeclaration,
  TType extends string,
> = Readonly<{
  elements: TDeclaration extends Readonly<{
    element: infer TElement extends SchemaElement;
  }>
    ? Readonly<{ [TKey in TType]: TElement }>
    : Readonly<Record<never, never>>;
  properties: readonly [
    ...PluginDeclarationProperties<TDeclaration>,
    ...PluginMarkProperties<TDeclaration, TType>,
  ];
  contentRoots: PluginDeclarationContentRoots<TDeclaration>;
}>;

export type InferExactPluginSchemaContribution<C extends AnyPluginConfig> = [
  InferPluginSchemaModel<C>,
] extends [never]
  ? never
  : InferPluginSchemaModel<C> extends infer TModel extends Readonly<{
        schema: unknown;
        type: string;
      }>
    ? LowerPluginSchemaDeclaration<
        ResolvePluginSchemaDeclaration<TModel['schema']>,
        TModel['type']
      >
    : never;

export type InferPluginSchemaContribution<C extends AnyPluginConfig> = [
  InferExactPluginSchemaContribution<C>,
] extends [never]
  ? EditorSchemaContribution
  : InferExactPluginSchemaContribution<C>;

export type BaseInjectProps = {
  /**
   * Object whose keys are node values and values are classNames which will be
   * extended.
   */
  classNames?: Record<string, string>;
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
  styleKey?: string;
  /** List of supported node values. */
  validNodeValues?: any[];
};

export type PluginBase<C extends AnyPluginConfig = PluginConfig> =
  EditorSchemaSourceProvider<InferPluginSchemaContribution<C>> & {
    /** Type-only config anchor used by public helper inference. */
    readonly __config: C;
    /** Type-only witness for a Plate-owned plugin descriptor. */
    readonly __pluginReference: 'plate-plugin-descriptor';
    /** Unique identifier for this plugin. */
    key: C['key'];
    /** Plugins that must be installed before this plugin. */
    dependencies: NonNullable<C['dependencies']>;
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
    }>;
    /** Mutable runtime state exposed through the plugin store. */
    options: InferOptions<C>;
    override: {};
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
    /** Plugin keys targeted by this plugin's schema and render behavior. */
    readonly targetPluginKeys: readonly string[];
    render: Nullable<{
      /**
       * Renders a component above the `Editable` component but within the `Plite`
       * wrapper. Useful for adding UI elements that should appear above the
       * editable area.
       */
      aboveEditable?: React.FC<{ children: React.ReactNode }>;
      /**
       * Renders a component above the `Plite` wrapper. This is the outermost
       * render position in the editor structure.
       */
      abovePlite?: React.FC<{ children: React.ReactNode }>;
      /**
       * Specifies the HTML tag name to use when rendering the node component.
       * Only used when the resolved plugin has no custom node component.
       *
       * @default 'div' for elements, 'span' for leaves
       */
      as?: keyof HTMLElementTagNameMap;
      /**
       * Renders a component below marked leaves when `schema.mark` is declared and
       * `isDecoration: false`. The plugin's root `component` renders decoration
       * leaves when `isDecoration: true`.
       */
      leaf?: NodeComponent;
      /**
       * Internal resolved slot for the plugin's root `component`.
       *
       * Renders a component for:
       *
       * - Element nodes when `schema.element` is declared
       * - Below text nodes when `schema.mark` and `isDecoration: false`
       * - Below leaves when `schema.mark` and `isDecoration: true`
       *
       * @internal
       */
      node?: NodeComponent;
      /** Render marked values as leaves by default, or once per text node. */
      isDecoration?: boolean;
    }>;
    rules: {
      /**
       * Defines actions on insert break based on block state.
       *
       * - `'default'`: Default behavior
       * - `'exit'`: Exit the current block
       * - `'lift'`: Lift the current block out of the nearest matching ancestor
       * - `'reset'`: Reset block to default paragraph type
       * - `'lineBreak'`: Insert newline character
       * - `'deleteExit'`: Delete backward then exit
       */
      break?: BreakRules;
      /**
       * Defines actions on delete based on block state.
       *
       * - `'default'`: Default behavior
       * - `'lift'`: Lift the current block out of the nearest matching ancestor
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
    /** Pure declarative contribution to the editor schema. */
    readonly schema: InferPluginSchema<C>;
    /** Document type/property key owned by this plugin. Defaults to `key`. */
    type: InferPluginDocumentType<C>;
    /** Selectors for the plugin. */
    selectors: InferSelectors<C>;
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
     *   - `transformInitialValue`: NOT edit-only by default (false if not specified).
     *       Set to `true` to make it edit-only.
     */
    editOnly?: EditOnlyConfig | boolean;
    /**
     * Enables or disables the plugin. Used by Plate to determine if the plugin
     * should be used.
     */
    enabled?: InferEnabled<C>;
  };

export interface PluginReference<
  TKey extends string = string,
  TDocumentType extends string = string,
> {
  /** Type-only witness for a Plate-owned plugin descriptor. */
  readonly __pluginReference: 'plate-plugin-descriptor';
  readonly key: TKey;
  readonly type: TDocumentType;
}

export type PluginReferenceDocumentType<
  TPlugin extends PluginReference = PluginReference,
> = TPlugin['type'];

export type PluginSchemaOwn<TType extends string = string> = Readonly<{
  /** Project this plugin's configured type as an element-owned root slot. */
  contentRoot: <
    const TContent extends SchemaContent,
    const TOptions extends Readonly<{
      ownership: SchemaContentRootOwnership;
      target: SchemaElementTarget;
    }>,
  >(
    content: TContent,
    options: TOptions
  ) => SchemaContentRootContribution<
    TType,
    SchemaContentRoot<TContent, TOptions['ownership']>,
    TOptions['target']
  >;
  elementProperty: <
    TDescriptor extends PropertyValueDescriptor,
    const TOptions extends SchemaElementPropertyOptions,
  >(
    value: TDescriptor,
    options: TOptions
  ) => SchemaElementProperty<TType, TDescriptor, TOptions['target']>;
  textProperty: <
    TDescriptor extends PropertyValueDescriptor,
    const TOptions extends
      SchemaTextPropertyOptions = SchemaTextPropertyOptions,
  >(
    value: TDescriptor,
    options?: TOptions
  ) => SchemaTextProperty<TType, TDescriptor, TOptions['target']>;
}>;

export type PluginSchemaReferences = Readonly<{
  /** Plate normal-flow block content, excluding nested structural elements. */
  blockContent: (options?: SchemaContentOptions) => SchemaContent;
  elementType: <const TPlugin extends PluginReference>(
    plugin: TPlugin
  ) => PluginReferenceDocumentType<TPlugin>;
  elementTypes: <const TPlugins extends readonly PluginReference[]>(
    plugins: TPlugins
  ) => {
    readonly [TIndex in keyof TPlugins]: PluginReferenceDocumentType<
      TPlugins[TIndex]
    >;
  };
  /** Resolve an optional plugin-key allowlist to installed element types. */
  elementTypesByKey: (pluginKeys: readonly string[]) => readonly string[];
}>;

export type PluginSchemaContext<
  C extends AnyPluginConfig = PluginConfig,
  TType extends string = InferPluginDocumentType<C>,
> = Readonly<{
  key: C['key'];
  options: Readonly<InferOptions<C>>;
  own: PluginSchemaOwn<TType>;
  plugins: PluginSchemaReferences;
  targetPluginKeys: readonly string[];
  type: TType;
}>;

export type PluginSchemaMark =
  | PropertyValueDescriptor
  | Readonly<
      SchemaTextPropertyOptions & {
        property: PropertyValueDescriptor;
      }
    >;

export type PlateSchemaElement = SchemaElement &
  Readonly<{
    /** Whether this element is legal in Plate normal block content. */
    topLevel?: boolean;
  }>;

type PluginSchemaElement = Readonly<{
  contentRoots?: readonly SchemaContentRootContribution[];
  element: PlateSchemaElement;
  mark?: never;
  properties?: readonly SchemaProperty[];
}>;

type PluginSchemaText = Readonly<{
  contentRoots?: readonly SchemaContentRootContribution[];
  element?: never;
  mark: PluginSchemaMark;
  properties?: readonly SchemaProperty[];
}>;

type PluginSchemaProperties = Readonly<{
  contentRoots?: readonly SchemaContentRootContribution[];
  element?: never;
  mark?: never;
  properties: readonly SchemaProperty[];
}>;

type PluginSchemaContentRoots = Readonly<{
  contentRoots: readonly SchemaContentRootContribution[];
  element?: never;
  mark?: never;
  properties?: readonly SchemaProperty[];
}>;

export type PluginSchemaDeclaration =
  | PluginSchemaContentRoots
  | PluginSchemaElement
  | PluginSchemaProperties
  | PluginSchemaText;

/** A frozen schema contribution or a pure configured contribution factory. */
export type PluginSchema<
  C extends AnyPluginConfig = PluginConfig,
  TType extends string = InferPluginDocumentType<C>,
> =
  | ((context: PluginSchemaContext<C, TType>) => PluginSchemaDeclaration)
  | PluginSchemaDeclaration;

export type PluginBaseContext<C extends AnyPluginConfig = PluginConfig> = {
  /** API owned by the current plugin, without the plugin-key namespace wrapper. */
  api: InferOwnApi<C>;
  /** Whether this plugin is installed and enabled in the target editor. */
  readonly installed: boolean;
  /** One-shot updates owned by the current plugin, without its key namespace. */
  update: InferOwnTx<C>;
  /** State-bound reads owned by the current plugin. */
  read: InferOwnState<C>;
  setOptions: (
    options:
      | ((state: Draft<Partial<InferOptions<C>>>) => void)
      | Partial<InferOptions<C>>
  ) => void;
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
  getOptions: () => Readonly<InferOptions<C>>;
  setOption: <K extends keyof InferOptions<C>>(
    optionKey: K,
    value: InferOptions<C>[K]
  ) => void;
};

export type BaseTransformOptions = GetInjectNodePropsOptions & {
  nodeValue?: any;
  value?: any;
};

// -----------------------------------------------------------------------------

export type BreakRules = {
  /** Action when Enter is pressed in an empty block. */
  empty?: 'default' | 'deleteExit' | 'exit' | 'lift' | 'none' | 'reset';
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
  /**
   * Default action when Enter is pressed. Defaults to splitting the block.
   * Use `'none'` to handle Enter without changing the document.
   */
  default?: 'default' | 'deleteExit' | 'exit' | 'lineBreak' | 'none';
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
  start?: 'default' | 'lift' | 'reset';
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
   * - `default`: Uses Plite's default behavior.
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
   * If true, `transformInitialValue` is only called when the editor is not
   * read-only.
   *
   * @default false (This is an exception. It's not edit-only by default, even if `editOnly` is true or an object, unless explicitly set to true here).
   */
  transformInitialValue?: boolean;
  /**
   * If true, `render` functions are only active when the editor is not
   * read-only.
   *
   * @default true (when `editOnly` is an object or `true` boolean)
   */
  render?: boolean;
};

export type ExtendConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ETx extends AnyPluginTx = {},
  ES = {},
  EState = {},
  EPluginApi = {},
> = {
  key: C['key'];
  api: C['api'] & EA;
  dependencies?: C['dependencies'];
  enabled?: C['enabled'];
  options: C['options'] & EO;
  pluginApi: NonNullable<C['pluginApi']> & EPluginApi;
  schemaModel?: C['schemaModel'];
  selectors: C['selectors'] & ES;
  state: C['state'] & EState;
  tx: C['tx'] & ETx;
};

export type GetInjectNodePropsOptions = {
  /** Existing className. */
  className?: string;

  /** Style value or className key. */
  element?: Element;

  /** Current node path when the node is rendered with path context. */
  path?: Path;

  /** Existing style. */
  style?: AnyObject;

  /** Style value or className key. */
  text?: Text;
};

export type GetInjectNodePropsReturnType = AnyObject & {
  className?: string;
  style?: AnyObject;
};

export type InferKey<P> = P extends { key: infer K } ? K : never;

export type InferApi<P> = P extends { api: infer A } ? A : never;

export type InferPluginApi<P extends AnyPluginConfig> = P extends {
  pluginApi?: infer A;
}
  ? NonNullable<A>
  : {};

export type InferEnabled<P> = P extends { enabled?: infer E }
  ? IsAny<E> extends true
    ? boolean
    : Extract<E, boolean> extends never
      ? boolean
      : Extract<E, boolean>
  : boolean;

export type InferDependencies<P> = P extends {
  dependencies?: infer D extends readonly PluginReference[];
}
  ? D
  : readonly [];

/**
 * Declaration-safe dependency witness.
 *
 * Plugin dependencies need their config tree for capability inference, not the
 * dependency descriptor's authoring methods and runtime fields. Keeping that
 * full structural descriptor in another package's emitted declaration can
 * exceed TypeScript's serializer depth and collapse the dependency to `any`.
 */
export type PluginDependencyReference<
  P extends PluginReference = PluginReference,
> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? PluginReference<P['key'], P['type']> & {
      readonly __config: PluginDependencyConfig<C>;
    }
  : P;

export type PluginDependencyReferences<
  D extends readonly PluginReference[] = readonly PluginReference[],
> = {
  readonly [TIndex in keyof D]: D[TIndex] extends PluginReference
    ? PluginDependencyReference<D[TIndex]>
    : never;
};

/** Declaration-safe references produced from inferred dependency configs. */
export type PluginDependencyConfigReferences<
  C extends readonly AnyPluginConfig[] = readonly AnyPluginConfig[],
> = {
  readonly [TIndex in keyof C]: PluginReference<
    C[TIndex]['key'],
    InferPluginDocumentType<C[TIndex]>
  > & {
    readonly __config: PluginDependencyConfig<C[TIndex]>;
  };
};

/**
 * Editor-capability view of a dependency.
 *
 * Runtime options stay on the dependency descriptor itself; copying them into
 * every dependent editor type leaks UI/provider implementation types into
 * downstream declarations without adding an editor capability.
 */
type PluginDependencyConfig<C extends AnyPluginConfig> = PluginConfig<
  C['key'],
  InferState<C>,
  InferApi<C>,
  InferTx<C>,
  InferSelectors<C>,
  {},
  PluginDependencyReferences<InferDependencies<C>> & readonly PluginReference[],
  InferPluginSchemaModel<C>,
  InferPluginApi<C>,
  InferEnabled<C>
>;

type InferDependencyConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends AnyPluginConfig
    ? P
    : never;

type NextSeenPluginKey<C extends AnyPluginConfig, Seen extends PropertyKey> =
  | Seen
  | (IsAny<C['key']> extends true ? never : C['key']);

export type InferDependencyConfigs<
  C extends AnyPluginConfig,
  Seen extends PropertyKey = never,
> = C extends unknown
  ? C['key'] extends Seen
    ? never
    : InferDependencyConfig<InferDependencies<C>[number]> extends infer D
      ? D extends AnyPluginConfig
        ? D | InferDependencyConfigs<D, NextSeenPluginKey<C, Seen>>
        : never
      : never
  : never;

export type InferPluginConfigTree<
  C extends AnyPluginConfig,
  Seen extends PropertyKey = never,
> = C extends unknown
  ? C['key'] extends Seen
    ? never
    : C | InferDependencyConfigs<C, Seen>
  : never;

export type InferOwnApi<P extends AnyPluginConfig> = InferPluginApi<P>;

/** Runtime option shape after plugin descriptors become nominal references. */
export type NormalizePluginOption<T> =
  IsAny<T> extends true
    ? T
    : T extends PluginReference<infer TKey, infer TDocumentType>
      ? PluginReference<TKey, TDocumentType>
      : T extends (...args: any[]) => any
        ? T
        : T extends readonly unknown[]
          ? { readonly [TIndex in keyof T]: NormalizePluginOption<T[TIndex]> }
          : T extends Readonly<Record<string, unknown>>
            ? { readonly [TKey in keyof T]: NormalizePluginOption<T[TKey]> }
            : T;

export type InferOptions<P> = P extends { options: infer O }
  ? NormalizePluginOption<O>
  : never;

/** Plugin capabilities visible to behavior extensions, without schema metadata. */
export type InferPluginBehaviorConfig<C extends AnyPluginConfig> =
  IsAny<InferOptions<C>> extends true
    ? C
    : PluginConfig<
        C['key'],
        InferOptions<C>,
        InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        never,
        InferPluginApi<C>,
        InferEnabled<C>
      >;

export type InferSelectors<P> = P extends { selectors: infer S } ? S : never;

export type InferState<P> = P extends { state?: infer State } ? State : {};

export type InferTx<P> = P extends { tx: infer Tx } ? Tx : never;

type OmitTxReadMethods<T> = {
  [K in keyof T as T[K] extends TxReadMethod<(...args: any[]) => any>
    ? never
    : K]: T[K];
};

export type InferPluginTx<P extends AnyPluginConfig> =
  InferTx<P> extends Record<P['key'], infer TTx> ? OmitTxReadMethods<TTx> : {};

export type InferOwnTx<P extends AnyPluginConfig> =
  IsAny<InferTx<P>> extends true
    ? any
    : Omit<InferTx<P>, P['key']> & InferPluginTx<P>;

export type InferPluginState<P extends AnyPluginConfig> =
  InferState<P> extends Record<P['key'], infer TState> ? TState : {};

export type InferOwnState<P extends AnyPluginConfig> =
  IsAny<InferState<P>> extends true ? any : InferPluginState<P>;

/**
 * Renders a component for Plite nodes declared by `schema.element` or
 * `schema.mark` that match this plugin's type. This is the primary render
 * method for plugin-specific node content.
 *
 * @default DefaultElement for elements, DefaultLeaf for leaves
 */
export type NodeComponent<T = any> = React.FC<T>;

export type NodeComponents = Record<string, NodeComponent>;

type CodecDataSource = Readonly<{
  files: Readonly<{
    readonly [index: number]: File;
    readonly length: number;
    item: (index: number) => File | null;
  }>;
  getData: (format: string) => string;
  types: readonly string[];
}>;

export type HtmlParserOptions = Readonly<{
  data: string;
  format: string;
  source: CodecDataSource;
}>;

/** Immutable plugin-key/type mapping available during HTML parsing. */
export type HtmlPluginRegistry = Readonly<{
  getKey: (type: string) => string | undefined;
  getType: (key: string) => string;
  has: (key: string) => boolean;
}>;

/** Pure context supplied to HTML parser and node-codec callbacks. */
export type HtmlPluginContext<C extends AnyPluginConfig = PluginConfig> =
  Readonly<{
    options: Readonly<InferOptions<C>>;
    registry: HtmlPluginRegistry;
    state: EditorCoreStateView;
    type: string;
  }>;

export type PluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  State = {},
  D extends readonly PluginReference[] = readonly [],
  SchemaModel = never,
  PluginApi = {},
  Enabled extends boolean = boolean,
> = {
  key: K;
  api: A;
  pluginApi: PluginApi;
  dependencies?: D;
  enabled?: Enabled;
  options: O;
  /** Exact schema type carried only by the plugin's `__config` type anchor. */
  schemaModel?: SchemaModel;
  selectors: S;
  state?: State;
  tx: Tx;
};

export type WithAnyKey<C extends AnyPluginConfig = PluginConfig> =
  IsAny<C['key']> extends true
    ? C
    : PluginConfig<
        any,
        InferOptions<C>,
        InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        InferEnabled<C>
      >;

export type WithRequiredKey<P = {}> =
  | (P extends { key: string } ? P : never)
  | { key: string };
