import type { TDescendant } from '../interfaces/node/TDescendant';
import type { TPath, TRange } from './interfaces';

export type TInsertNodeOperation<N extends TDescendant = TDescendant> = {
  [key: string]: unknown;
  node: N;
  path: TPath;
  type: 'insert_node';
};

export type TInsertTextOperation = {
  [key: string]: unknown;
  offset: number;
  path: TPath;
  text: string;
  type: 'insert_text';
};

export type TMergeNodeOperation = {
  [key: string]: unknown;
  path: TPath;
  position: number;
  properties: object;
  type: 'merge_node';
};

export type TMoveNodeOperation = {
  [key: string]: unknown;
  newPath: TPath;
  path: TPath;
  type: 'move_node';
};

export type TRemoveNodeOperation<N extends TDescendant = TDescendant> = {
  [key: string]: unknown;
  node: N;
  path: TPath;
  type: 'remove_node';
};

export type TRemoveTextOperation = {
  [key: string]: unknown;
  offset: number;
  path: TPath;
  text: string;
  type: 'remove_text';
};

export type TSetNodeOperation = {
  [key: string]: unknown;
  newProperties: object;
  path: TPath;
  properties: object;
  type: 'set_node';
};

export type TSetSelectionOperation =
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
    }
  | {
      [key: string]: unknown;
      newProperties: null;
      properties: TRange;
      type: 'set_selection';
    };

export type TSplitNodeOperation = {
  [key: string]: unknown;
  path: TPath;
  position: number;
  properties: object;
  type: 'split_node';
};

export type TNodeOperation<N extends TDescendant = TDescendant> =
  | TInsertNodeOperation<N>
  | TMergeNodeOperation
  | TMoveNodeOperation
  | TRemoveNodeOperation<N>
  | TSetNodeOperation
  | TSplitNodeOperation;

export type TSelectionOperation = TSetSelectionOperation;

export type TTextOperation = TInsertTextOperation | TRemoveTextOperation;

/**
 * `Operation` objects define the low-level instructions that Slate editors use
 * to apply changes to their internal state. Representing all changes as
 * operations is what allows Slate editors to easily implement history,
 * collaboration, and other features.
 */
export type TOperation<N extends TDescendant = TDescendant> =
  | TNodeOperation<N>
  | TSelectionOperation
  | TTextOperation;
