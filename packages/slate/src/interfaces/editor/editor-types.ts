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
  Point,
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
import type { Editor, Value } from './editor';

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
> & {
  /** Lookup before the location until this predicate is true */
  match?: (value: {
    at: At;
    beforePoint: Point;
    beforeString: string;
  }) => boolean;

  /**
   * If true, get the point after the matching point. If false, get the matching
   * point.
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
   * If true, lookup until the start of the editor value. If false, lookup until
   * the first invalid character.
   */
  skipInvalid?: boolean;
};

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
  QueryOptions<V> &
    QueryMode &
    QueryVoids & {
      /** Get the previous sibling node */
      sibling?: boolean;
    }
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

export type MergeNodesOptions<V extends Value, E extends Editor = Editor> = {
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

export type FindNodeOptions<V extends Value = Value> = GetNodeEntriesOptions<V>;

export type FindPathOptions = Omit<
  FindNodeOptions<Value>,
  'at' | 'block' | 'match'
>;

export type GetEndPointOptions = {
  /** Get the end point of the previous node */
  previous?: boolean;
};

export type GetStartPointOptions = {
  /** Get the start point of the next node */
  next?: boolean;
};

export type GetRangeOptions = {
  /** Get range from before to the end point of `at` */
  before?: GetPointBeforeOptions | boolean;

  /**
   * Get range from the start of the block above a location (default: selection)
   * to the location
   */
  blockStart?: boolean;
};

export type GetFragmentOptions = {
  /** Types of structural nodes to unwrap */
  structuralTypes?: string[];
};

export type IsElementEmptyOptions = {
  /** Check if text after selection is empty */
  after?: boolean;

  /** Check if block above location is empty */
  block?: boolean;
} & Omit<GetNodeEntriesOptions, 'at' | 'block'>;
