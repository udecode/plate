import type { OmitFirst } from '@udecode/utils';
import type { Editor } from 'slate';
import type { DOMEditor } from 'slate-dom';

import type { blurEditor } from '../../internal/dom-editor/blurEditor';
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
import type { HistoryEditor } from '../../slate-history/index';
import type { toggleMark } from '../../transforms/index';
import type { TOperation } from '../../types/index';
import type { ElementIn, ElementOrTextIn } from '../element/index';
import type {
  DescendantIn,
  NodeIn,
  TNodeEntry,
  TNodeProps,
} from '../node/index';
import type { Value } from './editor';
import type {
  EditorNormalizeOptions,
  InsertFragmentOptions,
  InsertNodesOptions,
  LiftNodesOptions,
  MergeNodesOptions,
  MoveNodesOptions,
  RemoveNodesOptions,
  SetNodesOptions,
  SplitNodesOptions,
  UnsetNodesOptions,
  UnwrapNodesOptions,
  WrapNodesOptions,
} from './editor-types';

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
    props: Partial<TNodeProps<N>>,
    options?: SetNodesOptions<V>
  ) => void;
  /**
   * Unset properties of nodes at the specified location. If no location is
   * specified, use the selection.
   */
  unsetNodes: <N extends DescendantIn<V>>(
    props: (keyof TNodeProps<N>)[] | keyof TNodeProps<N>,
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
  insertSoftBreak: Editor['insertSoftBreak'];
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
  redo: HistoryEditor['redo'];
  /**
   * Remove a custom property from all of the leaf text nodes within non-void
   * nodes or void nodes that `editor.markableVoid()` allows in the current
   * selection.
   *
   * If the selection is currently collapsed, the removal will be stored on
   * `editor.marks` and applied to the text inserted next.
   */
  removeMark: OmitFirst<typeof Editor.removeMark>;
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
  undo: HistoryEditor['undo'];
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
  writeHistory: HistoryEditor['writeHistory'];
} /** Text Transforms */ & {
  /** Delete text in the document. */
  delete: OmitFirst<typeof deleteText>;
  /**
   * Insert a string of text at the specified location or (if not defined) the
   * current selection or (if not defined) the end of the document.
   */
  insertText: OmitFirst<typeof Editor.insertText>;
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
   * `Partial<Range>`, this method can only handle updates to an existing
   * selection. If there is no active selection the operation will be void. Use
   * `select` if you'd like to create a selection when there is none.
   */
  setSelection: OmitFirst<typeof setSelection>;
} & {
  /** Blur the editor */
  blur: OmitFirst<typeof blurEditor>;
  /** Deselect the editor. */
  deselectDOM: OmitFirst<typeof DOMEditor.deselect>;
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
   * to call in this order `insertFragmentData(editor: ReactEditor, data:
   * DataTransfer)` and then `insertTextData(editor: ReactEditor, data:
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
  setSplittingOnce: OmitFirst<typeof HistoryEditor.setSplittingOnce>;
  /**
   * Apply a series of changes inside a synchronous `fn`, These operations will
   * be merged into the previous history.
   */
  withMerging: OmitFirst<typeof HistoryEditor.withMerging>;
  /**
   * Apply a series of changes inside a synchronous `fn`, ensuring that the
   * first operation starts a new batch in the history. Subsequent operations
   * will be merged as usual.
   */
  withNewBatch: OmitFirst<typeof HistoryEditor.withNewBatch>;
  /**
   * Apply a series of changes inside a synchronous `fn`, without merging any of
   * the new operations into previous save point in the history.
   */
  withoutMerging: OmitFirst<typeof HistoryEditor.withoutMerging>;
  /**
   * Apply a series of changes inside a synchronous `fn`, without saving any of
   * their operations into the history.
   */
  withoutSaving: OmitFirst<typeof HistoryEditor.withoutSaving>;
} & {
  toggle: {
    mark: OmitFirst<typeof toggleMark>;
  };
} & {
  /** Normalize a Node according to the schema. */
  normalizeNode: <N extends NodeIn<V>>(
    entry: TNodeEntry<N>,
    options?: { operation?: TOperation }
  ) => void;
  /** Apply an operation in the editor. */
  apply: <N extends DescendantIn<V>>(operation: TOperation<N>) => void;
};
