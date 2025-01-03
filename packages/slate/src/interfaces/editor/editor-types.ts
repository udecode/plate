import type { Modify } from '@udecode/utils';
import type {
  EditorAfterOptions,
  EditorBeforeOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorNodesOptions,
  EditorPositionsOptions,
  EditorPreviousOptions,
  EditorVoidOptions,
  LeafEdge,
  Path,
  Span,
  liftNodes as liftNodesBase,
  mergeNodes as mergeNodesBase,
  moveNodes as moveNodesBase,
  removeNodes as removeNodesBase,
  setNodes as setNodesBase,
  splitNodes as splitNodesBase,
  unsetNodes as unsetNodesBase,
  unwrapNodes as unwrapNodesBase,
  wrapNodes as wrapNodesBase,
} from 'slate';
import type { NodeInsertNodesOptions } from 'slate/dist/interfaces/transforms/node';
import type { TextInsertFragmentOptions } from 'slate/dist/interfaces/transforms/text';

import type {
  At,
  QueryAt,
  QueryMode,
  QueryNodeOptions,
  QueryOptions,
  QueryTextUnit,
  QueryVoids,
  TOperation,
} from '../../types';
import type { ElementOrTextIn } from '../element/index';
import type { TDescendant, TNode } from '../node/index';
import type { TEditor, Value } from './TEditor';

export type GetAboveNodeOptions<V extends Value = Value> = QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type GetEditorStringOptions = QueryVoids;

export type GetLevelsOptions<V extends Value = Value> = Modify<
  NonNullable<EditorLevelsOptions<TNode>>,
  QueryOptions<V> & QueryVoids
>;

export type GetNextNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNextOptions<TDescendant>>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type GetNodeEntriesOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNodesOptions<TNode>>,
  Omit<QueryOptions<V>, 'at'> &
    QueryMode & {
      /** Where to start at. @default editor.selection */
      at?: At | Span;
    }
>;

export type GetNodeEntryOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export type GetParentNodeOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export type GetPointAfterOptions = Modify<
  EditorAfterOptions,
  QueryTextUnit & QueryVoids
>;

export type GetPointBeforeOptions = Modify<
  EditorBeforeOptions,
  QueryTextUnit & QueryVoids
>;

export type GetPositionsOptions = Modify<
  EditorPositionsOptions,
  QueryAt &
    QueryVoids &
    QueryTextUnit & {
      ignoreNonSelectable?: boolean;
      /**
       * When `true` returns the positions in reverse order. In the case of the
       * `unit` being `word`, the actual returned positions are different (i.e.
       * we will get the start of a word in reverse instead of the end).
       */
      reverse?: boolean;
    }
>;

export type GetPreviousNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorPreviousOptions<TNode>>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type GetVoidNodeOptions = Modify<
  EditorVoidOptions,
  QueryAt & QueryMode & QueryVoids
>;

export interface EditorNormalizeOptions {
  force?: boolean;
  operation?: TOperation;
}

export type UnhangRangeOptions = {
  /** @default true */
  unhang?: boolean;
  /** Allow placing the end of the selection in a void node */
  voids?: boolean;
};

export type InsertFragmentOptions = Modify<
  TextInsertFragmentOptions,
  QueryAt & QueryVoids
>;

export type InsertNodesOptions<V extends Value = Value> = {
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
} & Modify<
  NodeInsertNodesOptions<ElementOrTextIn<V>>,
  QueryOptions<V> & QueryMode
>;

export type LiftNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof liftNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type MergeNodesOptions<V extends Value, E extends TEditor = TEditor> = {
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
} & Modify<
  NonNullable<Parameters<typeof mergeNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type MoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof moveNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type RemoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof removeNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type SetNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof setNodesBase>[2]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type SplitNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof splitNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type UnsetNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof unsetNodesBase>[2]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type UnwrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof unwrapNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export type WrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof wrapNodesBase>[2]>,
  QueryOptions<V> &
    QueryMode &
    QueryVoids & {
      /**
       * Indicates that it's okay to split a node in order to wrap the location.
       * For example, if `ipsum` was selected in a `Text` node with `lorem ipsum
       * dolar`, `split: true` would wrap the word `ipsum` only, resulting in
       * splitting the `Text` node. If `split: false`, the entire `Text` node
       * `lorem ipsum dolar` would be wrapped.
       */
      split?: boolean;
    }
>;
