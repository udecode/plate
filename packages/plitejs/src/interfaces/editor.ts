import type {
  Ancestor,
  Descendant,
  DescendantIn,
  Element,
  ElementIn,
  ElementOrTextIn,
  Location,
  Node,
  NodeEntry,
  NodeIn,
  NodeProps,
  Path,
  Point,
  Range,
  Span,
  Text,
} from '..';
import type { Anchor, AnchorOptions, AnchorValue } from '../core/anchor';
import type { DocumentChange } from '../core/change/document-change';
import { defineCommand as defineEditorCommand } from '../core/command-definition';
import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { isEditorNodeSelectable } from '../core/editor-read-execution';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorSchema,
} from '../core/editor-runtime';
import { getExtensionRegistry as getEditorExtensionRegistry } from '../core/extension-registry';
import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getCollabEffects as getEditorCollabEffects,
  isInTransaction,
  replaceSnapshot,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import type { EditorSchemaSource } from '../core/schema-source.internal';
import type { TxOnlyMethod, TxReadMethod } from '../core/tx-only';
import { addMark as executeAddMarkCommand } from '../editor/add-mark';
import { deleteBackward as executeDeleteBackwardCommand } from '../editor/delete-backward';
import { deleteForward as executeDeleteForwardCommand } from '../editor/delete-forward';
import { deleteFragment as executeDeleteFragmentCommand } from '../editor/delete-fragment';
import { insertBreak as executeInsertBreakCommand } from '../editor/insert-break';
import { insertSoftBreak as executeInsertSoftBreakCommand } from '../editor/insert-soft-break';
import { insertText as executeInsertTextCommand } from '../editor/insert-text';
import { isEditor as isEditorValue } from '../editor/is-editor';
import { removeMark as executeRemoveMarkCommand } from '../editor/remove-mark';
import { toggleMark as executeToggleMarkCommand } from '../editor/toggle-mark';
import { getLocationRoot, MAIN_ROOT_KEY } from '../internal/root-location';
import {
  liftNodes as executeLiftNodes,
  mergeNodes as executeMergeNodes,
  moveNodes as executeMoveNodes,
  replaceChildren as executeReplaceChildren,
  splitNodes as executeSplitNodes,
  unsetNodes as executeUnsetNodes,
  unwrapNodes as executeUnwrapNodes,
  wrapNodes as executeWrapNodes,
} from '../transforms-node';
import {
  deselect as executeDeselect,
  setPoint as executeSetPoint,
} from '../transforms-selection';
import { move as executeMoveCommand } from '../transforms-selection/move';
import { deleteText as executeDeleteText } from '../transforms-text/delete-text';
import type {
  LeafEdge,
  MaximizeMode,
  RangeMode,
  SelectionMode,
  TextDirection,
  TextUnit,
  TextUnitAdjustment,
} from '../types/types';
import type { NodeMatch, NodeTypeSelector } from './node';
import type {
  EditorSchemaDeclaration,
  EditorSchemaDelta,
  EditorSchemaElement,
  EditorSchemaExtensionProvider,
  EditorSchemaIdentity,
  EditorSchemaProperty,
  EditorSchemaPropertyQuery,
  SchemaDescendantInValue,
  SchemaElementConstructionPropertiesFor,
  SchemaElementFor,
  SchemaElementHandle,
  SchemaElementTypes,
  SchemaPropertyHandle,
  SchemaValueFromExtensions,
} from './schema';
import type {
  EditorSelection,
  NodeSelection,
  Selection,
  SelectionValue,
} from './selection';
import { SelectionApi } from './selection';
import type {
  BlockDuplicateOptions,
  NodeDuplicateOptions,
  NodeInsertNodesOptions,
  NodeLiftNodesOptions,
  NodeMergeNodesOptions,
  NodeMoveNodesOptions,
  NodeMutationMethods,
  NodeRemoveNodesOptions,
  NodeReplaceChildrenOptions,
  NodeSetNodesOptions,
  NodeSplitNodesOptions,
  NodeUnsetNodesOptions,
  NodeUnwrapNodesOptions,
  NodeWrapNodesOptions,
} from './transforms/node';
import type {
  SelectionCollapseOptions,
  SelectionMoveOptions,
  SelectionMutationMethods,
  SelectionSetPointOptions,
} from './transforms/selection';
import type {
  TextDeleteOptions,
  TextInsertFragmentOptions,
  TextInsertTextOptions,
  TextMutationMethods,
} from './transforms/text';

export type { Selection } from './selection';

/**
 * The `Editor` interface exposes the runtime API of a Plite editor. Document
 * state is read through editor methods and mutated through `editor.update`.
 */
export type Value = readonly Element[];

type NodePropertyEntryIn<V extends Value> =
  NodeIn<V> extends infer TNode
    ? TNode extends Descendant
      ? {
          [TKey in Extract<keyof NodeProps<TNode>, string>]: Readonly<{
            key: TKey;
            value: NodeProps<TNode>[TKey];
          }>;
        }[Extract<keyof NodeProps<TNode>, string>]
      : never
    : never;

type NodePropertyKeyIn<V extends Value> = NodePropertyEntryIn<V>['key'];

type WithNodeKeyTarget<TOptions extends { at?: Location | NodeSelection }> =
  Omit<TOptions, 'at'> & {
    at?: Location | NodeKey | NodeSelection;
  };

type NodePropertyPatch<TProps> = TProps extends unknown
  ? {
      [TKey in keyof TProps]?: TProps[TKey] | undefined;
    }
  : never;

type EditorNodeSetObject<V extends Value> = {
  <const TType extends NodeTypeSelector>(
    props: NodePropertyPatch<NodeProps<NodeForTypeSelector<TType>>>,
    options: WithNodeKeyTarget<
      NodeSetNodesOptions<NodeForTypeSelector<TType>, TType>
    > & { type: TType }
  ): void;
  <T extends Descendant>(
    props: NodePropertyPatch<NodeProps<NoInfer<T>>>,
    options: Omit<NodeSetNodesOptions<T>, 'at'> & { at: T }
  ): void;
  (
    props: [Value] extends [V]
      ? NodePropertyPatch<Omit<Element, 'children'>>
      : never,
    options?: WithNodeKeyTarget<NodeSetNodesOptions<Element>>
  ): void;
  (
    props: NodePropertyPatch<NodeProps<NodeIn<V>>>,
    options?: WithNodeKeyTarget<NodeSetNodesOptions<NodeIn<V>>>
  ): void;
};

type EditorBlockSetOptions<
  T extends Element,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> = {
  at?: NodeSelectionTarget;
  match?: NodeMatch<T>;
  mode?: MaximizeMode;
  type?: TType;
  voids?: boolean;
};

export type EditorTransactionBlocksApi<V extends Value = Value> = {
  duplicate: {
    <const TType extends NodeTypeSelector>(
      options: Omit<
        BlockDuplicateOptions<NodeForTypeSelector<TType>, TType>,
        'at'
      > & {
        at?: NodeSelectionTarget;
        type: TType;
      }
    ): void;
    (
      options?: Omit<BlockDuplicateOptions<ElementIn<V>>, 'at'> & {
        at?: NodeSelectionTarget;
      }
    ): void;
  };
  /** Insert block nodes after the block containing the target. */
  insertAfter: <T extends ElementIn<V>>(
    nodes: T | readonly T[],
    options?: NodeDuplicateOptions & { at?: NodeSelectionTarget }
  ) => void;
  /** Reset blocks to the immediate parent or root schema default. */
  reset: (options?: { at?: NodeSelectionTarget }) => void;
  set: (
    props: NodePropertyPatch<NodeProps<ElementIn<V>>>,
    options?: EditorBlockSetOptions<ElementIn<V>>
  ) => void;
  toggle: (
    props: NodePropertyPatch<NodeProps<ElementIn<V>>> & { type: string },
    options?: EditorBlockToggleOptions
  ) => void;
};

export type EditorNodeUnsetOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> = {
  at?: NodeSelectionTarget;
  match?(node: T, path: Path): boolean;
  type?: TType;
  mode?: MaximizeMode;
  hanging?: boolean;
  split?: boolean;
  voids?: boolean;
};

type ValueDescendant<V extends Value> = [SchemaDescendantInValue<V>] extends [
  never,
]
  ? Extract<DescendantIn<V>, Descendant>
  : Extract<SchemaDescendantInValue<V>, Descendant>;

type ValueElement<V extends Value> = Extract<ValueDescendant<V>, Element>;

type ValueText<V extends Value> = Extract<ValueDescendant<V>, Text>;

type ValueNode<V extends Value> = [SchemaDescendantInValue<V>] extends [never]
  ? Extract<NodeIn<V>, Node>
  : ValueDescendant<V>;

type ValueTreeNode<_V extends Value> = Node;

type NodeForSelectorItem<TItem> =
  TItem extends SchemaElementHandle<infer TSchema, infer TElementType>
    ? TSchema extends EditorSchemaSource
      ? SchemaElementFor<
          TSchema,
          Extract<TElementType, SchemaElementTypes<TSchema>>
        >
      : never
    : TItem extends string
      ? string extends TItem
        ? Element
        : Element & { type: TItem }
      : never;

/** The element selected by a persisted type or raw schema element handle. */
export type NodeForTypeSelector<TType extends NodeTypeSelector> =
  TType extends ReadonlyArray<infer TItem>
    ? NodeForSelectorItem<TItem>
    : NodeForSelectorItem<TType>;

type NodeInsertSplitTarget<
  V extends Value,
  TType extends NodeTypeSelector | undefined,
> = undefined extends TType
  ? NodeIn<V>
  : NodeForTypeSelector<Extract<TType, NodeTypeSelector>>;

export type EditorNodeForType<
  V extends Value,
  TType extends NodeTypeSelector | undefined,
> = undefined extends TType
  ? ValueNode<V>
  : NodeForTypeSelector<Extract<TType, NodeTypeSelector>>;

export type RootKey = string;

/** A named secondary root. Literal `main` is never a public root argument. */
export type NamedRootKey<TRoot extends RootKey = RootKey> = TRoot extends 'main'
  ? never
  : TRoot;

export type EditorDocumentValue<V extends Value = Value> = Readonly<{
  children: V;
  meta?: Readonly<Record<string, unknown>>;
  roots?: Readonly<Record<RootKey, V>>;
}>;

/** Schema-owned structural document content, excluding state-field metadata. */
export type EditorSchemaDocumentValue<V extends Value = Value> = Readonly<{
  children: V;
  roots?: Readonly<Record<RootKey, V>>;
}>;

export type InitialValue<V extends Value = Value> =
  | V
  | Readonly<{
      children: V;
      meta?: Readonly<Record<string, unknown>>;
      roots?: Readonly<Record<RootKey, V>>;
    }>;

/** A document location, node key, or live node to resolve. */
export type NodeTarget<N extends Descendant = Descendant> =
  | Location
  | N
  | NodeKey;

export type EditorReplaceChildrenOptions = Omit<
  NodeReplaceChildrenOptions,
  'at'
> & {
  at: NodeTarget<Element>;
};

/** Options for replacing exactly one node with zero or more nodes. */
export type EditorReplaceNodeOptions = {
  at: Descendant | Path;
  select?: boolean;
};

type NodeSelectionTarget<TNode extends Descendant = Descendant> =
  | NodeSelection
  | NodeTarget<TNode>;

type WithNodeTarget<
  TOptions extends { at?: Location },
  TNode extends Descendant = Descendant,
> = Omit<TOptions, 'at'> & {
  at?: NodeTarget<TNode>;
};

type WithNodeTargetOrSpan<
  TOptions extends { at?: Location | NodeSelection | Span },
  TNode extends Descendant = Descendant,
> = Omit<TOptions, 'at'> & {
  at?: NodeSelectionTarget<TNode> | Span;
};

export type EditorNodesReadOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> = WithNodeTargetOrSpan<EditorNodesOptions<T, TType>>;

type EditorBlocksReadOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> = Omit<EditorNodesReadOptions<T, TType>, 'pass' | 'universal'>;

export type EditorNodeGetOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> = {
  match?: NodeMatch<T>;
  type?: TType;
};

export type StateFieldCollabPolicy = 'local' | 'shared';

export type StateFieldHistoryPolicy = 'push' | 'skip';

export type StateFieldInitial<TValue> = TValue | (() => TValue);

/** Versioned encoder and validator for persisted editor values. */
export type EditorValueCodec<TValue = unknown> = Readonly<{
  decode: (value: unknown) => TValue;
  encode: (value: TValue) => unknown;
  version: number;
}>;

/** JSON envelope produced by a versioned editor value codec. */
export type SerializedEditorValue = Readonly<{
  value: unknown;
  version: number;
}>;

/** JSON envelope for one typed editor effect. */
export type SerializedEditorEffect = SerializedEditorValue &
  Readonly<{
    key: string;
  }>;

/** JSON envelope for one installed editor selection kind. */
export type SerializedEditorSelection = SerializedEditorValue &
  Readonly<{
    kind: string;
  }>;

export type StateFieldDescriptor<TValue = unknown> = Readonly<{
  collab?: StateFieldCollabPolicy;
  /** Suppresses transitions whose stored values are semantically equal. */
  compare?: (left: TValue, right: TValue) => boolean;
  history?: StateFieldHistoryPolicy;
  initial?: StateFieldInitial<TValue>;
  key: string;
  persist?: EditorValueCodec<TValue>;
  reduce?: (value: TValue, effect: EditorEffect) => TValue;
}>;

export type StateFieldValueInput<TValue> =
  | TValue
  | ((previous: TValue) => TValue);

export type StateFieldTransition<TValue> = Readonly<{
  previousValue: TValue;
  value: TValue;
}>;

export type EditorStateField<TValue = unknown> =
  EditorExtensionDefinitionInput &
    Readonly<{ name: string }> &
    Omit<StateFieldDescriptor<TValue>, 'compare'> & {
      compare: (left: TValue, right: TValue) => boolean;
      deserialize: (value: unknown) => TValue;
      effect: EditorEffectType<StateFieldTransition<TValue>>;
      serialize: (value: TValue) => SerializedEditorValue;
    };

/** Yjs-agnostic helpers supplied by a collaboration adapter while encoding. */
export type EditorEffectCollabEncodeContext = Readonly<{
  point: (point: Point) => unknown;
  range: (range: Range) => unknown;
}>;

/** Yjs-agnostic helpers supplied by a collaboration adapter while decoding. */
export type EditorEffectCollabDecodeContext = Readonly<{
  point: (value: unknown) => Point | null;
  range: (value: unknown) => Range | null;
}>;

/**
 * Maps a persisted effect payload through collaboration-relative positions.
 * Returning `undefined` while decoding drops an effect whose target vanished.
 */
export type EditorEffectCollabTransport<TValue = unknown> = Readonly<{
  decode: (
    value: unknown,
    context: EditorEffectCollabDecodeContext
  ) => TValue | undefined;
  encode: (value: TValue, context: EditorEffectCollabEncodeContext) => unknown;
}>;

/**
 * Persistence semantics for a shared collaboration effect.
 *
 * `latest` is reserved for absolute, idempotent restore values. `live` effects
 * are delivered exactly once to causally registered active peers and are
 * intentionally absent from late-join checkpoints.
 */
export type EditorEffectCollabReplay = 'latest' | 'live';

export type EditorEffectType<TValue = any> = Readonly<{
  codec?: EditorValueCodec<TValue>;
  collab: StateFieldCollabPolicy;
  collabReplay: EditorEffectCollabReplay;
  /** Pure capture of the current absolute value for late-join checkpoints. */
  collabSnapshot?: (state: EditorStateView<Value, any>) => TValue | undefined;
  collabTransport?: EditorEffectCollabTransport<TValue>;
  history: StateFieldHistoryPolicy;
  invert: (value: TValue) => TValue;
  key: string;
  map: (value: TValue, changes: DocumentChange) => TValue | undefined;
}>;

export type EditorEffect<TValue = any> = Readonly<{
  type: EditorEffectType<TValue>;
  value: TValue;
}>;

export type EditorUpdateAnnotation<TValue = unknown> = Readonly<{
  combine: (previous: TValue, next: TValue) => TValue;
  key: string;
}>;

/** One document root whose changes invalidate a computed facet provider. */
export type EditorFacetDocumentDependency<TRoot extends RootKey = RootKey> =
  Readonly<{
    kind: 'document';
    /** Omit for the primary document; named roots are explicit. */
    root?: NamedRootKey<TRoot>;
  }>;

/** Explicit state inputs that can invalidate a computed editor facet provider. */
export type EditorFacetDependency<TRoot extends RootKey = RootKey> =
  | 'document'
  | 'schema'
  | 'selection'
  | EditorFacet<any, any>
  | EditorFacetDocumentDependency<TRoot>
  | EditorStateField<any>;

export type EditorFacetComputeOptions<TRoot extends RootKey = RootKey> =
  Readonly<{
    /**
     * Inputs read by the provider. Omit this to preserve whole-editor revision
     * invalidation. An empty list computes the provider once per registration.
     */
    dependencies: ReadonlyArray<EditorFacetDependency<TRoot>>;
  }>;

export type EditorFacetProvider<TInput = any> = Readonly<{
  compute?: (state: EditorStateView<Value, any>) => TInput;
  dependencies?: readonly EditorFacetDependency[];
  facet: EditorFacet<TInput, any>;
  value?: TInput;
}>;

export type EditorFacet<TInput, TOutput = readonly TInput[]> = Readonly<{
  combine: (inputs: readonly TInput[]) => TOutput;
  compare: (left: TOutput, right: TOutput) => boolean;
  compareInput: (left: TInput, right: TInput) => boolean;
  compute: <const TRoot extends RootKey>(
    compute: (state: EditorStateView<Value, any>) => TInput,
    options?: EditorFacetComputeOptions<TRoot>
  ) => EditorFacetProvider<TInput>;
  default: TOutput;
  key: string;
  of: (value: TInput) => EditorFacetProvider<TInput>;
}>;

export type EditorTransactionEffectsApi = {
  all: () => readonly EditorEffect[];
  emit: <TValue>(type: EditorEffectType<TValue>, value: TValue) => void;
};

export type EditorExtensionMigrationContext = Readonly<{
  /** Immutable structural document before candidate configuration publication. */
  document: EditorSchemaDocumentValue;
  /** Candidate schema that validates the returned document. */
  next: EditorStateSchemaApi;
}>;

export type EditorExtensionReconfigureOptions = Readonly<{
  /**
   * Return the complete structural document to publish with the candidate.
   *
   * Omit this callback only when the current document already validates under
   * the candidate schema. Live reconfiguration never fills schema defaults
   * implicitly.
   */
  migrate?: (
    context: EditorExtensionMigrationContext
  ) => EditorSchemaDocumentValue;
}>;

export type EditorTransactionExtensionsApi = {
  /** Replace one named extension slot when the surrounding update commits. */
  reconfigure: (
    slot: EditorExtensionSlotLike,
    input: EditorExtensionInput,
    options?: EditorExtensionReconfigureOptions
  ) => void;
};

export type EditorTransactionAnnotationsApi = {
  get: <TValue>(
    annotation: EditorUpdateAnnotation<TValue>
  ) => TValue | undefined;
  set: <TValue>(
    annotation: EditorUpdateAnnotation<TValue>,
    value: TValue
  ) => void;
};

type BivariantMethod<TArgs extends readonly unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

type BivariantFunction<TFn> = TFn extends (
  ...args: infer TArgs
) => infer TResult
  ? BivariantMethod<TArgs, TResult>
  : never;

declare const editorGenericMethod: unique symbol;

/**
 * Preserve a generic extension method through editor projections.
 *
 * @internal
 */
export type EditorGenericMethod<TMethod extends (...args: any[]) => any> =
  TMethod & Readonly<{ [editorGenericMethod]: true }>;

export type EditorStateValueApi<V extends Value = Value> =
  () => EditorDocumentValue<V>;

export type SnapshotSelectionInput<
  TSelection extends SelectionValue = SelectionValue,
> = Selection<TSelection> | 'end' | 'start';

/** Application persistence envelope for one complete external document. */
export type PersistedDocumentInput<V extends Value = Value> = Readonly<{
  document: EditorDocumentValue<V>;
  schema: EditorSchemaIdentity;
  selection?: SnapshotSelectionInput;
}>;

export type EditorTransactionValueApi<V extends Value = Value> =
  EditorStateValueApi<V> & {
    replace: (input: SnapshotInput<V>) => void;
  };

export type EditorUpdateValueApi<V extends Value = Value> =
  EditorStateValueApi<V> & {
    /**
     * Repair every document root with the installed corrections.
     *
     * This maintenance task starts its own history-skipped update and
     * cannot run inside another update.
     */
    repair: () => void;
    replace: (input: SnapshotInput<V>) => void;
  };

export type EditorSelectionTargetOptions = {
  at?: NodeTarget | null;
};

export type EditorSelectionSetNodesOptions = Readonly<{
  /** First exact selected node in the user's selection direction. */
  anchor: Descendant | NodeKey | Path;
  /** Active exact selected node in the user's selection direction. */
  focus: Descendant | NodeKey | Path;
}>;

export type EditorSelectionBlockOptions = EditorSelectionTargetOptions & {
  match?: NodeMatch<Element>;
  type?: NodeTypeSelector;
};

export type EditorStateSelectionApi<
  TSelection extends SelectionValue = SelectionValue,
  V extends Value = Value,
> = (() => Range | null) & {
  contains: (target: NodeTarget) => boolean;
  intersects: (target: NodeTarget) => boolean;
  isAcrossBlocks: (options?: EditorSelectionBlockOptions) => boolean;
  isAtBlockEnd: (options?: EditorSelectionBlockOptions) => boolean;
  isAtBlockStart: (options?: EditorSelectionBlockOptions) => boolean;
  /** Whether the active representative range is collapsed. */
  isCollapsed: () => boolean;
  /** Whether the active representative range is expanded. */
  isExpanded: () => boolean;
  isValid: (value: unknown) => value is Selection<TSelection>;
  isWithinBlock: (options?: EditorSelectionBlockOptions) => boolean;
  /** Exact live entries in the current node selection. */
  nodes: () => ReadonlyArray<NodeEntry<ValueDescendant<V>>>;
  ranges: () => readonly Range[];
};

export type EditorStateViewApi = {
  isComposing: () => boolean;
  isFocused: () => boolean;
  isReadOnly: () => boolean;
  /** Named view root, or `undefined` for the primary document. */
  root: () => NamedRootKey | undefined;
};

export type EditorFragmentReadOptions = {
  at?: Range;
  unwrap?: readonly string[];
};

export type EditorStateFragmentApi<V extends Value = Value> = (
  options?: EditorFragmentReadOptions
) => ReadonlyArray<DescendantIn<V>>;

export type EditorSliceReadOptions = Readonly<{
  at?: NodeSelection | Range;
}>;

export type EditorStateSliceApi<V extends Value = Value> = {
  /** Read the selection slice and apply every external export projection. */
  export: (options?: EditorSliceReadOptions) => ContentSlice<V>;
  /** Build an atomic replacement transaction without publishing it. */
  fit: (
    slice: ContentSlice,
    options?: WithNodeTarget<TextInsertFragmentOptions, DescendantIn<V>>
  ) => false | TransactionSpec;
  /** Fit immutable slice content against one detached parent without publishing. */
  fitContent: <TRoot extends RootKey>(
    slice: ContentSlice,
    options: Readonly<{
      parent: Element;
      /** Named secondary-root context. Omit for the primary root. */
      root?: NamedRootKey<TRoot>;
    }>
  ) => ReadonlyArray<DescendantIn<V>> | null;
  /** Read one immutable slice with structural openness preserved. */
  get: (options?: EditorSliceReadOptions) => ContentSlice<V>;
};

type EditorSelectionLocation =
  | Path
  | Point
  | (Range & Readonly<{ kind?: never }>);

export type EditorTransactionSelectionApi<
  TSelection extends SelectionValue = SelectionValue,
  V extends Value = Value,
> = EditorStateSelectionApi<TSelection, V> & {
  collapse: (options?: SelectionCollapseOptions) => void;
  move: (options?: SelectionMoveOptions) => void;
  set: BivariantMethod<
    [target: TSelection | EditorSelectionLocation | null],
    void
  >;
  /** Select exact live nodes. An empty collection clears the selection. */
  setNodes: (
    targets: ReadonlyArray<Descendant | NodeKey | Path>,
    options?: EditorSelectionSetNodesOptions
  ) => void;
  setPoint: (props: Partial<Point>, options?: SelectionSetPointOptions) => void;
};

/** A mapped location whose lifetime is limited to one transaction callback. */
export type EditorTransactionAnchor<TValue extends AnchorValue> = Readonly<{
  resolve: () => TValue | null;
}>;

export type EditorTransactionAnchorApi = <
  TValue extends AnchorValue,
  const TRoot extends RootKey,
>(
  value: TValue,
  options: AnchorOptions<TValue, TRoot>
) => EditorTransactionAnchor<TValue>;

export type EditorStateMarksApi<V extends Value = Value> =
  () => EditorMarks<V> | null;

export type EditorToggleMarkOptions = {
  /** Collapse the resulting selection in the same command commit. */
  collapse?: boolean | SelectionCollapseOptions;
};

export type EditorBlockToggleOptions = {
  at?: NodeSelectionTarget;
  voids?: boolean;
  wrap?: boolean;
};

export type EditorToggleBlockOptions = EditorBlockToggleOptions & {
  /** Collapse the resulting selection in the same command commit. */
  collapse?: boolean | SelectionCollapseOptions;
};

export type EditorTransactionMarksApi<V extends Value = Value> =
  EditorStateMarksApi<V> & {
    add: (key: string, value: unknown) => void;
    remove: (key: string) => void;
    set: (marks: EditorMarks<V> | null) => void;
    toggle: (key: string, value?: unknown) => void;
  };

export type EditorCanonicalUpdateTag =
  | 'history-push'
  | 'history-merge'
  | 'history-skip'
  | 'historic'
  | 'paste'
  | 'collaboration'
  | 'skip-collab'
  | 'skip-dom-selection'
  | 'skip-scroll-into-view'
  | 'skip-selection-focus'
  | 'native-text-input'
  | 'semantic-command'
  | 'focus'
  | 'composition-start'
  | 'composition-end';

export type EditorUpdateTag = EditorCanonicalUpdateTag | (string & {});

export type EditorUpdateTagInput = EditorUpdateTag | readonly EditorUpdateTag[];

/** Semantic policy applied to one editor update. */
export type EditorUpdatePolicy = Readonly<{
  /** History behavior. Requires an installed History extension. */
  history?: 'merge' | 'new-batch' | 'skip';
  /** Tags applied in input order before the semantic history mode. */
  tags?: EditorUpdateTagInput;
}>;

export type EditorTransactionChangesApi = {
  /** Apply one canonical document change to the active transaction draft. */
  apply: (change: DocumentChange) => void;
};

export type EditorTransactionRootsApi<V extends Value = Value> = {
  create: <TRoot extends RootKey>(
    root: NamedRootKey<TRoot>,
    children: V
  ) => void;
  delete: <TRoot extends RootKey>(root: NamedRootKey<TRoot>) => void;
  replace: <TRoot extends RootKey>(
    root: NamedRootKey<TRoot>,
    children: V
  ) => void;
};

/** Inspect and extend the final tag set of the active update. */
export type EditorTransactionTagsApi = {
  add: (tag: EditorUpdateTag) => void;
  has: (tag: EditorUpdateTag) => boolean;
};

export type EditorStateNodesApi<V extends Value = Value> = {
  above: {
    <TGuard extends Ancestor>(
      options: WithNodeTarget<EditorAboveOptions<Ancestor, undefined>> & {
        match: (node: Ancestor, path: Path) => node is TGuard;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      options: WithNodeTarget<
        EditorAboveOptions<NodeForTypeSelector<TType>, TType>
      > & { type: TType }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    (
      options?: WithNodeTarget<EditorAboveOptions<Ancestor>>
    ): NodeEntry<Ancestor> | undefined;
  };
  block: {
    <TGuard extends ValueElement<V>>(
      options: WithNodeTarget<
        EditorBlockOptions<ValueElement<V>, undefined>
      > & {
        match: (node: ValueElement<V>, path: Path) => node is TGuard;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      options: WithNodeTarget<
        EditorBlockOptions<NodeForTypeSelector<TType>, TType>
      > & { type: TType }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    (
      options?: WithNodeTarget<EditorBlockOptions<ValueElement<V>>>
    ): NodeEntry<ValueElement<V>> | undefined;
  };
  /** Read every schema block relevant to the target or active selection. */
  blocks: {
    <TGuard extends ValueElement<V>>(
      options: EditorBlocksReadOptions<ValueElement<V>, undefined> & {
        match: (node: ValueElement<V>, path: Path) => node is TGuard;
      }
    ): ReadonlyArray<NodeEntry<TGuard>>;
    <const TType extends NodeTypeSelector>(
      options: EditorBlocksReadOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): ReadonlyArray<NodeEntry<NodeForTypeSelector<TType>>>;
    (
      options?: EditorBlocksReadOptions<ValueElement<V>>
    ): ReadonlyArray<NodeEntry<ValueElement<V>>>;
  };
  children: (at?: NodeTarget) => ReadonlyArray<ValueDescendant<V>>;
  elementReadOnly: (
    options?: WithNodeTarget<EditorElementReadOnlyOptions>
  ) => NodeEntry<Element> | undefined;
  first: (at: NodeTarget) => NodeEntry | undefined;
  get: {
    <TGuard extends ValueTreeNode<V>>(
      at: NodeTarget,
      options: EditorNodeGetOptions<ValueTreeNode<V>, undefined> & {
        match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      at: NodeTarget,
      options: EditorNodeGetOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    <TNode extends Descendant>(at: TNode): NodeEntry<TNode> | undefined;
    (
      at: Location | NodeKey,
      options?: EditorNodeGetOptions<ValueTreeNode<V>>
    ): NodeEntry | undefined;
  };
  isSelectable: (element: Node) => boolean;
  isEmpty: (element: Element) => boolean;
  last: (at: NodeTarget, options?: EditorLastOptions) => NodeEntry | undefined;
  leaf: (
    at: NodeTarget<Text>,
    options?: EditorLeafOptions
  ) => NodeEntry<ValueText<V>> | undefined;
  levels: {
    <TGuard extends ValueTreeNode<V>>(
      options: WithNodeTarget<
        EditorLevelsOptions<ValueTreeNode<V>, undefined>
      > & {
        match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
      }
    ): Generator<NodeEntry<TGuard>, void, undefined>;
    <const TType extends NodeTypeSelector>(
      options: WithNodeTarget<
        EditorLevelsOptions<NodeForTypeSelector<TType>, TType>
      > & { type: TType }
    ): Generator<NodeEntry<NodeForTypeSelector<TType>>, void, undefined>;
    (
      options?: WithNodeTarget<EditorLevelsOptions<ValueTreeNode<V>>>
    ): Generator<NodeEntry, void, undefined>;
  };
  /**
   * Resolve a path in this editor/view root. A `NodeKey` owned by another root
   * returns `undefined`; create that root's view because `Path` has no root.
   */
  path: (at: NodeTarget, options?: EditorPathOptions) => Path | undefined;
  entries: {
    <TGuard extends ValueTreeNode<V>>(
      options: EditorNodesReadOptions<ValueTreeNode<V>, undefined> & {
        match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
      }
    ): Generator<NodeEntry<TGuard>, void, undefined>;
    <const TType extends NodeTypeSelector>(
      options: EditorNodesReadOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): Generator<NodeEntry<NodeForTypeSelector<TType>>, void, undefined>;
    (
      options?: EditorNodesReadOptions<ValueTreeNode<V>>
    ): Generator<NodeEntry, void, undefined>;
  };
  find: {
    <TGuard extends ValueTreeNode<V>>(
      options: EditorNodesReadOptions<ValueTreeNode<V>> & {
        match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
        type?: undefined;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      options: EditorNodesReadOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    (options?: EditorNodesReadOptions<ValueTreeNode<V>>): NodeEntry | undefined;
  };
  some: {
    <const TType extends NodeTypeSelector>(
      options: EditorNodesReadOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): boolean;
    (options?: EditorNodesReadOptions<ValueTreeNode<V>>): boolean;
  };
  toArray: {
    <TGuard extends ValueTreeNode<V>>(
      options: EditorNodesReadOptions<ValueTreeNode<V>, undefined> & {
        match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
      }
    ): ReadonlyArray<NodeEntry<TGuard>>;
    <const TType extends NodeTypeSelector>(
      options: EditorNodesReadOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): ReadonlyArray<NodeEntry<NodeForTypeSelector<TType>>>;
    (options?: EditorNodesReadOptions<ValueTreeNode<V>>): readonly NodeEntry[];
  };
  next: {
    <TGuard extends ValueDescendant<V>>(
      options: WithNodeTarget<EditorNextOptions<ValueDescendant<V>>> & {
        match: (node: ValueDescendant<V>, path: Path) => node is TGuard;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      options: WithNodeTarget<
        EditorNextOptions<NodeForTypeSelector<TType>, TType>
      > & { type: TType }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    (
      options?: WithNodeTarget<EditorNextOptions<ValueDescendant<V>>>
    ): NodeEntry<ValueDescendant<V>> | undefined;
  };
  parent: {
    <TGuard extends Ancestor>(
      at: NodeTarget,
      options: EditorParentOptions<Ancestor, undefined> & {
        match: (node: Ancestor, path: Path) => node is TGuard;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      at: NodeTarget,
      options: EditorParentOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    (
      at: NodeTarget,
      options?: EditorParentOptions
    ): NodeEntry<Ancestor> | undefined;
  };
  previous: {
    <TGuard extends ValueTreeNode<V>>(
      options: WithNodeTarget<
        EditorPreviousOptions<ValueTreeNode<V>, undefined>
      > & {
        match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
      }
    ): NodeEntry<TGuard> | undefined;
    <const TType extends NodeTypeSelector>(
      options: WithNodeTarget<
        EditorPreviousOptions<NodeForTypeSelector<TType>, TType>
      > & { type: TType }
    ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
    (
      options?: WithNodeTarget<EditorPreviousOptions<ValueTreeNode<V>>>
    ): NodeEntry | undefined;
  };
  void: (
    options?: WithNodeTarget<EditorVoidOptions>
  ) => NodeEntry<Element> | undefined;
};

export type EditorTransactionNodesApi<V extends Value = Value> =
  EditorStateNodesApi<V> & {
    insert: {
      <
        T extends ElementOrTextIn<V>,
        const TType extends NodeTypeSelector | undefined,
      >(
        nodes: T | readonly T[],
        options: WithNodeTarget<
          NodeInsertNodesOptions<NodeInsertSplitTarget<V, TType>, TType>
        > & {
          split: NodeInsertNodesOptions<
            NodeInsertSplitTarget<V, TType>,
            TType
          >['split'] & { type: TType };
        }
      ): void;
      <T extends ElementOrTextIn<V>>(
        nodes: T | readonly T[],
        options?: WithNodeTarget<NodeInsertNodesOptions<NodeIn<V>>>
      ): void;
    };
    lift: {
      <const TType extends NodeTypeSelector>(options: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeForTypeSelector<TType>>;
        mode?: MaximizeMode;
        type: TType;
        voids?: boolean;
      }): void;
      (options?: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeIn<V>>;
        mode?: MaximizeMode;
        type?: NodeTypeSelector;
        voids?: boolean;
      }): void;
    };
    merge: {
      <const TType extends NodeTypeSelector>(options: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeForTypeSelector<TType>>;
        mode?: RangeMode;
        hanging?: boolean;
        type: TType;
        voids?: boolean;
      }): void;
      (options?: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeIn<V>>;
        mode?: RangeMode;
        hanging?: boolean;
        type?: NodeTypeSelector;
        voids?: boolean;
      }): void;
    };
    move: {
      <const TType extends NodeTypeSelector>(options: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeForTypeSelector<TType>>;
        mode?: MaximizeMode;
        to: Path;
        type: TType;
        voids?: boolean;
      }): void;
      (options: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeIn<V>>;
        mode?: MaximizeMode;
        to: Path;
        type?: NodeTypeSelector;
        voids?: boolean;
      }): void;
    };
    remove: {
      <const TType extends NodeTypeSelector>(options: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeForTypeSelector<TType>>;
        mode?: MaximizeMode;
        hanging?: boolean;
        type: TType;
        voids?: boolean;
      }): void;
      (options?: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeIn<V>>;
        mode?: MaximizeMode;
        hanging?: boolean;
        type?: NodeTypeSelector;
        voids?: boolean;
      }): void;
    };
    replace: <T extends ElementOrTextIn<V>>(
      nodes: T | readonly T[],
      options: EditorReplaceNodeOptions
    ) => void;
    replaceChildren: (
      children: ReadonlyArray<ElementOrTextIn<V>>,
      options: EditorReplaceChildrenOptions
    ) => void;
    set: EditorNodeSetObject<V>;
    split: {
      <const TType extends NodeTypeSelector>(options: {
        at?: NodeTarget;
        match?: NodeMatch<NodeForTypeSelector<TType>>;
        mode?: RangeMode;
        always?: boolean;
        height?: number;
        position?: number;
        type: TType;
        voids?: boolean;
      }): void;
      (options?: {
        at?: NodeTarget;
        match?: NodeMatch<NodeIn<V>>;
        mode?: RangeMode;
        always?: boolean;
        height?: number;
        position?: number;
        type?: NodeTypeSelector;
        voids?: boolean;
      }): void;
    };
    unset: {
      <
        const TKey extends NodePropertyKeyIn<V>,
        const TType extends NodeTypeSelector,
      >(
        props: TKey | readonly TKey[],
        options: EditorNodeUnsetOptions<NodeForTypeSelector<TType>, TType> & {
          type: TType;
        }
      ): void;
      <const TKey extends NodePropertyKeyIn<V>>(
        props: TKey | readonly TKey[],
        options?: EditorNodeUnsetOptions<NodeIn<V>>
      ): void;
      <const TType extends NodeTypeSelector>(
        property: SchemaPropertyHandle<string>,
        options: EditorNodeUnsetOptions<NodeForTypeSelector<TType>, TType> & {
          type: TType;
        }
      ): void;
      (
        property: SchemaPropertyHandle<string>,
        options?: EditorNodeUnsetOptions<NodeIn<V>>
      ): void;
      <TKey extends string, const TType extends NodeTypeSelector>(
        property: string extends TKey ? TKey | readonly TKey[] : never,
        options: EditorNodeUnsetOptions<NodeForTypeSelector<TType>, TType> & {
          type: TType;
        }
      ): void;
      <TKey extends string>(
        property: string extends TKey ? TKey | readonly TKey[] : never,
        options?: EditorNodeUnsetOptions<NodeIn<V>>
      ): void;
    };
    unwrap: {
      <const TType extends NodeTypeSelector>(options: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeForTypeSelector<TType>>;
        mode?: MaximizeMode;
        split?: boolean;
        type: TType;
        voids?: boolean;
      }): void;
      (options?: {
        at?: NodeSelectionTarget;
        match?: NodeMatch<NodeIn<V>>;
        mode?: MaximizeMode;
        split?: boolean;
        type?: NodeTypeSelector;
        voids?: boolean;
      }): void;
    };
    wrap: {
      <const TType extends NodeTypeSelector>(
        element: ElementIn<V>,
        options: {
          at?: NodeSelectionTarget;
          match?: NodeMatch<NodeForTypeSelector<TType>>;
          mode?: MaximizeMode;
          split?: boolean;
          type: TType;
          voids?: boolean;
        }
      ): void;
      (
        element: ElementIn<V>,
        options?: {
          at?: NodeSelectionTarget;
          match?: NodeMatch<NodeIn<V>>;
          mode?: MaximizeMode;
          split?: boolean;
          type?: NodeTypeSelector;
          voids?: boolean;
        }
      ): void;
    };
  };

export type EditorStatePointsApi = {
  after: (at: NodeTarget, options?: EditorAfterOptions) => Point | undefined;
  before: (at: NodeTarget, options?: EditorBeforeOptions) => Point | undefined;
  end: (at: NodeTarget) => Point | undefined;
  get: (at: NodeTarget, options?: EditorPointOptions) => Point | undefined;
  isEdge: (point: Point, at: NodeTarget) => boolean;
  isEnd: (point: Point, at: NodeTarget) => boolean;
  isStart: (point: Point, at: NodeTarget) => boolean;
  isWordEnd: (point: Point) => boolean;
  positions: (
    options?: WithNodeTarget<EditorPositionsOptions>
  ) => Generator<Point, void, undefined>;
  start: (at: NodeTarget) => Point | undefined;
};

export type EditorStateRangesApi = {
  edges: (at: NodeTarget) => readonly [Point, Point] | undefined;
  fromEntries: (entries: readonly NodeEntry[]) => Range | undefined;
  get: (at: NodeTarget, to?: Location) => Range | undefined;
  project: (range: Range) => readonly ProjectedRangeSegment[];
  unhang: (range: Range, options?: EditorUnhangRangeOptions) => Range;
};

export type EditorStateTextApi = {
  /** Return text at a target, or at the current selection when omitted. */
  string: (at?: NodeSelectionTarget, options?: EditorStringOptions) => string;
};

export type EditorTransactionFragmentApi<V extends Value = Value> =
  EditorStateFragmentApi<V> & {
    delete: (
      options?: WithNodeTarget<EditorFragmentDeletionOptions, DescendantIn<V>>
    ) => void;
    /** Fit and replace known-closed content as one canonical closed slice. */
    replace: (
      content: ReadonlyArray<DescendantIn<V>>,
      options?: WithNodeTarget<TextInsertFragmentOptions, DescendantIn<V>>
    ) => boolean;
  };

export type EditorTransactionSliceApi<V extends Value = Value> = Pick<
  EditorStateSliceApi<V>,
  'get'
> & {
  /**
   * Fit and atomically replace content at the transaction target.
   *
   * Returns `false` without mutating when the target cannot be resolved, is a
   * protected void, or the compiled schema cannot fit a well-formed slice.
   * Malformed slice shapes are programmer errors and throw.
   */
  replace: (
    slice: ContentSlice,
    options?: WithNodeTarget<TextInsertFragmentOptions, DescendantIn<V>>
  ) => boolean;
};

export type EditorTransactionBreakApi = {
  insert: () => void;
  insertSoft: () => void;
};

export type EditorTransactionTextApi = EditorStateTextApi & {
  delete: (options?: WithNodeTarget<TextDeleteOptions>) => void;
  deleteBackward: (options?: EditorDirectedDeletionOptions) => void;
  deleteForward: (options?: EditorDirectedDeletionOptions) => void;
  insert: (
    text: string,
    options?: WithNodeTarget<TextInsertTextOptions>
  ) => void;
};

/** Concrete registered schema targets available to host codecs. */
export type EditorSchemaVocabulary = Readonly<{
  elementTypes: readonly string[];
  groupNames: readonly string[];
  propertyIds: readonly string[];
  rootNames: readonly string[];
}>;

type WithoutInternalPrimaryRoot<TQuery> = TQuery extends {
  readonly root?: infer TRoot;
}
  ? string extends Exclude<TRoot, null | undefined>
    ? unknown
    : 'main' extends Exclude<TRoot, null | undefined>
      ? Readonly<{ root?: never }>
      : unknown
  : unknown;

export type EditorSchemaCreate = {
  <
    TSchema extends EditorSchemaSource,
    TType extends SchemaElementTypes<TSchema>,
  >(
    element: SchemaElementHandle<TSchema, TType>,
    ...properties: {} extends SchemaElementConstructionPropertiesFor<
      TSchema,
      TType
    >
      ? [properties?: SchemaElementConstructionPropertiesFor<TSchema, TType>]
      : [properties: SchemaElementConstructionPropertiesFor<TSchema, TType>]
  ): SchemaElementFor<TSchema, TType>;
  (type: string, properties?: Readonly<Record<string, unknown>>): Element;
};

export type EditorSchemaPropertyReadOptions = Readonly<{
  /** Immediate parent first. Required to apply targeted text-property defaults. */
  ancestors?: readonly Element[];
  /** Parent element for a text-property target. */
  parent?: Element;
  /** Omission addresses the implicit primary root. */
  root?: RootKey;
}>;

export type EditorSchemaReadProperty = {
  <TValue>(
    node: Element | Text,
    property: SchemaPropertyHandle<string, TValue>,
    options?: EditorSchemaPropertyReadOptions
  ): TValue | undefined;
  (
    node: Element | Text,
    property: string,
    options?: EditorSchemaPropertyReadOptions
  ): unknown;
};

export type EditorSchemaGetProperty = {
  (property: SchemaPropertyHandle): EditorSchemaProperty | null;
  <const TQuery extends EditorSchemaPropertyQuery>(
    query: TQuery & WithoutInternalPrimaryRoot<TQuery>
  ): EditorSchemaProperty | null;
};

export type EditorStateSchemaApi<V extends Value = Value> = {
  /** Whether one child element type is accepted directly by one parent type. */
  allowsElementType: (parentType: string, childType: string) => boolean;
  /** Create one valid canonical element with every required default child. */
  create: EditorSchemaCreate;
  /** Copy one node through its compiled property lifecycle. */
  copy: <TNode extends Descendant>(
    node: TNode,
    options: Readonly<{ at: Path; root?: NamedRootKey }>
  ) => TNode;
  /** Create the declared default child for one document root. */
  createDefaultRootChild: <TRoot extends RootKey>(
    root?: NamedRootKey<TRoot>
  ) => Descendant | null;
  /** Semantic resources changed by the current configuration publication. */
  delta: () => EditorSchemaDelta | null;
  /** Read immutable compiled facts for one declared element type. */
  element: (type: string) => EditorSchemaElement | null;
  /** Fit one external document through the candidate schema without publishing it. */
  fitDocument: <TValue extends Value>(
    value: EditorDocumentValue<TValue>
  ) => EditorDocumentValue<V>;
  findWrapping: (
    parent: Element,
    child: Descendant
  ) => readonly string[] | null;
  getElementBehavior: (element: Element) => EditorElementBehavior;
  /** Resolve every named document root projected by an element, keyed by slot. */
  getElementContentRoots: (
    element: Element
  ) => Readonly<Record<string, NamedRootKey>>;
  /** Read one stored or defaulted property through its schema identity. */
  getProperty: EditorSchemaReadProperty;
  /** Compiled open-slice boundary behavior for one element. */
  getElementSlicePolicy: (element: Element) => EditorElementSlicePolicy;
  /** Return the immutable compiled schema vocabulary. */
  getVocabulary: () => EditorSchemaVocabulary;
  /** Whether the schema declares any element-owned document roots. */
  hasContentRoots: () => boolean;
  /** Stable persisted identity for the current compiled schema. */
  identity: () => EditorSchemaIdentity;
  isAtom: (element: Node) => boolean;
  isBlock: (element: Node) => boolean;
  isEditableIsland: (element: Node) => boolean;
  /** Test one compiled, transitive schema group membership. */
  isElementTypeInGroup: (type: string, group: string) => boolean;
  isInline: (element: Node) => boolean;
  isIsolating: (element: Node) => boolean;
  isKeyboardSelectable: (element: Node) => boolean;
  isReadOnly: (element: Node) => boolean;
  isSelectable: (element: Node) => boolean;
  isVoid: (element: Node) => boolean;
  isMarkableVoid: (element: Node) => boolean;
  /**
   * Resolve one compiled property declaration for an exact runtime context.
   * Omitting `type` succeeds only when the key has one unambiguous declaration.
   */
  property: EditorSchemaGetProperty;
  /**
   * Validate an external document against the compiled schema.
   *
   * Throws `EditorSchemaValidationError` with immutable root/path/property
   * diagnostics on failure.
   */
  assertDocument(value: unknown): asserts value is EditorDocumentValue<V>;
  /**
   * Validate an external fragment against the compiled schema.
   *
   * Throws `EditorSchemaValidationError` with immutable path/property
   * diagnostics on failure.
   */
  assertFragment(
    children: unknown
  ): asserts children is ReadonlyArray<DescendantIn<V>>;
};

/** Immutable open document content carried across host and insertion boundaries. */
export type ContentSlice<V extends Value = Value> = Readonly<{
  content: ReadonlyArray<DescendantIn<V>>;
  openEnd: number;
  openStart: number;
  /** Detached secondary roots referenced by the slice content. */
  roots?: Readonly<Record<RootKey, ReadonlyArray<DescendantIn<V>>>>;
}>;

export type EditorStateRuntimeApi<V extends Value = Value> = {
  snapshot: () => EditorSnapshot<V>;
};

export type EditorElementBehavior = Readonly<{
  atom: boolean;
  editableIsland: boolean;
  inline: boolean;
  isolating: boolean;
  keyboardSelectable: boolean;
  markableVoid: boolean;
  readOnly: boolean;
  selectable: boolean;
  void: boolean;
}>;

export type EditorElementSlicePolicy = Readonly<{
  preserveContext: boolean;
  replaceWhenCovered: boolean;
}>;

declare const editorSelectionCapability: unique symbol;

type EditorSelectionCapability<TSelection extends SelectionValue> =
  SelectionValue extends TSelection
    ? {}
    : Readonly<{
        /**
         * Keep concrete installed selection capabilities invariant.
         *
         * @internal
         */
        [editorSelectionCapability]?: (selection: TSelection) => TSelection;
      }>;

export type EditorCoreStateView<
  V extends Value = Value,
  TSelection extends SelectionValue = SelectionValue,
> = {
  /**
   * Read the primary document children without cloning the full serializable
   * document value. Treat the returned nodes as read-only live state.
   */
  children: () => readonly [...V];
  facet: <TOutput>(facet: EditorFacet<any, TOutput>) => TOutput;
  fragment: EditorStateFragmentApi<V>;
  getField: <TValue>(field: EditorStateField<TValue>) => TValue;
  lastCommit: () => EditorCommit<V> | null;
  /** Return the stable runtime key for a live node or location. */
  key: EditorKeyApi;
  marks: EditorStateMarksApi<V>;
  /**
   * Read persisted document metadata. Use state fields for typed access.
   */
  meta: () => Readonly<Record<string, unknown>> | undefined;
  nodes: EditorStateNodesApi<V>;
  points: EditorStatePointsApi;
  ranges: EditorStateRangesApi;
  /**
   * Read a named secondary root. Use `children()` for the primary document.
   */
  root: <TRoot extends RootKey>(
    root: NamedRootKey<TRoot>
  ) => ReadonlyArray<V[number]>;
  runtime: EditorStateRuntimeApi<V>;
  schema: EditorStateSchemaApi<V>;
  selection: EditorStateSelectionApi<TSelection, V>;
  slice: EditorStateSliceApi<V>;
  text: EditorStateTextApi;
  value: EditorStateValueApi<V>;
  view: EditorStateViewApi;
};

export type EditorStateView<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreStateView<V, EditorSelection> &
  EditorInstalledReadGroups<V, TExtensions> &
  EditorSelectionCapability<EditorSelection> & {
    /**
     * Build an immutable transaction without mutating or publishing editor
     * state. An empty spec represents an intentionally handled no-op.
     */
    transaction: ((
      fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void
    ) => TransactionSpec) & {
      /** Continue building from a delegated spec without publishing either step. */
      extend: (
        base: TransactionSpec,
        fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void
      ) => TransactionSpec;
    };
  };

export type EditorCoreUpdateTransaction<
  V extends Value = Value,
  TSelection extends SelectionValue = SelectionValue,
> = Omit<
  EditorCoreStateView<V, TSelection>,
  'marks' | 'nodes' | 'selection' | 'slice' | 'text' | 'value'
> & {
  /** Track a location from the current draft until this transaction ends. */
  anchor: EditorTransactionAnchorApi;
  annotations: EditorTransactionAnnotationsApi;
  blocks: EditorTransactionBlocksApi<V>;
  break: EditorTransactionBreakApi;
  changes: EditorTransactionChangesApi;
  effects: EditorTransactionEffectsApi;
  extensions: EditorTransactionExtensionsApi;
  fragment: EditorTransactionFragmentApi<V>;
  marks: EditorTransactionMarksApi<V>;
  nodes: EditorTransactionNodesApi<V>;
  roots: EditorTransactionRootsApi<V>;
  slice: EditorTransactionSliceApi<V>;
  selection: EditorTransactionSelectionApi<TSelection, V>;
  setField: <TValue>(
    field: EditorStateField<TValue>,
    value: StateFieldValueInput<TValue>
  ) => void;
  tags: EditorTransactionTagsApi;
  text: EditorTransactionTextApi;
  value: EditorTransactionValueApi<V>;
};

export type EditorUpdateTransaction<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreUpdateTransaction<V, EditorSelection> & {
  /** Dispatch a typed semantic command inside this active update. */
  command: EditorCommandDispatch<BaseEditor<V, TExtensions>>;
} & EditorInstalledUpdateGroups<V, TExtensions> &
  EditorSelectionCapability<EditorSelection>;

/** Pure transaction builder available while producing a command spec. */
export type EditorTransactionSpecBuilder<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<
  EditorCoreUpdateTransaction<V, EditorSelection>,
  'extensions' | 'key'
> &
  EditorExtensionSpecMethods<EditorInstalledUpdateGroups<V, TExtensions>> &
  EditorSelectionCapability<EditorSelection>;

export type EditorReadMethods<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<EditorCoreStateView<V, EditorSelection>, 'key'> &
  EditorInstalledReadGroups<V, TExtensions>;

export type EditorRead<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = (<T>(fn: (state: EditorStateView<V, TExtensions>) => T) => T) &
  EditorReadMethods<V, TExtensions>;

type EditorBivariantMethods<T> = {
  [
    K in keyof T as T[K] extends
      | TxOnlyMethod<(...args: any[]) => any>
      | TxReadMethod<(...args: any[]) => any>
      ? never
      : K
  ]: T[K] extends EditorGenericMethod<(...args: any[]) => any>
    ? T[K]
    : T[K] extends (...args: any[]) => any
      ? BivariantFunction<T[K]>
      : T[K];
};

export type EditorCoreUpdateMethods<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  annotations: EditorBivariantMethods<EditorTransactionAnnotationsApi>;
  blocks: EditorBivariantMethods<EditorTransactionBlocksApi<V>>;
  break: EditorBivariantMethods<EditorTransactionBreakApi>;
  changes: EditorBivariantMethods<EditorTransactionChangesApi>;
  /** Dispatch a typed semantic command in one update. */
  command: EditorCommandDispatch<BaseEditor<V, TExtensions>>;
  effects: EditorBivariantMethods<EditorTransactionEffectsApi>;
  extensions: EditorBivariantMethods<EditorTransactionExtensionsApi>;
  fragment: EditorBivariantMethods<
    Pick<EditorTransactionFragmentApi<V>, 'delete' | 'replace'>
  >;
  marks: EditorBivariantMethods<
    Pick<EditorTransactionMarksApi<V>, 'add' | 'remove' | 'set' | 'toggle'>
  >;
  nodes: EditorBivariantMethods<
    Pick<
      EditorTransactionNodesApi<V>,
      | 'insert'
      | 'lift'
      | 'merge'
      | 'move'
      | 'remove'
      | 'replace'
      | 'replaceChildren'
      | 'split'
      | 'unwrap'
      | 'wrap'
    >
  > &
    Pick<EditorTransactionNodesApi<V>, 'set' | 'unset'>;
  roots: EditorBivariantMethods<EditorTransactionRootsApi<V>>;
  slice: EditorBivariantMethods<Pick<EditorTransactionSliceApi<V>, 'replace'>>;
  selection: EditorBivariantMethods<
    Pick<
      EditorTransactionSelectionApi<EditorSelection>,
      'collapse' | 'move' | 'set' | 'setNodes' | 'setPoint'
    >
  >;
  setField: BivariantFunction<EditorCoreUpdateTransaction<V>['setField']>;
  text: EditorBivariantMethods<
    Pick<
      EditorTransactionTextApi,
      'delete' | 'deleteBackward' | 'deleteForward' | 'insert'
    >
  >;
  value: EditorBivariantMethods<
    Pick<EditorUpdateValueApi<V>, 'repair' | 'replace'>
  >;
};

type EditorExtensionUpdateMethods<TGroups> = {
  [K in keyof TGroups]: TGroups[K] extends object
    ? EditorBivariantMethods<TGroups[K]>
    : TGroups[K];
};

type EditorSpecBivariantMethods<T> = {
  [
    K in keyof T as T[K] extends TxOnlyMethod<(...args: any[]) => any>
      ? never
      : K
  ]: T[K] extends EditorGenericMethod<(...args: any[]) => any>
    ? T[K]
    : T[K] extends (...args: any[]) => any
      ? BivariantFunction<T[K]>
      : T[K];
};

type EditorExtensionSpecMethods<TGroups> = {
  [K in keyof TGroups]: TGroups[K] extends object
    ? EditorSpecBivariantMethods<TGroups[K]>
    : TGroups[K];
};

type EditorAvailableUpdatePolicy<TTxGroups> = Readonly<
  Omit<EditorUpdatePolicy, 'history'> &
    (string extends keyof TTxGroups
      ? { history?: never }
      : 'history' extends keyof TTxGroups
        ? Pick<EditorUpdatePolicy, 'history'>
        : { history?: never })
>;

export type EditorUpdateMethods<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreUpdateMethods<V, TExtensions> &
  EditorExtensionUpdateMethods<EditorInstalledUpdateGroups<V, TExtensions>>;

export type EditorUpdate<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  (
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions>,
      context: EditorUpdateContext<BaseEditor<V, TExtensions>>
    ) => void
  ): void;
  (
    policy: EditorAvailableUpdatePolicy<
      EditorInstalledUpdateGroups<V, TExtensions>
    >,
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions>,
      context: EditorUpdateContext<BaseEditor<V, TExtensions>>
    ) => void
  ): void;
  (
    policy: EditorAvailableUpdatePolicy<
      EditorInstalledUpdateGroups<V, TExtensions>
    >
  ): EditorUpdateMethods<V, TExtensions>;
} & EditorUpdateMethods<V, TExtensions>;

export type EditorUpdateContext<TEditor = Editor> = {
  afterCommit: (handler: EditorCommitHandler<TEditor>) => void;
};

export interface BaseEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> {
  api: Readonly<EditorCoreApiGroups & EditorInstalledApiGroups<TExtensions>>;
  /** Create a live location that rebases across document changes. */
  anchor: EditorAnchorApi;
  /** Stable logical identity for this editor instance. */
  id: string;
  extension: <const TExtension extends EditorExtensionReference>(
    extension: TExtension,
    ...guard: EditorInstalledExtensionGuard<
      TExtension,
      TExtensions
    > extends never
      ? [never]
      : []
  ) => EditorExtensionPortal<TExtension, V>;
  /** Return the stable runtime key for a live node or location. */
  key: EditorKeyApi;
  read: EditorRead<V, TExtensions>;
  subscribe: (listener: SnapshotListener<any>) => () => void;
  subscribeCommit: (listener: EditorCommitListener<any>) => () => void;
  update: EditorUpdate<V, TExtensions>;
  install: (
    extension: EditorExtensionInput,
    options?: EditorExtensionReconfigureOptions
  ) => () => void;
}

/** Update policy available for a specific editor's installed extensions. */
export type EditorUpdatePolicyFor<TEditor extends BaseEditor<any, any>> =
  TEditor extends BaseEditor<
    infer V,
    infer TExtensions extends readonly unknown[]
  >
    ? EditorAvailableUpdatePolicy<EditorInstalledUpdateGroups<V, TExtensions>>
    : never;

export type EditorViewOptions<TRoot extends RootKey = RootKey> = {
  readOnly?: boolean;
  /** Named secondary root. Omit for the primary document. */
  root?: NamedRootKey<TRoot>;
};

export type EditorView<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = BaseEditor<V, TExtensions> & {
  blur: () => void;
  focus: () => void;
  /** Named view root, or `undefined` for the primary document. */
  readonly root: NamedRootKey | undefined;
};

export type Editor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = BaseEditor<V, TExtensions>;

/**
 * Existential editor boundary for runtime registries.
 *
 * @internal
 */
export type AnyEditor<
  V extends Value = any,
  TExtensions extends readonly unknown[] = any,
> = BaseEditor<V, TExtensions>;

export type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  extensions?: TExtensions;
  /** Stable logical identity for this editor instance. */
  id?: string;
  initialSelection?: Selection<EditorSelection>;
  initialValue?: InitialValue<V>;
  /** Receives failures from observers that run after authoritative state is published. */
  lifecycleErrorSink?: EditorLifecycleErrorSink<Editor<V, TExtensions>>;
  maxLength?: number;
  readOnly?: boolean;
};

/** Default document value inferred from complete installed schema extensions. */
export type EditorValueFromExtensions<TExtensions extends readonly unknown[]> =
  [
    SchemaValueFromExtensions<EditorResolvedInstalledExtensions<TExtensions>>,
  ] extends [never]
    ? Value
    : SchemaValueFromExtensions<
          EditorResolvedInstalledExtensions<TExtensions>
        > extends infer V extends Value
      ? V
      : Value;

type IsAny<T> = 0 extends 1 & T ? true : false;

declare const EDITOR_VALUE_TYPE: unique symbol;
declare const EDITOR_NODE_TYPES: unique symbol;

/**
 * Deferred exact-node witness for hosts with a broad runtime editor.
 *
 * @internal
 */
export interface EditorNodeTypeProvider<
  TElementFactory extends () => Element = () => Element,
  TTextFactory extends () => Text = () => Text,
> {
  readonly [EDITOR_NODE_TYPES]: Readonly<{
    element: TElementFactory;
    text: TTextFactory;
  }>;
}

/**
 * Deferred exact-value witness for hosts with a broad runtime editor.
 *
 * @internal
 */
export interface EditorValueTypeProvider<
  TValueFactory extends () => Value = () => Value,
> {
  readonly [EDITOR_VALUE_TYPE]: TValueFactory;
}

export type ValueOf<E> =
  E extends EditorValueTypeProvider<infer TValueFactory>
    ? ReturnType<TValueFactory> extends infer TProvidedValue
      ? IsAny<TProvidedValue> extends true
        ? Value
        : TProvidedValue extends Value
          ? TProvidedValue
          : Value
      : Value
    : E extends BaseEditor<infer V, any>
      ? IsAny<V> extends true
        ? Value
        : V extends Value
          ? V
          : Value
      : Value;

export type ExtensionsOf<E> =
  E extends BaseEditor<any, infer TExtensions extends readonly unknown[]>
    ? TExtensions
    : readonly [];

export type EditorMarks<V extends Value = Value> = Partial<
  Omit<ValueText<V>, 'text'>
>;

export type EditorMarksOf<E extends BaseEditor<any, any> = Editor> =
  EditorMarks<ValueOf<E>>;

/** Opaque identity for one descendant inside one editor runtime. */
export type NodeKey = string & {
  readonly '~nodeKey': true;
};

export type SnapshotIndex = Readonly<{
  /** Materialize the lazy index and return stable, frozen node-key/path pairs. */
  entries: () => ReadonlyArray<readonly [NodeKey, Path]>;
  /** Return the node key at a snapshot path, or `null` when absent. */
  keyAt: (path: Path) => NodeKey | null;
  /** Return the snapshot path for a node key, or `null` when absent. */
  pathOf: (nodeKey: NodeKey) => Path | null;
}>;

export type ProjectedRangeSegment = Readonly<{
  path: Path;
  key: NodeKey;
  start: number;
  end: number;
}>;

export type EditorSnapshot<V extends Value = Value> = Readonly<{
  children: V;
  index: SnapshotIndex;
  selection: Selection;
  version: number;
}>;

export type SnapshotInput<V extends Value = Value> =
  | PersistedDocumentInput<V>
  | Readonly<{
      children: V | readonly Descendant[];
      meta?: Readonly<Record<string, unknown>>;
      roots?: Readonly<Record<RootKey, V | readonly Descendant[]>>;
      selection?: SnapshotSelectionInput;
    }>;

export type SnapshotListener<V extends Value = Value> = (
  snapshot: EditorSnapshot<V>,
  change?: EditorCommit<V>
) => void;

export type EditorCommitSource =
  | 'commit'
  | 'selection'
  | 'text'
  | 'node'
  | 'decoration'
  | 'annotation'
  | 'root'
  | 'state'
  | 'focus'
  | 'composition'
  | 'external';

export type EditorTransaction<V extends Value = Value> = {
  readonly children: V;
  getModelSelection: () => Selection;
  /** Effective marks at the draft selection, including inherited leaf marks. */
  getSelectionMarks: () => EditorMarks<V> | null;
  readonly marks: EditorMarks<V> | null;
  resolveTarget: (options?: {
    at?: Location | NodeSelection;
  }) => Location | NodeSelection | null;
  readonly selection: Selection;
  setMarks: (marks: EditorMarks<V> | null) => void;
  setSelection: (selection: Selection) => void;
};

export type TargetFreshnessRequest = {
  fallback: Selection;
  reason: 'implicit-target';
};

export type EditorTargetRuntime = {
  resolveImplicitTarget: (
    editor: Editor,
    request: TargetFreshnessRequest
  ) => Selection;
};

declare const TRANSACTION_SPEC_TYPE: unique symbol;

export interface TransactionSpec<TRoot extends RootKey = RootKey> {
  /**
   * Opaque proof that this spec was built by the owning editor.
   *
   * @internal
   */
  readonly [TRANSACTION_SPEC_TYPE]: true;
  readonly annotations: ReadonlyArray<
    Readonly<{
      type: EditorUpdateAnnotation;
      value: unknown;
    }>
  >;
  readonly changes: DocumentChange;
  readonly effects: readonly EditorEffect[];
  readonly kind: 'transaction';
  readonly selection?: Readonly<{
    /** Named selection root. Omitted for the primary document. */
    root?: NamedRootKey<TRoot>;
    value: Selection;
  }>;
  readonly tags: readonly EditorUpdateTag[];
}

export type EditorCommandResult = false | TransactionSpec;

/** @internal */
export declare const editorStateViewTypes: unique symbol;

/**
 * Deferred state-view carrier for editor layers with richer transactions.
 *
 * @internal
 */
export interface EditorStateViewProvider<TStateFactory extends () => unknown> {
  readonly [editorStateViewTypes]: TStateFactory;
}

/**
 * Deferred update-transaction carrier for layered editor types.
 *
 * @internal
 */
/** @internal */
export declare const editorUpdateTransactionTypes: unique symbol;

export interface EditorUpdateTransactionProvider<
  TTransactionFactory extends () => unknown,
> {
  readonly [editorUpdateTransactionTypes]: TTransactionFactory;
}

/**
 * Resolve a layered editor's exact live update transaction.
 *
 * @internal
 */
export type EditorUpdateTransactionOf<TEditor> =
  TEditor extends EditorUpdateTransactionProvider<infer TTransactionFactory>
    ? ReturnType<TTransactionFactory>
    : EditorUpdateTransaction<ValueOf<TEditor>, ExtensionsOf<TEditor>>;

type EditorStateViewOf<TEditor> =
  TEditor extends EditorStateViewProvider<infer TStateFactory>
    ? ReturnType<TStateFactory>
    : EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>;

export type EditorCommandContext<Input, TEditor = Editor> = {
  input: Readonly<Input>;
  state: EditorStateViewOf<TEditor>;
  /** Frozen semantic tags visible across the active update/spec stack. */
  tags: readonly EditorUpdateTag[];
};

export type EditorCommandContinuation<Input> = ((
  ...input: [] | [input: Input]
) => EditorCommandResult) & {
  /** Run downstream against the immutable state produced by the prefix. */
  after: (
    prefix: TransactionSpec,
    ...input: [] | [input: Input]
  ) => EditorCommandResult;
};

export type EditorCommandHandler<Input, TEditor = Editor> = (
  context: EditorCommandContext<Input, TEditor>
) => EditorCommandResult;

export type EditorCommandAroundHandler<Input, TEditor = Editor> = (
  context: EditorCommandContext<Input, TEditor> & {
    next: EditorCommandContinuation<Input>;
  }
) => EditorCommandResult;

/** @internal */
export declare const editorCommandRegistrationTypes: unique symbol;

export type EditorCommandRegistration<TEditor = Editor> = Readonly<{
  [editorCommandRegistrationTypes]: (
    capabilities: EditorCommandCapabilities<TEditor>
  ) => void;
}>;

export type EditorExtensionCommandContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  /** Register ordinary conditional behavior. `false` falls through. */
  handle: <TCommand extends EditorCommandDescriptor>(
    command: CompatibleEditorCommand<TEditor, TCommand>,
    handler: EditorCommandHandler<EditorCommandInput<TCommand>, TEditor>
  ) => EditorCommandRegistration<TEditor>;
  /** Register input rewriting or downstream spec composition. */
  around: <TCommand extends EditorCommandDescriptor>(
    command: CompatibleEditorCommand<TEditor, TCommand>,
    handler: EditorCommandAroundHandler<EditorCommandInput<TCommand>, TEditor>
  ) => EditorCommandRegistration<TEditor>;
}>;

/** @internal */
export declare const editorReadTypes: unique symbol;

type PrivateEditorReadTypes<Input, Result, TEditor> = Readonly<{
  [editorReadTypes]: Readonly<{
    editor: TEditor;
    input: Input;
    result: Result;
  }>;
}>;

export type EditorReadDescriptor<
  Input = void,
  Result = unknown,
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  /** Stable configuration and diagnostics identity. */
  id: string;
}> &
  PrivateEditorReadTypes<Input, Result, TEditor>;

export type EditorReadInput<TRead extends EditorReadDescriptor<any, any, any>> =
  TRead extends PrivateEditorReadTypes<infer Input, any, any> ? Input : never;

export type EditorReadResult<
  TRead extends EditorReadDescriptor<any, any, any>,
> =
  TRead extends PrivateEditorReadTypes<any, infer Result, any> ? Result : never;

export type EditorReadRequiredEditor<
  TRead extends EditorReadDescriptor<any, any, any>,
> =
  TRead extends PrivateEditorReadTypes<any, any, infer TEditor>
    ? TEditor
    : never;

export type EditorReadCapabilities<TEditor> =
  TEditor extends BaseEditor<
    infer V extends Value,
    infer TExtensions extends readonly unknown[]
  >
    ? Readonly<{
        state: EditorInstalledReadGroups<V, TExtensions>;
        value: V;
      }>
    : never;

type IsDefaultEditor<TEditor> = [ExtensionsOf<TEditor>] extends [readonly []]
  ? [Value] extends [ValueOf<TEditor>]
    ? [ValueOf<TEditor>] extends [Value]
      ? true
      : false
    : false
  : false;

export type CompatibleEditorRead<
  TEditor,
  TRead extends EditorReadDescriptor<any, any, any>,
> =
  IsDefaultEditor<EditorReadRequiredEditor<TRead>> extends true
    ? TRead
    : EditorReadCapabilities<TEditor> extends EditorReadCapabilities<
          EditorReadRequiredEditor<TRead>
        >
      ? TRead
      : never;

export type EditorReadContinuation<Input, Result> = (
  ...input: [] | [input: Input]
) => Result;

export type EditorReadContext<
  Input,
  Result,
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  editor: TEditor;
  input: Readonly<Input>;
  next: EditorReadContinuation<Input, Result>;
  state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
}>;

export type EditorReadAroundHandler<
  Input,
  Result,
  TEditor extends BaseEditor<any, any> = Editor,
> = (context: EditorReadContext<Input, Result, TEditor>) => Result;

/** @internal */
export declare const editorReadRegistrationTypes: unique symbol;

export type EditorReadRegistration<TEditor = Editor> = Readonly<{
  [editorReadRegistrationTypes]: (
    capabilities: EditorReadCapabilities<TEditor>
  ) => void;
}>;

export type EditorExtensionReadContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  around: <TRead extends EditorReadDescriptor<any, any, any>>(
    read: CompatibleEditorRead<TEditor, TRead>,
    handler: EditorReadAroundHandler<
      EditorReadInput<TRead>,
      EditorReadResult<TRead>,
      TEditor
    >
  ) => EditorReadRegistration<TEditor>;
}>;

export type EditorExtensionReadMiddlewareFactory<
  TEditor extends BaseEditor<any, any> = Editor,
> = BivariantMethod<
  [context: EditorExtensionReadContext<TEditor>],
  ReadonlyArray<EditorReadRegistration<TEditor>>
>;

/** @internal */
export declare const editorCommandTypes: unique symbol;

type PrivateEditorCommandTypes<Input, TEditor> = Readonly<{
  [editorCommandTypes]: Readonly<{
    editor: TEditor;
    input: Input;
  }>;
}>;

export type EditorCommand<
  Input = void,
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  /** Build only the descriptor default without running installed handlers. */
  build: (
    state: EditorStateViewOf<TEditor>,
    ...input: [Input] extends [void] ? [] | [input: Input] : [input: Input]
  ) => EditorCommandResult;
  /** Stable configuration and diagnostics identity. */
  id: string;
}> &
  PrivateEditorCommandTypes<Input, TEditor>;

/** Minimal descriptor shape shared by every semantic editor command. */
export type EditorCommandDescriptor = Readonly<{
  id: string;
}> &
  PrivateEditorCommandTypes<any, any>;

/** Input accepted by one semantic command descriptor. */
export type EditorCommandInput<TCommand extends EditorCommandDescriptor> =
  TCommand extends PrivateEditorCommandTypes<infer Input, any> ? Input : never;

/**
 * Editor capability required by one semantic command descriptor.
 *
 * @internal
 */
export type EditorCommandRequiredEditor<
  TCommand extends EditorCommandDescriptor,
> =
  TCommand extends PrivateEditorCommandTypes<any, infer TEditor>
    ? TEditor
    : never;

/**
 * Pure capabilities visible while building a semantic command.
 *
 * @internal
 */
export type EditorCommandCapabilities<TEditor> =
  TEditor extends BaseEditor<
    infer V extends Value,
    infer TExtensions extends readonly unknown[]
  >
    ? Readonly<{
        state: EditorInstalledReadGroups<V, TExtensions>;
        transaction: EditorExtensionSpecMethods<
          EditorInstalledUpdateGroups<V, TExtensions>
        >;
        value: V;
      }>
    : never;

/** A command accepted only when the actual editor meets its requirements. */
export type CompatibleEditorCommand<
  TEditor,
  TCommand extends EditorCommandDescriptor,
> =
  IsDefaultEditor<EditorCommandRequiredEditor<TCommand>> extends true
    ? TCommand
    : EditorCommandCapabilities<TEditor> extends EditorCommandCapabilities<
          EditorCommandRequiredEditor<TCommand>
        >
      ? TCommand
      : never;

export type EditorCommandDispatch<TEditor = Editor> = <
  TCommand extends EditorCommandDescriptor,
>(
  command: TCommand & CompatibleEditorCommand<TEditor, TCommand>,
  ...input: [EditorCommandInput<TCommand>] extends [void]
    ? [] | [input: EditorCommandInput<TCommand>]
    : [input: EditorCommandInput<TCommand>]
) => boolean;

export type EditorCorrectionTransaction<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Pick<
  EditorCoreUpdateTransaction<V>,
  | 'anchor'
  | 'blocks'
  | 'break'
  | 'fragment'
  | 'marks'
  | 'nodes'
  | 'schema'
  | 'selection'
  | 'tags'
  | 'text'
> &
  EditorInstalledUpdateGroups<V, TExtensions> & {
    value: EditorStateValueApi<V>;
  };

export type EditorCorrectionEvent = 'children' | 'content' | 'properties';

export type EditorCorrectionQuery<TNode extends Node = Node> =
  | 'root'
  | Readonly<{
      match?(node: TNode, path: Path): boolean;
      type?: NodeTypeSelector;
    }>;

export type EditorCorrectionContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = {
  editor: TEditor;
  entry: NodeEntry;
  tx: EditorCorrectionTransaction<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
};

export type EditorCorrection<TEditor extends BaseEditor<any, any> = Editor> = {
  correct: (context: EditorCorrectionContext<TEditor>) => void;
  event: EditorCorrectionEvent;
  query?: EditorCorrectionQuery;
};

export type EditorExtensionReadFactoryContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  editor: TEditor;
  state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
}>;

export type EditorReadMethodRecord = Readonly<{
  [key: string]: EditorReadMethodTree;
}>;

export type EditorReadMethodTree =
  | ((...args: any[]) => unknown)
  | EditorReadMethodRecord;

export type EditorExtensionUpdateFactoryContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  context: EditorUpdateContext<TEditor>;
  editor: TEditor;
  tx: EditorUpdateTransaction<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
}>;

export type EditorExtensionReadFactory<
  TEditor extends BaseEditor<any, any> = Editor,
  TResult extends EditorReadMethodTree = EditorReadMethodTree,
> = BivariantMethod<
  [context: EditorExtensionReadFactoryContext<TEditor>],
  TResult
>;

export type EditorExtensionUpdateFactory<
  TEditor extends BaseEditor<any, any> = Editor,
  TResult = unknown,
> = BivariantMethod<
  [context: EditorExtensionUpdateFactoryContext<TEditor>],
  TResult
>;

/**
 * Runtime storage keyed by the owning extension name.
 *
 * @internal
 */
export type EditorExtensionApiMap = Record<string, unknown>;

export type EditorExtensionCandidateEditor<
  TEditor extends BaseEditor<any, any> = Editor,
> = TEditor & {
  extension: TEditor['extension'];
};

declare const EDITOR_EXTENSION_REQUIRED_EDITOR: unique symbol;

export type EditorExtensionPoint<TValue> = Readonly<{
  id: string;
  of: (value: TValue) => EditorExtensionContribution<TValue>;
}>;

/** Contextual installation requirement for one opaque extension contribution. */
export type EditorExtensionContributionInput<TRequiredEditor = unknown> =
  Readonly<{
    point: Readonly<{ id: string }>;
    /**
     * Contravariant proof of the editor capabilities this value needs.
     *
     * @internal
     */
    [EDITOR_EXTENSION_REQUIRED_EDITOR]?: (editor: TRequiredEditor) => void;
  }>;

export type EditorExtensionContribution<
  TValue,
  TRequiredEditor = unknown,
> = EditorExtensionContributionInput<TRequiredEditor> &
  Readonly<{
    point: EditorExtensionPoint<TValue>;
  }>;

/**
 * Resolve host APIs against one stable extension candidate.
 * API-factory results become visible only after every factory has resolved.
 */
export type EditorExtensionApiFactoryContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  editor: EditorExtensionCandidateEditor<TEditor>;
  getContributions: <TValue>(
    point: EditorExtensionPoint<TValue>
  ) => ReadonlyArray<Readonly<TValue>>;
  /** Named view root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
}>;

export type EditorExtensionApiFactory<
  TEditor extends BaseEditor<any, any> = Editor,
  TResult = unknown,
> = BivariantMethod<
  [context: EditorExtensionApiFactoryContext<TEditor>],
  TResult
>;

export type EditorExtensionPortal<
  TExtension,
  V extends Value = Value,
> = Readonly<{
  api: EditorApiValueFromExtension<TExtension>;
  read: EditorReadValueFromExtension<V, TExtension>;
  update: EditorUpdateValueFromExtension<V, TExtension> &
    ((
      policy: EditorUpdatePolicy
    ) => EditorUpdateValueFromExtension<V, TExtension>);
}>;

export type EditorAnchorApi = <
  TValue extends AnchorValue,
  const TRoot extends RootKey,
>(
  value: TValue,
  options: AnchorOptions<TValue, TRoot>
) => Anchor<TValue>;

export type EditorKeyApi = {
  (node: Descendant): NodeKey;
  (at: Location): NodeKey | null;
};

export type EditorCoreApiGroups = Record<never, never>;

export type EditorExtensionCleanupContext = Readonly<{
  reason: 'remove' | 'replace' | 'rollback';
}>;

export type EditorExtensionActivationContext = Readonly<{
  afterPublish: (callback: () => void) => void;
  extensionName: string;
  onCleanup: (
    cleanup: (context: EditorExtensionCleanupContext) => void
  ) => void;
  /** Named view root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
  schema: EditorStateSchemaApi;
  signal: AbortSignal;
}>;

export type EditorLifecycleError<TEditor = Editor> =
  | Readonly<{
      cause: unknown;
      editor: TEditor;
      extensionName: string;
      phase:
        | 'after-commit'
        | 'afterPublish'
        | 'cleanup'
        | 'commit-listener'
        | 'node-change-listener'
        | 'snapshot-listener'
        | 'source-listener'
        | 'text-change-listener';
    }>
  | Readonly<{
      cause: unknown;
      editor: TEditor;
      extensionName: string;
      format: string;
      key: string;
      phase: 'parse' | 'query' | 'serialize';
      source: 'host-codec';
    }>;

export type EditorLifecycleErrorSink<TEditor = Editor> = (
  error: EditorLifecycleError<TEditor>
) => void;

export type EditorExtensionCandidateContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = EditorExtensionApiFactoryContext<TEditor> &
  Readonly<{
    name: string;
    schema: EditorStateSchemaApi<ValueOf<TEditor>>;
  }>;

export type EditorCommitContext<TEditor = Editor> = {
  commit: EditorCommit<ValueOf<TEditor>>;
  editor: TEditor;
  snapshot: EditorSnapshot<ValueOf<TEditor>>;
};

export type EditorCommitHandler<TEditor = Editor> = (
  context: EditorCommitContext<TEditor>
) => void;

export type EditorTransactionChangeContext<TEditor = Editor> = Readonly<{
  after: EditorDocumentValue<ValueOf<TEditor>>;
  before: EditorDocumentValue<ValueOf<TEditor>>;
  change: DocumentChange;
  /** Lazy final-coordinate document-change queries for this transaction step. */
  changed: EditorTransactionChanged;
  editor: TEditor;
  selectionAfter: Selection;
  selectionAfterRoot: NamedRootKey | undefined;
  selectionBefore: Selection;
  selectionBeforeRoot: NamedRootKey | undefined;
  tx: EditorUpdateTransaction<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
}>;

export type EditorTransactionChangeHandler<TEditor = Editor> = (
  context: EditorTransactionChangeContext<TEditor>
) => void;

export type EditorNodeChangeKind = 'insert' | 'move' | 'remove' | 'update';

export type EditorNodeChangeContext<TEditor = Editor> = {
  commit: EditorCommit<ValueOf<TEditor>>;
  editor: TEditor;
  kind: EditorNodeChangeKind;
  node: DescendantIn<ValueOf<TEditor>> | null;
  path: Path;
  previousPath: Path | null;
  previousNode: DescendantIn<ValueOf<TEditor>> | null;
  /** Named changed root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
};

export type EditorTextChangeContext<TEditor = Editor> = {
  commit: EditorCommit<ValueOf<TEditor>>;
  editor: TEditor;
  node: DescendantIn<ValueOf<TEditor>> | null;
  path: Path;
  previousPath: Path;
  previousText: string;
  /** Named changed root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
  text: string;
};

export type EditorNodeChangeHandler<TEditor = Editor> = (
  context: EditorNodeChangeContext<TEditor>
) => void;

export type EditorTextChangeHandler<TEditor = Editor> = (
  context: EditorTextChangeContext<TEditor>
) => void;

export type EditorExtensionChangeHandlers<TEditor = Editor> = Readonly<{
  commit?: EditorCommitHandler<TEditor>;
  nodeChange?: EditorNodeChangeHandler<TEditor>;
  textChange?: EditorTextChangeHandler<TEditor>;
  transactionChange?: EditorTransactionChangeHandler<TEditor>;
}>;

export type EditorExtensionSchemaFactoryContext = Readonly<{
  name: string;
}>;

export type EditorExtensionSchemaFactory = (
  context: EditorExtensionSchemaFactoryContext
) => EditorSchemaDeclaration;

/**
 * Erased runtime descriptor reference. Exact author capabilities live only in
 * `EditorExtension<D>`'s private invariant witness.
 */
declare class PrivateEditorExtensionReferenceBrand {
  protected readonly editorExtensionReference: true;
}

export type EditorExtensionReference = Readonly<{
  name: string;
  enabled?: boolean;
  dependencies?: readonly EditorExtensionDependencyReference[];
  conflicts?: readonly EditorExtensionDependencyReference[];
  schema?: EditorSchemaDeclaration | EditorExtensionSchemaFactory;
  api?: unknown;
  read?: unknown;
  update?: unknown;
  readMiddleware?: unknown;
  commands?: unknown;
  corrections?: unknown;
  stateFields?: unknown;
  effectTypes?: unknown;
  facetProviders?: unknown;
  contributions?: unknown;
  on?: unknown;
  activate?: unknown;
  validate?: unknown;
}> &
  PrivateEditorExtensionReferenceBrand;

type EditorExtensionShallowReference = Readonly<{
  enabled?: boolean;
  name: string;
}>;

export type EditorExtensionDefinition = Readonly<{
  api?: unknown;
  activate?: true;
  commands?: true;
  conflicts?: readonly EditorExtensionShallowReference[];
  contributions?: true;
  corrections?: true;
  dependencies?: readonly EditorExtensionShallowReference[];
  effectTypes?: true;
  enabled?: boolean;
  facetProviders?: true;
  name: string;
  on?: true;
  read?: unknown;
  readMiddleware?: true;
  schema?: EditorSchemaDeclaration;
  stateFields?: true;
  update?: unknown;
  validate?: true;
}>;

declare class PrivateEditorExtensionWitness<TWitness> {
  protected readonly witness: TWitness;
}

type EditorExtensionWitnessOf<TExtension> =
  TExtension extends PrivateEditorExtensionWitness<infer TWitness>
    ? TWitness
    : never;

type EditorExtensionCapabilityOf<TExtension> = TExtension extends unknown
  ? [EditorExtensionWitnessOf<TExtension>] extends [never]
    ? TExtension extends EditorExtensionDefinition
      ? TExtension
      : never
    : EditorExtensionWitnessOf<TExtension> extends {
          capability: infer TCapability;
        }
      ? TCapability
      : never
  : never;

type EditorExtensionInternalDefinitionOf<TExtension> =
  TExtension extends unknown
    ? [EditorExtensionWitnessOf<TExtension>] extends [never]
      ? never
      : EditorExtensionWitnessOf<TExtension> extends {
            internalDefinition: (
              definition: infer TDefinition
            ) => infer TDefinition;
          }
        ? TDefinition
        : never
    : never;

type EditorExtensionDependencyReferences<TInput> =
  TInput extends readonly unknown[]
    ? {
        readonly [TIndex in keyof TInput]: EditorExtensionShallowReferenceOf<
          TInput[TIndex]
        >;
      }
    : never;

type EditorExtensionPublicDefinition<TDefinition> = Readonly<{
  [TKey in keyof TDefinition]: TKey extends 'conflicts' | 'dependencies'
    ? EditorExtensionDependencyReferences<TDefinition[TKey]>
    : TDefinition[TKey];
}>;

export type DefinitionOf<TExtension> = TExtension extends unknown
  ? EditorExtensionWitnessOf<TExtension> extends {
      definition: (definition: infer TDefinition) => infer TDefinition;
    }
    ? TDefinition
    : never
  : never;

type EditorExtensionCapabilityFromPublicDefinition<TDefinition> = Readonly<
  Pick<
    TDefinition,
    Extract<
      keyof TDefinition,
      'api' | 'enabled' | 'name' | 'read' | 'schema' | 'update'
    >
  >
>;

type EditorExtensionCapabilityDefinition<TDefinition> =
  EditorExtensionCapabilityFromPublicDefinition<
    EditorExtensionPublicDefinition<TDefinition>
  >;

/** Shallow public reference to an extension dependency. */
export interface EditorExtensionDependencyReference extends PrivateEditorExtensionReferenceBrand {
  readonly enabled?: boolean;
  readonly name: string;
}

type EditorExtensionDependencyContract = Readonly<{
  direct: EditorExtensionDefinition;
  installed: unknown;
}>;

declare class PrivateEditorExtensionDependencyWitness<TContract> {
  protected readonly dependencyContract: TContract;
}

/**
 * Named declaration carrier for one finite dependency contract.
 *
 */
export interface EditorExtensionDependencyContractReference<
  in out TContract extends EditorExtensionDependencyContract,
>
  extends
    EditorExtensionDependencyReference,
    PrivateEditorExtensionDependencyWitness<TContract> {}

type EditorExtensionDependencyContractOf<TReference> =
  TReference extends PrivateEditorExtensionDependencyWitness<
    infer TContract extends EditorExtensionDependencyContract
  >
    ? TContract
    : never;

type EditorExtensionShallowReferenceFromDefinition<TDefinition> = Readonly<{
  name: TDefinition extends {
    name: infer TName extends string;
  }
    ? TName
    : string;
}> &
  (TDefinition extends {
    enabled: infer TEnabled extends boolean;
  }
    ? Readonly<{ enabled: TEnabled }>
    : Readonly<Record<never, never>>) &
  PrivateEditorExtensionReferenceBrand;

type EditorExtensionShallowReferenceOf<TReference> =
  EditorExtensionDependencyContractOf<TReference> extends infer TContract
    ? TContract extends EditorExtensionDependencyContract
      ? EditorExtensionShallowReferenceFromDefinition<TContract['direct']>
      : EditorExtensionShallowReferenceFromDefinition<TReference>
    : EditorExtensionShallowReferenceFromDefinition<TReference>;

type EditorExtensionInstalledFromReference<TReference> =
  EditorExtensionDependencyContractOf<TReference> extends infer TContract
    ? TContract extends EditorExtensionDependencyContract
      ? TContract['installed']
      : never
    : never;

type EditorExtensionDirectFromReference<TReference> =
  EditorExtensionDependencyContractOf<TReference> extends infer TContract
    ? TContract extends EditorExtensionDependencyContract
      ? TContract['direct']
      : never
    : never;

type EditorExtensionRequirementNames<TRequirement> =
  TRequirement extends unknown
    ? TRequirement extends { name: infer TName extends PropertyKey }
      ? TName
      : never
    : never;

type EditorExtensionExcludeRequirementNames<
  TRequirement,
  TNames extends PropertyKey,
> = TRequirement extends unknown
  ? TRequirement extends { name: infer TName extends PropertyKey }
    ? TName extends TNames
      ? never
      : TRequirement
    : TRequirement
  : never;

type EditorExtensionRequirementsFromReferences<
  TReferences extends readonly unknown[],
> = number extends TReferences['length']
  ? EditorExtensionInstalledFromReference<TReferences[number]>
  : TReferences extends readonly [
        ...infer TPrevious extends readonly unknown[],
        infer TLast,
      ]
    ? EditorExtensionInstalledFromReference<TLast> extends infer TInstalledLast
      ?
          | TInstalledLast
          | EditorExtensionExcludeRequirementNames<
              EditorExtensionRequirementsFromReferences<TPrevious>,
              EditorExtensionRequirementNames<
                EditorExtensionDirectFromReference<TLast>
              >
            >
      : never
    : never;

type EditorExtensionRequirementsOf<TExtension> = TExtension extends unknown
  ? [EditorExtensionDependencyContractOf<TExtension>] extends [never]
    ? EditorExtensionInternalDefinitionOf<TExtension> extends {
        dependencies: infer TDependencies extends readonly unknown[];
      }
      ? EditorExtensionRequirementsFromReferences<TDependencies>
      : never
    : EditorExtensionDependencyContractOf<TExtension>['installed']
  : never;

type ResolvedEditorExtensionTypeProvider<TExtension> =
  TExtension extends unknown
    ? TExtension extends EditorExtensionTypeProvider<
        infer TProvider extends EditorExtensionTypeLambda
      >
      ? EditorExtensionTypeProvider<TProvider>
      : Readonly<Record<never, never>>
    : never;

type EditorSchemaExtensionProviderOf<TExtension> = TExtension extends unknown
  ? TExtension extends EditorSchemaExtensionProvider<infer TSchema>
    ? EditorSchemaExtensionProvider<TSchema>
    : Readonly<Record<never, never>>
  : never;

/**
 * Preserve only one extension's finite type-provider projection.
 *
 */
export type EditorExtensionTypeProviderOf<TExtension> =
  ResolvedEditorExtensionTypeProvider<TExtension>;

type EditorExtensionDirectCapability<TExtension> = TExtension extends unknown
  ? EditorExtensionCapabilityOf<TExtension> extends infer TCapability extends
      EditorExtensionDefinition
    ? TCapability &
        ResolvedEditorExtensionTypeProvider<TExtension> &
        EditorSchemaExtensionProviderOf<TExtension>
    : never
  : never;

type EditorExtensionDirectDependencyCapability<TExtension> =
  TExtension extends unknown
    ? EditorExtensionCapabilityOf<TExtension> extends infer TCapability extends
        EditorExtensionDefinition
      ? TCapability extends { enabled: false }
        ? Readonly<Pick<TCapability, 'enabled' | 'name'>>
        : EditorExtensionDirectCapability<TExtension>
      : never
    : never;

type EditorExtensionInstallRequirement<TExtension> = TExtension extends unknown
  ? EditorExtensionCapabilityOf<TExtension> extends { enabled: false }
    ? never
    : EditorExtensionDirectCapability<TExtension> extends infer TDirect
      ?
          | TDirect
          | EditorExtensionExcludeRequirementNames<
              EditorExtensionRequirementsOf<TExtension>,
              EditorExtensionRequirementNames<TDirect>
            >
      : never
  : never;

type EditorExtensionDependencyContractFor<TExtension> =
  TExtension extends unknown
    ? [EditorExtensionDependencyContractOf<TExtension>] extends [never]
      ? Readonly<{
          direct: EditorExtensionDirectDependencyCapability<TExtension>;
          installed: EditorExtensionInstallRequirement<TExtension>;
        }>
      : EditorExtensionDependencyContractOf<TExtension>
    : never;

/**
 * Compact install contract for one direct dependency.
 *
 */
export type EditorExtensionDependencyReferenceFor<TExtension> =
  TExtension extends unknown
    ? EditorExtensionDependencyContractReference<
        EditorExtensionDependencyContractFor<TExtension>
      >
    : never;

/**
 * Finite installed capability carried by one dependency reference.
 *
 */
export type EditorExtensionInstalledCapabilitiesOf<TReference> =
  EditorExtensionDependencyContractOf<TReference> extends infer TContract
    ? TContract extends Readonly<{ installed: infer TInstalled }>
      ? TInstalled
      : never
    : never;

type EditorExtensionRuntimeReferences<TInput> =
  TInput extends readonly unknown[]
    ? {
        readonly [TIndex in keyof TInput]: EditorExtensionShallowReferenceOf<
          TInput[TIndex]
        >;
      }
    : never;

type EditorExtensionRuntimeField<
  TDefinition,
  TKey extends keyof TDefinition,
> = TKey extends 'conflicts' | 'dependencies'
  ? EditorExtensionRuntimeReferences<TDefinition[TKey]>
  : TKey extends 'enabled' | 'name' | 'schema'
    ? TDefinition[TKey]
    : unknown;

/**
 * Exact type witness without public runtime descriptor fields.
 *
 */
export type EditorExtensionWitnessFor<
  TDefinition extends EditorExtensionDefinition,
> = PrivateEditorExtensionWitness<{
  capability: EditorExtensionCapabilityDefinition<TDefinition>;
  definition: (
    definition: EditorExtensionPublicDefinition<TDefinition>
  ) => EditorExtensionPublicDefinition<TDefinition>;
  internalDefinition: (definition: TDefinition) => TDefinition;
}>;

export type EditorExtension<TDefinition extends EditorExtensionDefinition> =
  Readonly<{
    [TKey in keyof TDefinition]: EditorExtensionRuntimeField<TDefinition, TKey>;
  }> &
    EditorExtensionWitnessFor<TDefinition> &
    PrivateEditorExtensionReferenceBrand;

/**
 * Contextually typed author input. `defineExtension` normalizes this
 * callback-rich shape to the compact definition carried by `DefinitionOf`.
 */
export type EditorExtensionDefinitionInput<
  TEditor extends BaseEditor<any, any> = BaseEditor<any>,
> = {
  enabled?: boolean;
  dependencies?: readonly EditorExtensionReference[];
  conflicts?: readonly EditorExtensionReference[];
  schema?: EditorSchemaDeclaration | EditorExtensionSchemaFactory;
  api?: EditorExtensionApiFactory<TEditor>;
  read?: EditorExtensionReadFactory<TEditor>;
  update?: EditorExtensionUpdateFactory<TEditor>;
  readMiddleware?: EditorExtensionReadMiddlewareFactory<TEditor>;
  commands?: (
    context: EditorExtensionCommandContext<TEditor>
  ) => ReadonlyArray<EditorCommandRegistration<TEditor>>;
  corrections?: ReadonlyArray<EditorCorrection<TEditor>>;
  stateFields?: ReadonlyArray<EditorStateField<any>>;
  effectTypes?: readonly EditorEffectType[];
  facetProviders?: readonly EditorFacetProvider[];
  contributions?: ReadonlyArray<
    EditorExtensionContributionInput<NoInfer<TEditor>>
  >;
  on?: EditorExtensionChangeHandlers<TEditor>;
  activate?: (
    context: EditorExtensionActivationContext & Readonly<{ editor: TEditor }>
  ) => void;
  validate?: BivariantMethod<
    [context: EditorExtensionCandidateContext<TEditor>],
    void
  >;
};

export type EditorExtensionInput =
  | EditorExtensionReference
  | readonly EditorExtensionReference[];

export type EditorExtensionSlotLike = Readonly<{
  key: string;
  of: (input: EditorExtensionInput) => EditorExtensionReference;
}>;

export type EditorSelectionMapContext = Readonly<{
  change: DocumentChange;
  editor: AnyEditor;
  mapPoint: (
    point: Point,
    options?: {
      association?: 'backward' | 'forward';
      deletion?: 'drop' | 'nearest';
    }
  ) => Point | null;
  mapPath: (
    path: Path,
    options?: {
      association?: 'backward' | 'forward';
      deletion?: 'drop' | 'nearest';
    }
  ) => Path | null;
  mapRange: (
    range: Range,
    options?: {
      association?: 'backward' | 'forward' | 'inward' | 'outward';
      deletion?: 'drop' | 'nearest';
    }
  ) => Range | null;
  /** Named mapped root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
}>;

export type EditorExtensionTypes = {
  api?: Record<string, unknown>;
  read?: EditorReadMethodTree;
  update?: Record<string, unknown>;
};

/** Type lambda for value-sensitive extension capabilities. */
export interface EditorExtensionTypeLambda {
  readonly input: Value;
  readonly output: EditorExtensionTypes;
}

/** Fixed capabilities contributed by an extension regardless of editor value. */
export interface EditorExtensionCapabilities<
  TOutput extends EditorExtensionTypes,
> {
  readonly input: Value;
  readonly output: TOutput;
}

export declare class EditorExtensionTypeProvider<
  TProvider extends EditorExtensionTypeLambda,
> {
  protected readonly editorExtensionTypes: TProvider;
}

type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type EditorExtensionName<TExtension> = TExtension extends {
  name: infer TName extends PropertyKey;
}
  ? TName
  : never;

type EditorLiteralExtensionName<TExtension> =
  EditorExtensionName<TExtension> extends infer TName
    ? TName extends string
      ? string extends TName
        ? never
        : TName
      : TName extends number
        ? number extends TName
          ? never
          : TName
        : TName extends symbol
          ? symbol extends TName
            ? never
            : TName
          : never
    : never;

type IsEqual<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;

type EditorInstalledCapabilityForName<
  TExtensions extends readonly unknown[],
  TName extends PropertyKey,
> = EditorResolvedInstalledExtensions<TExtensions>[number] extends infer TInstalled
  ? TInstalled extends unknown
    ? EditorExtensionCapabilityOf<TInstalled> extends infer TCapability
      ? TCapability extends { name: TName }
        ? TCapability
        : never
      : never
    : never
  : never;

type EditorInstalledExtensionGuard<
  TExtension,
  TExtensions extends readonly unknown[],
> =
  EditorExtensionCapabilityOf<TExtension> extends infer TCapability
    ? TCapability extends { name: infer TName extends PropertyKey }
      ? [TCapability] extends [
          EditorInstalledCapabilityForName<TExtensions, TName>,
        ]
        ? [EditorInstalledCapabilityForName<TExtensions, TName>] extends [
            TCapability,
          ]
          ? unknown
          : never
        : never
      : never
    : never;

type EditorExtensionEnabled<TExtension> = TExtension extends {
  enabled: infer TEnabled;
}
  ? IsEqual<TEnabled, false> extends true
    ? never
    : TExtension
  : TExtension;

type EditorExtensionNames<TExtensions extends readonly unknown[]> =
  TExtensions[number] extends infer TExtension
    ? EditorLiteralExtensionName<TExtension>
    : never;

type EditorResolvedExtensionAndDependencies<TExtension> =
  EditorExtensionEnabled<TExtension> extends infer TEnabled
    ? [TEnabled] extends [never]
      ? readonly []
      : readonly [EditorExtensionRequirementsOf<TEnabled> | TEnabled]
    : readonly [];

type EditorResolvedArrayExtensionAndDependencies<TExtension> =
  EditorExtensionEnabled<TExtension> extends infer TEnabled
    ? TEnabled extends unknown
      ? EditorExtensionRequirementsOf<TEnabled> | TEnabled
      : never
    : never;

export type EditorResolvedInstalledExtensions<
  TExtensions extends readonly unknown[],
> = number extends TExtensions['length']
  ? ReadonlyArray<
      EditorResolvedArrayExtensionAndDependencies<TExtensions[number]>
    >
  : TExtensions extends readonly []
    ? readonly []
    : TExtensions extends readonly [
          infer TFirst,
          ...infer TRest extends readonly unknown[],
        ]
      ? [EditorExtensionName<TFirst>] extends [never]
        ? EditorResolvedInstalledExtensions<TRest>
        : [EditorLiteralExtensionName<TFirst>] extends [never]
          ? EditorExtensionEnabled<TFirst> extends never
            ? EditorResolvedInstalledExtensions<TRest>
            : [
                ...EditorResolvedExtensionAndDependencies<TFirst>,
                ...EditorResolvedInstalledExtensions<TRest>,
              ]
          : EditorLiteralExtensionName<TFirst> extends EditorExtensionNames<TRest>
            ? EditorResolvedInstalledExtensions<TRest>
            : EditorExtensionEnabled<TFirst> extends never
              ? EditorResolvedInstalledExtensions<TRest>
              : [
                  ...EditorResolvedExtensionAndDependencies<TFirst>,
                  ...EditorResolvedInstalledExtensions<TRest>,
                ]
      : readonly [];

type EditorDefinitionSlot<TExtension, TSlot extends 'api' | 'read' | 'update'> =
  EditorExtensionCapabilityOf<TExtension> extends infer TDefinition
    ? TDefinition extends object
      ? TSlot extends keyof TDefinition
        ? TDefinition[TSlot]
        : unknown
      : unknown
    : unknown;

type EditorProvidedTypesFromExtension<V extends Value, TExtension> =
  IsAny<TExtension> extends true
    ? never
    : TExtension extends EditorExtensionTypeProvider<
          infer TProvider extends EditorExtensionTypeLambda
        >
      ? (TProvider & Readonly<{ input: V }>)['output']
      : never;

type EditorProvidedSlot<
  V extends Value,
  TExtension,
  TSlot extends keyof EditorExtensionTypes,
> =
  EditorProvidedTypesFromExtension<V, TExtension> extends infer TTypes
    ? TTypes extends object
      ? TSlot extends keyof TTypes
        ? NonNullable<TTypes[TSlot]>
        : never
      : never
    : never;

type EditorReadGroupsFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends unknown
  ? EditorProvidedSlot<V, TExtension, 'read'> extends infer TProvidedState
    ? [TProvidedState] extends [never]
      ? EditorDefinitionSlot<TExtension, 'read'> extends infer TRead
        ? [unknown] extends [TRead]
          ? never
          : EditorLiteralExtensionName<TExtension> extends infer TName extends
                PropertyKey
            ? { [K in TName]: TRead }
            : never
        : never
      : TProvidedState
    : never
  : never;

type EditorUpdateGroupsFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends unknown
  ? EditorProvidedSlot<V, TExtension, 'update'> extends infer TProvidedTx
    ? [TProvidedTx] extends [never]
      ? EditorDefinitionSlot<TExtension, 'update'> extends infer TUpdate
        ? [unknown] extends [TUpdate]
          ? never
          : EditorLiteralExtensionName<TExtension> extends infer TName extends
                PropertyKey
            ? { [K in TName]: TUpdate }
            : never
        : never
      : TProvidedTx
    : never
  : never;

type EditorApiGroupsFromExtension<TExtension> = TExtension extends unknown
  ? EditorProvidedSlot<Value, TExtension, 'api'> extends infer TProvidedApi
    ? [TProvidedApi] extends [never]
      ? EditorDefinitionSlot<TExtension, 'api'> extends infer TApi
        ? [unknown] extends [TApi]
          ? never
          : EditorLiteralExtensionName<TExtension> extends infer TName extends
                PropertyKey
            ? { [K in TName]: TApi }
            : never
        : never
      : TProvidedApi
    : never
  : never;

export type EditorInstalledReadGroups<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> =
  IsAny<TExtensions> extends true
    ? Record<string, any>
    : UnionToIntersection<
        EditorReadGroupsFromExtension<
          V,
          EditorResolvedInstalledExtensions<TExtensions>[number]
        >
      >;

export type EditorInstalledUpdateGroups<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> =
  IsAny<TExtensions> extends true
    ? Record<string, any>
    : UnionToIntersection<
        EditorUpdateGroupsFromExtension<
          V,
          EditorResolvedInstalledExtensions<TExtensions>[number]
        >
      >;

export type EditorInstalledApiGroups<
  TExtensions extends readonly unknown[] = readonly [],
> =
  IsAny<TExtensions> extends true
    ? Record<string, any>
    : UnionToIntersection<
        EditorApiGroupsFromExtension<
          EditorResolvedInstalledExtensions<TExtensions>[number]
        >
      >;

export type EditorApiValueFromExtension<TExtension> =
  EditorApiGroupsFromExtension<TExtension> extends infer TApi
    ? TExtension extends { name: infer TName }
      ? TName extends keyof TApi
        ? TApi[TName]
        : never
      : never
    : never;

export type EditorReadValueFromExtension<V extends Value, TExtension> =
  EditorReadGroupsFromExtension<V, TExtension> extends infer TRead
    ? TExtension extends { name: infer TName }
      ? TName extends keyof TRead
        ? TRead[TName]
        : never
      : never
    : never;

export type EditorUpdateValueFromExtension<V extends Value, TExtension> =
  EditorUpdateGroupsFromExtension<V, TExtension> extends infer TUpdate
    ? TExtension extends { name: infer TName }
      ? TName extends keyof TUpdate
        ? TUpdate[TName]
        : never
      : never
    : never;

export type RegisteredEditorExtension = {
  conflicts: readonly EditorExtensionReference[];
  dependencies: readonly EditorExtensionReference[];
  descriptor: EditorExtensionReference;
  name: string;
  order: number;
  requiredBy: ReadonlySet<EditorExtensionReference>;
};

export type EditorExtensionRegistry = {
  commands: Readonly<{
    byDescriptor: ReadonlyMap<
      object,
      Readonly<{
        descriptor: object;
        entries: readonly unknown[];
        hasAround: boolean;
        id: string;
      }>
    >;
    byId: ReadonlyMap<string, object>;
    revision: number;
  }>;
  commitListeners: Set<EditorCommitListener>;
  contributions: Map<object, readonly unknown[]>;
  dependencyOrder: readonly EditorExtensionReference[];
  extensions: Map<string, RegisteredEditorExtension>;
  extensionsByDescriptor: ReadonlyMap<
    EditorExtensionReference,
    RegisteredEditorExtension
  >;
  nodeChangeListeners: Set<EditorNodeChangeHandler>;
  reads: Readonly<{
    byDescriptor: ReadonlyMap<
      object,
      Readonly<{
        descriptor: object;
        entries: readonly unknown[];
        id: string;
      }>
    >;
    byId: ReadonlyMap<string, object>;
    revision: number;
  }>;
  corrections: Map<string, EditorCorrection>;
  stateGroups: Map<string, unknown>;
  textChangeListeners: Set<EditorTextChangeHandler>;
  txGroups: Map<string, unknown>;
};

export type EditorCommitListener<V extends Value = Value> = BivariantMethod<
  [commit: EditorCommit<V>, snapshot: EditorSnapshot<V>],
  void
>;

export type TopLevelRuntimeRange = readonly [number, number];

export type EditorCommitChangeKind =
  | 'document'
  | 'marks'
  | 'properties'
  | 'replace'
  | 'root-order'
  | 'selection'
  | 'snapshot'
  | 'state'
  | 'structure'
  | 'text';

export type EditorCommitRuntimeChangeKind =
  | 'decoration'
  | 'node'
  | 'path'
  /** Runtime node identities added to or removed from a document root. */
  | 'presence'
  | 'projection'
  | 'selection'
  | 'text';

/** Lazy commit queries derived from canonical changes and snapshot indexes. */
export type EditorCommitChanged = {
  has: <TRoot extends RootKey>(
    kind: EditorCommitChangeKind,
    root?: NamedRootKey<TRoot>
  ) => boolean;
  /** Whether any document root has this change kind. */
  hasAny: (kind: EditorCommitChangeKind) => boolean;
  hasNodeKey: (
    nodeKey: NodeKey,
    kind: EditorCommitRuntimeChangeKind
  ) => boolean;
  /** Final-coordinate paths touching changed ranges in one document root. */
  paths: <TRoot extends RootKey>(root?: NamedRootKey<TRoot>) => readonly Path[];
  nodeKeys: <TRoot extends RootKey>(
    kind: EditorCommitRuntimeChangeKind,
    root?: NamedRootKey<TRoot>
  ) => readonly NodeKey[];
  /** Node keys with this change kind across every document root. */
  nodeKeysAll: (kind: EditorCommitRuntimeChangeKind) => readonly NodeKey[];
  topLevelRanges: <TRoot extends RootKey>(
    root?: NamedRootKey<TRoot>
  ) => readonly TopLevelRuntimeRange[];
};

export type EditorTransactionDocumentChangeKind =
  | 'properties'
  | 'structure'
  | 'text';

export type EditorTransactionTopLevelRange = Readonly<{
  /** Inclusive top-level window in the final transaction-step document. */
  after: TopLevelRuntimeRange | null;
  /** Inclusive top-level window in the transaction-step source document. */
  before: TopLevelRuntimeRange | null;
}>;

/** Lazy semantic queries over one transaction-local document change. */
export type EditorTransactionChanged = {
  has: <TRoot extends RootKey>(
    kind: EditorTransactionDocumentChangeKind,
    root?: NamedRootKey<TRoot>
  ) => boolean;
  /** Final-coordinate paths touching changed ranges in one document root. */
  paths: <TRoot extends RootKey>(root?: NamedRootKey<TRoot>) => readonly Path[];
  /** Bounded before/after top-level windows for each changed range. */
  topLevelRanges: <TRoot extends RootKey>(
    root?: NamedRootKey<TRoot>
  ) => readonly EditorTransactionTopLevelRange[];
};

export type EditorCommit<V extends Value = Value> = Readonly<{
  annotations: Readonly<Record<string, unknown>>;
  after: EditorSnapshot<V>;
  before: EditorSnapshot<V>;
  changed: EditorCommitChanged;
  changes: DocumentChange;
  inverseChanges: DocumentChange;
  dirtyStateKeys: readonly string[];
  effects: readonly EditorEffect[];
  previousVersion: number;
  selectionAfter: Selection;
  /** Named selection root, or `undefined` for the primary document. */
  selectionAfterRoot: NamedRootKey | undefined;
  selectionBefore: Selection;
  /** Named selection root, or `undefined` for the primary document. */
  selectionBeforeRoot: NamedRootKey | undefined;
  selectionChanged: boolean;
  tags: readonly EditorUpdateTag[];
  version: number;
}>;

export interface EditorAboveOptions<
  T extends Ancestor,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorBlockOptions<
  T extends Element = Element,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorAfterOptions {
  distance?: number;
  unit?: TextUnitAdjustment;
  voids?: boolean;
}

export interface EditorBeforeOptions {
  /**
   * Return the point after the matched text or predicate instead of the point
   * before it.
   */
  afterMatch?: boolean;
  distance?: number;
  /** Return the current block start when a match is not found before crossing blocks. */
  matchBlockStart?: boolean;
  /** Interpret `matchString` entries as regular expressions. */
  matchByRegex?: boolean;
  /** Lookup backward until one of these strings is matched. */
  matchString?: readonly string[] | string;
  /** Lookup backward until this predicate returns true. */
  match?: (value: {
    at: Location;
    beforePoint: Point;
    beforeString: string;
  }) => boolean;
  /** Continue looking past non-matching text until block start. */
  skipInvalid?: boolean;
  unit?: TextUnitAdjustment;
  voids?: boolean;
}

export interface EditorDirectedDeletionOptions {
  unit?: TextUnit;
}

export interface EditorElementReadOnlyOptions {
  at?: Location;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorFragmentDeletionOptions {
  at?: Location;
  direction?: TextDirection;
}

export interface EditorIsEditorOptions {
  deep?: boolean;
}

export interface EditorLeafOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorLevelsOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorLastOptions {
  level?: number;
}

export interface EditorNextOptions<
  T extends Descendant,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  from?: 'after' | 'child';
  match?: NodeMatch<T>;
  type?: TType;
  mode?: SelectionMode;
  voids?: boolean;
}

export interface EditorNodeOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorNodesOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location | NodeSelection | Span;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: SelectionMode;
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
  pass?: (entry: NodeEntry) => boolean;
}

export interface EditorParentOptions<
  T extends Ancestor = Ancestor,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  depth?: number;
  edge?: LeafEdge;
  match?: NodeMatch<T>;
  type?: TType;
}

export interface EditorPathOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorPointOptions {
  edge?: LeafEdge;
}

export interface EditorPositionsOptions {
  at?: Location;
  unit?: TextUnitAdjustment;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorPreviousOptions<
  T extends Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  from?: 'before' | 'parent';
  match?: NodeMatch<T>;
  type?: TType;
  mode?: SelectionMode;
  sibling?: boolean;
  voids?: boolean;
}

export interface EditorStringOptions {
  voids?: boolean;
}

export interface EditorUnhangRangeOptions {
  character?: boolean;
  unhang?: boolean;
  voids?: boolean;
}

export interface EditorVoidOptions {
  at?: Location;
  mode?: MaximizeMode;
  voids?: boolean;
}

type EditorStaticAbove = {
  <V extends Value, TGuard extends Ancestor>(
    editor: AnyEditor<V>,
    options: EditorAboveOptions<Ancestor, undefined> & {
      match: (node: Ancestor, path: Path) => node is TGuard;
    }
  ): NodeEntry<TGuard> | undefined;
  <V extends Value, const TType extends NodeTypeSelector>(
    editor: AnyEditor<V>,
    options: EditorAboveOptions<NodeForTypeSelector<TType>, TType> & {
      type: TType;
    }
  ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
  <V extends Value>(
    editor: AnyEditor<V>,
    options?: EditorAboveOptions<Ancestor>
  ): NodeEntry<Ancestor> | undefined;
};

type EditorStaticLevels = {
  <V extends Value, TGuard extends ValueTreeNode<V>>(
    editor: AnyEditor<V>,
    options: EditorLevelsOptions<ValueTreeNode<V>, undefined> & {
      match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
    }
  ): Generator<NodeEntry<TGuard>, void, undefined>;
  <V extends Value, const TType extends NodeTypeSelector>(
    editor: AnyEditor<V>,
    options: EditorLevelsOptions<NodeForTypeSelector<TType>, TType> & {
      type: TType;
    }
  ): Generator<NodeEntry<NodeForTypeSelector<TType>>, void, undefined>;
  <V extends Value>(
    editor: AnyEditor<V>,
    options?: EditorLevelsOptions<ValueTreeNode<V>>
  ): Generator<NodeEntry, void, undefined>;
};

type EditorStaticNext = {
  <V extends Value, TGuard extends ValueDescendant<V>>(
    editor: AnyEditor<V>,
    options: EditorNextOptions<ValueDescendant<V>, undefined> & {
      match: (node: ValueDescendant<V>, path: Path) => node is TGuard;
    }
  ): NodeEntry<TGuard> | undefined;
  <V extends Value, const TType extends NodeTypeSelector>(
    editor: AnyEditor<V>,
    options: EditorNextOptions<NodeForTypeSelector<TType>, TType> & {
      type: TType;
    }
  ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
  <V extends Value>(
    editor: AnyEditor<V>,
    options?: EditorNextOptions<ValueDescendant<V>>
  ): NodeEntry<ValueDescendant<V>> | undefined;
};

type EditorStaticPrevious = {
  <V extends Value, TGuard extends ValueTreeNode<V>>(
    editor: AnyEditor<V>,
    options: EditorPreviousOptions<ValueTreeNode<V>, undefined> & {
      match: (node: ValueTreeNode<V>, path: Path) => node is TGuard;
    }
  ): NodeEntry<TGuard> | undefined;
  <V extends Value, const TType extends NodeTypeSelector>(
    editor: AnyEditor<V>,
    options: EditorPreviousOptions<NodeForTypeSelector<TType>, TType> & {
      type: TType;
    }
  ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
  <V extends Value>(
    editor: AnyEditor<V>,
    options?: EditorPreviousOptions<ValueTreeNode<V>>
  ): NodeEntry | undefined;
};

type EditorStaticParent = {
  <TGuard extends Ancestor>(
    editor: AnyEditor,
    at: Location,
    options: EditorParentOptions<Ancestor, undefined> & {
      match: (node: Ancestor, path: Path) => node is TGuard;
    }
  ): NodeEntry<TGuard> | undefined;
  <const TType extends NodeTypeSelector>(
    editor: AnyEditor,
    at: Location,
    options: EditorParentOptions<NodeForTypeSelector<TType>, TType> & {
      type: TType;
    }
  ): NodeEntry<NodeForTypeSelector<TType>> | undefined;
  (
    editor: AnyEditor,
    at: Location,
    options?: EditorParentOptions<Ancestor, undefined> & {
      match?: undefined;
      type?: undefined;
    }
  ): NodeEntry<Ancestor>;
  (
    editor: AnyEditor,
    at: Location,
    options: EditorParentOptions
  ): NodeEntry<Ancestor> | undefined;
};

export interface EditorStaticApi {
  /**
   * Get the ancestor above a location in the document.
   */
  above: EditorStaticAbove;

  /**
   * Add a custom property to the leaf text nodes in the current selection.
   *
   * If the selection is currently collapsed, the marks are stored by the
   * editor runtime and applied when text is inserted next.
   */
  addMark: (editor: AnyEditor, key: string, value: any) => void;

  /**
   * Get the point after a location.
   */
  after: (
    editor: AnyEditor,
    at: Location,
    options?: EditorAfterOptions
  ) => Point | undefined;

  /**
   * Get the point before a location.
   */
  before: (
    editor: AnyEditor,
    at: Location,
    options?: EditorBeforeOptions
  ) => Point | undefined;

  /**
   * Delete content in the editor backward from the current selection.
   */
  deleteBackward: (
    editor: AnyEditor,
    options?: EditorDirectedDeletionOptions
  ) => void;

  /**
   * Delete content in the editor forward from the current selection.
   */
  deleteForward: (
    editor: AnyEditor,
    options?: EditorDirectedDeletionOptions
  ) => void;

  /**
   * Delete the content in the current selection.
   */
  deleteFragment: (
    editor: AnyEditor,
    options?: EditorFragmentDeletionOptions
  ) => void;

  delete: TextMutationMethods['delete'];

  collapse: SelectionMutationMethods['collapse'];

  deselect: SelectionMutationMethods['deselect'];

  /**
   * Get the start and end points of a location.
   */
  edges: (editor: AnyEditor, at: Location) => readonly [Point, Point];

  /**
   * Get the latest committed transaction metadata.
   */
  getLastCommit: <V extends Value>(
    editor: AnyEditor<V>
  ) => EditorCommit<V> | null;

  /**
   * Return effects that are marked for collaboration.
   */
  getCollabEffects: <V extends Value>(
    editor: AnyEditor<V>,
    commit: EditorCommit<V>
  ) => readonly EditorEffect[];

  /**
   * Get the extension registry for an editor.
   */
  getExtensionRegistry: (editor: AnyEditor) => EditorExtensionRegistry;

  /**
   * Resolve the current-root live path for a node key without rebuilding a
   * snapshot.
   */
  getPathByNodeKey: (editor: AnyEditor, nodeKey: NodeKey) => Path | null;

  /**
   * Get the node key for a live node path without rebuilding a snapshot.
   */
  getNodeKey: (editor: AnyEditor, path: Path) => NodeKey | null;

  /**
   * Run a coherent synchronous read against the current editor/runtime state.
   */
  read: <V extends Value, TExtensions extends readonly unknown[], T>(
    editor: Editor<V, TExtensions>,
    fn: (state: EditorStateView<V, TExtensions>) => T
  ) => T;

  /**
   * Match a read-only element in the current branch of the editor.
   */
  elementReadOnly: (
    editor: AnyEditor,
    options?: EditorElementReadOnlyOptions
  ) => NodeEntry<Element> | undefined;

  /**
   * Get the first node at a location.
   */
  first: (editor: AnyEditor, at: Location) => NodeEntry;

  /**
   * Get the current children through the public accessor boundary.
   */
  getChildren: <V extends Value>(editor: AnyEditor<V>) => V;

  /**
   * Get the current selection through the selection freshness runtime.
   */
  getSelection: (editor: AnyEditor) => Selection;

  /**
   * Get the fragment at a location.
   */
  fragment: <V extends Value>(
    editor: AnyEditor<V>,
    at: Location
  ) => ReadonlyArray<DescendantIn<V>>;

  /**
   * Get the fragment at the current selection.
   */
  getFragment: <V extends Value>(
    editor: AnyEditor<V>
  ) => ReadonlyArray<DescendantIn<V>>;

  /**
   * Get the current immutable snapshot of editor state.
   */
  getSnapshot: <V extends Value>(editor: AnyEditor<V>) => EditorSnapshot<V>;

  /**
   * Check if a node has block children.
   */
  hasBlocks: (editor: AnyEditor, element: Element) => boolean;

  /**
   * Check if a node has inline and text children.
   */
  hasInlines: (editor: AnyEditor, element: Element) => boolean;

  hasPath: (editor: AnyEditor, path: Path) => boolean;

  /**
   * Check if a node has text children.
   */
  hasTexts: (editor: AnyEditor, element: Element) => boolean;

  /**
   * Insert a block break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertBreak: (editor: AnyEditor) => void;

  /**
   * Atomically inserts `nodes`
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertNode: {
    <V extends Value, const TType extends NodeTypeSelector | undefined>(
      editor: AnyEditor<V>,
      node: ElementOrTextIn<V>,
      options: NodeInsertNodesOptions<
        NodeInsertSplitTarget<V, TType>,
        TType
      > & {
        split: NodeInsertNodesOptions<
          NodeInsertSplitTarget<V, TType>,
          TType
        >['split'] & { type: TType };
      }
    ): void;
    <V extends Value>(
      editor: AnyEditor<V>,
      node: ElementOrTextIn<V>,
      options?: NodeInsertNodesOptions<NodeIn<V>>
    ): void;
  };

  insertNodes: NodeMutationMethods['insertNodes'];

  /**
   * Insert a soft break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertSoftBreak: (editor: AnyEditor) => void;

  /**
   * Insert a string of text
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertText: (
    editor: AnyEditor,
    text: string,
    options?: TextInsertTextOptions
  ) => void;

  mergeNodes: NodeMutationMethods['mergeNodes'];

  move: SelectionMutationMethods['move'];

  moveNodes: NodeMutationMethods['moveNodes'];

  /**
   * Check if a value is a block `Element` object.
   */
  isBlock: (editor: AnyEditor, value: Node) => boolean;

  /**
   * Check if a point is an edge of a location.
   */
  isEdge: (editor: AnyEditor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is an `AnyEditor` object.
   */
  isEditor: (
    value: unknown,
    options?: EditorIsEditorOptions
  ) => value is AnyEditor;

  /**
   * Check if a value is a read-only `Element` object.
   */
  isElementReadOnly: (editor: AnyEditor, element: Element) => boolean;

  /**
   * Check if an element is empty, accounting for void nodes.
   */
  isEmpty: (editor: AnyEditor, element: Element) => boolean;

  /**
   * Check if a point is the end point of a location.
   */
  isEnd: (editor: AnyEditor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is an inline `Element` object.
   */
  isInline: (editor: AnyEditor, value: Node) => boolean;

  /**
   * Check if a value is a selectable `Element` object.
   */
  isSelectable: (editor: AnyEditor, element: Node) => boolean;

  /**
   * Check if a point is the start point of a location.
   */
  isStart: (editor: AnyEditor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is a void `Element` object.
   */
  isVoid: (editor: AnyEditor, value: Node) => boolean;

  /**
   * Get the last node at a location.
   */
  last: (
    editor: AnyEditor,
    at: Location,
    options?: EditorLastOptions
  ) => NodeEntry | undefined;

  /**
   * Get the leaf text node at a location.
   */
  leaf: (
    editor: AnyEditor,
    at: Location,
    options?: EditorLeafOptions
  ) => NodeEntry<Text>;

  /**
   * Iterate through all of the levels at a location.
   */
  levels: EditorStaticLevels;

  liftNodes: NodeMutationMethods['liftNodes'];

  /**
   * Get the matching node in the branch of the document after a location.
   */
  next: EditorStaticNext;

  /**
   * Normalize any dirty objects in the editor.
   */

  /**
   * Get the parent node of a location.
   */
  parent: EditorStaticParent;

  /**
   * Get the path of a location.
   */
  path: (editor: AnyEditor, at: Location, options?: EditorPathOptions) => Path;

  /**
   * Get the start or end point of a location.
   */
  point: (
    editor: AnyEditor,
    at: Location,
    options?: EditorPointOptions
  ) => Point;

  projectRange: (
    editor: AnyEditor,
    range: Range
  ) => readonly ProjectedRangeSegment[];

  /**
   * Return all the positions in `at` range where a `Point` can be placed.
   *
   * By default, moves forward by individual offsets at a time, but
   * the `unit` option can be used to to move by character, word, line, or block.
   *
   * The `reverse` option can be used to change iteration direction.
   *
   * Note: By default void nodes are treated as a single point and iteration
   * will not happen inside their content unless you pass in true for the
   * `voids` option, then iteration will occur.
   */
  positions: (
    editor: AnyEditor,
    options?: EditorPositionsOptions
  ) => Generator<Point, void, undefined>;

  /**
   * Get the matching node in the branch of the document before a location.
   */
  previous: EditorStaticPrevious;

  /**
   * Get a range of a location.
   */
  range: (editor: AnyEditor, at: Location, to?: Location) => Range;

  install: (
    editor: AnyEditor,
    extension: EditorExtensionInput,
    options?: EditorExtensionReconfigureOptions
  ) => () => void;

  replace: <V extends Value>(
    editor: AnyEditor<V>,
    input: SnapshotInput<V>
  ) => void;

  reset: <V extends Value>(
    editor: AnyEditor<V>,
    input: SnapshotInput<V>
  ) => void;

  /**
   * Remove a custom property from all of the leaf text nodes in the current
   * selection.
   *
   * If the selection is currently collapsed, the removal is stored by the
   * editor runtime and applied to the text inserted next.
   */
  removeMark: (editor: AnyEditor, key: string) => void;

  removeNodes: NodeMutationMethods['removeNodes'];
  replaceChildren: NodeMutationMethods['replaceChildren'];

  select: SelectionMutationMethods['select'];

  setPoint: SelectionMutationMethods['setPoint'];

  setNodes: NodeMutationMethods['setNodes'];

  setSelection: SelectionMutationMethods['setSelection'];

  splitNodes: NodeMutationMethods['splitNodes'];

  /**
   * Toggle a custom property on the leaf text nodes in the current selection.
   *
   * If the selection is collapsed, the mark is stored for the next inserted
   * text.
   */
  toggleMark: (
    editor: AnyEditor,
    key: string,
    value?: any,
    options?: EditorToggleMarkOptions
  ) => void;

  /** Toggle selected blocks between target properties and the schema default. */
  toggleBlock: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    props: NodePropertyPatch<NodeProps<ElementIn<V>>> & { type: string },
    options?: EditorToggleBlockOptions
  ) => void;

  unsetNodes: NodeMutationMethods['unsetNodes'];

  unwrapNodes: NodeMutationMethods['unwrapNodes'];

  wrapNodes: NodeMutationMethods['wrapNodes'];

  /**
   * Get the text string content of a location.
   *
   * Note: by default the text of void nodes is considered to be an empty
   * string, regardless of content, unless you pass in true for the voids option
   */
  string: (
    editor: AnyEditor,
    at: Location,
    options?: EditorStringOptions
  ) => string;

  subscribe: <V extends Value>(
    editor: AnyEditor<V>,
    listener: SnapshotListener<V>
  ) => () => void;

  subscribeCommit: <V extends Value>(
    editor: AnyEditor<V>,
    listener: EditorCommitListener<V>
  ) => () => void;

  subscribeSource: <V extends Value>(
    editor: AnyEditor<V>,
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) => () => void;

  update: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions>,
      context: EditorUpdateContext<Editor<V, TExtensions>>
    ) => void
  ) => void;

  /**
   * Convert a range into a non-hanging one.
   */
  unhangRange: (
    editor: AnyEditor,
    range: Range,
    options?: EditorUnhangRangeOptions
  ) => Range;

  /**
   * Match a void node in the current branch of the editor.
   */
  void: (
    editor: AnyEditor,
    options?: EditorVoidOptions
  ) => NodeEntry<Element> | undefined;

  /**
   *  Call a function, Determine whether or not remove the previous node when merge.
   */
  shouldMergeNodesRemovePrevNode: (
    editor: AnyEditor,
    prevNodeEntry: NodeEntry,
    curNodeEntry: NodeEntry
  ) => boolean;
}

type EditorInternalApiTable = EditorStaticApi & {
  defineCommand: typeof defineEditorCommand;
};

const getImplicitSelectionRoot = (editor: AnyEditor) =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

const getWriteRoot = (
  editor: AnyEditor,
  at: Location | NodeSelection | undefined
) =>
  at === undefined
    ? getImplicitSelectionRoot(editor)
    : SelectionApi.isNode(at)
      ? (at.root ?? MAIN_ROOT_KEY)
      : getLocationRoot(at);

const isPathLocation = (
  value: Location | NodeSelection | undefined
): value is Path =>
  Array.isArray(value) && value.every((segment) => Number.isInteger(segment));

const runRootedInternalWrite = <T>(
  editor: AnyEditor,
  fn: () => T,
  root?: string
): T =>
  root
    ? withEditorUpdateRoot(editor, root, () =>
        withEditorUpdateRootChildren(editor, root, fn)
      )
    : fn();

const runInternalEditorWrite = <T>(
  editor: AnyEditor,
  fn: (owner: AnyEditor) => T,
  root?: string
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const runRooted = <TReturn>(callback: () => TReturn) =>
    runRootedInternalWrite(owner, callback, root);

  if (isInTransaction(owner)) {
    return runRooted(() => fn(owner));
  }

  let result!: T;

  const runUpdate = () => {
    editor.update(() => {
      result = fn(owner);
    });
  };

  runRooted(runUpdate);

  return result;
};

const runInternalEditorWriteSkipNormalize = <T>(
  editor: AnyEditor,
  fn: (owner: AnyEditor) => T,
  root?: string
): T => {
  const owner = getEditorRuntimeOwner(editor);

  if (isInTransaction(owner)) {
    return runRootedInternalWrite(owner, () => fn(owner), root);
  }

  let result!: T;

  runRootedInternalWrite(
    owner,
    () => {
      getEditorRuntime(editor).update(
        () => {
          result = fn(owner);
        },
        { skipCorrections: true }
      );
    },
    root
  );

  return result;
};

const isEditorView = (
  editor: AnyEditor | EditorView<any, any>
): editor is EditorView => Object.hasOwn(editor, 'root');

const replaceEditorSnapshot = (
  editor: AnyEditor | EditorView<any, any>,
  input: SnapshotInput
) => {
  if (isEditorView(editor)) {
    getEditorRuntime(editor).update((tx) => {
      tx.value.replace(input);
    });
    return;
  }

  replaceSnapshot(editor, input);
};

const editorInternalApi: EditorInternalApiTable = {
  above: ((editor: AnyEditor, options?: EditorAboveOptions<Ancestor>) =>
    getEditorRuntime(editor).above(options)) as EditorStaticApi['above'],

  addMark(editor, key, value) {
    executeAddMarkCommand(editor, key, value);
  },

  after(editor, at, options) {
    return getEditorRuntime(editor).after(at, options);
  },

  before(editor, at, options) {
    return getEditorRuntime(editor).before(at, options);
  },

  deleteBackward(editor, options = {}) {
    const { unit = 'character' } = options;
    executeDeleteBackwardCommand(editor, unit);
  },

  deleteForward(editor, options = {}) {
    const { unit = 'character' } = options;
    executeDeleteForwardCommand(editor, unit);
  },

  deleteFragment(editor, options) {
    executeDeleteFragmentCommand(editor, options);
  },

  delete(editor, options) {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeDeleteText(owner, options);
      },
      getWriteRoot(editor, options?.at)
    );
  },

  collapse(editor, options) {
    dispatchCommand(editor, editorCommands.collapse, {
      options,
    });
  },

  deselect(editor) {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeDeselect(owner);
      },
      getImplicitSelectionRoot(editor)
    );
  },

  edges(editor, at) {
    return getEditorRuntime(editor).edges(at);
  },

  elementReadOnly(
    editor: AnyEditor,
    options: EditorElementReadOnlyOptions = {}
  ) {
    return getEditorRuntime(editor).elementReadOnly(options);
  },

  first(editor, at) {
    return getEditorRuntime(editor).first(at);
  },

  fragment<V extends Value>(editor: Editor<V>, at: Location) {
    return getEditorRuntime(editor).fragment(at) as Array<DescendantIn<V>>;
  },

  getFragment(editor) {
    return editor.read((state) => state.fragment());
  },

  getChildren(editor) {
    return getEditorRuntime(editor).getChildren();
  },

  getLastCommit<V extends Value>(editor: Editor<V>) {
    return getEditorRuntime<V>(editor).getLastCommit();
  },

  getCollabEffects(editor, commit) {
    return getEditorCollabEffects(editor, commit);
  },

  getExtensionRegistry(editor) {
    return getEditorExtensionRegistry(editor);
  },

  getSnapshot(editor) {
    return getEditorRuntime(editor).getSnapshot();
  },

  getPathByNodeKey(editor, nodeKey) {
    return getEditorRuntime(editor).getPathByNodeKey(nodeKey);
  },

  getNodeKey(editor, path) {
    return getEditorRuntime(editor).getNodeKey(path);
  },

  read(editor, fn) {
    return editor.read(fn);
  },

  getSelection(editor) {
    return getEditorRuntime(editor).getSelection();
  },

  hasBlocks(editor, element) {
    return getEditorRuntime(editor).hasBlocks(element);
  },

  hasInlines(editor, element) {
    return getEditorRuntime(editor).hasInlines(element);
  },

  hasPath(editor, path) {
    return getEditorRuntime(editor).hasPath(path);
  },

  hasTexts(editor, element) {
    return getEditorRuntime(editor).hasTexts(element);
  },

  insertBreak(editor) {
    executeInsertBreakCommand(editor);
  },

  insertNode: ((
    editor: AnyEditor,
    node: Descendant,
    options?: NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>
  ) => {
    dispatchCommand(editor, editorCommands.insertNodes, {
      nodes: node,
      options,
    });
  }) as EditorStaticApi['insertNode'],

  insertNodes: ((
    editor: AnyEditor,
    nodes: Descendant | readonly Descendant[],
    options?: NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>
  ) => {
    dispatchCommand(editor, editorCommands.insertNodes, {
      nodes,
      options,
    });
  }) as EditorStaticApi['insertNodes'],

  insertSoftBreak(editor) {
    executeInsertSoftBreakCommand(editor);
  },

  insertText(editor, text, options) {
    executeInsertTextCommand(editor, text, options);
  },

  isBlock(editor, value) {
    return getEditorRuntime(editor).isBlock(value);
  },

  isEdge(editor, point, at) {
    return getEditorRuntime(editor).isEdge(point, at);
  },

  isEditor(value, options) {
    return isEditorValue(value, options);
  },

  isElementReadOnly(editor, element) {
    return getEditorSchema(editor).isReadOnly(element);
  },

  isEmpty(editor, element) {
    return getEditorRuntime(editor).isEmpty(element);
  },

  isEnd(editor, point, at) {
    return getEditorRuntime(editor).isEnd(point, at);
  },

  isInline(editor, value) {
    return getEditorSchema(editor).isInline(value);
  },

  isSelectable(editor, value) {
    return isEditorNodeSelectable(editor, value);
  },

  isStart(editor, point, at) {
    return getEditorRuntime(editor).isStart(point, at);
  },

  isVoid(editor, value) {
    return getEditorSchema(editor).isVoid(value);
  },

  last(editor, at, options) {
    return getEditorRuntime(editor).last(at, options);
  },

  leaf(editor, at, options) {
    return getEditorRuntime(editor).leaf(at, options);
  },

  liftNodes: ((editor: AnyEditor, options?: NodeLiftNodesOptions) => {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeLiftNodes(owner, options);
      },
      getWriteRoot(editor, options?.at)
    );
  }) as EditorStaticApi['liftNodes'],

  levels: ((editor: AnyEditor, options?: EditorLevelsOptions<Node>) =>
    getEditorRuntime(editor).levels(options)) as EditorStaticApi['levels'],

  next: ((editor: AnyEditor, options?: EditorNextOptions<Descendant>) =>
    getEditorRuntime(editor).next(options)) as EditorStaticApi['next'],

  mergeNodes: ((editor: AnyEditor, options?: NodeMergeNodesOptions) => {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeMergeNodes(owner, options);
      },
      getWriteRoot(editor, options?.at)
    );
  }) as EditorStaticApi['mergeNodes'],

  move(editor, options) {
    executeMoveCommand(editor, options);
  },

  moveNodes: ((editor: AnyEditor, options: NodeMoveNodesOptions) => {
    if (isPathLocation(options.at) && options.at.length === 1) {
      runInternalEditorWriteSkipNormalize(
        editor,
        (owner) => {
          executeMoveNodes(owner, options);
        },
        getWriteRoot(editor, options.at)
      );
      return;
    }

    runInternalEditorWrite(
      editor,
      (owner) => {
        executeMoveNodes(owner, options);
      },
      getWriteRoot(editor, options.at)
    );
  }) as EditorStaticApi['moveNodes'],

  parent: ((editor: AnyEditor, at: Location, options?: EditorParentOptions) =>
    getEditorRuntime(editor).parent(
      at,
      options as EditorParentOptions<Ancestor, undefined> | undefined
    )) as EditorStaticApi['parent'],

  path(editor, at, options) {
    return getEditorRuntime(editor).path(at, options);
  },

  point(editor, at, options) {
    return getEditorRuntime(editor).point(at, options);
  },

  projectRange(editor, range) {
    return getEditorRuntime(editor).projectRange(range);
  },

  positions(editor, options) {
    return getEditorRuntime(editor).positions(options);
  },

  previous: ((editor: AnyEditor, options?: EditorPreviousOptions<Node>) =>
    getEditorRuntime(editor).previous(options)) as EditorStaticApi['previous'],

  range(editor, at, to) {
    return getEditorRuntime(editor).range(at, to);
  },

  defineCommand: defineEditorCommand,

  install(editor, extension, options) {
    return editor.install(extension, options);
  },

  replace(editor, input) {
    replaceEditorSnapshot(editor as never, input);
  },

  reset(editor, input) {
    replaceEditorSnapshot(editor as never, input);
  },

  removeMark(editor, key) {
    executeRemoveMarkCommand(editor, key);
  },

  removeNodes: ((editor: AnyEditor, options?: NodeRemoveNodesOptions) => {
    dispatchCommand(editor, editorCommands.removeNodes, {
      options,
    });
  }) as EditorStaticApi['removeNodes'],

  replaceChildren(editor, children, options) {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeReplaceChildren(owner, children, options);
      },
      getWriteRoot(editor, options.at)
    );
  },

  select(editor, target) {
    dispatchCommand(editor, editorCommands.select, {
      target,
    });
  },

  setPoint(editor, props, options) {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeSetPoint(owner, props, options);
      },
      getImplicitSelectionRoot(editor)
    );
  },

  setNodes: ((
    editor: AnyEditor,
    props: Partial<Node>,
    options?: NodeSetNodesOptions
  ) => {
    dispatchCommand(editor, editorCommands.setNodes, {
      options,
      props: props as Partial<NodeProps>,
    });
  }) as EditorStaticApi['setNodes'],

  setSelection(editor, props) {
    dispatchCommand(editor, editorCommands.setSelection, {
      props,
    });
  },

  splitNodes: ((editor: AnyEditor, options?: NodeSplitNodesOptions) => {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeSplitNodes(owner, options);
      },
      getWriteRoot(editor, options?.at)
    );
  }) as EditorStaticApi['splitNodes'],

  toggleMark(editor, key, value, options) {
    const nextValue = value === undefined ? true : value;
    executeToggleMarkCommand(editor, key, nextValue, options);
  },

  toggleBlock(editor, props, options) {
    dispatchCommand(editor, editorCommands.toggleBlock, {
      options,
      props,
    });
  },

  unsetNodes: ((
    editor: AnyEditor,
    props: string | readonly string[],
    options?: NodeUnsetNodesOptions
  ) => {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeUnsetNodes(owner, props, options);
      },
      getWriteRoot(editor, options?.at)
    );
  }) as EditorStaticApi['unsetNodes'],

  unwrapNodes: ((editor: AnyEditor, options?: NodeUnwrapNodesOptions) => {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeUnwrapNodes(owner, options);
      },
      getWriteRoot(editor, options?.at)
    );
  }) as EditorStaticApi['unwrapNodes'],

  wrapNodes: ((
    editor: AnyEditor,
    element: Element,
    options?: NodeWrapNodesOptions
  ) => {
    runInternalEditorWrite(
      editor,
      (owner) => {
        executeWrapNodes(owner, element, options);
      },
      getWriteRoot(editor, options?.at)
    );
  }) as EditorStaticApi['wrapNodes'],

  string(editor, at, options) {
    return getEditorRuntime(editor).string(at, options);
  },

  subscribe(editor, listener) {
    return editor.subscribe(listener);
  },

  subscribeCommit(editor, listener) {
    return editor.subscribeCommit(listener);
  },

  subscribeSource<V extends Value>(
    editor: Editor<V>,
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) {
    return getEditorRuntime<V>(editor).subscribeSource(source, listener);
  },

  update(editor, fn) {
    editor.update(fn);
  },

  unhangRange(editor, range, options) {
    return getEditorRuntime(editor).unhangRange(range, options);
  },

  void(editor, options) {
    return getEditorRuntime(editor).void(options);
  },

  shouldMergeNodesRemovePrevNode: (editor, previousNode, curNode) =>
    getEditorRuntime(editor).shouldMergeNodesRemovePrevNode(
      previousNode,
      curNode
    ),
};

const {
  above,
  addMark,
  after,
  before,
  deleteBackward,
  deleteForward,
  deleteFragment,
  collapse,
  deselect,
  edges,
  elementReadOnly,
  first,
  fragment,
  getFragment,
  getChildren,
  getLastCommit,
  getCollabEffects,
  getExtensionRegistry,
  getSnapshot,
  getPathByNodeKey,
  getNodeKey,
  read,
  getSelection,
  hasBlocks,
  hasInlines,
  hasPath,
  hasTexts,
  insertBreak,
  insertNode,
  insertNodes,
  insertSoftBreak,
  insertText,
  isBlock,
  isEdge,
  isEditor,
  isElementReadOnly,
  isEmpty,
  isEnd,
  isInline,
  isSelectable,
  isStart,
  isVoid,
  last,
  leaf,
  liftNodes,
  levels,
  next,
  mergeNodes,
  move,
  moveNodes,
  parent,
  path,
  point,
  projectRange,
  positions,
  previous,
  range,
  defineCommand,
  install,
  replace,
  reset,
  removeMark,
  removeNodes,
  replaceChildren,
  select,
  setPoint,
  setNodes,
  setSelection,
  splitNodes,
  toggleBlock,
  toggleMark,
  unwrapNodes,
  unsetNodes,
  wrapNodes,
  string,
  subscribe,
  subscribeCommit,
  subscribeSource,
  update,
  unhangRange,
  shouldMergeNodesRemovePrevNode,
} = editorInternalApi;

const deleteEditor = editorInternalApi.delete;
const voidEditor = editorInternalApi.void;

export {
  above,
  addMark,
  after,
  before,
  collapse,
  defineCommand,
  deleteEditor as delete,
  deleteBackward,
  deleteForward,
  deleteFragment,
  deselect,
  edges,
  elementReadOnly,
  first,
  fragment,
  getChildren,
  getCollabEffects,
  getExtensionRegistry,
  getFragment,
  getLastCommit,
  getNodeKey,
  getPathByNodeKey,
  getSelection,
  getSnapshot,
  hasBlocks,
  hasInlines,
  hasPath,
  hasTexts,
  insertBreak,
  insertNode,
  insertNodes,
  insertSoftBreak,
  insertText,
  install,
  isBlock,
  isEdge,
  isEditor,
  isElementReadOnly,
  isEmpty,
  isEnd,
  isInline,
  isSelectable,
  isStart,
  isVoid,
  last,
  leaf,
  levels,
  liftNodes,
  mergeNodes,
  move,
  moveNodes,
  next,
  parent,
  path,
  point,
  positions,
  previous,
  projectRange,
  range,
  read,
  removeMark,
  removeNodes,
  replace,
  replaceChildren,
  reset,
  select,
  setNodes,
  setPoint,
  setSelection,
  shouldMergeNodesRemovePrevNode,
  splitNodes,
  string,
  subscribe,
  subscribeCommit,
  subscribeSource,
  toggleBlock,
  toggleMark,
  unhangRange,
  unsetNodes,
  unwrapNodes,
  update,
  voidEditor as void,
  wrapNodes,
};

export type PropsCompare = (prop: unknown, node: unknown) => boolean;
export type PropsMerge = (prop: unknown, node: unknown) => unknown;
