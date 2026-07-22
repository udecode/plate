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
import { defineCommand as defineEditorCommand } from '../core/command-definition';
import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import type { Anchor, AnchorOptions, AnchorValue } from '../core/anchor';
import {
  defineEditorExtension as defineEditorExtensionCore,
  extendEditor as extendEditorCore,
} from '../core/editor-extension';
import type { DocumentChange } from '../core/document-change';
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
import { isEditorNodeSelectable } from '../core/query-middleware';
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
import { move as executeMoveCommand } from '../transforms-selection/move';
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
import { deleteText as executeDeleteText } from '../transforms-text/delete-text';
import { getLocationRoot } from '../internal/root-location';
import type {
  LeafEdge,
  MaximizeMode,
  RangeMode,
  SelectionMode,
  TextDirection,
  TextUnit,
  TextUnitAdjustment,
} from '../types/types';
import type { TxOnlyMethod } from '../core/tx-only';
import type { PropertyPolicy } from './schema';
import type {
  BlockDuplicateOptions,
  NodeInsertNodesOptions,
  NodeRemoveNodesOptions,
  NodeDuplicateOptions,
  NodeMutationMethods,
  NodeReplaceChildrenOptions,
  NodeSetNodesOptions,
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
import type { NodeMatch } from './node';
import type { EditorSelection, Selection } from './selection';
import type {
  EditorSchemaDeclaration,
  EditorSchemaDelta,
  EditorSchemaElement,
  EditorSchemaIdentity,
  EditorSchemaProperty,
  EditorSchemaPropertyQuery,
  EditorSchemaSource,
  SchemaElementFor,
  SchemaElementHandle,
  SchemaElementPropertiesFor,
  SchemaElementPropertyHandle,
  SchemaElementPropertyValue,
  SchemaElementTypes,
  SchemaDescendantInValue,
  SchemaValueFromExtensions,
} from './schema';

export type { Selection } from './selection';

/**
 * The `Editor` interface exposes the runtime API of a Plite editor. Document
 * state is read through editor methods and mutated through `editor.update`.
 */
export type Value = Element[];

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

export type RootKey = string;

/** A named secondary root. Literal `main` is never a public root argument. */
export type NamedRootKey<TRoot extends RootKey = RootKey> = TRoot extends 'main'
  ? never
  : TRoot;

export type EditorDocumentValue<V extends Value = Value> = {
  children: V;
  meta?: Record<string, unknown>;
  roots?: Record<RootKey, V>;
};

/** Schema-owned structural document content, excluding state-field metadata. */
export type EditorSchemaDocumentValue<V extends Value = Value> = {
  children: V;
  roots?: Record<RootKey, V>;
};

export type InitialValue<V extends Value = Value> =
  | V
  | {
      children: V;
      meta?: Record<string, unknown>;
      roots?: Record<RootKey, V>;
    };

/** A document location or a live node whose current location should be used. */
export type NodeTarget<N extends Descendant = Descendant> = Location | N;

export type EditorReplaceChildrenOptions = Omit<
  NodeReplaceChildrenOptions,
  'at'
> & {
  at: Element | Path;
};

/** Options for replacing exactly one node with zero or more nodes. */
export type EditorReplaceNodeOptions = {
  at: Descendant | Path;
  select?: boolean;
};

type TargetDescendant<T extends Node> = Extract<T, Descendant>;

type WithNodeTarget<
  TOptions extends { at?: Location },
  TNode extends Descendant = Descendant,
> = Omit<TOptions, 'at'> & {
  at?: NodeTarget<TNode>;
};

type WithNodeTargetOrSpan<
  TOptions extends { at?: Location | Span },
  TNode extends Descendant = Descendant,
> = Omit<TOptions, 'at'> & {
  at?: NodeTarget<TNode> | Span;
};

export type EditorNodesReadOptions<T extends Node> = WithNodeTargetOrSpan<
  EditorNodesOptions<T>,
  TargetDescendant<T>
>;

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

export type EditorStateField<TValue = unknown> = EditorExtension<
  Editor,
  StateFieldDescriptor<TValue>
> &
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
  collabSnapshot?: (state: EditorStateView) => TValue | undefined;
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
    dependencies: readonly EditorFacetDependency<TRoot>[];
  }>;

export type EditorFacetProvider<TInput = any> = Readonly<{
  compute?: (state: EditorStateView) => TInput;
  dependencies?: readonly EditorFacetDependency[];
  facet: EditorFacet<TInput, any>;
  value?: TInput;
}>;

export type EditorFacet<TInput, TOutput = readonly TInput[]> = Readonly<{
  combine: (inputs: readonly TInput[]) => TOutput;
  compare: (left: TOutput, right: TOutput) => boolean;
  compareInput: (left: TInput, right: TInput) => boolean;
  compute: <const TRoot extends RootKey>(
    compute: (state: EditorStateView) => TInput,
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
  reconfigure: <const TInput extends EditorExtensionInput>(
    slot: EditorExtensionSlotLike,
    input: TInput,
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

export type EditorStateValueApi<V extends Value = Value> =
  () => EditorDocumentValue<V>;

export type SnapshotSelectionInput = Selection | 'end' | 'start';

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

export type EditorSelectionBlockOptions = EditorSelectionTargetOptions & {
  match?: NodeMatch<Element>;
};

export type EditorStateSelectionApi = (() => Selection) & {
  contains: (target: NodeTarget) => boolean;
  domRange: () => Range | null;
  intersects: (target: NodeTarget) => boolean;
  isAcrossBlocks: (options?: EditorSelectionBlockOptions) => boolean;
  isAtBlockEnd: (options?: EditorSelectionBlockOptions) => boolean;
  isAtBlockStart: (options?: EditorSelectionBlockOptions) => boolean;
  isCollapsed: () => boolean;
  isExpanded: () => boolean;
  isWithinBlock: (options?: EditorSelectionBlockOptions) => boolean;
  isWithinText: (options?: EditorSelectionTargetOptions) => boolean;
  ranges: () => readonly Range[];
  replacementRange: () => Range | null;
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
) => DescendantIn<V>[];

export type EditorSliceReadOptions = Readonly<{
  at?: Range;
}>;

export type EditorStateSliceApi<V extends Value = Value> = {
  /** Build an atomic replacement transaction without publishing it. */
  fit: (
    slice: ContentSlice<V>,
    options?: WithNodeTarget<TextInsertFragmentOptions, DescendantIn<V>>
  ) => false | TransactionSpec;
  /** Fit immutable slice content against one detached parent without publishing. */
  fitContent: <TRoot extends RootKey>(
    slice: ContentSlice<V>,
    options: Readonly<{
      parent: ElementIn<V>;
      /** Named secondary-root context. Omit for the primary root. */
      root?: NamedRootKey<TRoot>;
    }>
  ) => readonly DescendantIn<V>[] | null;
  /** Read one immutable slice with structural openness preserved. */
  get: (options?: EditorSliceReadOptions) => ContentSlice<V>;
};

export type EditorTransactionSelectionApi = EditorStateSelectionApi & {
  clear: () => void;
  collapse: (options?: SelectionCollapseOptions) => void;
  move: (options?: SelectionMoveOptions) => void;
  set: (target: EditorSelection | Location | null) => void;
  setPoint: (props: Partial<Point>, options?: SelectionSetPointOptions) => void;
  setRange: (props: Partial<Range>) => void;
};

/** A mapped location whose lifetime is limited to one transaction callback. */
export type EditorTransactionDraftRef<TValue extends Path | Point> = Readonly<{
  resolve: () => TValue | null;
}>;

export type EditorTransactionRefsApi = {
  path: <const TRoot extends RootKey>(
    path: Path,
    options: AnchorOptions<Path, TRoot>
  ) => EditorTransactionDraftRef<Path>;
  point: <const TRoot extends RootKey>(
    point: Point,
    options: AnchorOptions<Point, TRoot>
  ) => EditorTransactionDraftRef<Point>;
};

export type EditorStateMarksApi<V extends Value = Value> =
  () => EditorMarks<V> | null;

export type EditorMarkToggleOptions = {
  clear?: string[] | string;
};

export type EditorToggleMarkOptions = EditorMarkToggleOptions & {
  /** Collapse the resulting selection in the same command commit. */
  collapse?: boolean | SelectionCollapseOptions;
};

export type EditorBlockToggleOptions<T extends Descendant = Descendant> = {
  at?: NodeTarget<T>;
  compare?: PropsCompare;
  defaultType?: string;
  hanging?: boolean;
  merge?: PropsMerge;
  mode?: MaximizeMode;
  someOptions?: Omit<EditorNodesReadOptions<Node>, 'at'>;
  split?: boolean;
  voids?: boolean;
  wrap?: boolean;
};

export type EditorToggleBlockOptions<T extends Descendant = Descendant> =
  EditorBlockToggleOptions<T> & {
    /** Collapse the resulting selection in the same command commit. */
    collapse?: boolean | SelectionCollapseOptions;
  };

export type EditorTransactionMarksApi<V extends Value = Value> =
  EditorStateMarksApi<V> & {
    add: (key: string, value: unknown) => void;
    remove: (key: string) => void;
    set: (marks: EditorMarks<V> | null) => void;
    toggle: (
      key: string,
      value?: unknown,
      options?: EditorMarkToggleOptions
    ) => void;
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
  above: <T extends Ancestor = ValueElement<V>>(
    options?: WithNodeTarget<EditorAboveOptions<T>, TargetDescendant<T>>
  ) => NodeEntry<T> | undefined;
  block: <T extends Element = ValueElement<V>>(
    options?: WithNodeTarget<EditorBlockOptions<T>, T>
  ) => NodeEntry<T> | undefined;
  children: (at?: NodeTarget) => readonly ValueDescendant<V>[];
  elementReadOnly: (
    options?: WithNodeTarget<EditorElementReadOnlyOptions>
  ) => NodeEntry<Element> | undefined;
  first: (at: NodeTarget) => NodeEntry | undefined;
  get: <T extends Node = ValueNode<V>>(
    at: NodeTarget<TargetDescendant<T>>
  ) => NodeEntry<T> | undefined;
  hasBlocks: (element: Element) => boolean;
  hasInlines: (element: Element) => boolean;
  hasPath: (path: Path) => boolean;
  hasTexts: (element: Element) => boolean;
  isBlock: (element: Node) => boolean;
  isSelectable: (element: Node) => boolean;
  isEmpty: (element: Element) => boolean;
  last: (at: NodeTarget, options?: EditorLastOptions) => NodeEntry | undefined;
  leaf: (
    at: NodeTarget<Text>,
    options?: EditorLeafOptions
  ) => NodeEntry<ValueText<V>> | undefined;
  levels: <T extends Node = ValueNode<V>>(
    options?: WithNodeTarget<EditorLevelsOptions<T>, TargetDescendant<T>>
  ) => Generator<NodeEntry<T>, void, undefined>;
  path: (at: NodeTarget, options?: EditorPathOptions) => Path | undefined;
  entries: <T extends Node = ValueNode<V>>(
    options?: EditorNodesReadOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>;
  find: <T extends Node = ValueNode<V>>(
    options?: EditorNodesReadOptions<T>
  ) => NodeEntry<T> | undefined;
  some: <T extends Node>(options?: EditorNodesReadOptions<T>) => boolean;
  toArray: {
    <T extends Node = ValueNode<V>>(
      options?: EditorNodesReadOptions<T>
    ): NodeEntry<T>[];
    <T extends Node, R>(
      options: EditorNodesReadOptions<T> | undefined,
      map: (entry: NodeEntry<T>) => R
    ): R[];
  };
  next: <T extends Descendant = ValueDescendant<V>>(
    options?: WithNodeTarget<EditorNextOptions<T>, T>
  ) => NodeEntry<T> | undefined;
  parent: <T extends Ancestor = ValueElement<V>>(
    at: NodeTarget,
    options?: EditorParentOptions
  ) => NodeEntry<T> | undefined;
  previous: <T extends Node = ValueNode<V>>(
    options?: WithNodeTarget<EditorPreviousOptions<T>, TargetDescendant<T>>
  ) => NodeEntry<T> | undefined;
  shouldMergeNodesRemovePrevNode: (
    previous: NodeEntry,
    current: NodeEntry
  ) => boolean;
  void: (
    options?: WithNodeTarget<EditorVoidOptions>
  ) => NodeEntry<Element> | undefined;
};

export type EditorTransactionNodesApi<V extends Value = Value> =
  EditorStateNodesApi<V> & {
    duplicate: <T extends ElementOrTextIn<V>>(
      entries: readonly NodeEntry<T>[],
      options?: NodeDuplicateOptions<T>
    ) => void;
    insert: <T extends ElementOrTextIn<V>>(
      nodes: T | T[],
      options?: WithNodeTarget<NodeInsertNodesOptions<T>, T>
    ) => void;
    lift: <T extends NodeIn<V>>(options?: {
      at?: NodeTarget<TargetDescendant<T>>;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      voids?: boolean;
    }) => void;
    merge: <T extends NodeIn<V>>(options?: {
      at?: NodeTarget<TargetDescendant<T>>;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    }) => void;
    move: <T extends NodeIn<V>>(options: {
      at?: NodeTarget<TargetDescendant<T>>;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      to: Path;
      voids?: boolean;
    }) => void;
    remove: <T extends NodeIn<V>>(options?: {
      at?: NodeTarget<TargetDescendant<T>>;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      hanging?: boolean;
      voids?: boolean;
    }) => void;
    replace: <T extends ElementOrTextIn<V>>(
      nodes: T | T[],
      options: EditorReplaceNodeOptions
    ) => void;
    replaceChildren: <T extends ElementOrTextIn<V>>(
      children: T[],
      options: EditorReplaceChildrenOptions
    ) => void;
    set: {
      <T extends Descendant>(
        props: Partial<NodeProps<NoInfer<T>>>,
        options: Omit<NodeSetNodesOptions<T>, 'at'> & { at: T }
      ): void;
      (
        props: Partial<Omit<Element, 'children'>>,
        options?: NodeSetNodesOptions<Element>
      ): void;
      <T extends NodeIn<V>>(
        props: Partial<NodeProps<T>>,
        options?: NodeSetNodesOptions<T>
      ): void;
    };
    split: <T extends NodeIn<V>>(options?: {
      at?: NodeTarget<TargetDescendant<T>>;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      always?: boolean;
      height?: number;
      position?: number;
      voids?: boolean;
    }) => void;
    toggle: (
      type: string,
      options?: EditorBlockToggleOptions<DescendantIn<V>>
    ) => void;
    unset: <T extends NodeIn<V>>(
      props: string | string[],
      options?: {
        at?: NodeTarget<TargetDescendant<T>>;
        match?: NodeMatch<T>;
        mode?: MaximizeMode;
        hanging?: boolean;
        split?: boolean;
        voids?: boolean;
      }
    ) => void;
    unwrap: <T extends NodeIn<V>>(options?: {
      at?: NodeTarget<TargetDescendant<T>>;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    }) => void;
    wrap: <T extends NodeIn<V>, E extends ElementIn<V>>(
      element: E,
      options?: {
        at?: NodeTarget<TargetDescendant<T>>;
        match?: NodeMatch<T>;
        mode?: MaximizeMode;
        split?: boolean;
        voids?: boolean;
      }
    ) => void;
  };

export type EditorBlockResetOptions<T extends Element = Element> =
  EditorBlockOptions<T> & {
    preserve?: readonly string[];
  };

export type EditorTransactionBlocksApi<V extends Value = Value> = {
  duplicate: (
    options?: WithNodeTarget<BlockDuplicateOptions<ElementIn<V>>, ElementIn<V>>
  ) => void;
  /** Insert block nodes after the block containing the target. */
  insertAfter: <T extends ElementIn<V>>(
    nodes: T | T[],
    options?: WithNodeTarget<NodeInsertNodesOptions<T>>
  ) => void;
  lift: EditorTransactionNodesApi<V>['lift'];
  reset: <T extends ElementIn<V>>(
    props: Partial<NodeProps<T>>,
    options?: WithNodeTarget<EditorBlockResetOptions<T>, T>
  ) => void;
  toggle: EditorTransactionNodesApi<V>['toggle'];
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
  edges: (at: NodeTarget) => [Point, Point] | undefined;
  fromEntries: (entries: readonly NodeEntry[]) => Range | undefined;
  get: (at: NodeTarget, to?: Location) => Range | undefined;
  project: (range: Range) => readonly ProjectedRangeSegment[];
  unhang: (range: Range, options?: EditorUnhangRangeOptions) => Range;
};

export type EditorStateTextApi = {
  /** Return text at a target, or at the current selection when omitted. */
  string: (at?: NodeTarget, options?: EditorStringOptions) => string;
};

export type EditorTransactionFragmentApi<V extends Value = Value> =
  EditorStateFragmentApi<V> & {
    delete: (
      options?: WithNodeTarget<EditorFragmentDeletionOptions, DescendantIn<V>>
    ) => void;
    /** Fit and replace known-closed content as one canonical closed slice. */
    replace: (
      content: readonly DescendantIn<V>[],
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
    slice: ContentSlice<V>,
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

export type EditorSchemaCreateAndFill = {
  <
    TSchema extends EditorSchemaSource,
    TType extends SchemaElementTypes<TSchema>,
  >(
    element: SchemaElementHandle<TSchema, TType>,
    properties?: SchemaElementPropertiesFor<TSchema, TType>
  ): SchemaElementFor<TSchema, TType>;
  (type: string, properties?: Readonly<Record<string, unknown>>): Element;
};

export type EditorSchemaGetElementProperty = {
  <
    TSchema extends EditorSchemaSource,
    TType extends SchemaElementTypes<TSchema>,
    TKey extends import('./schema').SchemaElementPropertyKeys<TSchema, TType>,
  >(
    element: Element,
    property: SchemaElementPropertyHandle<TSchema, TType, TKey>
  ): SchemaElementPropertyValue<TSchema, TType, TKey> | undefined;
  <T = unknown>(element: Element, property: string): T | undefined;
};

/** Stable compiled property identity for descriptor and host integrations. */
export type EditorSchemaPropertyHandle = Readonly<{
  id: string;
  kind: 'schema-property';
}>;

export type EditorSchemaGetProperty = {
  (property: EditorSchemaPropertyHandle): EditorSchemaProperty | null;
  <
    TSchema extends EditorSchemaSource,
    TType extends SchemaElementTypes<TSchema>,
    TKey extends import('./schema').SchemaElementPropertyKeys<TSchema, TType>,
  >(
    property: SchemaElementPropertyHandle<TSchema, TType, TKey>
  ): EditorSchemaProperty | null;
  <const TQuery extends EditorSchemaPropertyQuery>(
    query: TQuery & WithoutInternalPrimaryRoot<TQuery>
  ): EditorSchemaProperty | null;
};

export type EditorStateSchemaApi<V extends Value = Value> = {
  /** Whether one child element type is accepted directly by one parent type. */
  allowsElementType: (parentType: string, childType: string) => boolean;
  createAndFill: EditorSchemaCreateAndFill;
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
  getElementProperty: EditorSchemaGetElementProperty;
  /** Compiled open-slice boundary behavior for one element. */
  getElementSlicePolicy: (element: Element) => EditorElementSlicePolicy;
  /** Return the immutable compiled schema vocabulary. */
  getVocabulary: () => EditorSchemaVocabulary;
  /** Whether the schema declares any element-owned document roots. */
  hasContentRoots: () => boolean;
  /** Stable persisted identity, or `null` for an open raw editor. */
  identity: () => EditorSchemaIdentity | null;
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
  markableVoid: (element: Node) => boolean;
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
  validateDocument: (value: EditorDocumentValue) => void;
  /**
   * Validate an external fragment against the compiled schema.
   *
   * Throws `EditorSchemaValidationError` with immutable path/property
   * diagnostics on failure.
   */
  validateFragment: (children: readonly Descendant[]) => void;
};

/** Immutable open document content carried across host and insertion boundaries. */
export type ContentSlice<V extends Value = Value> = Readonly<{
  content: readonly DescendantIn<V>[];
  openEnd: number;
  openStart: number;
}>;

export type EditorStateRuntimeApi<V extends Value = Value> = {
  idAt: (path: Path) => RuntimeId | null;
  pathOf: (runtimeId: RuntimeId) => Path | null;
  snapshot: () => EditorSnapshot<V>;
};

export type EditorElementBehavior = {
  atom: boolean;
  editableIsland: boolean;
  inline: boolean;
  isolating: boolean;
  keyboardSelectable: boolean;
  markableVoid: boolean;
  readOnly: boolean;
  selectable: boolean;
  void: boolean;
};

export type EditorElementSlicePolicy = Readonly<{
  preserveContext: boolean;
  replaceWhenCovered: boolean;
}>;

declare const EDITOR_EXTENSION_TYPES: unique symbol;

export type EditorCoreStateView<V extends Value = Value> = {
  /**
   * Read the primary document children without cloning the full serializable
   * document value. Treat the returned nodes as read-only live state.
   */
  children: () => readonly [...V];
  facet: <TOutput>(facet: EditorFacet<any, TOutput>) => TOutput;
  fragment: EditorStateFragmentApi<V>;
  getField: <TValue>(field: EditorStateField<TValue>) => TValue;
  lastCommit: () => EditorCommit<V> | null;
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
  ) => readonly V[number][];
  runtime: EditorStateRuntimeApi<V>;
  schema: EditorStateSchemaApi<V>;
  selection: EditorStateSelectionApi;
  slice: EditorStateSliceApi<V>;
  text: EditorStateTextApi;
  value: EditorStateValueApi<V>;
  view: EditorStateViewApi;
};

export type EditorStateView<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreStateView<V> &
  EditorInstalledStateGroups<V, TExtensions> & {
    /**
     * Build an immutable transaction without mutating or publishing editor
     * state. An empty spec represents an intentionally handled no-op.
     */
    transaction: BivariantFunction<
      (
        fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void
      ) => TransactionSpec
    > & {
      /** Continue building from a delegated spec without publishing either step. */
      extend: BivariantFunction<
        (
          base: TransactionSpec,
          fn: (
            transaction: EditorTransactionSpecBuilder<V, TExtensions>
          ) => void
        ) => TransactionSpec
      >;
    };
  };

export type EditorCoreUpdateTransaction<V extends Value = Value> = Omit<
  EditorCoreStateView<V>,
  'marks' | 'nodes' | 'selection' | 'slice' | 'text' | 'value'
> & {
  /** Create a live location from the transaction's current document state. */
  anchor: EditorAnchorApi;
  annotations: EditorTransactionAnnotationsApi;
  blocks: EditorTransactionBlocksApi<V>;
  break: EditorTransactionBreakApi;
  changes: EditorTransactionChangesApi;
  effects: EditorTransactionEffectsApi;
  extensions: EditorTransactionExtensionsApi;
  fragment: EditorTransactionFragmentApi<V>;
  marks: EditorTransactionMarksApi<V>;
  nodes: EditorTransactionNodesApi<V>;
  refs: EditorTransactionRefsApi;
  roots: EditorTransactionRootsApi<V>;
  slice: EditorTransactionSliceApi<V>;
  selection: EditorTransactionSelectionApi;
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
> = EditorCoreUpdateTransaction<V> & {
  /** Dispatch a typed semantic command inside this active update. */
  command: EditorCommandDispatch<BaseEditor<V, TExtensions>>;
} & EditorInstalledTxGroups<V, TExtensions>;

/** Pure transaction builder available while producing a command spec. */
export type EditorTransactionSpecBuilder<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<EditorCoreUpdateTransaction<V>, 'anchor' | 'extensions'> &
  EditorExtensionSpecMethods<EditorInstalledTxGroups<V, TExtensions>>;

export type EditorReadMethods<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreStateView<V> & EditorInstalledStateGroups<V, TExtensions>;

export type EditorRead<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = (<T>(fn: (state: EditorStateView<V, TExtensions>) => T) => T) &
  EditorReadMethods<V, TExtensions>;

type EditorBivariantMethods<T> = {
  [K in keyof T as T[K] extends TxOnlyMethod<(...args: any[]) => any>
    ? never
    : K]: T[K] extends (...args: any[]) => any ? BivariantFunction<T[K]> : T[K];
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
      | 'duplicate'
      | 'lift'
      | 'merge'
      | 'move'
      | 'remove'
      | 'replace'
      | 'replaceChildren'
      | 'split'
      | 'toggle'
      | 'unset'
      | 'unwrap'
      | 'wrap'
    >
  > &
    Pick<EditorTransactionNodesApi<V>, 'set'>;
  roots: EditorBivariantMethods<EditorTransactionRootsApi<V>>;
  slice: EditorBivariantMethods<Pick<EditorTransactionSliceApi<V>, 'replace'>>;
  selection: EditorBivariantMethods<
    Pick<
      EditorTransactionSelectionApi,
      'clear' | 'collapse' | 'move' | 'set' | 'setPoint' | 'setRange'
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

type EditorExtensionSpecMethods<TGroups> = {
  [K in keyof TGroups]: TGroups[K] extends object
    ? EditorBivariantMethods<TGroups[K]>
    : TGroups[K];
};

type EditorAvailableUpdatePolicy<TTxGroups> = Readonly<
  Omit<EditorUpdatePolicy, 'history'> &
    ('history' extends keyof TTxGroups
      ? Pick<EditorUpdatePolicy, 'history'>
      : { history?: never })
>;

export type EditorUpdateMethods<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreUpdateMethods<V, TExtensions> &
  EditorExtensionUpdateMethods<EditorInstalledTxGroups<V, TExtensions>>;

export type EditorUpdate<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions> & TTx,
      context: EditorUpdateContext<BaseEditor<V, TExtensions>>
    ) => void
  ): void;
  <TTx extends object = {}>(
    policy: EditorAvailableUpdatePolicy<
      EditorInstalledTxGroups<V, TExtensions>
    >,
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions> & TTx,
      context: EditorUpdateContext<BaseEditor<V, TExtensions>>
    ) => void
  ): void;
  (
    policy: EditorAvailableUpdatePolicy<EditorInstalledTxGroups<V, TExtensions>>
  ): EditorUpdateMethods<V, TExtensions>;
} & EditorUpdateMethods<V, TExtensions>;

export type EditorUpdateContext<TEditor extends BaseEditor<any, any> = Editor> =
  {
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
  getApi: <
    TExtension extends EditorResolvedInstalledExtensions<TExtensions>[number],
  >(
    extension: TExtension
  ) => EditorApiValueFromExtension<TExtension>;
  read: EditorRead<V, TExtensions>;
  subscribe: (listener: SnapshotListener<any>) => () => void;
  subscribeCommit: (listener: EditorCommitListener<any>) => () => void;
  update: EditorUpdate<V, TExtensions>;
  extend: (
    extension: EditorExtensionInput<any>,
    options?: EditorExtensionReconfigureOptions
  ) => () => void;
}

/** Update policy available for a specific editor's installed extensions. */
export type EditorUpdatePolicyFor<TEditor extends BaseEditor<any, any>> =
  TEditor extends BaseEditor<
    infer V,
    infer TExtensions extends readonly unknown[]
  >
    ? EditorAvailableUpdatePolicy<EditorInstalledTxGroups<V, TExtensions>>
    : never;

export type EditorRuntime<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Pick<
  BaseEditor<V, TExtensions>,
  | 'anchor'
  | 'api'
  | 'extend'
  | 'getApi'
  | 'read'
  | 'subscribe'
  | 'subscribeCommit'
  | 'update'
> & {
  editor: Editor<V, TExtensions>;
};

export type EditorRuntimeOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = CreateEditorOptions<V, TExtensions>;

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
  readonly runtime: EditorRuntime<V, TExtensions>;
};

type EmptyQueryMiddlewareArgs = Record<never, never>;

export type EditorQueryMiddlewareArgs<_V extends Value = Value> = {
  fragment: {
    get: { options?: EditorFragmentReadOptions };
  };
  marks: {
    get: EmptyQueryMiddlewareArgs;
  };
  nodes: {
    above: { options?: EditorAboveOptions<Ancestor> };
    block: { options?: EditorBlockOptions<Element> };
    children: { at?: Location };
    elementReadOnly: { options?: EditorElementReadOnlyOptions };
    entries: { options?: EditorNodesOptions<Node> };
    find: { options?: EditorNodesOptions<Node> };
    first: { at: Location };
    get: { at: Location };
    hasBlocks: { element: Element };
    hasInlines: { element: Element };
    hasPath: { path: Path };
    hasTexts: { element: Element };
    isBlock: { element: Node };
    isSelectable: { element: Node };
    isEmpty: { element: Element };
    last: { at: Location; options?: EditorLastOptions };
    leaf: { at: Location; options?: EditorLeafOptions };
    levels: { options?: EditorLevelsOptions<Node> };
    next: { options?: EditorNextOptions<Descendant> };
    parent: { at: Location; options?: EditorParentOptions };
    path: { at: Location; options?: EditorPathOptions };
    previous: { options?: EditorPreviousOptions<Node> };
    shouldMergeNodesRemovePrevNode: {
      current: NodeEntry;
      previous: NodeEntry;
    };
    some: { options?: EditorNodesOptions<Node> };
    toArray: {
      map?: (entry: NodeEntry<Node>) => unknown;
      options?: EditorNodesOptions<Node>;
    };
    void: { options?: EditorVoidOptions };
  };
  points: {
    after: { at: Location; options?: EditorAfterOptions };
    before: { at: Location; options?: EditorBeforeOptions };
    end: { at: Location };
    get: { at: Location; options?: EditorPointOptions };
    isEdge: { at: Location; point: Point };
    isEnd: { at: Location; point: Point };
    isStart: { at: Location; point: Point };
    positions: { options?: EditorPositionsOptions };
    start: { at: Location };
  };
  ranges: {
    edges: { at: Location };
    fromEntries: { entries: readonly NodeEntry[] };
    get: {
      at: Location;
      to?: Location;
    };
    project: { range: Range };
    unhang: { options?: EditorUnhangRangeOptions; range: Range };
  };
  text: {
    string: { at: Location; options?: EditorStringOptions };
  };
};

export type EditorQueryMiddlewareResult<V extends Value = Value> = {
  fragment: {
    get: DescendantIn<V>[];
  };
  marks: {
    get: EditorMarks<V> | null;
  };
  nodes: {
    above: NodeEntry<Ancestor> | undefined;
    block: NodeEntry<Element> | undefined;
    children: readonly Node[];
    elementReadOnly: NodeEntry<Element> | undefined;
    entries: Generator<NodeEntry<Node>, void, undefined>;
    find: NodeEntry<Node> | undefined;
    first: NodeEntry | undefined;
    get: NodeEntry<Node> | undefined;
    hasBlocks: boolean;
    hasInlines: boolean;
    hasPath: boolean;
    hasTexts: boolean;
    isBlock: boolean;
    isSelectable: boolean;
    isEmpty: boolean;
    last: NodeEntry | undefined;
    leaf: NodeEntry<Text> | undefined;
    levels: Generator<NodeEntry<Node>, void, undefined>;
    next: NodeEntry<Descendant> | undefined;
    parent: NodeEntry<Ancestor> | undefined;
    path: Path | undefined;
    previous: NodeEntry<Node> | undefined;
    shouldMergeNodesRemovePrevNode: boolean;
    some: boolean;
    toArray: NodeEntry<Node>[] | unknown[];
    void: NodeEntry<Element> | undefined;
  };
  points: {
    after: Point | undefined;
    before: Point | undefined;
    end: Point | undefined;
    get: Point | undefined;
    isEdge: boolean;
    isEnd: boolean;
    isStart: boolean;
    positions: Generator<Point, void, undefined>;
    start: Point | undefined;
  };
  ranges: {
    edges: [Point, Point] | undefined;
    fromEntries: Range | undefined;
    get: Range | undefined;
    project: readonly ProjectedRangeSegment[];
    unhang: Range;
  };
  text: {
    string: string;
  };
};

export type EditorQueryGroup = keyof EditorQueryMiddlewareArgs;

export type EditorQueryMiddlewareContext<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
  TResult,
> = TArgs & {
  editor: TEditor;
  next: (overrides?: Partial<TArgs>) => TResult;
  state: EditorStateView<ValueOf<TEditor>>;
};

type EditorQueryMiddlewareEntry<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
  TResult,
> = (context: EditorQueryMiddlewareContext<TEditor, TArgs, TResult>) => TResult;

export type EditorQueryMiddlewareMap<TEditor extends BaseEditor<any> = Editor> =
  {
    fragment?: {
      get?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['fragment']['get'],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['fragment']['get']
      >;
    };
    marks?: {
      get?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['marks']['get'],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['marks']['get']
      >;
    };
    nodes?: {
      [K in keyof EditorQueryMiddlewareArgs<
        ValueOf<TEditor>
      >['nodes']]?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['nodes'][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['nodes'][K]
      >;
    };
    points?: {
      [K in keyof EditorQueryMiddlewareArgs<
        ValueOf<TEditor>
      >['points']]?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['points'][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['points'][K]
      >;
    };
    ranges?: {
      [K in keyof EditorQueryMiddlewareArgs<
        ValueOf<TEditor>
      >['ranges']]?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['ranges'][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['ranges'][K]
      >;
    };
    text?: {
      string?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['text']['string'],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['text']['string']
      >;
    };
  };

export type Editor<
  V extends Value = any,
  TExtensions extends readonly unknown[] = readonly [],
> = BaseEditor<V, TExtensions>;

export type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  defaultBlockType?: string;
  extensions?: TExtensions;
  /** Stable logical identity for this editor instance. */
  id?: string;
  initialSelection?: Selection;
  initialValue?: InitialValue<V>;
  lifecycleErrorSink?: EditorLifecycleErrorSink;
  maxLength?: number;
  readOnly?: boolean;
};

/** Default document value inferred from complete installed schema extensions. */
export type EditorValueFromExtensions<TExtensions extends readonly unknown[]> =
  [SchemaValueFromExtensions<TExtensions>] extends [never]
    ? Value
    : SchemaValueFromExtensions<TExtensions> extends infer V extends Value
      ? V
      : Value;

type IsAny<T> = 0 extends 1 & T ? true : false;

export type ValueOf<E> =
  E extends BaseEditor<infer V>
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

export type EditorMarksOf<E extends BaseEditor<any> = Editor> = EditorMarks<
  ValueOf<E>
>;

export type RuntimeId = string;

export type SnapshotIndex = Readonly<{
  /** Materialize the lazy index and return stable, frozen runtime-id/path pairs. */
  entries: () => readonly (readonly [RuntimeId, Path])[];
  /** Return the runtime identity at a snapshot path, or `null` when absent. */
  idAt: (path: Path) => RuntimeId | null;
  /** Return the snapshot path for a runtime identity, or `null` when absent. */
  pathOf: (runtimeId: RuntimeId) => Path | null;
}>;

export type ProjectedRangeSegment = {
  path: Path;
  runtimeId: RuntimeId;
  start: number;
  end: number;
};

export type EditorSnapshot<V extends Value = Value> = {
  children: V;
  index: SnapshotIndex;
  selection: Selection;
  version: number;
};

export type SnapshotInput<V extends Value = Value> = {
  children: V | Descendant[];
  selection?: SnapshotSelectionInput;
};

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
  resolveTarget: (options?: { at?: Location }) => Location | null;
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

export type TransactionSpec<TRoot extends RootKey = RootKey> = Readonly<{
  /** @internal Opaque proof that this spec was built by the owning editor. */
  readonly [TRANSACTION_SPEC_TYPE]: true;
  annotations: readonly Readonly<{
    type: EditorUpdateAnnotation<unknown>;
    value: unknown;
  }>[];
  changes: DocumentChange;
  effects: readonly EditorEffect[];
  kind: 'transaction';
  selection?: Readonly<{
    /** Named selection root. Omitted for the primary document. */
    root?: NamedRootKey<TRoot>;
    value: Selection;
  }>;
  tags: readonly EditorUpdateTag[];
}>;

export type EditorCommandResult = false | TransactionSpec;

export type EditorCommandContext<Input, TEditor = Editor> = {
  input: Readonly<Input>;
  state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
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

declare const EDITOR_COMMAND_REGISTRATION_TYPES: unique symbol;
declare const EDITOR_COMMAND_TYPES: unique symbol;

export type EditorCommandRegistration<TEditor = Editor> = Readonly<{
  /** @internal Compile-time editor requirement; runtime data is private. */
  readonly [EDITOR_COMMAND_REGISTRATION_TYPES]: (
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

export type EditorCommand<
  Input = void,
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
  /** @internal Carries input and editor requirements without runtime metadata. */
  readonly [EDITOR_COMMAND_TYPES]: Readonly<{
    editor: TEditor;
    input: Input;
  }>;
  /** Build only the descriptor default without running installed handlers. */
  build: (
    state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
    ...input: [Input] extends [void] ? [] | [input: Input] : [input: Input]
  ) => EditorCommandResult;
  /** Stable configuration and diagnostics identity. */
  id: string;
}>;

/** Minimal descriptor shape shared by every semantic editor command. */
export type EditorCommandDescriptor = Readonly<{
  readonly [EDITOR_COMMAND_TYPES]: Readonly<{
    editor: unknown;
    input: unknown;
  }>;
  id: string;
}>;

/** Input accepted by one semantic command descriptor. */
export type EditorCommandInput<TCommand extends EditorCommandDescriptor> =
  TCommand[typeof EDITOR_COMMAND_TYPES]['input'];

/** @internal Editor capability required by one semantic command descriptor. */
export type EditorCommandRequiredEditor<
  TCommand extends EditorCommandDescriptor,
> = TCommand[typeof EDITOR_COMMAND_TYPES]['editor'];

/** @internal Pure capabilities visible while building a semantic command. */
export type EditorCommandCapabilities<TEditor> =
  TEditor extends BaseEditor<
    infer V extends Value,
    infer TExtensions extends readonly unknown[]
  >
    ? Readonly<{
        state: EditorInstalledStateGroups<V, TExtensions>;
        transaction: EditorExtensionSpecMethods<
          EditorInstalledTxGroups<V, TExtensions>
        >;
        value: V;
      }>
    : never;

/** A command accepted only when the actual editor meets its requirements. */
export type CompatibleEditorCommand<
  TEditor,
  TCommand extends EditorCommandDescriptor,
> =
  EditorCommandCapabilities<TEditor> extends EditorCommandCapabilities<
    EditorCommandRequiredEditor<TCommand>
  >
    ? TCommand
    : never;

export type EditorCommandDispatch<TEditor = Editor> = <
  TCommand extends EditorCommandDescriptor,
>(
  command: CompatibleEditorCommand<TEditor, TCommand>,
  ...input: [EditorCommandInput<TCommand>] extends [void]
    ? [] | [input: EditorCommandInput<TCommand>]
    : [input: EditorCommandInput<TCommand>]
) => boolean;

export type EditorCorrectionTransaction<V extends Value = Value> = Pick<
  EditorCoreUpdateTransaction<V>,
  | 'blocks'
  | 'break'
  | 'fragment'
  | 'marks'
  | 'nodes'
  | 'schema'
  | 'selection'
  | 'tags'
  | 'text'
> & {
  value: EditorStateValueApi<V>;
};

export type EditorCorrectionEvent = 'children' | 'content' | 'properties';

export type EditorCorrectionQuery<TNode extends Node = Node> =
  | 'root'
  | NodeMatch<TNode>;

export type EditorCorrectionContext<TEditor extends BaseEditor<any> = Editor> =
  {
    editor: TEditor;
    entry: NodeEntry;
    tx: EditorCorrectionTransaction<
      TEditor extends BaseEditor<infer V> ? V : Value
    >;
  };

export type EditorCorrection<TEditor extends BaseEditor<any> = Editor> = {
  correct: (context: EditorCorrectionContext<TEditor>) => void;
  event: EditorCorrectionEvent;
  query?: EditorCorrectionQuery;
};

export type EditorExtensionStateGroup<
  TEditor extends BaseEditor<any> = Editor,
  TResult = unknown,
> = (
  state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
  editor: TEditor
) => TResult;

export type EditorExtensionTxGroup<
  TEditor extends BaseEditor<any> = Editor,
  TResult = unknown,
> = (
  transaction: EditorUpdateTransaction<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
  editor: TEditor,
  context: EditorUpdateContext<TEditor>
) => TResult;

export type EditorExtensionStateGroups<
  TEditor extends BaseEditor<any> = Editor,
> = Record<string, EditorExtensionStateGroup<TEditor> | undefined>;

export type EditorExtensionTxGroups<TEditor extends BaseEditor<any> = Editor> =
  Record<string, EditorExtensionTxGroup<TEditor> | undefined>;

export type EditorExtensionApiMap = Record<
  string,
  unknown | readonly unknown[]
>;

/**
 * Resolve host APIs against one stable declarative configuration candidate.
 * API-factory outputs become visible only after every factory has resolved.
 */
export type EditorExtensionApiFactory<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
> = (
  editor: TEditor,
  context: EditorExtensionConfigurationContext<TEditor, TOptions>
) => EditorExtensionApiMap;

export type EditorClipboardInsertDataContext<
  TEditor extends BaseEditor<any> = Editor,
> = {
  editor: TEditor;
  next: (data?: DataTransfer) => boolean;
  tx: EditorUpdateTransaction<ValueOf<TEditor>>;
};

export type EditorClipboardMiddlewareMap<
  TEditor extends BaseEditor<any> = Editor,
> = {
  insertData?: (
    data: DataTransfer,
    context: EditorClipboardInsertDataContext<TEditor>
  ) => boolean;
};

export type EditorClipboardApi = {
  insertData: (data: DataTransfer) => boolean;
};

export type EditorAnchorApi = <
  TValue extends AnchorValue,
  const TRoot extends RootKey,
>(
  value: TValue,
  options: AnchorOptions<TValue, TRoot>
) => Anchor<TValue>;

export type EditorCoreApiGroups = {
  clipboard: EditorClipboardApi;
};

export type EditorClipboardInsertDataCapability<
  TEditor extends BaseEditor<any> = Editor,
> = (
  editor: TEditor,
  data: DataTransfer,
  tx: EditorUpdateTransaction<ValueOf<TEditor>>,
  next: (data?: DataTransfer) => boolean
) => boolean;

export type EditorExtensionCleanupContext = Readonly<{
  reason: 'remove' | 'replace' | 'rollback';
}>;

export type EditorExtensionActivationContext<TOptions = unknown> = Readonly<{
  capabilities: <TValue = unknown>(name: string) => readonly Readonly<TValue>[];
  name: string;
  onCleanup: (
    cleanup: (context: EditorExtensionCleanupContext) => void
  ) => void;
  onReady: (callback: () => void) => void;
  options: Readonly<TOptions>;
  /** Named view root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
  schema: EditorStateSchemaApi;
  signal: AbortSignal;
}>;

export type EditorLifecycleError =
  | Readonly<{
      cause: unknown;
      editor: Editor;
      extension: string;
      phase: 'activate' | 'cleanup' | 'ready';
    }>
  | Readonly<{
      cause: unknown;
      editor: Editor;
      extension: string;
      format: string;
      key: string;
      phase: 'parse' | 'query' | 'serialize';
      source: 'host-codec';
    }>;

export type EditorLifecycleErrorSink = (error: EditorLifecycleError) => void;

export type EditorExtensionConfigurationContext<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
> = Readonly<{
  capabilities: <TValue = unknown>(name: string) => readonly Readonly<TValue>[];
  editor: TEditor;
  name: string;
  options: Readonly<TOptions>;
  /** Named view root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
  schema: EditorStateSchemaApi<ValueOf<TEditor>>;
}>;

export type EditorCommitContext<TEditor extends BaseEditor<any, any> = Editor> =
  {
    commit: EditorCommit<ValueOf<TEditor>>;
    editor: TEditor;
    snapshot: EditorSnapshot<ValueOf<TEditor>>;
  };

export type EditorCommitHandler<TEditor extends BaseEditor<any, any> = Editor> =
  (context: EditorCommitContext<TEditor>) => void;

export type EditorTransactionChangeContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = Readonly<{
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
  tx: EditorUpdateTransaction<ValueOf<TEditor>>;
}>;

export type EditorTransactionChangeHandler<
  TEditor extends BaseEditor<any, any> = Editor,
> = (context: EditorTransactionChangeContext<TEditor>) => void;

export type EditorNodeChangeKind = 'insert' | 'move' | 'remove' | 'update';

export type EditorNodeChangeContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = {
  commit: EditorCommit<ValueOf<TEditor>>;
  editor: TEditor;
  kind: EditorNodeChangeKind;
  node: DescendantIn<ValueOf<TEditor>> | null;
  path: Path;
  previousPath: Path | null;
  prevNode: DescendantIn<ValueOf<TEditor>> | null;
  /** Named changed root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
};

export type EditorTextChangeContext<
  TEditor extends BaseEditor<any, any> = Editor,
> = {
  commit: EditorCommit<ValueOf<TEditor>>;
  editor: TEditor;
  node: DescendantIn<ValueOf<TEditor>> | null;
  path: Path;
  previousPath: Path;
  prevText: string;
  /** Named changed root, or `undefined` for the primary document. */
  root: NamedRootKey | undefined;
  text: string;
};

export type EditorNodeChangeHandler<
  TEditor extends BaseEditor<any, any> = Editor,
> = (context: EditorNodeChangeContext<TEditor>) => void;

export type EditorTextChangeHandler<
  TEditor extends BaseEditor<any, any> = Editor,
> = (context: EditorTextChangeContext<TEditor>) => void;

export type EditorImmutableConfig<TValue> = TValue extends bigint | symbol
  ? never
  : TValue extends PropertyPolicy<any>
    ? TValue
    : TValue extends (...args: any[]) => any
      ? never
      : TValue extends readonly unknown[]
        ? {
            readonly [TKey in keyof TValue]: EditorImmutableConfig<
              TValue[TKey]
            >;
          }
        : TValue extends object
          ? {
              readonly [TKey in keyof TValue]: EditorImmutableConfig<
                TValue[TKey]
              >;
            }
          : TValue;

export type EditorExtensionSchemaFactoryContext<TConfig = unknown> = Readonly<{
  config: EditorImmutableConfig<TConfig>;
  name: string;
}>;

export type EditorExtensionSchemaFactory<TConfig = unknown> = (
  context: EditorExtensionSchemaFactoryContext<TConfig>
) => EditorSchemaDeclaration;

export type EditorExtension<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
  TConfig = unknown,
> = {
  activate?: (
    editor: TEditor,
    context: EditorExtensionActivationContext<TOptions>
  ) => void;
  /** Declarative capabilities. Factory evaluation must not mutate the editor. */
  api?: EditorExtensionApiFactory<TEditor, TOptions> | EditorExtensionApiMap;
  clipboard?: EditorClipboardMiddlewareMap<TEditor>;
  /**
   * Declare semantic command policy with the installed editor type already
   * bound. Pass the descriptor first so input and state namespaces infer.
   */
  commands?: (
    context: EditorExtensionCommandContext<TEditor>
  ) => readonly EditorCommandRegistration<TEditor>[];
  /** Immutable input available to pure schema factories. */
  config?: TConfig & EditorImmutableConfig<TConfig>;
  conflicts?: readonly string[];
  dependencies?: readonly string[];
  enabled?: boolean;
  effects?: readonly EditorEffectType[];
  facets?: readonly EditorFacetProvider[];
  fields?: readonly EditorStateField<any>[];
  name: string;
  corrections?: readonly EditorCorrection<TEditor>[];
  onCommit?: EditorCommitHandler<TEditor>;
  onNodeChange?: EditorNodeChangeHandler<TEditor>;
  onTextChange?: EditorTextChangeHandler<TEditor>;
  onTransactionChange?: EditorTransactionChangeHandler<TEditor>;
  options?: TOptions;
  peerDependencies?: readonly string[];
  priority?: number;
  queries?: EditorQueryMiddlewareMap<TEditor>;
  /** Immutable partial/complete declaration or pure immutable-config factory. */
  schema?: EditorSchemaDeclaration | EditorExtensionSchemaFactory<TConfig>;
  selections?: readonly EditorSelectionSpec[];
  state?: EditorExtensionStateGroups<TEditor>;
  tx?: EditorExtensionTxGroups<TEditor>;
  /** Validate the provisional immutable configuration before activation. */
  validateConfiguration?: (
    context: EditorExtensionConfigurationContext<TEditor, TOptions>
  ) => void;
};

export type EditorExtensionInput<TEditor extends BaseEditor<any> = Editor> =
  | EditorExtension<TEditor, any>
  | readonly EditorExtension<TEditor, any>[];

export type EditorExtensionSlotLike = Readonly<{
  key: string;
  of: <const TInput extends EditorExtensionInput>(
    input: TInput
  ) => EditorExtension;
}>;

export type EditorSelectionMapContext = Readonly<{
  change: DocumentChange;
  editor: Editor;
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

export type EditorSelectionSpec<
  TSelection extends EditorSelection = EditorSelection,
> = TSelection extends EditorSelection
  ? Readonly<{
      /** Versioned persistence contract for this selection kind. */
      codec: EditorValueCodec<TSelection>;
      domRange?: (selection: TSelection) => Range | null;
      kind: TSelection['kind'];
      map?: (
        selection: TSelection,
        context: EditorSelectionMapContext
      ) => TSelection | null;
      ranges?: (selection: TSelection) => readonly Range[];
      replacementRange?: (selection: TSelection) => Range | null;
      /** Validate kind-specific runtime fields before the selection is accepted. */
      validate: (selection: TSelection) => boolean;
    }>
  : never;

export type EditorExtensionTypes = {
  api?: Record<string, unknown>;
  state?: Record<string, unknown>;
  tx?: Record<string, unknown>;
};

export type EditorExtensionTypeProvider<
  TProvider extends (editor: any) => EditorExtensionTypes = (
    editor: Editor
  ) => EditorExtensionTypes,
> = {
  readonly [EDITOR_EXTENSION_TYPES]?: TProvider;
};

type UnionToIntersection<T> = (
  T extends unknown
    ? (value: T) => void
    : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type EditorLiteralExtensionSlot<TSlot> =
  NonNullable<TSlot> extends infer TNonNullable
    ? TNonNullable extends object
      ? string extends keyof TNonNullable
        ? unknown
        : TNonNullable
      : unknown
    : unknown;

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

export type EditorResolvedInstalledExtensions<
  TExtensions extends readonly unknown[],
> = number extends TExtensions['length']
  ? readonly EditorExtensionEnabled<TExtensions[number]>[]
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
                EditorExtensionEnabled<TFirst>,
                ...EditorResolvedInstalledExtensions<TRest>,
              ]
          : EditorLiteralExtensionName<TFirst> extends EditorExtensionNames<TRest>
            ? EditorResolvedInstalledExtensions<TRest>
            : EditorExtensionEnabled<TFirst> extends never
              ? EditorResolvedInstalledExtensions<TRest>
              : [
                  EditorExtensionEnabled<TFirst>,
                  ...EditorResolvedInstalledExtensions<TRest>,
                ]
      : readonly [];

type EditorStateSlotsFromExtension<TExtension> = TExtension extends {
  state?: infer TState;
}
  ? EditorLiteralExtensionSlot<TState>
  : unknown;

type EditorTxSlotsFromExtension<TExtension> = TExtension extends {
  tx?: infer TTx;
}
  ? EditorLiteralExtensionSlot<TTx>
  : unknown;

type EditorApiSlotsFromExtension<TExtension> = TExtension extends {
  api?: infer TApi;
}
  ? TApi extends (...args: any[]) => infer TResult
    ? EditorLiteralExtensionSlot<TResult>
    : EditorLiteralExtensionSlot<TApi>
  : unknown;

type EditorProvidedTypesFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends {
  readonly [EDITOR_EXTENSION_TYPES]?: infer TProvider;
}
  ? TProvider extends (editor: Editor<V>) => infer TTypes
    ? TTypes
    : never
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

type EditorStateGroupResult<TFactory> = TFactory extends (
  ...args: any[]
) => infer TResult
  ? TResult
  : never;

type EditorTxGroupResult<TFactory> = TFactory extends (
  ...args: any[]
) => infer TResult
  ? TResult
  : never;

type EditorStateGroupsFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends unknown
  ? EditorProvidedSlot<V, TExtension, 'state'> extends infer TProvidedState
    ? [TProvidedState] extends [never]
      ? EditorStateSlotsFromExtension<TExtension> extends infer TState
        ? keyof TState extends never
          ? never
          : {
              [K in keyof TState]: EditorStateGroupResult<TState[K]>;
            }
        : never
      : TProvidedState
    : never
  : never;

type EditorTxGroupsFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends unknown
  ? EditorProvidedSlot<V, TExtension, 'tx'> extends infer TProvidedTx
    ? [TProvidedTx] extends [never]
      ? EditorTxSlotsFromExtension<TExtension> extends infer TTx
        ? keyof TTx extends never
          ? never
          : {
              [K in keyof TTx]: EditorTxGroupResult<TTx[K]>;
            }
        : never
      : TProvidedTx
    : never
  : never;

type EditorApiValue<TValue> = TValue extends readonly (infer TItem)[]
  ? TItem
  : TValue;

type EditorApiGroupsFromExtension<TExtension> = TExtension extends unknown
  ? EditorProvidedSlot<Value, TExtension, 'api'> extends infer TProvidedApi
    ? [TProvidedApi] extends [never]
      ? EditorApiSlotsFromExtension<TExtension> extends infer TApi
        ? keyof TApi extends never
          ? never
          : {
              [K in keyof TApi]: EditorApiValue<TApi[K]>;
            }
        : never
      : TProvidedApi
    : never
  : never;

export type EditorInstalledStateGroups<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = UnionToIntersection<
  EditorStateGroupsFromExtension<
    V,
    EditorResolvedInstalledExtensions<TExtensions>[number]
  >
>;

export type EditorInstalledTxGroups<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = UnionToIntersection<
  EditorTxGroupsFromExtension<
    V,
    EditorResolvedInstalledExtensions<TExtensions>[number]
  >
>;

export type EditorInstalledApiGroups<
  TExtensions extends readonly unknown[] = readonly [],
> = UnionToIntersection<
  EditorApiGroupsFromExtension<
    EditorResolvedInstalledExtensions<TExtensions>[number]
  >
>;

export type EditorApiValueFromExtension<TExtension> =
  EditorApiGroupsFromExtension<TExtension> extends infer TApi
    ? TExtension extends { name: infer TName }
      ? TName extends keyof TApi
        ? TApi[TName]
        : TApi[keyof TApi]
      : TApi[keyof TApi]
    : never;

export type RegisteredEditorExtension = {
  conflicts: readonly string[];
  dependencies: readonly string[];
  name: string;
  order: number;
  peerDependencies: readonly string[];
};

export type EditorExtensionRegistry = {
  capabilities: Map<string, unknown[]>;
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
  extensions: Map<string, RegisteredEditorExtension>;
  nodeChangeListeners: Set<EditorNodeChangeHandler>;
  corrections: Map<string, EditorCorrection>;
  queryMiddlewares: Map<string, unknown[]>;
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
  hasRuntime: (
    runtimeId: RuntimeId,
    kind: EditorCommitRuntimeChangeKind
  ) => boolean;
  /** Final-coordinate paths touching changed ranges in one document root. */
  paths: <TRoot extends RootKey>(root?: NamedRootKey<TRoot>) => readonly Path[];
  runtimeIds: <TRoot extends RootKey>(
    kind: EditorCommitRuntimeChangeKind,
    root?: NamedRootKey<TRoot>
  ) => readonly RuntimeId[];
  /** Runtime ids with this change kind across every document root. */
  runtimeIdsAll: (kind: EditorCommitRuntimeChangeKind) => readonly RuntimeId[];
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

export type EditorCommit<V extends Value = Value> = {
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
};

export interface EditorAboveOptions<T extends Ancestor> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorBlockOptions<T extends Element = Element> {
  at?: Location;
  match?: NodeMatch<T>;
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

export interface EditorLevelsOptions<T extends Node> {
  at?: Location;
  match?: NodeMatch<T>;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorLastOptions {
  level?: number;
}

export interface EditorNextOptions<T extends Descendant> {
  at?: Location;
  from?: 'after' | 'child';
  match?: NodeMatch<T>;
  mode?: SelectionMode;
  voids?: boolean;
}

export interface EditorNodeOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorNodesOptions<T extends Node> {
  at?: Location | Span;
  match?: NodeMatch<T>;
  mode?: SelectionMode;
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
  pass?: (entry: NodeEntry) => boolean;
}

export interface EditorParentOptions {
  depth?: number;
  edge?: LeafEdge;
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

export interface EditorPreviousOptions<T extends Node> {
  at?: Location;
  from?: 'before' | 'parent';
  match?: NodeMatch<T>;
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

export interface EditorStaticApi {
  /**
   * Get the ancestor above a location in the document.
   */
  above: <T extends Ancestor>(
    editor: Editor,
    options?: EditorAboveOptions<T>
  ) => NodeEntry<T> | undefined;

  /**
   * Add a custom property to the leaf text nodes in the current selection.
   *
   * If the selection is currently collapsed, the marks are stored by the
   * editor runtime and applied when text is inserted next.
   */
  addMark: (editor: Editor, key: string, value: any) => void;

  /**
   * Get the point after a location.
   */
  after: (
    editor: Editor,
    at: Location,
    options?: EditorAfterOptions
  ) => Point | undefined;

  /**
   * Get the point before a location.
   */
  before: (
    editor: Editor,
    at: Location,
    options?: EditorBeforeOptions
  ) => Point | undefined;

  /**
   * Delete content in the editor backward from the current selection.
   */
  deleteBackward: (
    editor: Editor,
    options?: EditorDirectedDeletionOptions
  ) => void;

  /**
   * Delete content in the editor forward from the current selection.
   */
  deleteForward: (
    editor: Editor,
    options?: EditorDirectedDeletionOptions
  ) => void;

  /**
   * Delete the content in the current selection.
   */
  deleteFragment: (
    editor: Editor,
    options?: EditorFragmentDeletionOptions
  ) => void;

  delete: TextMutationMethods['delete'];

  collapse: SelectionMutationMethods['collapse'];

  deselect: SelectionMutationMethods['deselect'];

  /**
   * Get the start and end points of a location.
   */
  edges: (editor: Editor, at: Location) => [Point, Point];

  /**
   * Get the latest committed transaction metadata.
   */
  getLastCommit: <V extends Value>(editor: Editor<V>) => EditorCommit<V> | null;

  /**
   * Return effects that are marked for collaboration.
   */
  getCollabEffects: <V extends Value>(
    editor: Editor<V>,
    commit: EditorCommit<V>
  ) => readonly EditorEffect[];

  /**
   * Get the extension registry for an editor.
   */
  getExtensionRegistry: (editor: Editor) => EditorExtensionRegistry;

  /**
   * Resolve the current live path for a runtime id without rebuilding a snapshot.
   */
  getPathByRuntimeId: (editor: Editor, runtimeId: RuntimeId) => Path | null;

  /**
   * Get the runtime id for a live node path without rebuilding a snapshot.
   */
  getRuntimeId: (editor: Editor, path: Path) => RuntimeId | null;

  /**
   * Run a coherent synchronous read against the current editor/runtime state.
   */
  read: <V extends Value, T>(
    editor: Editor<V>,
    fn: (state: EditorStateView<V>) => T
  ) => T;

  /**
   * Match a read-only element in the current branch of the editor.
   */
  elementReadOnly: (
    editor: Editor,
    options?: EditorElementReadOnlyOptions
  ) => NodeEntry<Element> | undefined;

  /**
   * Get the first node at a location.
   */
  first: (editor: Editor, at: Location) => NodeEntry;

  /**
   * Get the current children through the public accessor boundary.
   */
  getChildren: <V extends Value>(editor: Editor<V>) => V;

  /**
   * Get the current selection through the selection freshness runtime.
   */
  getSelection: (editor: Editor) => Selection;

  /**
   * Get the fragment at a location.
   */
  fragment: <V extends Value>(
    editor: Editor<V>,
    at: Location
  ) => DescendantIn<V>[];

  /**
   * Get the fragment at the current selection.
   */
  getFragment: <V extends Value>(editor: Editor<V>) => DescendantIn<V>[];

  /**
   * Get the current immutable snapshot of editor state.
   */
  getSnapshot: <V extends Value>(editor: Editor<V>) => EditorSnapshot<V>;

  /**
   * Check if a node has block children.
   */
  hasBlocks: (editor: Editor, element: Element) => boolean;

  /**
   * Check if a node has inline and text children.
   */
  hasInlines: (editor: Editor, element: Element) => boolean;

  hasPath: (editor: Editor, path: Path) => boolean;

  /**
   * Check if a node has text children.
   */
  hasTexts: (editor: Editor, element: Element) => boolean;

  /**
   * Insert a block break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertBreak: (editor: Editor) => void;

  /**
   * Atomically inserts `nodes`
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertNode: <V extends Value, T extends ElementOrTextIn<V>>(
    editor: Editor<V>,
    node: T,
    options?: NodeInsertNodesOptions<T>
  ) => void;

  insertNodes: NodeMutationMethods['insertNodes'];

  /**
   * Insert a soft break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertSoftBreak: (editor: Editor) => void;

  /**
   * Insert a string of text
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertText: (
    editor: Editor,
    text: string,
    options?: TextInsertTextOptions
  ) => void;

  mergeNodes: NodeMutationMethods['mergeNodes'];

  move: SelectionMutationMethods['move'];

  moveNodes: NodeMutationMethods['moveNodes'];

  /**
   * Check if a value is a block `Element` object.
   */
  isBlock: (editor: Editor, value: Node) => boolean;

  /**
   * Check if a point is an edge of a location.
   */
  isEdge: (editor: Editor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is an `Editor` object.
   */
  isEditor: (
    value: unknown,
    options?: EditorIsEditorOptions
  ) => value is Editor;

  /**
   * Check if a value is a read-only `Element` object.
   */
  isElementReadOnly: (editor: Editor, element: Element) => boolean;

  /**
   * Check if an element is empty, accounting for void nodes.
   */
  isEmpty: (editor: Editor, element: Element) => boolean;

  /**
   * Check if a point is the end point of a location.
   */
  isEnd: (editor: Editor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is an inline `Element` object.
   */
  isInline: (editor: Editor, value: Node) => boolean;

  /**
   * Check if a value is a selectable `Element` object.
   */
  isSelectable: (editor: Editor, element: Node) => boolean;

  /**
   * Check if a point is the start point of a location.
   */
  isStart: (editor: Editor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is a void `Element` object.
   */
  isVoid: (editor: Editor, value: Node) => boolean;

  /**
   * Get the last node at a location.
   */
  last: (
    editor: Editor,
    at: Location,
    options?: EditorLastOptions
  ) => NodeEntry | undefined;

  /**
   * Get the leaf text node at a location.
   */
  leaf: (
    editor: Editor,
    at: Location,
    options?: EditorLeafOptions
  ) => NodeEntry<Text>;

  /**
   * Iterate through all of the levels at a location.
   */
  levels: <T extends Node>(
    editor: Editor,
    options?: EditorLevelsOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>;

  liftNodes: NodeMutationMethods['liftNodes'];

  /**
   * Get the matching node in the branch of the document after a location.
   */
  next: <T extends Descendant>(
    editor: Editor,
    options?: EditorNextOptions<T>
  ) => NodeEntry<T> | undefined;

  /**
   * Normalize any dirty objects in the editor.
   */

  /**
   * Get the parent node of a location.
   */
  parent: (
    editor: Editor,
    at: Location,
    options?: EditorParentOptions
  ) => NodeEntry<Ancestor>;

  /**
   * Get the path of a location.
   */
  path: (editor: Editor, at: Location, options?: EditorPathOptions) => Path;

  /**
   * Get the start or end point of a location.
   */
  point: (editor: Editor, at: Location, options?: EditorPointOptions) => Point;

  projectRange: (
    editor: Editor,
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
    editor: Editor,
    options?: EditorPositionsOptions
  ) => Generator<Point, void, undefined>;

  /**
   * Get the matching node in the branch of the document before a location.
   */
  previous: <T extends Node>(
    editor: Editor,
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined;

  /**
   * Get a range of a location.
   */
  range: (editor: Editor, at: Location, to?: Location) => Range;

  extend: <TEditor extends Editor>(
    editor: TEditor,
    extension: EditorExtensionInput<TEditor>,
    options?: EditorExtensionReconfigureOptions
  ) => () => void;

  defineEditorExtension: <TEditor extends BaseEditor<any> = Editor>(
    extension: EditorExtension<TEditor>
  ) => EditorExtension<TEditor>;

  replace: <V extends Value>(
    editor: Editor<V> | EditorView<V, any>,
    input: SnapshotInput<V>
  ) => void;

  reset: <V extends Value>(
    editor: Editor<V> | EditorView<V, any>,
    input: SnapshotInput<V>
  ) => void;

  /**
   * Remove a custom property from all of the leaf text nodes in the current
   * selection.
   *
   * If the selection is currently collapsed, the removal is stored by the
   * editor runtime and applied to the text inserted next.
   */
  removeMark: (editor: Editor, key: string) => void;

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
    editor: Editor,
    key: string,
    value?: any,
    options?: EditorToggleMarkOptions
  ) => void;

  /** Toggle selected blocks between a target type and its default type. */
  toggleBlock: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    type: string,
    options?: EditorToggleBlockOptions<DescendantIn<V>>
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
    editor: Editor,
    at: Location,
    options?: EditorStringOptions
  ) => string;

  subscribe: <V extends Value>(
    editor: Editor<V>,
    listener: SnapshotListener<V>
  ) => () => void;

  subscribeCommit: <V extends Value>(
    editor: Editor<V>,
    listener: EditorCommitListener<V>
  ) => () => void;

  subscribeSource: <V extends Value>(
    editor: Editor<V>,
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) => () => void;

  update: <V extends Value>(
    editor: Editor<V>,
    fn: (
      transaction: EditorUpdateTransaction<V>,
      context: EditorUpdateContext<Editor<V>>
    ) => void
  ) => void;

  /**
   * Convert a range into a non-hanging one.
   */
  unhangRange: (
    editor: Editor,
    range: Range,
    options?: EditorUnhangRangeOptions
  ) => Range;

  /**
   * Match a void node in the current branch of the editor.
   */
  void: (
    editor: Editor,
    options?: EditorVoidOptions
  ) => NodeEntry<Element> | undefined;

  /**
   *  Call a function, Determine whether or not remove the previous node when merge.
   */
  shouldMergeNodesRemovePrevNode: (
    editor: Editor,
    prevNodeEntry: NodeEntry,
    curNodeEntry: NodeEntry
  ) => boolean;
}

type EditorInternalApiTable = EditorStaticApi & {
  defineCommand: typeof defineEditorCommand;
};

const getImplicitSelectionRoot = (editor: Editor) =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

const getWriteRoot = (editor: Editor, at: Location | undefined) =>
  at === undefined ? getImplicitSelectionRoot(editor) : getLocationRoot(at);

const isPathLocation = (value: Location | undefined): value is Path =>
  Array.isArray(value) && value.every((segment) => Number.isInteger(segment));

const runRootedInternalWrite = <T>(
  editor: Editor,
  fn: () => T,
  root?: string
): T =>
  root
    ? withEditorUpdateRoot(editor, root, () =>
        withEditorUpdateRootChildren(editor, root, fn)
      )
    : fn();

const runInternalEditorWrite = <T>(
  editor: Editor,
  fn: (owner: Editor) => T,
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
  editor: Editor,
  fn: (owner: Editor) => T,
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
  editor: Editor | EditorView<any, any>
): editor is EditorView =>
  (editor as { runtime?: EditorRuntime }).runtime?.editor !== undefined;

const replaceEditorSnapshot = (
  editor: Editor | EditorView<any, any>,
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
  above(editor, options) {
    return getEditorRuntime(editor).above(options);
  },

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
      (owner) => executeDeleteText(owner, options),
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
      (owner) => executeDeselect(owner),
      getImplicitSelectionRoot(editor)
    );
  },

  edges(editor, at) {
    return getEditorRuntime(editor).edges(at);
  },

  elementReadOnly(editor: Editor, options: EditorElementReadOnlyOptions = {}) {
    return getEditorRuntime(editor).elementReadOnly(options);
  },

  first(editor, at) {
    return getEditorRuntime(editor).first(at);
  },

  fragment<V extends Value>(editor: Editor<V>, at: Location) {
    return getEditorRuntime(editor).fragment(at) as DescendantIn<V>[];
  },

  getFragment(editor) {
    return editor.read((state) => state.fragment());
  },

  getChildren(editor) {
    return getEditorRuntime(editor).getChildren();
  },

  getLastCommit(editor) {
    return getEditorRuntime(editor).getLastCommit();
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

  getPathByRuntimeId(editor, runtimeId) {
    return getEditorRuntime(editor).getPathByRuntimeId(runtimeId);
  },

  getRuntimeId(editor, path) {
    return getEditorRuntime(editor).getRuntimeId(path);
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

  insertNode(editor, node, options) {
    dispatchCommand(editor, editorCommands.insertNodes, {
      nodes: node,
      options: options as NodeInsertNodesOptions,
    });
  },

  insertNodes(editor, nodes, options) {
    dispatchCommand(editor, editorCommands.insertNodes, {
      nodes,
      options: options as NodeInsertNodesOptions,
    });
  },

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

  liftNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeLiftNodes(owner, options),
      getWriteRoot(editor, options?.at)
    );
  },

  levels(editor, options) {
    return getEditorRuntime(editor).levels(options);
  },

  next<T extends Descendant>(
    editor: Editor,
    options?: EditorNextOptions<T>
  ): NodeEntry<T> | undefined {
    return getEditorRuntime(editor).next(options);
  },

  mergeNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeMergeNodes(owner, options),
      getWriteRoot(editor, options?.at)
    );
  },

  move(editor, options) {
    executeMoveCommand(editor, options);
  },

  moveNodes(editor, options) {
    if (isPathLocation(options.at) && options.at.length === 1) {
      return runInternalEditorWriteSkipNormalize(
        editor,
        (owner) => executeMoveNodes(owner, options),
        getWriteRoot(editor, options.at)
      );
    }

    runInternalEditorWrite(
      editor,
      (owner) => executeMoveNodes(owner, options),
      getWriteRoot(editor, options.at)
    );
  },

  parent(editor, at, options) {
    return getEditorRuntime(editor).parent(at, options);
  },

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

  previous(editor, options) {
    return getEditorRuntime(editor).previous(options);
  },

  range(editor, at, to) {
    return getEditorRuntime(editor).range(at, to);
  },

  defineCommand: defineEditorCommand,

  extend(editor, extension, options) {
    return extendEditorCore(editor, extension, options);
  },

  defineEditorExtension(extension) {
    return defineEditorExtensionCore(
      extension as EditorExtension<any, any>
    ) as never;
  },

  replace(editor, input) {
    replaceEditorSnapshot(editor, input);
  },

  reset(editor, input) {
    replaceEditorSnapshot(editor, input);
  },

  removeMark(editor, key) {
    executeRemoveMarkCommand(editor, key);
  },

  removeNodes(editor, options) {
    dispatchCommand(editor, editorCommands.removeNodes, {
      options: options as NodeRemoveNodesOptions,
    });
  },

  replaceChildren(editor, children, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeReplaceChildren(owner, children, options),
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
      (owner) => executeSetPoint(owner, props, options),
      getImplicitSelectionRoot(editor)
    );
  },

  setNodes(editor, props, options) {
    dispatchCommand(editor, editorCommands.setNodes, {
      options: options as NodeSetNodesOptions,
      props: props as Partial<NodeProps<Node>>,
    });
  },

  setSelection(editor, props) {
    dispatchCommand(editor, editorCommands.setSelection, {
      props,
    });
  },

  splitNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeSplitNodes(owner, options),
      getWriteRoot(editor, options?.at)
    );
  },

  toggleMark(editor, key, value, options) {
    const nextValue = value === undefined ? true : value;
    executeToggleMarkCommand(editor, key, nextValue, options);
  },

  toggleBlock(editor, type, options) {
    dispatchCommand(editor, editorCommands.toggleBlock, {
      blockType: type,
      options,
    });
  },

  unsetNodes(editor, props, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeUnsetNodes(owner, props, options),
      getWriteRoot(editor, options?.at)
    );
  },

  unwrapNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeUnwrapNodes(owner, options),
      getWriteRoot(editor, options?.at)
    );
  },

  wrapNodes(editor, element, options) {
    runInternalEditorWrite(
      editor,
      (owner) => executeWrapNodes(owner, element, options),
      getWriteRoot(editor, options?.at)
    );
  },

  string(editor, at, options) {
    return getEditorRuntime(editor).string(at, options);
  },

  subscribe(editor, listener) {
    return editor.subscribe(listener);
  },

  subscribeCommit(editor, listener) {
    return editor.subscribeCommit(listener);
  },

  subscribeSource(editor, source, listener) {
    return getEditorRuntime(editor).subscribeSource(source, listener);
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

  shouldMergeNodesRemovePrevNode: (editor, prevNode, curNode) =>
    getEditorRuntime(editor).shouldMergeNodesRemovePrevNode(prevNode, curNode),
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
  getPathByRuntimeId,
  getRuntimeId,
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
  extend,
  defineEditorExtension,
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
  defineEditorExtension,
  deleteBackward,
  deleteEditor as delete,
  deleteForward,
  deleteFragment,
  deselect,
  edges,
  elementReadOnly,
  extend,
  first,
  fragment,
  getChildren,
  getCollabEffects,
  getExtensionRegistry,
  getFragment,
  getLastCommit,
  getPathByRuntimeId,
  getRuntimeId,
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
  replaceChildren,
  replace,
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
  unwrapNodes,
  unsetNodes,
  update,
  voidEditor as void,
  wrapNodes,
};

export type PropsCompare = (prop: unknown, node: unknown) => boolean;
export type PropsMerge = (prop: unknown, node: unknown) => unknown;
