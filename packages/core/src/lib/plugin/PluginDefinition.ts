/** Shared type contracts for Plate plugin definitions. */
import type {
  EditorCoreStateView,
  DefinitionOf as PliteDefinitionOf,
  EditorExtensionDependencyReference,
  EditorExtensionDefinition,
  EditorExtensionReference,
  Editor,
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
  Text,
} from '@platejs/plite';
import type {
  EditorSchemaSourceProvider,
  EditorExtensionDependencyReferenceFor,
  InternalEditorExtensionInstalledCapabilitiesOf,
} from '@platejs/plite/internal';
import type { AnyObject, Nullable } from '@udecode/utils';
import type { Draft } from 'mutative';
import type { InternalDefinitionOf } from './pluginDefinitionCarrier.internal';
import type {
  InferPluginDocumentType,
  InferPluginSchema,
  InferPluginSchemaContribution,
} from './pluginSchemaModel.internal';

/**
 * Compact inferred definition carried by every Base plugin descriptor.
 *
 * Author callbacks are normalized to their capability results before reaching
 * this boundary, so declarations do not serialize callback graphs.
 */
export type BasePluginDefinition = Readonly<{
  activate?: true;
  api?: object;
  codecs?: true;
  commands?: true;
  conflicts?: readonly (EditorExtensionReference | PluginReference)[];
  contributions?: true;
  corrections?: true;
  decorate?: true;
  dependencies?: readonly (EditorExtensionReference | PluginReference)[];
  editOnly?: true;
  effectTypes?: true;
  enabled?: boolean;
  facetProviders?: true;
  initialState?: object;
  inject?: true;
  inputRules?: true;
  name: string;
  on?: true;
  override?: true;
  parsers?: true;
  read?: object;
  readMiddleware?: true;
  render?: true;
  rules?: true;
  schema?: PluginSchemaDeclaration;
  selectionKinds?: true;
  selectors?: object;
  shortcuts?: true;
  stateFields?: true;
  targetPluginNames?: readonly string[];
  transformInitialValue?: true;
  type?: string;
  update?: object;
  useHooks?: true;
  validate?: true;
}>;

/** Erased runtime boundary for heterogeneous plugin definitions. */
export type AnyBasePluginDefinition = BasePluginDefinition;

type PublicDependencyReference<P> =
  P extends PluginReference<infer TName, infer TDocumentType>
    ? PluginReference<TName, TDocumentType>
    : P extends Readonly<{
          enabled: infer TEnabled extends boolean;
          name: infer TName extends string;
        }>
      ? Readonly<{ enabled: TEnabled; name: TName }>
      : P extends Readonly<{ name: infer TName extends string }>
        ? Readonly<{ name: TName }>
        : EditorExtensionDependencyReference;

type PublicDependencyReferences<TReferences> =
  TReferences extends readonly unknown[]
    ? {
        readonly [TIndex in keyof TReferences]: PublicDependencyReference<
          TReferences[TIndex]
        >;
      }
    : readonly [];

type PublicPluginDefinition<D extends AnyBasePluginDefinition> = Readonly<{
  [TKey in keyof D]: TKey extends 'conflicts' | 'dependencies'
    ? PublicDependencyReferences<D[TKey]>
    : D[TKey];
}>;

/** Extract the exact normalized public definition from a Base or Plate descriptor. */
export type DefinitionOf<P> = P extends unknown
  ? [InternalDefinitionOf<P>] extends [never]
    ? PliteDefinitionOf<P> extends infer D extends AnyBasePluginDefinition
      ? D
      : never
    : InternalDefinitionOf<P> extends infer D extends AnyBasePluginDefinition
      ? PublicPluginDefinition<D>
      : never
  : never;

type IsAny<T> = 0 extends 1 & T ? true : false;

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
  defaultNodeValue?: unknown;
  /** Node key to map to the styles. */
  nodeKey?: string;
  /**
   * Style key to override.
   *
   * @default nodeKey
   */
  styleKey?: string;
  /** List of supported node values. */
  validNodeValues?: readonly unknown[];
};

export type PluginBase<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = EditorSchemaSourceProvider<InferPluginSchemaContribution<C>> & {
  /** Unique name for this plugin. */
  name: C['name'];
  /** Plugins that must be installed before this plugin. */
  dependencies: InferDependencies<C>;
  inject: Nullable<{
    /** Plugin names of elements to exclude the children from */
    excludeBelowPlugins?: string[];
    /** Plugin names of elements to exclude */
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
  /** Initial value used to create this plugin's editor-local store. */
  initialState: InferPluginStoreState<C>;
  override: {};
  /** Plugin names targeted by this plugin's schema and render behavior. */
  readonly targetPluginNames: InferTargetPluginNames<C>;
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
  /** Document type/property identifier owned by this plugin. Defaults to `name`. */
  type: InferPluginDocumentType<C>;
  /** Selectors for the plugin. */
  selectors: InferSelectors<C>;
  /**
   * Configures edit-only behavior for various plugin functionalities.
   *
   * - If `true` (boolean):
   *
   *   - `render`, `on`, and `inject.nodeProps` are active only when the
   *       editor is NOT read-only.
   * - If an object ({@link EditOnlyConfig}): Allows fine-grained control:
   *
   *   - `render`: Edit-only by default (true if not specified). Set to `false` to
   *       always be active.
   *   - `on`: Edit-only by default (true if not specified). Set to `false` to
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

declare const pluginReference: unique symbol;

export interface PluginReference<
  TName extends string = string,
  TDocumentType extends string = string,
> {
  /** @internal Nominal descriptor identity. */
  readonly [pluginReference]: true;
  readonly name: TName;
  readonly type: TDocumentType;
}

type NormalizePliteDefinition<TDefinition> =
  TDefinition extends EditorExtensionDefinition
    ? Readonly<{
        [TKey in keyof TDefinition as TKey extends
          | 'schema'
          | keyof BasePluginDefinition
          ? TKey extends 'schema'
            ? never
            : TKey
          : never]: TDefinition[TKey];
      }> &
        Readonly<{ name: TDefinition['name'] }>
    : never;

type DependencyInstalledDefinitionOf<P> = NormalizePliteDefinition<
  InternalEditorExtensionInstalledCapabilitiesOf<P>
>;

type PliteDependencyInstalledDefinitionOf<P> = [
  DependencyInstalledDefinitionOf<P>,
] extends [never]
  ? DependencyInstalledDefinitionOf<EditorExtensionDependencyReferenceFor<P>>
  : DependencyInstalledDefinitionOf<P>;

type PluginDependencyInstalledDefinitionOf<P> =
  | InternalDefinitionOf<P>
  | PliteDependencyInstalledDefinitionOf<P>;

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
  /** Resolve an optional plugin-name allowlist to installed element types. */
  elementTypesByName: (pluginNames: readonly string[]) => readonly string[];
}>;

export type PluginSchemaContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  TType extends string = InferPluginDocumentType<C>,
> = Readonly<{
  initialState: Readonly<InferPluginStoreState<C>>;
  name: C['name'];
  own: PluginSchemaOwn<TType>;
  plugins: PluginSchemaReferences;
  targetPluginNames: InferTargetPluginNames<C>;
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
    blockContent?: boolean;
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
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  TType extends string = InferPluginDocumentType<C>,
> =
  | ((context: PluginSchemaContext<C, TType>) => PluginSchemaDeclaration)
  | PluginSchemaDeclaration;

export type PluginBaseContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = {
  /** API owned by the current plugin, without the plugin-name namespace wrapper. */
  api: InferOwnApi<C>;
  /** Whether this plugin is installed and enabled in the target editor. */
  readonly installed: boolean;
  /** One-shot updates owned by the current plugin, without its name namespace. */
  update: InferOwnUpdate<C>;
  /** State-bound reads owned by the current plugin. */
  read: InferOwnRead<C>;
  /** Mutable editor-local state and pure named selectors owned by this plugin. */
  store: PluginStore<C>;
  type: string;
};

export type BaseTransformOptions = GetInjectNodePropsOptions & {
  nodeValue?: unknown;
  value?: unknown;
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
   * If true, `on` callbacks are only active when the editor is not read-only.
   *
   * @default true (when `editOnly` is an object or `true` boolean)
   */
  on?: boolean;
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

export type InferName<P> = P extends { name: infer N } ? N : never;

export type InferApi<P> = P extends { api: infer A extends object } ? A : {};

export type InferRead<P> = P extends { read: infer R extends object } ? R : {};

export type InferUpdate<P> = P extends { update: infer U extends object }
  ? U
  : {};

export type InferEnabled<P> = P extends { enabled?: infer E }
  ? IsAny<E> extends true
    ? boolean
    : Extract<E, boolean> extends never
      ? boolean
      : Extract<E, boolean>
  : boolean;

export type InferTargetPluginNames<P extends AnyBasePluginDefinition> =
  string extends P['name']
    ? readonly string[]
    : P extends {
          targetPluginNames: infer TNames extends readonly string[];
        }
      ? TNames
      : readonly [];

export type InferDependencies<P> = P extends {
  dependencies?: infer D extends readonly (
    | EditorExtensionReference
    | PluginReference
  )[];
}
  ? D
  : readonly [];

export type InferConflicts<P> = P extends {
  conflicts?: infer D extends readonly (
    | EditorExtensionReference
    | PluginReference
  )[];
}
  ? D
  : readonly [];

type InferDependencyDefinition<P> = Extract<
  PluginDependencyInstalledDefinitionOf<P>,
  AnyBasePluginDefinition
>;

export type InferDependencyDefinitions<C extends AnyBasePluginDefinition> =
  InferDependencyDefinition<InferDependencies<C>[number]>;

export type InferOwnApi<P extends AnyBasePluginDefinition> = InferApi<P>;

/** Runtime state shape after plugin descriptors become nominal references. */
export type NormalizePluginState<T> =
  IsAny<T> extends true
    ? T
    : T extends Editor
      ? T
      : T extends PluginReference<infer TName, infer TDocumentType>
        ? PluginReference<TName, TDocumentType>
        : T extends Readonly<{
              configure: (...args: never[]) => unknown;
              extend: (...args: never[]) => unknown;
              name: infer TName extends string;
              type: infer TDocumentType extends string;
            }>
          ? PluginReference<TName, TDocumentType>
          : T extends (...args: never[]) => unknown
            ? T
            : T extends readonly unknown[]
              ? {
                  readonly [TIndex in keyof T]: NormalizePluginState<T[TIndex]>;
                }
              : T extends Readonly<Record<string, unknown>>
                ? { readonly [TKey in keyof T]: NormalizePluginState<T[TKey]> }
                : T;

export type InferPluginStoreState<P> = P extends {
  initialState: infer StoreState;
}
  ? StoreState
  : {};

export type InferSelectors<P> = P extends { selectors: infer S } ? S : {};

export type PluginSelector<
  TState extends object = object,
  TArgs extends unknown[] = unknown[],
  TResult = unknown,
> = (state: Readonly<TState>, ...args: TArgs) => TResult;

export type PluginSelectors<TState extends object = object> = Record<
  string,
  PluginSelector<TState, never[], unknown>
>;

type PluginSelectorMethod<TSelector> = TSelector extends (
  state: any,
  ...args: infer TArgs
) => infer TResult
  ? (...args: TArgs) => TResult
  : never;

/** Public selector call shape without the implementation-only state input. */
export type PluginSelectorMethods<TSelectors extends object> = {
  [TKey in keyof TSelectors]: PluginSelectorMethod<TSelectors[TKey]>;
};

type NormalizedPluginSelector<
  TState extends object,
  TSelector,
> = TSelector extends (...args: infer TArgs) => infer TResult
  ? PluginSelector<TState, TArgs, TResult>
  : never;

/** Rebind selector methods to one compact, nameable plugin state. */
export type NormalizePluginSelectors<
  TState extends object,
  TSelectors extends object,
> = {
  [TKey in keyof TSelectors]: NormalizedPluginSelector<
    TState,
    TSelectors[TKey]
  >;
};

export type PluginSelectorArgs<T> = T extends (
  state: infer _TState,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never;

export type PluginSelectorReturn<T> = T extends (
  state: infer _TState,
  ...args: never[]
) => infer TResult
  ? TResult
  : never;

type IsBroadPluginDefinition<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? true
    : [keyof InferPluginStoreState<C>] extends [never]
      ? [keyof InferSelectors<C>] extends [never]
        ? true
        : false
      : false;

type PluginStoreKey<C extends AnyBasePluginDefinition> =
  IsBroadPluginDefinition<C> extends true
    ? PropertyKey
    : keyof InferPluginStoreState<C> | keyof InferSelectors<C>;

type PluginStoreValue<
  C extends AnyBasePluginDefinition,
  K extends PluginStoreKey<C>,
> = K extends keyof InferSelectors<C>
  ? IsBroadPluginDefinition<C> extends true
    ? unknown
    : PluginSelectorReturn<InferSelectors<C>[K]>
  : IsBroadPluginDefinition<C> extends true
    ? unknown
    : K extends keyof InferPluginStoreState<C>
      ? InferPluginStoreState<C>[K]
      : never;

export type PluginStore<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = {
  /** Read the complete current plugin state. */
  get(): Readonly<InferPluginStoreState<C>>;
  /** Read one state field or evaluate one named selector. */
  get<K extends PluginStoreKey<C>>(
    key: K,
    ...args: IsBroadPluginDefinition<C> extends true
      ? unknown[]
      : K extends keyof InferSelectors<C>
        ? PluginSelectorArgs<InferSelectors<C>[K]>
        : []
  ): PluginStoreValue<C, K>;
  /** Replace fields or update the current plugin state through a draft. */
  set(
    value:
      | Partial<InferPluginStoreState<C>>
      | ((state: Draft<InferPluginStoreState<C>>) => void)
  ): void;
  /** Subscribe to raw state changes. */
  subscribe: (
    listener: (
      state: InferPluginStoreState<C>,
      previousState: InferPluginStoreState<C>
    ) => void
  ) => () => void;
};

export type InferPluginReadGroups<P extends AnyBasePluginDefinition> = {
  readonly [TName in P['name']]: InferRead<P>;
};

export type InferPluginUpdateGroups<P extends AnyBasePluginDefinition> = {
  readonly [TName in P['name']]: InferUpdate<P>;
};

export type InferOwnRead<P extends AnyBasePluginDefinition> = InferRead<P>;

export type InferOwnUpdate<P extends AnyBasePluginDefinition> = InferUpdate<P>;

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

/** Immutable plugin-name/type mapping available during HTML parsing. */
export type HtmlPluginRegistry = Readonly<{
  getName: (type: string) => string | undefined;
  getType: (name: string) => string;
  has: (name: string) => boolean;
}>;

/** Pure context supplied to HTML parser and node-codec callbacks. */
export type HtmlPluginContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Readonly<{
  pluginState: Readonly<InferPluginStoreState<C>>;
  registry: HtmlPluginRegistry;
  state: EditorCoreStateView;
  type: string;
}>;

export type WithAnyName<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  IsAny<C['name']> extends true
    ? C
    : string extends C['name']
      ? C
      : Omit<C, 'name'> & { name: string };

export type WithRequiredName<P = {}> =
  | (P extends { name: string } ? P : never)
  | { name: string };
