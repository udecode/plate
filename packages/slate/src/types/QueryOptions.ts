import type { TextUnitAdjustment } from 'slate';

import type { Value } from '../interfaces';
import type { NodeIn } from '../interfaces/node/TNode';
import type { Predicate } from '../utils';
import type { At } from './At';

export type QueryOptions<V extends Value = Value> = {
  /** Match the node by id. `true` will match all nodes with an id. */
  id?: boolean | string;

  /** Match block nodes. */
  block?: boolean;

  /** Match the node. */
  match?: Predicate<NodeIn<V>>;
} & QueryAt;

export type QueryAt = {
  /** Where to start at. @default editor.selection */
  at?: At;
};

export type QueryVoids = {
  /** When `true` include void Nodes. */
  voids?: boolean;
};

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
