import type { OmitFirst } from '@udecode/utils';

import type { findDocumentOrShadowRoot } from '../../internal/dom-editor/findDocumentOrShadowRoot';
import type { findEventRange } from '../../internal/dom-editor/findEventRange';
import type { findKey } from '../../internal/dom-editor/findKey';
import type { getWindow } from '../../internal/dom-editor/getWindow';
import type { hasDOMNode } from '../../internal/dom-editor/hasDOMNode';
import type { hasRange } from '../../internal/dom-editor/hasRange';
import type { isComposing } from '../../internal/dom-editor/isComposing';
import type { isFocused } from '../../internal/dom-editor/isFocused';
import type { isReadOnly } from '../../internal/dom-editor/isReadOnly';
import type { isTargetInsideNonReadonlyVoid } from '../../internal/dom-editor/isTargetInsideNonReadonlyVoid';
import type { toDOMNode } from '../../internal/dom-editor/toDOMNode';
import type { toDOMPoint } from '../../internal/dom-editor/toDOMPoint';
import type { toDOMRange } from '../../internal/dom-editor/toDOMRange';
import type { toSlateNode } from '../../internal/dom-editor/toSlateNode';
import type { toSlatePoint } from '../../internal/dom-editor/toSlatePoint';
import type { toSlateRange } from '../../internal/dom-editor/toSlateRange';
import type { hasMark } from '../../internal/editor-extension/hasMark';
import type { isAt } from '../../internal/editor-extension/isAt';
import type { isText } from '../../internal/editor-extension/isText';
import type { scrollIntoView } from '../../internal/editor-extension/scrollIntoView';
import type { some } from '../../internal/editor-extension/some';
import type { createPathRef } from '../../internal/editor/createPathRef';
import type { createPointRef } from '../../internal/editor/createPointRef';
import type { createRangeRef } from '../../internal/editor/createRangeRef';
import type { path } from '../../internal/editor/editor-path';
import type { getEdgePoints } from '../../internal/editor/getEdgePoints';
import type { getEditorString } from '../../internal/editor/getEditorString';
import type { getEndPoint } from '../../internal/editor/getEndPoint';
import type { getPathRefs } from '../../internal/editor/getPathRefs';
import type { getPoint } from '../../internal/editor/getPoint';
import type { getPointAfter } from '../../internal/editor/getPointAfter';
import type { getPointBefore } from '../../internal/editor/getPointBefore';
import type { getPointRefs } from '../../internal/editor/getPointRefs';
import type { getPositions } from '../../internal/editor/getPositions';
import type { getRangeRefs } from '../../internal/editor/getRangeRefs';
import type { getStartPoint } from '../../internal/editor/getStartPoint';
import type { hasBlocks } from '../../internal/editor/hasBlocks';
import type { hasInlines } from '../../internal/editor/hasInlines';
import type { hasTexts } from '../../internal/editor/hasTexts';
import type { isBlock } from '../../internal/editor/isBlock';
import type { isEdgePoint } from '../../internal/editor/isEdgePoint';
import type { isEditorNormalizing } from '../../internal/editor/isEditorNormalizing';
import type { isElementReadOnly } from '../../internal/editor/isElementReadOnly';
import type { isEmpty } from '../../internal/editor/isEmpty';
import type { isEndPoint } from '../../internal/editor/isEndPoint';
import type { isStartPoint } from '../../internal/editor/isStartPoint';
import type { range } from '../../internal/editor/range';
import type { unhangRange } from '../../internal/editor/unhangRange';
import type { HistoryApi } from '../../slate-history';
import type {
  At,
  AtOrDescendant,
  LeafEdge,
  RangeDirection,
  TextDirection,
  TextUnitAdjustment,
} from '../../types';
import type { Predicate } from '../../utils';
import type { ElementIn, ElementOrTextIn, TElement } from '../element';
import type { Span, TLocation } from '../location';
import type { AncestorIn, DescendantIn, NodeIn, TNode } from '../node';
import type { NodeEntry } from '../node-entry';
import type { Operation } from '../operation';
import type { Path } from '../path';
import type { Point } from '../point';
import type { TRange } from '../range';
import type { MarksIn, TextIn } from '../text';
import type { Value } from './editor-type';

export type EditorAboveOptions<V extends Value = Value> = QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type EditorAfterOptions = {
  distance?: number;
} & QueryTextUnit &
  QueryVoids;

export type EditorApi<V extends Value = Value> = {
  /** Get the fragment at a location or selection. */
  fragment: <N extends ElementOrTextIn<V>>(
    at?: At | null,
    options?: EditorFragmentOptions
  ) => N[];
  /** Get the dirty paths of the editor. */
  getDirtyPaths: <N extends DescendantIn<V>>(operation: Operation<N>) => Path[];
  /**
   * Returns the fragment at the current selection. Used when cutting or
   * copying, as an example, to get the fragment at the current selection.
   */
  getFragment: (at?: At) => ElementOrTextIn<V>[];
  /** Check if a value is a read-only `Element` object. */
  isElementReadOnly: <N extends ElementIn<V>>(element: N) => boolean;
  /** Check if a path is selected by the current selection. */
  isSelected: (
    target: Path | TRange,
    options?: EditorIsSelectedOptions
  ) => boolean;
  /** Check if a value is a void `Element` object. */
  isVoid: <N extends ElementIn<V>>(element: N) => boolean;
  /** Check if a value is a markable `Element` object. */
  markableVoid: <N extends ElementIn<V>>(element: N) => boolean;
  /**
   * Manually set if the editor should currently be normalizing. Note: Using
   * this incorrectly can leave the editor in an invalid state.
   */
  setNormalizing: (isNormalizing: boolean) => void;
  /**
   * Call a function, Determine whether or not remove the previous node when
   * merge.
   */
  shouldMergeNodesRemovePrevNode: (
    prevNodeEntry: NodeEntry,
    curNodeEntry: NodeEntry
  ) => boolean;
  /** Override this method to prevent normalizing the editor. */
  shouldNormalize: (options: {
    dirtyPaths: Path[];
    initialDirtyPathsLength: number;
    iteration: number;
    operation?: Operation;
  }) => boolean;
  /** Called when there is a change in the editor. */
  onChange: (options?: { operation?: Operation }) => void;
} & {
  /**
   * Get the point after a location.
   *
   * If there is no point after the location (e.g. we are at the bottom of the
   * document) returns `undefined`.
   */
  after: OmitFirst<typeof getPointAfter>;
  /**
   * Returns the point before a location with optional matching criteria.
   *
   * If there is no point before the location (e.g. we are at the top of the
   * document) returns `undefined`.
   */
  before: OmitFirst<typeof getPointBefore>;
  /** Get the start and end points of a location. */
  edges: OmitFirst<typeof getEdgePoints>;
  /** Check if an element is read-only. */
  elementReadOnly: OmitFirst<typeof isElementReadOnly>;
  /** Get the end point of a location. */
  end: OmitFirst<typeof getEndPoint>;
  /** Check if a node has block children. */
  hasBlocks: OmitFirst<typeof hasBlocks>;
  /** Check if a node has inline and text children. */
  hasInlines: OmitFirst<typeof hasInlines>;
  /** Check if mark is active at selection */
  hasMark: OmitFirst<typeof hasMark>;
  /** Check if a node has text children. */
  hasTexts: OmitFirst<typeof hasTexts>;
  /** Check if a value is a block `Element` object. */
  isBlock: OmitFirst<typeof isBlock>;
  /** Check if a point is an edge of a location. */
  isEdge: OmitFirst<typeof isEdgePoint>;
  /**
   * Check if an element is empty, accounting for void nodes.
   *
   * @example
   *   ```ts
   *   editor.api.isEmpty() // Check if editor is empty
   *   editor.api.isEmpty(at) // Check if nodes at location are empty
   *   editor.api.isEmpty(at, { after: true }) // Check if text after location is empty
   *   editor.api.isEmpty(at, { block: true }) // Check if block above location is empty
   *   ```;
   */
  isEmpty: OmitFirst<typeof isEmpty>;
  /** Check if a point is the end point of a location. */
  isEnd: OmitFirst<typeof isEndPoint>;
  /** Check if the editor is currently normalizing after each operation. */
  isNormalizing: OmitFirst<typeof isEditorNormalizing>;
  /** Check if a point is the start point of a location. */
  isStart: OmitFirst<typeof isStartPoint>;
  /** Get the path of a location. */
  path: OmitFirst<typeof path>;
  /**
   * Create a mutable ref for a `Path` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  pathRef: OmitFirst<typeof createPathRef>;
  /** Get the set of currently tracked path refs of the editor. */
  pathRefs: OmitFirst<typeof getPathRefs>;
  /** Get the `start` or `end` (default is `start`) point of a location. */
  point: OmitFirst<typeof getPoint>;
  /**
   * Create a mutable ref for a `Point` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  pointRef: OmitFirst<typeof createPointRef>;
  /** Get the set of currently tracked point refs of the editor. */
  pointRefs: OmitFirst<typeof getPointRefs>;
  /**
   * Iterate through all of the positions in the document where a `Point` can be
   * placed. The first `Point` returns is always the starting point followed by
   * the next `Point` as determined by the `unit` option. Note: By default void
   * nodes are treated as a single point and iteration will not happen inside
   * their content unless the voids option is set, then iteration will occur.
   */
  positions: OmitFirst<typeof getPositions>;
  /**
   * Get a range from a location to another location.
   *
   * @example
   *   ```ts
   *   editor.api.range(at, to) // From a location to another location
   *   editor.api.range('start', at) // From block start to a location
   *   editor.api.range('before', at, { before }) // From the point before a location
   *   ```;
   */
  range: OmitFirst<typeof range>;
  /**
   * Create a mutable ref for a `TRange` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  rangeRef: OmitFirst<typeof createRangeRef>;
  /** Get the set of currently tracked range refs of the editor. */
  rangeRefs: OmitFirst<typeof getRangeRefs>;
  /** Get the start point of a location. */
  start: OmitFirst<typeof getStartPoint>;
  /**
   * Get the text string content of a location.
   *
   * Note: by default the text of void nodes is considered to be an empty
   * string, regardless of content, unless you pass in true for the voids
   * option.
   *
   * @example
   *   ```ts
   *   editor.api.string() // Get selection string
   *   editor.api.string([]) // Get whole editor string
   *   editor.api.string(at) // Get string at location
   *   ```;
   */
  string: OmitFirst<typeof getEditorString>;
  /**
   * Convert a range into a non-hanging one.
   *
   * A "hanging" range is one created by the browser's "triple-click" selection
   * behavior. When triple-clicking a block, the browser selects from the start
   * of that block to the start of the _next_ block. The range thus "hangs over"
   * into the next block. If `unhangRange` is given such a range, it moves the
   * end backwards until it's in a non-empty text node that precedes the hanging
   * block.
   *
   * Note that `unhangRange` is designed for the specific purpose of fixing
   * triple-clicked blocks, and therefore currently has a number of caveats:
   *
   * - It does not modify the start of the range; only the end. For example, it
   *   does not "unhang" a selection that starts at the end of a previous
   *   block.
   * - It only does anything if the start block is fully selected. For example, it
   *   does not handle ranges created by double-clicking the end of a paragraph
   *   (which browsers treat by selecting from the end of that paragraph to the
   *   start of the next).
   */
  unhangRange: OmitFirst<typeof unhangRange>;
  /** Get the matching ancestor above a location in the document. */
  above: <N extends AncestorIn<V>>(
    options?: EditorAboveOptions<V>
  ) => NodeEntry<N> | undefined;
  /** Get the first node at a location. */
  first: <N extends DescendantIn<V>>(at: At) => NodeEntry<N> | undefined;
  /** Get the fragment at a location. */
  fragment: <N extends ElementOrTextIn<V>>(at: At) => N[] | undefined;
  /** Check if a path exists in the editor. */
  hasPath: (path: Path) => boolean;
  /** Get the last node at a location. */
  last: <N extends DescendantIn<V>>(
    at: At,
    options?: EditorLastOptions
  ) => NodeEntry<N> | undefined;
  /** Get the leaf text node at a location. */
  leaf: <N extends TextIn<V>>(
    at: At,
    options?: EditorLeafOptions
  ) => NodeEntry<N> | undefined;
  /** Iterate through all of the levels at a location. */
  levels: <N extends NodeIn<V>>(
    options?: EditorLevelsOptions<V>
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Get the marks that would be added to text at the current selection. */
  marks: () => MarksIn<V> | null;
  /**
   * Get the matching node in the branch of the document after a location.
   *
   * Note: To find the next Point, and not the next Node, use the `Editor.after`
   * method
   */
  next: <N extends DescendantIn<V>>(
    options?: EditorNextOptions<V>
  ) => NodeEntry<N> | undefined;
  /**
   * Get the node at a location or find the first node that matches options.
   *
   * @example
   *   ```ts
   *   editor.api.node([0]) // Get node at path [0]
   *   editor.api.node({ at: [], id: '1' }) // Find first node with id '1'
   *   editor.api.node({ at: path, block: true }) // Find first block at path
   *   ```;
   */
  node: <N extends DescendantIn<V>>(
    atOrOptions: AtOrDescendant | EditorNodesOptions<V>,
    nodeOptions?: EditorNodeOptions
  ) => NodeEntry<N> | undefined;
  /**
   * At any given `Location` or `Span` in the editor provided by `at` (default
   * is the current selection), the method returns a Generator of `NodeEntry`
   * objects that represent the nodes that include `at`. At the top of the
   * hierarchy is the `Editor` object itself.
   */
  nodes: <N extends DescendantIn<V>>(
    options?: EditorNodesOptions<V>
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Get the parent node of a location. */
  parent: <N extends AncestorIn<V>>(
    at: At,
    options?: EditorParentOptions
  ) => NodeEntry<N> | undefined;
  /**
   * Get the matching node in the branch of the document before a location.
   *
   * Note: To find the previous Point, and not the previous Node, use the
   * `Editor.before` method
   */
  previous: <N extends DescendantIn<V>>(
    options?: EditorPreviousOptions<V>
  ) => NodeEntry<N> | undefined;
  /** Match a void node in the current branch of the editor. */
  void: <N extends ElementIn<V>>(
    options?: EditorVoidOptions
  ) => NodeEntry<N> | undefined;
} & {
  findDocumentOrShadowRoot: OmitFirst<typeof findDocumentOrShadowRoot>;
  /** Get the target range from a DOM `event` */
  findEventRange: OmitFirst<typeof findEventRange>;
  /**
   * Find a key for a Slate node. Returns an instance of `Key` which looks like
   * `{ id: string }`
   */
  findKey: OmitFirst<typeof findKey>;
  getWindow: OmitFirst<typeof getWindow>;
  /** Check if a DOM node is within the editor */
  hasDOMNode: OmitFirst<typeof hasDOMNode>;
  hasRange: OmitFirst<typeof hasRange>;
  /** Check if the user is currently composing inside the editor */
  isComposing: OmitFirst<typeof isComposing>;
  /** Check if the editor is focused */
  isFocused: OmitFirst<typeof isFocused>;
  /** Check if the editor is in read-only mode */
  isReadOnly: OmitFirst<typeof isReadOnly>;
  /** Check if the target is inside a non-readonly void element. */
  isTargetInsideNonReadonlyVoid: OmitFirst<
    typeof isTargetInsideNonReadonlyVoid
  >;
  /** Find the native DOM element from a Slate node */
  toDOMNode: OmitFirst<typeof toDOMNode>;
  /** Find a native DOM selection point from a Slate point */
  toDOMPoint: OmitFirst<typeof toDOMPoint>;
  /** Find a native DOM range from a Slate `range` */
  toDOMRange: OmitFirst<typeof toDOMRange>;
  /** Find a Slate point from a DOM selection's `domNode` and `domOffset`. */
  toSlatePoint: OmitFirst<typeof toSlatePoint>;
  /** Find a Slate range from a DOM range or selection. */
  toSlateRange: OmitFirst<typeof toSlateRange>;
  /**
   * Find the path of Slate node. If DOM node is not found, it will use
   * `findNodePath` (traversal method).
   */
  findPath: (node: TNode, options?: EditorFindPathOptions) => Path | undefined;
  hasEditableTarget: (target: EventTarget | null) => target is Node;
  hasSelectableTarget: (target: EventTarget | null) => target is Node;
  hasTarget: (target: EventTarget | null) => target is Node;
  /** Find a Slate node from a native DOM `element` */
  toSlateNode: <N extends NodeIn<V>>(
    domNode: Parameters<typeof toSlateNode>[1]
  ) => N | undefined;
} & {
  /** Get the merge flag's current value. */
  isMerging: OmitFirst<typeof HistoryApi.isMerging>;
  /** Get the saving flag's current value. */
  isSaving: OmitFirst<typeof HistoryApi.isSaving>;
  isSplittingOnce: OmitFirst<typeof HistoryApi.isSplittingOnce>;
} & {
  create: {
    /** Default block factory. */
    block: (node?: Partial<TElement>, path?: Path) => TElement;
    /** Default value factory. */
    value: () => Value;
  };
  /**
   * Check if a location (point/range) is at a specific position.
   *
   * @example
   *   ```ts
   *   // For ranges:
   *   editor.api.isAt({ text: true }) // Check if range is in single text node
   *   editor.api.isAt({ block: true }) // Check if range is in single block
   *   editor.api.isAt({ blocks: true }) // Check if range is across multiple blocks
   *   editor.api.isAt({ start: true }) // Check if range starts at block start
   *   editor.api.isAt({ end: true }) // Check if range ends at block end
   *
   *   // For points:
   *   editor.api.isAt({ word: true }) // Check relative to word boundaries
   *   editor.api.isAt({ start: true }) // Check if at start
   *   editor.api.isAt({ end: true }) // Check if at end
   *   ```;
   */
  isAt: OmitFirst<typeof isAt>;
  /** Check if a node at a location is a Text node */
  isText: OmitFirst<typeof isText>;
  /**
   * Scroll the editor to bring a target point into view.
   *
   * @param target - The point to scroll into view
   * @param options - Scroll options
   */
  scrollIntoView: OmitFirst<typeof scrollIntoView>;
  /**
   * Check if any node at a location (default: selection) matches the given
   * criteria
   */
  some: OmitFirst<typeof some>;
  /**
   * Get the block at a location or find the first block that matches options.
   * If `above` is true, get the block above the location, similar to
   * `editor.api.above({ block: true })`. If `highest` is true, get the highest
   * block at the location.
   *
   * @example
   *   ```ts
   *   editor.api.block() // Get block above selection
   *   editor.api.block({ above: true }) // Get block above selection
   *   editor.api.block({ at: [0, 0] }) // Get block at [0, 0]
   *   editor.api.block({ at: [0, 0], above: true }) // Get block at [0]
   *   editor.api.block({ highest: true }) // Get highest block at selection
   *   ```;
   */
  block: <N extends ElementIn<V>>(
    options?: EditorBlockOptions<V>
  ) => NodeEntry<N> | undefined;
  /** Returns all matching blocks. */
  blocks: <N extends ElementIn<V>>(
    options?: EditorNodesOptions<V>
  ) => NodeEntry<N>[];
  /** Returns the first matching descendant. */
  descendant: <N extends DescendantIn<V>>(
    options: EditorNodesOptions<V>
  ) => NodeEntry<N> | undefined;
  /** Returns the edge blocks above a location (default: selection). */
  edgeBlocks: <N1 extends ElementIn<V>, N2 extends ElementIn<V> = N1>(
    options?: EditorAboveOptions<V>
  ) => [NodeEntry<N1>, NodeEntry<N2>] | null;
  /** Check if the selection is collapsed */
  isCollapsed: () => boolean;
  /** Check if selection is at editor end */
  isEditorEnd: () => boolean;
  /** Check if the selection is expanded */
  isExpanded: () => boolean;
  /** Check if a value is an inline `Element` object. */
  isInline: <N extends DescendantIn<V>>(element: N) => boolean;
  /** Check if a value is a selectable `Element` object. */
  isSelectable: <N extends ElementIn<V>>(element: N) => boolean;
  /** Returns the selection mark value by key. */
  mark: <K extends keyof MarksIn<V>>(
    key: K
  ) => MarksIn<V>[K] | null | undefined;
  /** Returns the range spanning the given node entries. */
  nodesRange: (nodes: NodeEntry[]) => TRange | undefined;
  /**
   * Get a property value from a list of nodes. Returns undefined if the
   * property value is not consistent across all nodes.
   */
  prop: (options: EditorPropOptions<V>) => string | undefined;
};

export type EditorBeforeOptions = {
  distance?: number;
} & QueryTextUnit &
  QueryVoids & {
    /**
     * If true, get the point after the matching point. If false, get the
     * matching point.
     */
    afterMatch?: boolean;
    /** Return block start point if no match found */
    matchBlockStart?: boolean;
    /**
     * If true, `matchString` will be interpreted as regex expression(s).
     * Otherwise, it will be compared by string equality.
     *
     * @default false
     */
    matchByRegex?: boolean;
    /** Lookup before the location for `matchString`. */
    matchString?: string[] | string;
    /**
     * If true, lookup until the start of the editor value. If false, lookup
     * until the first invalid character.
     */
    skipInvalid?: boolean;
    /** Lookup before the location until this predicate is true */
    match?: (value: {
      at: At;
      beforePoint: Point;
      beforeString: string;
    }) => boolean;
  };

export type EditorBlockOptions<V extends Value = Value> = Omit<
  EditorNodesOptions<V>,
  'block' | 'mode'
> & {
  /**
   * If true, get the block above the location. This has no effect when `at` is
   * not a block path.
   */
  above?: boolean;
  /**
   * If true, get the highest block at the location. This will return the block
   * at the root level (path length 1).
   */
  highest?: boolean;
};

export type EditorElementReadOnlyOptions = {
  at?: TLocation;
} & QueryMode &
  QueryVoids;

export type EditorEmptyOptions = {
  /** Check if text after selection is empty */
  after?: boolean;
  /** Check if block above location is empty */
  block?: boolean;
} & Omit<EditorNodesOptions, 'at' | 'block'>;

export type EditorEndOptions = {
  /** Get the end point of the previous node */
  previous?: boolean;
};

export type EditorFindPathOptions = Omit<
  EditorNodesOptions<Value>,
  'at' | 'block' | 'match'
>;

export type EditorFragmentDeletionOptions = {
  direction?: TextDirection;
};

export type EditorFragmentOptions = {
  /** Types of structural nodes to unwrap */
  structuralTypes?: string[];
};

export type EditorIsSelectedOptions = {
  /** Check if selection contains the entire path range */
  contains?: boolean;
};

export type EditorLastOptions = {
  /** Get last node at this level (0-based). */
  level?: number;
};

export type EditorLeafOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export type EditorLevelsOptions<V extends Value = Value> = {
  reverse?: boolean;
} & QueryOptions<V> &
  QueryVoids;

export type EditorNextOptions<V extends Value = Value> = QueryOptions<V> &
  QueryVoids & {
    /**
     * Determines where to start traversing from:
     *
     * - `'after'` (default): Start from the point after the current location
     * - `'child'`: Start from the first child of the current path. `at` must be a
     *   path.
     */
    from?: 'after' | 'child';
    /**
     * - `'all'` (default if `from` is `child`): Return all matching nodes.
     * - `'highest'`: in a hierarchy of nodes, only return the highest level
     *   matching nodes
     * - `'lowest'` (default if `from` is `after`): in a hierarchy of nodes, only
     *   return the lowest level matching nodes
     */
    mode?: 'all' | 'highest' | 'lowest';
  };

export type EditorNodeOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export type EditorNodesOptions<V extends Value = Value> = {
  /** Where to start at. @default editor.selection */
  at?: At | Span;
  ignoreNonSelectable?: boolean;
  reverse?: boolean;
  universal?: boolean;
} & Omit<QueryOptions<V>, 'at'> &
  QueryMode &
  QueryVoids;

export type EditorNormalizeOptions = {
  force?: boolean;
  operation?: Operation;
};

export type EditorParentOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export type EditorPathOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export type EditorPathRefOptions = {
  affinity?: TextDirection | null;
};

export type EditorPointOptions = {
  edge?: LeafEdge;
};

export type EditorPointRefOptions = {
  affinity?: TextDirection | null;
};

export type EditorPositionsOptions = {
  ignoreNonSelectable?: boolean;
  /**
   * When `true` returns the positions in reverse order. In the case of the
   * `unit` being `word`, the actual returned positions are different (i.e. we
   * will get the start of a word in reverse instead of the end).
   */
  reverse?: boolean;
} & QueryAt &
  QueryVoids &
  QueryTextUnit;

export type EditorPreviousOptions<V extends Value = Value> = QueryOptions<V> &
  QueryVoids & {
    /**
     * Determines where to start traversing from:
     *
     * - `'before'` (default): Start from the point before the current location
     * - `'parent'`: Start from the parent of the current location
     */
    from?: 'before' | 'parent';
    /**
     * - `'all'`: Return all matching nodes
     * - `'highest'`: in a hierarchy of nodes, only return the highest level
     *   matching nodes
     * - `'lowest'` (default): in a hierarchy of nodes, only return the lowest
     *   level matching nodes
     */
    mode?: 'all' | 'highest' | 'lowest';
    /** Get the previous sibling node */
    sibling?: boolean;
  };

export type EditorPropOptions<V extends Value = Value> = {
  /** Nodes to get the property value from. */
  nodes: TElement[];
  /** Property key to get. */
  key?: string;
  /** Default value to return if property is not found. */
  defaultValue?: string;
  /**
   * - `'all'`: Get the property value from all nodes.
   * - `'block'`: Get the property value from the first block node.
   * - `'text'`: Get the property value from the first text node.
   */
  mode?: 'all' | 'block' | 'text';
  /** Function to get the property value from a node. */
  getProp?: (node: DescendantIn<V>) => any;
};

export type EditorRangeOptions = {
  /** Get range from before to the end point of `at` */
  before?: EditorBeforeOptions | boolean;
  /**
   * Get range from the start of the block above a location (default: selection)
   * to the location
   */
  blockStart?: boolean;
};

export type EditorRangeRefOptions = {
  affinity?: RangeDirection | null;
};

export type EditorStartOptions = {
  /** Get the start point of the next node */
  next?: boolean;
};

export type EditorStringOptions = QueryVoids;

export type EditorUnhangRangeOptions = {
  /**
   * When true, unhang a range of length 1 so both edges are in the same text
   * node. This is useful for handling ranges created by character-level
   * operations.
   */
  character?: boolean;
  /** @default true */
  unhang?: boolean;
  /** Allow placing the end of the selection in a void node */
  voids?: boolean;
};

export type EditorVoidOptions = QueryAt & QueryMode & QueryVoids;

export type QueryAt = {
  /** Where to start at. @default editor.selection */
  at?: At;
};

export type QueryMode = {
  /**
   * - `'all'` (default): Return all matching nodes
   * - `'highest'`: in a hierarchy of nodes, only return the highest level
   *   matching nodes
   * - `'lowest'`: in a hierarchy of nodes, only return the lowest level matching
   *   nodes
   */
  mode?: 'all' | 'highest' | 'lowest';
};

export type QueryOptions<V extends Value = Value> = {
  /** Match the node by id. `true` will match all nodes with an id. */
  id?: boolean | string;
  /** Match block nodes. */
  block?: boolean;
  /** When true, match only empty nodes. When false, match only non-empty nodes */
  empty?: boolean;
  /** Match the node. */
  match?: Predicate<NodeIn<V>>;
  /** When true, match only text nodes */
  text?: boolean;
} & QueryAt;

export type QueryTextUnit = {
  /**
   * - `offset`: Moves to the next offset `Point`. It will include the `Point` at
   *   the end of a `Text` object and then move onto the first `Point` (at the
   *   0th offset) of the next `Text` object. This may be counter-intuitive
   *   because the end of a `Text` and the beginning of the next `Text` might be
   *   thought of as the same position.
   * - `character`: Moves to the next `character` but is not always the next
   *   `index` in the string. This is because Unicode encodings may require
   *   multiple bytes to create one character. Unlike `offset`, `character` will
   *   not count the end of a `Text` and the beginning of the next `Text` as
   *   separate positions to return. Warning: The character offsets for Unicode
   *   characters does not appear to be reliable in some cases like a Smiley
   *   Emoji will be identified as 2 characters.
   * - `word`: Moves to the position immediately after the next `word`. In
   *   `reverse` mode, moves to the position immediately before the previous
   *   `word`.
   * - `line` | `block`: Starts at the beginning position and then the position at
   *   the end of the block. Then starts at the beginning of the next block and
   *   then the end of the next block.
   */
  unit?: TextUnitAdjustment;
};

export type QueryVoids = {
  /** When `true` include void Nodes. */
  voids?: boolean;
};
