import { Operation as SlateOperation } from 'slate';

import type { Descendant, NodeProps } from './node';
import type { Path } from './path';
import type { TRange } from './range';

/**
 * `Operation` objects define the low-level instructions that Slate editors use
 * to apply changes to their internal state. Representing all changes as
 * operations is what allows Slate editors to easily implement history,
 * collaboration, and other features.
 */
export type Operation<N extends Descendant = Descendant> =
  | NodeOperation<N>
  | SelectionOperation
  | TextOperation;

/** Operation manipulation and check methods. */
export const OperationApi: {
  /**
   * Invert an operation, returning a new operation that will exactly undo the
   * original when applied.
   */
  inverse: (op: Operation) => Operation;
  /** Check if a value is a `NodeOperation` object. */
  isNodeOperation: <N extends Descendant>(
    value: any
  ) => value is NodeOperation<N>;
  /** Check if a value is an `Operation` object. */
  isOperation: <N extends Descendant>(value: any) => value is Operation<N>;
  /** Check if a value is a list of `Operation` objects. */
  isOperationList: (value: any) => value is Operation[];
  /** Check if a value is a `SelectionOperation` object. */
  isSelectionOperation: (value: any) => value is SelectionOperation;
  /** Check if a value is a `TextOperation` object. */
  isTextOperation: (value: any) => value is TextOperation;
} = SlateOperation as any;

export type InsertNodeOperation<N extends Descendant = Descendant> = {
  [key: string]: unknown;
  node: N;
  path: Path;
  type: 'insert_node';
};

export type InsertTextOperation = {
  [key: string]: unknown;
  offset: number;
  path: Path;
  text: string;
  type: 'insert_text';
};

export type MergeNodeOperation<N extends Descendant = Descendant> = {
  [key: string]: unknown;
  path: Path;
  position: number;
  properties: Partial<NodeProps<N>>;
  type: 'merge_node';
};

export type MoveNodeOperation = {
  [key: string]: unknown;
  newPath: Path;
  path: Path;
  type: 'move_node';
};

export type NodeOperation<N extends Descendant = Descendant> =
  | InsertNodeOperation<N>
  | MergeNodeOperation<N>
  | MoveNodeOperation
  | RemoveNodeOperation<N>
  | SetNodeOperation<N>
  | SplitNodeOperation<N>;

export type RemoveNodeOperation<N extends Descendant = Descendant> = {
  [key: string]: unknown;
  node: N;
  path: Path;
  type: 'remove_node';
};

export type RemoveTextOperation = {
  [key: string]: unknown;
  offset: number;
  path: Path;
  text: string;
  type: 'remove_text';
};

export type SelectionOperation = SetSelectionOperation;

export type SetNodeOperation<
  N1 extends Descendant = Descendant,
  N2 extends Descendant = Descendant,
> = {
  [key: string]: unknown;
  newProperties: Partial<NodeProps<N1>>;
  path: Path;
  properties: Partial<NodeProps<N2>>;
  type: 'set_node';
};

export type SetSelectionOperation =
  | {
      [key: string]: unknown;
      newProperties: null;
      properties: TRange;
      type: 'set_selection';
    }
  | {
      [key: string]: unknown;
      newProperties: Partial<TRange>;
      properties: Partial<TRange>;
      type: 'set_selection';
    }
  | {
      [key: string]: unknown;
      newProperties: TRange;
      properties: null;
      type: 'set_selection';
    };

export type SplitNodeOperation<N extends Descendant = Descendant> = {
  [key: string]: unknown;
  path: Path;
  position: number;
  properties: Partial<NodeProps<N>>;
  type: 'split_node';
};

export type TextOperation = InsertTextOperation | RemoveTextOperation;
