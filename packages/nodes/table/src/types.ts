import { TDescendant, TElement } from '@udecode/plate-core';

export interface TablePlugin {
  /**
   * Disable expanding the table when inserting cells.
   */
  disableExpandOnInsert?: boolean;

  /**
   * @default empty paragraph
   */
  newCellChildren?: TDescendant[];
}

export interface TTableElement extends TElement {
  colSizes?: number[];
}
