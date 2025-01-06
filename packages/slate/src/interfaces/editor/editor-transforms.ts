import type { OmitFirst } from '@udecode/utils';
import type { DOMEditor } from 'slate-dom';

import type { blurEditor } from '../../internal/dom-editor/blurEditor';
import type { deselectEditor } from '../../internal/dom-editor/deselectEditor';
import type { focusEditor } from '../../internal/dom-editor/focusEditor';
import type { addMark } from '../../internal/editor/addMark';
import type { deleteBackward } from '../../internal/editor/deleteBackward';
import type { deleteForward } from '../../internal/editor/deleteForward';
import type { deleteFragment } from '../../internal/editor/deleteFragment';
import type { insertBreak } from '../../internal/editor/insertBreak';
import type { withoutNormalizing } from '../../internal/editor/withoutNormalizing';
import type { collapseSelection } from '../../internal/transforms/collapseSelection';
import type { deleteText } from '../../internal/transforms/deleteText';
import type { moveSelection } from '../../internal/transforms/moveSelection';
import type { select } from '../../internal/transforms/select';
import type { setPoint } from '../../internal/transforms/setPoint';
import type { setSelection } from '../../internal/transforms/setSelection';
import type { HistoryApi } from '../../slate-history/index';
import type { toggleMark } from '../../transforms/index';
import type {
  QueryAt,
  QueryMode,
  QueryNodeOptions,
  QueryOptions,
  QueryTextUnit,
  QueryVoids,
  TextUnit,
} from '../../types/index';
import type { ElementIn, ElementOrTextIn } from '../element';
import type { TLocation } from '../location';
import type { Descendant, DescendantIn, NodeIn, NodeProps } from '../node';
import type { NodeEntry } from '../node-entry';
import type { Operation } from '../operation';
import type { Path } from '../path';
import type { Editor, Value } from './editor';
import type { EditorNormalizeOptions } from './editor-api';

export type EditorTransforms<V extends Value = Value> = {
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
   * Unset properties of nodes at the specified location. If no location is
   * specified, use the selection.
   */
  unsetNodes: <N extends DescendantIn<V>>(
    props: (keyof NodeProps<N>)[] | keyof NodeProps<N>,
    options?: UnsetNodesOptions<V>
  ) => void;
  /**
   * Wrap nodes at the specified location in the `element` container. If no
   * location is specified, wrap the selection.
   */
  wrapNodes: <N extends ElementIn<V>>(
    element: N,
    options?: WrapNodesOptions<V>
  ) => void;
  /**
   * Add a custom property to the leaf text nodes in the current selection.
   *
   * If the selection is currently collapsed, the marks will be added to the
   * `editor.marks` property instead, and applied when text is inserted next.
   */
  addMark: OmitFirst<typeof addMark>;
  /** Delete content in the editor backward from the current selection. */
  deleteBackward: OmitFirst<typeof deleteBackward>;
  /** Delete content in the editor forward from the current selection. */
  deleteForward: OmitFirst<typeof deleteForward>;
  /** Delete the content of the current selection. */
  deleteFragment: OmitFirst<typeof deleteFragment>;
  /** Insert a block break at the current selection. */
  insertBreak: OmitFirst<typeof insertBreak>;
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
  moveNodes: (options?: MoveNodesOptions<V>) => void;
  /** Normalize any dirty objects in the editor. */
  normalize: (options?: EditorNormalizeOptions) => void;
  /** Redo to the next saved state. */
  redo: () => void;
  /**
   * Remove a custom property from all of the leaf text nodes within non-void
   * nodes or void nodes that `editor.markableVoid()` allows in the current
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
   * Split nodes at the specified location. If no location is specified, split
   * the selection.
   */
  splitNodes: (options?: SplitNodesOptions<V>) => void;
  /** Undo to the previous saved state. */
  undo: () => void;
  /**
   * Unwrap nodes at the specified location. If necessary, the parent node is
   * split. If no location is specified, use the selection.
   */
  unwrapNodes: (options?: UnwrapNodesOptions<V>) => void;
  /**
   * Call a function, deferring normalization until after it completes
   *
   * @returns True if normalized.
   */
  withoutNormalizing: OmitFirst<typeof withoutNormalizing>;
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
  /** Unset the selection. */
  deselect: () => void;
  /** Move the selection's point forward or backward. */
  move: OmitFirst<typeof moveSelection>;
  /**
   * Set the selection to a new value specified by `target`. When a selection
   * already exists, this method is just a proxy for `setSelection` and will
   * update the existing value.
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
} & {
  /** Blur the editor */
  blur: OmitFirst<typeof blurEditor>;
  /** Deselect the editor. */
  deselectDOM: OmitFirst<typeof deselectEditor>;
  /**
   * Focus the editor.
   *
   * If `target` is defined:
   *
   * - Deselect the editor (otherwise it will focus the start of the editor)
   * - Select the editor
   * - Focus the editor
   */
  focus: OmitFirst<typeof focusEditor>;
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
  toggle: {
    mark: OmitFirst<typeof toggleMark>;
  };
} & {
  /** Normalize a Node according to the schema. */
  normalizeNode: <N extends NodeIn<V>>(
    entry: NodeEntry<N>,
    options?: { operation?: Operation }
  ) => void;
  /** Apply an operation in the editor. */
  apply: <N extends DescendantIn<V>>(operation: Operation<N>) => void;
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
} & QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type RemoveNodesOptions<V extends Value = Value> = {
  hanging?: boolean;
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

export type SetNodesOptions<V extends Value = Value> = {
  compare?: PropsCompare;
  hanging?: boolean;
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

export type InsertTextOptions = {
  at?: TLocation;
  voids?: boolean;
};

export type DeleteTextOptions = {
  distance?: number;
  hanging?: boolean;
  reverse?: boolean;
  unit?: TextUnit;
} & QueryAt &
  QueryVoids &
  QueryTextUnit;
