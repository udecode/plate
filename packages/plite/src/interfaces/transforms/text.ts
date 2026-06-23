import type { DescendantIn, Editor, Location, Value } from '../../index';
import type { TextUnit } from '../../types/types';

export interface TextDeleteOptions {
  /** Location to delete from. Defaults to the transaction target. */
  at?: Location;
  /** Number of units to delete. Defaults to one unit. */
  distance?: number;
  /** Unit used for collapsed deletion. Defaults to a single character. */
  unit?: TextUnit;
  /** Delete before the target instead of after it. */
  reverse?: boolean;
  /** Keep hanging range edges instead of un-hanging before deletion. */
  hanging?: boolean;
  /** Allow deletion inside void elements. */
  voids?: boolean;
}

export interface TextInsertFragmentOptions {
  /** Location to insert at. Defaults to the transaction target. */
  at?: Location;
  /** Keep hanging range edges instead of un-hanging before insertion. */
  hanging?: boolean;
  /** Allow insertion into void elements. */
  voids?: boolean;
  batchDirty?: boolean;
}

export interface TextInsertTextOptions {
  /** Location to insert at. Defaults to the transaction target. */
  at?: Location;
  /** Allow insertion into void elements. */
  voids?: boolean;
}

export interface TextRemoveTextOptions {
  at?: { path: number[]; offset: number };
}

export interface TextMutationMethods<V extends Value = Value> {
  /**
   * Delete content at a location, or at the transaction target when omitted.
   */
  delete: (editor: Editor<V>, options?: TextDeleteOptions) => void;

  /**
   * Insert a fragment at a location, or at the transaction target when omitted.
   */
  insertFragment: (
    editor: Editor<V>,
    fragment: DescendantIn<V>[],
    options?: TextInsertFragmentOptions
  ) => void;

  /**
   * Insert text at a location, or at the transaction target when omitted.
   */
  insertText: (
    editor: Editor<V>,
    text: string,
    options?: TextInsertTextOptions
  ) => void;

  /**
   * Remove a string of text at a point or the current selection anchor.
   */
  removeText: (
    editor: Editor<V>,
    text: string,
    options?: TextRemoveTextOptions
  ) => void;
}
