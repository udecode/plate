import { PlateEditor, TDescendant, TElement, Value } from '@udecode/plate-core';
import { Path } from 'slate';

export interface TablePlugin<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> {
  /**
   * Disable expanding the table when inserting cells.
   */
  disableExpandOnInsert?: boolean;

  /**
   * @default empty paragraph
   */
  newCellChildren?: TDescendant[];

  /**
   * @default insertTableColumn
   */
  insertColumn?: (
    editor: PlateEditor<V>,
    options: {
      fromCell: Path;
    }
  ) => void;

  /**
   * @default insertTableRow
   */
  insertRow?: (
    editor: PlateEditor<V>,
    options: {
      fromRow: Path;
    }
  ) => void;
}

export interface TTableElement extends TElement {
  colSizes?: number[];
}
