import { TElement, useElement, usePlateEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';
import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin';
import { getTableColumnIndex } from '../../queries';
import { useTableRowStore } from '../../stores/tableRowStore';
import { useTableStore } from '../../stores/tableStore';
import { TTableElement, TTableRowElement } from '../../types';
import { useIsCellSelected } from './useIsCellSelected';

export type TableCellElementState = {
  colIndex: number;
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
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const isCellSelected = useIsCellSelected(cellElement);

  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const rowElement = useElement<TTableRowElement>(ELEMENT_TR);
  const rowSizeOverride = useTableRowStore().get.overrideSize();
  const rowSize = rowSizeOverride ?? rowElement?.size ?? undefined;

  const readOnly = useReadOnly();

  const colIndex = getTableColumnIndex(editor, cellElement);

  return {
    colIndex,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === colIndex,
    rowSize,
    isLastCell: colIndex === rowElement?.children.length - 1,
    isLastRow:
      tableElement.children[tableElement.children.length - 1] === rowElement,
  };
};
