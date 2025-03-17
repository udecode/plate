import type { OmitFirst } from '@udecode/utils';
import type { DOMEditor } from 'slate-dom';

import type { blur } from '../../internal/dom-editor/blur';
import type { deselectDOM } from '../../internal/dom-editor/deselectDOM';
import type { focus } from '../../internal/dom-editor/focus';
import type { addMark } from '../../internal/editor/addMark';
import type { deleteBackward } from '../../internal/editor/deleteBackward';
import type { deleteForward } from '../../internal/editor/deleteForward';
import type { deleteFragment } from '../../internal/editor/deleteFragment';
import type { insertBreak } from '../../internal/editor/insertBreak';
import type { withoutNormalizing } from '../../internal/editor/withoutNormalizing';
import type { addMarks } from '../../internal/transforms-extension/addMarks';
import type { duplicateNodes } from '../../internal/transforms-extension/duplicateNodes';
import type { removeMarks } from '../../internal/transforms-extension/removeMarks';
import type { reset } from '../../internal/transforms-extension/reset';
import type { toggleBlock } from '../../internal/transforms-extension/toggleBlock';
import type { toggleMark } from '../../internal/transforms-extension/toggleMark';
import type { collapseSelection } from '../../internal/transforms/collapseSelection';
import type { deleteText } from '../../internal/transforms/deleteText';
import type { moveSelection } from '../../internal/transforms/moveSelection';
import type { select } from '../../internal/transforms/select';
import type { setPoint } from '../../internal/transforms/setPoint';
import type { setSelection } from '../../internal/transforms/setSelection';
import type { HistoryApi } from '../../slate-history/index';
import type { At, TextUnit } from '../../types';
import type { QueryNodeOptions } from '../../utils';
import type { ElementIn, ElementOrTextIn } from '../element';
import type { Descendant, DescendantIn, NodeIn, NodeProps } from '../node';
import type { NodeEntry } from '../node-entry';
import type { Operation } from '../operation';
import type { Path } from '../path';
import type { TRange } from '../range';
import type {
  EditorNodesOptions,
  EditorNormalizeOptions,
  QueryAt,
  QueryMode,
  QueryOptions,
  QueryTextUnit,
  QueryVoids,
} from './editor-api';
import type { Editor, Value } from './editor-type';

export type AddMarksOptions = {
  /** Marks to remove before adding new ones */
  remove?: string[] | string;
};

export type DeleteTextOptions = {
  distance?: number;
  hanging?: boolean;
  reverse?: boolean;
  unit?: TextUnit;
} & QueryAt &
  QueryVoids &
  QueryTextUnit;

export type DuplicateNodesOptions<V extends Value = Value> = {
  /** Location to get nodes from and insert after. Default: selection */
  at?: At;
  /** If true, duplicate blocks above location. Ignored if `nodes` is provided */
  block?: boolean;
  /** Specific nodes to duplicate. If provided, ignores `block` option */
  nodes?: NodeEntry[];
} & Omit<InsertNodesOptions<V>, 'at' | 'block'>;

export type EditorTransforms<V extends Value = Value> = {
  /**
   * Add a custom property to the leaf text nodes in the current selection.
   *
   * If the selection is currently collapsed, the marks will be added to the
   * `editor.marks` property instead, and applied when text is inserted next.
   */
  addMark: OmitFirst<typeof addMark>;
  /**
   * Add multiple marks to the leaf text nodes in the current selection. If
   * marks with the same keys exist, they will be removed first.
   *
   * @example
   *   ```ts
   *   editor.tf.addMarks({ bold: true, italic: true })
   *   editor.tf.addMarks({ bold: subscript }, { remove: 'superscript' })
   *   editor.tf.addMarks({ bold: true }, { remove: ['italic', 'underline'] })
   *   ```;
   */
  addMarks: OmitFirst<typeof addMarks>;
  /** Delete content in the editor backward from the current selection. */
  deleteBackward: OmitFirst<typeof deleteBackward>;
  /** Delete content in the editor forward from the current selection. */
  deleteForward: OmitFirst<typeof deleteForward>;
  /** Delete the content of the current selection. */
  deleteFragment: OmitFirst<typeof deleteFragment>;
  /**
   * Duplicate nodes at a location. By default duplicates nodes at the current
   * selection. When `block: true`, duplicates the blocks above the location.
   */
  duplicateNodes: OmitFirst<typeof duplicateNodes>;
  /** Insert a block break at the current selection. */
  insertBreak: OmitFirst<typeof insertBreak>;
  /**
   * Remove marks from text nodes.
   *
   * - If `keys` is provided: removes specific mark(s) from text nodes
   * - If `at` is provided: removes from range
   * - If `at` is not provided and selection is expanded: removes marks only if
   *   `keys` is provided
   * - If `at` is not provided and selection is collapsed: removes from
   *   `editor.marks`
   *
   *   - If `keys` is provided: removes specific mark(s)
   *   - If `keys` is not provided: removes all marks
   *
   * If the selection is currently collapsed, the removal will be stored on
   * `editor.marks` and applied to the text inserted next.
   *
   * @example
   *   ```ts
   *   editor.tf.removeMarks() // Remove all marks from editor.marks
   *   editor.tf.removeMarks('bold') // Remove bold mark at selection
   *   editor.tf.removeMarks(['bold', 'italic']) // Remove multiple marks at selection
   *   editor.tf.removeMarks('bold', { at: range }) // Remove bold in range
   *   ```;
   */
  removeMarks: OmitFirst<typeof removeMarks>;
  /**
   * Reset the editor state. Use `children: true` to only reset children without
   * clearing history and operations
   */
  reset: OmitFirst<typeof reset>;
  /**
   * Toggle a block type. If wrap is true, wrap/unwrap the block in the
   * specified type. Otherwise, sets the block type directly.
   *
   * @example
   *   ```ts
   *   editor.tf.toggleBlock('blockquote') // Toggle blockquote
   *   editor.tf.toggleBlock('list', { wrap: true }) // Toggle list wrapper
   *   ```;
   */
  toggleBlock: OmitFirst<typeof toggleBlock>;
  /**
   * Toggle a mark on the leaf text nodes in the current selection. If the mark
   * exists, it will be removed. Otherwise, it will be added.
   *
   * When adding a mark, you can specify marks to remove first using the
   * `remove` option. This is useful for mutually exclusive marks like
   * subscript/superscript.
   *
   * @example
   *   ```ts
   *   editor.tf.toggleMark('bold') // Toggle bold mark
   *   editor.tf.toggleMark('subscript', { remove: 'superscript' }) // Add subscript, remove superscript
   *   ```;
   */
  toggleMark: OmitFirst<typeof toggleMark>;
  /**
   * Call a function, deferring normalization until after it completes
   *
   * @returns True if normalized.
   */
  withoutNormalizing: OmitFirst<typeof withoutNormalizing>;
  /**
   * Insert of fragment of nodes at the specified location or (if not defined)
   * the current selection or (if not defined) the end of the document.
   */
  insertFragment: <N extends ElementOrTextIn<V>>(
    fragment: N[],
    options?: InsertFragmentOptions
  ) => void;
  /**
   * Atomically insert `node` at the specified location or (if not defined) the
   * current selection or (if not defined) the end of the document.
   */
  insertNode: <N extends DescendantIn<V>>(
    node: N,
    options?: InsertNodesOptions<V>
  ) => void;
  /**
   * Atomically inserts `nodes` at the specified location or (if not defined)
   * the current selection or (if not defined) the end of the document.
   */
  insertNodes: <N extends ElementOrTextIn<V>>(
    nodes: N | N[],
    options?: InsertNodesOptions<V>
  ) => void;
  /**
   * Insert a soft break at the current selection. If the selection is currently
   * expanded, delete it first.
   */
  insertSoftBreak: () => void;
  /**
   * Lift nodes at the specified location upwards in the document tree. If
   * necessary, the parent node is split. If no location is specified, use the
   * selection.
   */
  liftNodes: (options?: LiftNodesOptions<V>) => void;
  /**
   * Merge a node at the specified location with the previous node at the same
   * depth. If no location is specified, use the selection. Resulting empty
   * container nodes are removed.
   */
  mergeNodes: (options?: MergeNodesOptions<V>) => void;
  /**
   * Move the nodes from an origin to a destination. A destination must be
   * specified in the `options`. If no origin is specified, move the selection.
   */
  moveNodes: (options: MoveNodesOptions<V>) => void;
  /** Normalize any dirty objects in the editor. */
  normalize: (options?: EditorNormalizeOptions) => void;
  /** Redo to the next saved state. */
  redo: () => void;
  /**
   * Remove a custom property from all of the leaf text nodes within non-void
   * nodes or void nodes that `editor.api.markableVoid()` allows in the current
   * selection.
   *
   * If the selection is currently collapsed, the removal will be stored on
   * `editor.marks` and applied to the text inserted next.
   */
  removeMark: (key: string) => void;
  /**
   * Remove nodes at the specified location in the document. If no location is
   * specified, remove the nodes in the selection.
   */
  removeNodes: (options?: RemoveNodesOptions<V>) => void;
  /**
   * Replace nodes at a location with new nodes.
   *
   * @example
   *   ```ts
   *   editor.tf.replaceNodes(node, { at }) // Replace node at location
   *   editor.tf.replaceNodes(node, { at, select: true }) // Replace node then select
   *   editor.tf.replaceNodes(node, { at, children: true }) // Replace children at location
   *   ```;
   */
  replaceNodes: <N extends ElementOrTextIn<V>>(
    nodes: N | N[],
    options?: ReplaceNodesOptions<V>
  ) => void;
  /**
   * Set properties of nodes at the specified location. If no location is
   * specified, use the selection.
   *
   * If `props` contains `undefined` values, the node's corresponding property
   * will also be set to `undefined` as opposed to ignored.
   */
  setNodes: <N extends DescendantIn<V>>(
    props: Partial<NodeProps<N>>,
    options?: SetNodesOptions<V>
  ) => void;
  /**
   * Split nodes at the specified location. If no location is specified, split
   * the selection.
   */
  splitNodes: (options?: SplitNodesOptions<V>) => void;
  /** Undo to the previous saved state. */
  undo: () => void;
  /**
   * Unset properties of nodes at the specified location. If no location is
   * specified, use the selection.
   */
  unsetNodes: <N extends DescendantIn<V>>(
    props: (keyof NodeProps<N>)[] | keyof NodeProps<N>,
    options?: UnsetNodesOptions<V>
  ) => void;
  /**
   * Unwrap nodes at the specified location. If necessary, the parent node is
   * split. If no location is specified, use the selection.
   */
  unwrapNodes: (options?: UnwrapNodesOptions<V>) => void;
  /**
   * Wrap nodes at the specified location in the `element` container. If no
   * location is specified, wrap the selection.
   */
  wrapNodes: <N extends ElementIn<V>>(
    element: N,
    options?: WrapNodesOptions<V>
  ) => void;
  /**
   * Push a batch of operations as either `undos` or `redos` onto `editor.undos`
   * or `editor.redos`
   */
  writeHistory: (stack: 'redos' | 'undos', batch: any) => void;
} /** Text Transforms */ & {
  /** Delete text in the document. */
  delete: OmitFirst<typeof deleteText>;
  /**
   * Insert a string of text at the specified location or (if not defined) the
   * current selection or (if not defined) the end of the document.
   */
  insertText: (text: string, options?: InsertTextOptions) => void;
} /** Selection Transforms */ & {
  /** Collapse the selection to a single point. */
  collapse: OmitFirst<typeof collapseSelection>;
  /** Move the selection's point forward or backward. */
  move: OmitFirst<typeof moveSelection>;
  /**
   * Set the selection to a new value specified by `at`. When a selection
   * already exists, this method is just a proxy for `setSelection` and will
   * update the existing value.
   *
   * @example
   *   ```ts
   *   editor.tf.select(at) // Select at location
   *   editor.tf.select(at, { edge: 'end' }) // Select end of block above
   *   editor.tf.select(at, { edge: 'start' }) // Select start of block above
   *   ```;
   */
  select: OmitFirst<typeof select>;
  /** Set new properties on one of the selection's points. */
  setPoint: OmitFirst<typeof setPoint>;
  /**
   * Set new properties on an active selection. Since the value is a
   * `Partial<TRange>`, this method can only handle updates to an existing
   * selection. If there is no active selection the operation will be void. Use
   * `select` if you'd like to create a selection when there is none.
   */
  setSelection: OmitFirst<typeof setSelection>;
  /** Unset the selection. */
  deselect: () => void;
} & {
  /** Blur the editor */
  blur: OmitFirst<typeof blur>;
  /** Deselect the editor. */
  deselectDOM: OmitFirst<typeof deselectDOM>;
  /**
   * Focus the editor.
   *
   * - If `at` is defined: select the location and focus
   * - If `edge` is defined: select the location (default: editor) edge ('start' |
   *   'end') and focus
   *
   * @example
   *   ```ts
   *   editor.tf.focus() // focus editor
   *   editor.tf.focus({ edge: 'end' }) // end of selection if selection exists
   *   editor.tf.focus({ edge: 'end' }) // end of editor if selection is null
   *   ```;
   */
  focus: OmitFirst<typeof focus>;
  /**
   * Insert data from a `DataTransfer` into the editor. This is a proxy method
   * to call in this order `insertFragmentData(editor: Editor, data:
   * DataTransfer)` and then `insertTextData(editor: Editor, data:
   * DataTransfer)`.
   */
  insertData: DOMEditor['insertData'];
  /**
   * Insert fragment data from a `DataTransfer` into the editor. Returns true if
   * some content has been effectively inserted.
   */
  insertFragmentData: DOMEditor['insertFragmentData'];
  /**
   * Insert text data from a `DataTransfer` into the editor. Returns true if
   * some content has been effectively inserted.
   */
  insertTextData: DOMEditor['insertTextData'];
  /** Sets data from the currently selected fragment on a `DataTransfer`. */
  setFragmentData: DOMEditor['setFragmentData'];
} & {
  setSplittingOnce: OmitFirst<typeof HistoryApi.setSplittingOnce>;
  /**
   * Apply a series of changes inside a synchronous `fn`, These operations will
   * be merged into the previous history.
   */
  withMerging: OmitFirst<typeof HistoryApi.withMerging>;
  /**
   * Apply a series of changes inside a synchronous `fn`, ensuring that the
   * first operation starts a new batch in the history. Subsequent operations
   * will be merged as usual.
   */
  withNewBatch: OmitFirst<typeof HistoryApi.withNewBatch>;
  /**
   * Apply a series of changes inside a synchronous `fn`, without merging any of
   * the new operations into previous save point in the history.
   */
  withoutMerging: OmitFirst<typeof HistoryApi.withoutMerging>;
  /**
   * Apply a series of changes inside a synchronous `fn`, without saving any of
   * their operations into the history.
   */
  withoutSaving: OmitFirst<typeof HistoryApi.withoutSaving>;
} & {
  /** Apply an operation in the editor. */
  apply: <N extends DescendantIn<V>>(operation: Operation<N>) => void;
  /** Normalize a Node according to the schema. */
  normalizeNode: <N extends NodeIn<V>>(
    entry: NodeEntry<N>,
    options?: { operation?: Operation }
  ) => void;
};

export type FocusOptions = {
  /** Target location to select before focusing */
  at?: At;
  /** Focus at location or editor edge. Default location is at or selection. */
  edge?: 'end' | 'endEditor' | 'start' | 'startEditor';
  /** Number of times to retry focusing */
  retries?: number;
};

export type InsertFragmentOptions = {
  batchDirty?: boolean;
  hanging?: boolean;
} & QueryAt &
  QueryVoids;

export type InsertNodesOptions<V extends Value = Value> = {
  batchDirty?: boolean;
  hanging?: boolean;
  /**
   * Insert the nodes after the currect block. Does not apply if the removeEmpty
   * option caused the current block to be removed.
   */
  nextBlock?: boolean;
  /**
   * Remove the currect block if empty before inserting. Only applies to
   * paragraphs by default, but can be customized by passing a QueryNodeOptions
   * object.
   */
  removeEmpty?: QueryNodeOptions | boolean;
  /** If true, select the inserted nodes. */
  select?: boolean;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type InsertTextOptions = {
  /** @default true */
  marks?: boolean;
} & QueryAt &
  QueryVoids;

export type LiftNodesOptions<V extends Value = Value> = QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type MergeNodesOptions<V extends Value, E extends Editor = Editor> = {
  hanging?: boolean;
  /**
   * Default: if the node isn't already the next sibling of the previous node,
   * move it so that it is before merging.
   */
  mergeNode?: (editor: E, options: { at: Path; to: Path }) => void;
  /**
   * Default: if there was going to be an empty ancestor of the node that was
   * merged, we remove it from the tree.
   */
  removeEmptyAncestor?: (editor: E, options: { at: Path }) => void;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type MoveNodesOptions<V extends Value = Value> = {
  to: Path;
  /** Move only children of the node at location */
  children?: boolean;
  /** Start index of the children to move. Default: 0 */
  fromIndex?: number;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type RemoveMarksOptions = {
  /** Range where the mark(s) will be removed. Default: selection */
  at?: TRange;
  /** When true, trigger onChange if collapsed selection */
  shouldChange?: boolean;
} & Omit<UnsetNodesOptions, 'match' | 'split'>;

export type RemoveNodesOptions<V extends Value = Value> = {
  /** When true, remove all children of the node at the specified location */
  children?: boolean;
  hanging?: boolean;
  /** When true, remove the previous empty block if it exists */
  previousEmptyBlock?: boolean;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type ReplaceNodesOptions<V extends Value = Value> = {
  /** When true, replace all children of the node at the specified location */
  children?: boolean;
  /** Options for removing nodes */
  removeNodes?: Omit<RemoveNodesOptions<V>, 'at'>;
} & InsertNodesOptions<V>;

export type ResetOptions = {
  /** When true, only reset children without clearing history and operations */
  children?: boolean;
} & Omit<ReplaceNodesOptions, 'at' | 'children'>;

export type SelectOptions = {
  /** Select edge of the block above location */
  edge?: 'end' | 'start';
  /** If true, focus the editor before selecting */
  focus?: boolean;
  /** Select start of next sibling */
  next?: boolean;
  /** Select end of previous sibling */
  previous?: boolean;
};

export type SetNodesOptions<V extends Value = Value> = {
  compare?: PropsCompare;
  hanging?: boolean;
  /**
   * When true, only apply to text nodes in non-void nodes or markable void
   * nodes
   */
  marks?: boolean;
  merge?: PropsMerge;
  split?: boolean;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type SplitNodesOptions<V extends Value = Value> = {
  always?: boolean;
  height?: number;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type ToggleBlockOptions = {
  /** The default block type to revert to when untoggling. Defaults to paragraph. */
  defaultType?: string;
  someOptions?: EditorNodesOptions;
  /**
   * If true, toggles wrapping the block with the specified type. Otherwise,
   * toggles the block type directly.
   */
  wrap?: boolean;
} & SetNodesOptions;

export type ToggleMarkOptions = {
  /** Mark keys to remove when adding the mark. */
  remove?: string[] | string;
};

export type UnsetNodesOptions<V extends Value = Value> = {
  hanging?: boolean;
  split?: boolean;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type UnwrapNodesOptions<V extends Value = Value> = {
  hanging?: boolean;
  split?: boolean;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type WrapNodesOptions<V extends Value = Value> = {
  /**
   * When true, wrap node children into a single element:
   *
   * - Wraps the first child node into the element
   * - Move the other child nodes next to the element children
   */
  children?: boolean;
  hanging?: boolean;
  /**
   * Indicates that it's okay to split a node in order to wrap the location. For
   * example, if `ipsum` was selected in a `Text` node with `lorem ipsum dolar`,
   * `split: true` would wrap the word `ipsum` only, resulting in splitting the
   * `Text` node. If `split: false`, the entire `Text` node `lorem ipsum dolar`
   * would be wrapped.
   */
  split?: boolean;
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

type PropsCompare = (
  prop: Partial<Descendant>,
  node: Partial<Descendant>
) => boolean;

type PropsMerge = (
  prop: Partial<Descendant>,
  node: Partial<Descendant>
) => object;
