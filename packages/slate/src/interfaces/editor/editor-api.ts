import type { OmitFirst } from '@udecode/utils';
import type { Editor, EditorLeafOptions, Path, Range } from 'slate';

import type { findEditorDocumentOrShadowRoot } from '../../internal/dom-editor/findEditorDocumentOrShadowRoot';
import type { findEventRange } from '../../internal/dom-editor/findEventRange';
import type { findNodeKey } from '../../internal/dom-editor/findNodeKey';
import type { getEditorWindow } from '../../internal/dom-editor/getEditorWindow';
import type { hasEditorDOMNode } from '../../internal/dom-editor/hasEditorDOMNode';
import type { hasEditorRange } from '../../internal/dom-editor/hasEditorRange';
import type { isComposing } from '../../internal/dom-editor/isComposing';
import type { isEditorFocused } from '../../internal/dom-editor/isEditorFocused';
import type { isEditorReadOnly } from '../../internal/dom-editor/isEditorReadOnly';
import type { isTargetInsideNonReadonlyVoid } from '../../internal/dom-editor/isTargetInsideNonReadonlyVoid';
import type { toDOMNode } from '../../internal/dom-editor/toDOMNode';
import type { toDOMPoint } from '../../internal/dom-editor/toDOMPoint';
import type { toDOMRange } from '../../internal/dom-editor/toDOMRange';
import type { toSlateNode } from '../../internal/dom-editor/toSlateNode';
import type { toSlatePoint } from '../../internal/dom-editor/toSlatePoint';
import type { toSlateRange } from '../../internal/dom-editor/toSlateRange';
import type { createPathRef } from '../../internal/editor/createPathRef';
import type { createPointRef } from '../../internal/editor/createPointRef';
import type { createRangeRef } from '../../internal/editor/createRangeRef';
import type { getEdgePoints } from '../../internal/editor/getEdgePoints';
import type { getEditorString } from '../../internal/editor/getEditorString';
import type { getEndPoint } from '../../internal/editor/getEndPoint';
import type { getPath } from '../../internal/editor/getPath';
import type { getPathRefs } from '../../internal/editor/getPathRefs';
import type { getPoint } from '../../internal/editor/getPoint';
import type { getPointAfter } from '../../internal/editor/getPointAfter';
import type { getPointBefore } from '../../internal/editor/getPointBefore';
import type { getPointRefs } from '../../internal/editor/getPointRefs';
import type { getPositions } from '../../internal/editor/getPositions';
import type { getRange } from '../../internal/editor/getRange';
import type { getRangeRefs } from '../../internal/editor/getRangeRefs';
import type { getStartPoint } from '../../internal/editor/getStartPoint';
import type { hasBlocks } from '../../internal/editor/hasBlocks';
import type { hasInlines } from '../../internal/editor/hasInlines';
import type { hasMark } from '../../internal/editor/hasMark';
import type { hasTexts } from '../../internal/editor/hasTexts';
import type { isAt } from '../../internal/editor/isAt';
import type { isBlock } from '../../internal/editor/isBlock';
import type { isEdgePoint } from '../../internal/editor/isEdgePoint';
import type { isEditorNormalizing } from '../../internal/editor/isEditorNormalizing';
import type { isElementReadOnly } from '../../internal/editor/isElementReadOnly';
import type { isEmpty } from '../../internal/editor/isEmpty';
import type { isEndPoint } from '../../internal/editor/isEndPoint';
import type { isStartPoint } from '../../internal/editor/isStartPoint';
import type { isText } from '../../internal/editor/isText';
import type { unhangRange } from '../../internal/editor/unhangRange';
import type { someNode } from '../../internal/queries/someNode';
import type { HistoryEditor } from '../../slate-history/index';
import type { At, TOperation } from '../../types/index';
import type { ElementIn, ElementOrTextIn } from '../element/index';
import type {
  AncestorIn,
  DescendantIn,
  NodeIn,
  TNodeEntry,
} from '../node/index';
import type { MarksIn, TextIn } from '../text/index';
import type { Value } from './editor';
import type {
  FindNodeOptions,
  FindPathOptions,
  GetAboveNodeOptions,
  GetFragmentOptions,
  GetLevelsOptions,
  GetNextNodeOptions,
  GetNodeEntriesOptions,
  GetNodeEntryOptions,
  GetParentNodeOptions,
  GetPreviousNodeOptions,
  GetVoidNodeOptions,
} from './editor-types';

export type EditorApi<V extends Value = Value> = Pick<
  Editor,
  'hasPath' | 'setNormalizing' | 'shouldMergeNodesRemovePrevNode'
> & {
  /** Get the fragment at a location or selection. */
  fragment: <N extends ElementOrTextIn<V>>(
    at?: At | null,
    options?: GetFragmentOptions
  ) => N[];

  /** Get the dirty paths of the editor. */
  getDirtyPaths: <N extends DescendantIn<V>>(
    operation: TOperation<N>
  ) => Path[];

  /** Override this method to prevent normalizing the editor. */
  shouldNormalize: (options: {
    dirtyPaths: Path[];
    initialDirtyPathsLength: number;
    iteration: number;
    operation?: TOperation;
  }) => boolean;

  /**
   * Returns the fragment at the current selection. Used when cutting or
   * copying, as an example, to get the fragment at the current selection.
   */
  getFragment: (at?: At) => ElementOrTextIn<V>[];

  /** Check if a value is a read-only `Element` object. */
  isElementReadOnly: <N extends ElementIn<V>>(element: N) => boolean;

  /** Check if a value is a void `Element` object. */
  isVoid: <N extends ElementIn<V>>(element: N) => boolean;

  /** Check if a value is a markable `Element` object. */
  markableVoid: <N extends ElementIn<V>>(element: N) => boolean;

  /** Called when there is a change in the editor. */
  onChange: (options?: { operation?: TOperation }) => void;
} & {
  /** Get the matching ancestor above a location in the document. */
  above: <N extends AncestorIn<V>>(
    options?: GetAboveNodeOptions<V>
  ) => TNodeEntry<N> | undefined;
  /** Get the leaf text node at a location. */
  leaf: <N extends TextIn<V>>(
    at: At,
    options?: EditorLeafOptions
  ) => TNodeEntry<N> | undefined;

  /** Iterate through all of the levels at a location. */
  levels: <N extends NodeIn<V>>(
    options?: GetLevelsOptions<V>
  ) => Generator<TNodeEntry<N>, void, undefined>;

  /**
   * Get the matching node in the branch of the document after a location.
   *
   * Note: To find the next Point, and not the next Node, use the `Editor.after`
   * method
   */
  next: <N extends DescendantIn<V>>(
    options?: GetNextNodeOptions<V>
  ) => TNodeEntry<N> | undefined;
  /** Get the node at a location. */
  node: <N extends DescendantIn<V>>(
    at: At,
    options?: GetNodeEntryOptions
  ) => TNodeEntry<N> | undefined;
  /**
   * At any given `Location` or `Span` in the editor provided by `at` (default
   * is the current selection), the method returns a Generator of `NodeEntry`
   * objects that represent the nodes that include `at`. At the top of the
   * hierarchy is the `Editor` object itself.
   */
  nodes: <N extends DescendantIn<V>>(
    options?: GetNodeEntriesOptions<V>
  ) => Generator<TNodeEntry<N>, void, undefined>;
  /** Get the parent node of a location. */
  parent: <N extends AncestorIn<V>>(
    at: At,
    options?: GetParentNodeOptions
  ) => TNodeEntry<N> | undefined;
  /**
   * Get the matching node in the branch of the document before a location.
   *
   * Note: To find the previous Point, and not the previous Node, use the
   * `Editor.before` method
   */
  previous: <N extends DescendantIn<V>>(
    options?: GetPreviousNodeOptions<V>
  ) => TNodeEntry<N> | undefined;
  /** Match a void node in the current branch of the editor. */
  void: <N extends ElementIn<V>>(
    options?: GetVoidNodeOptions
  ) => TNodeEntry<N> | undefined;
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
  /** Get the first node at a location. */
  first: <N extends DescendantIn<V>>(at: At) => TNodeEntry<N> | undefined;
  /** Get the fragment at a location. */
  fragment: <N extends ElementOrTextIn<V>>(at: At) => N[] | undefined;
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
  /** Get the last node at a location. */
  last: <N extends DescendantIn<V>>(at: At) => TNodeEntry<N> | undefined;
  /** Get the marks that would be added to text at the current selection. */
  marks: () => MarksIn<V> | null;
  /** Get the path of a location. */
  path: OmitFirst<typeof getPath>;
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
  range: OmitFirst<typeof getRange>;
  /**
   * Create a mutable ref for a `Range` object, which will stay in sync as new
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
} & {
  /**
   * Find the path of Slate node. If DOM node is not found, it will use
   * `findNodePath` (traversal method).
   */
  findPath: <N extends NodeIn<V>>(
    node: N,
    options?: FindPathOptions
  ) => Path | undefined;
  /** Check if the target is inside a non-readonly void element. */
  isTargetInsideNonReadonlyVoid: OmitFirst<
    typeof isTargetInsideNonReadonlyVoid
  >;
  /** Find a Slate node from a native DOM `element` */
  toSlateNode: <N extends NodeIn<V>>(
    domNode: Parameters<typeof toSlateNode>[1]
  ) => N | undefined;
  findDocumentOrShadowRoot: OmitFirst<typeof findEditorDocumentOrShadowRoot>;
  /** Get the target range from a DOM `event` */
  findEventRange: OmitFirst<typeof findEventRange>;
  /**
   * Find a key for a Slate node. Returns an instance of `Key` which looks like
   * `{ id: string }`
   */
  findKey: OmitFirst<typeof findNodeKey>;
  getWindow: OmitFirst<typeof getEditorWindow>;
  /** Check if a DOM node is within the editor */
  hasDOMNode: OmitFirst<typeof hasEditorDOMNode>;
  hasEditableTarget: (target: EventTarget | null) => target is Node;
  hasRange: OmitFirst<typeof hasEditorRange>;
  hasSelectableTarget: (target: EventTarget | null) => target is Node;
  hasTarget: (target: EventTarget | null) => target is Node;
  /** Check if the user is currently composing inside the editor */
  isComposing: OmitFirst<typeof isComposing>;
  /** Check if the editor is focused */
  isFocused: OmitFirst<typeof isEditorFocused>;
  /** Check if the editor is in read-only mode */
  isReadOnly: OmitFirst<typeof isEditorReadOnly>;
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
} & {
  /** Get the merge flag's current value. */
  isMerging: OmitFirst<typeof HistoryEditor.isMerging>;
  /** Get the saving flag's current value. */
  isSaving: OmitFirst<typeof HistoryEditor.isSaving>;
  isSplittingOnce: OmitFirst<typeof HistoryEditor.isSplittingOnce>;
} & {
  /** Get the closest block above a location (default: selection). */
  block: <N extends ElementIn<V>>(
    options?: GetAboveNodeOptions<V>
  ) => TNodeEntry<N> | undefined;

  /** Returns all matching blocks. */
  blocks: <N extends ElementIn<V>>(
    options?: GetNodeEntriesOptions<V>
  ) => TNodeEntry<N>[];

  /** Returns the first matching descendant. */
  descendant: <N extends DescendantIn<V>>(
    options: FindNodeOptions<V>
  ) => TNodeEntry<N> | undefined;

  /** Returns the edge blocks above a location (default: selection). */
  edgeBlocks: <N1 extends ElementIn<V>, N2 extends ElementIn<V> = N1>(
    options?: GetAboveNodeOptions<V>
  ) => [TNodeEntry<N1>, TNodeEntry<N2>] | null;

  /** Returns the first matching node. */
  find: <N extends DescendantIn<V>>(
    options?: FindNodeOptions<V>
  ) => TNodeEntry<N> | undefined;

  /** Returns the last node at a given level. */
  lastByLevel: <N extends ElementOrTextIn<V>>(
    level: number
  ) => TNodeEntry<N> | undefined;

  /** Returns the selection mark value by key. */
  mark: <K extends keyof MarksIn<V>>(
    key: K
  ) => MarksIn<V>[K] | null | undefined;

  /** Get the highest block in the editor. */
  highestBlock: <N extends V[number]>(at?: Path) => TNodeEntry<N> | undefined;

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

  /** Check if a node at a location is a Text node */
  isText: OmitFirst<typeof isText>;
  /** Returns the range spanning the given node entries. */
  nodesRange: (nodes: TNodeEntry[]) => Range | undefined;
  /**
   * Check if any node at a location (default: selection) matches the given
   * criteria
   */
  some: OmitFirst<typeof someNode>;
};
