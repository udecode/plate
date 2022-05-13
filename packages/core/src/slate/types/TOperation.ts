import { TDescendant } from '../node/TDescendant';
import { TPath, TRange } from './interfaces';

export type TInsertNodeOperation<N extends TDescendant = TDescendant> = {
  type: 'insert_node';
  path: TPath;
  node: N;
  [key: string]: unknown;
};

export type TInsertTextOperation = {
  type: 'insert_text';
  path: TPath;
  offset: number;
  text: string;
  [key: string]: unknown;
};

export type TMergeNodeOperation = {
  type: 'merge_node';
  path: TPath;
  position: number;
  properties: object;
  [key: string]: unknown;
};

export type TMoveNodeOperation = {
  type: 'move_node';
  path: TPath;
  newPath: TPath;
  [key: string]: unknown;
};

export type TRemoveNodeOperation<N extends TDescendant = TDescendant> = {
  type: 'remove_node';
  path: TPath;
  node: N;
  [key: string]: unknown;
};

export type TRemoveTextOperation = {
  type: 'remove_text';
  path: TPath;
  offset: number;
  text: string;
  [key: string]: unknown;
};

export type TSetNodeOperation = {
  type: 'set_node';
  path: TPath;
  properties: object;
  newProperties: object;
  [key: string]: unknown;
};

export type TSetSelectionOperation =
  | {
      type: 'set_selection';
      properties: null;
      newProperties: TRange;
      [key: string]: unknown;
    }
  | {
      type: 'set_selection';
      properties: Partial<TRange>;
      newProperties: Partial<TRange>;
      [key: string]: unknown;
    }
  | {
      type: 'set_selection';
      properties: TRange;
      newProperties: null;
      [key: string]: unknown;
    };

export type TSplitNodeOperation = {
  type: 'split_node';
  path: TPath;
  position: number;
  properties: object;
  [key: string]: unknown;
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
