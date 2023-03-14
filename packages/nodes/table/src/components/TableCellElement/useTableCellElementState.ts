import { TElement, useElement, usePlateEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';
import { getTableColumnIndex, getTableRowIndex } from '../../queries';
import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin';
import { useTableStore } from '../../stores/tableStore';
import { TTableElement, TTableRowElement } from '../../types';
import { useIsCellSelected } from './useIsCellSelected';

export type TableCellElementState = {
  colIndex: number;
  rowIndex: number;
  readOnly: boolean;
  hovered: boolean;
  selected: boolean;
  rowSize: number | undefined;
  isLastCell: boolean;
  isLastRow: boolean;
};

export const useTableCellElementState = ({
  ignoreReadOnly,
}: {
  /**
   * Ignores editable readOnly mode
   */
  ignoreReadOnly?: boolean;
} = {}): TableCellElementState => {
  const editor = usePlateEditorRef();
  const cellElement = useElement<TElement>();

  const colIndex = getTableColumnIndex(editor, cellElement);
  const rowIndex = getTableRowIndex(editor, cellElement);

  const readOnly = useReadOnly();

  const isCellSelected = useIsCellSelected(cellElement);
  const hoveredColIndex = useTableStore().get.hoveredColIndex();

  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const rowElement = useElement<TTableRowElement>(ELEMENT_TR);
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();
  const rowSize =
    rowSizeOverrides.get(rowIndex) ?? rowElement?.size ?? undefined;

  return {
    colIndex,
    rowIndex,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === colIndex,
    rowSize,
    isLastCell: colIndex === rowElement?.children.length - 1,
    isLastRow:
      tableElement.children[tableElement.children.length - 1] === rowElement,
  };
};
