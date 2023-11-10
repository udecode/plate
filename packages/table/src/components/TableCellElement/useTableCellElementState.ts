import { useEffect, useMemo } from 'react';
import {
  getPluginOptions,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin';
import { getCellIndices } from '../../queries/getCellIdices';
import { getColSpan } from '../../queries/getColSpan';
import { getRowSpan } from '../../queries/getRowSpan';
import { getTableColumnIndex, getTableRowIndex } from '../../queries/index';
import { useTableStore } from '../../stores/tableStore';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../../types';
import {
  BorderStylesDefault,
  getTableCellBorders,
} from './getTableCellBorders';
import { useIsCellSelected } from './useIsCellSelected';

export type TableCellElementState = {
  colIndex: number;
  rowIndex: number;
  readOnly: boolean;
  hovered: boolean;
  hoveredLeft: boolean;
  selected: boolean;
  rowSize: number | undefined;
  borders: BorderStylesDefault;
  isSelectingCell: boolean;
  colSpan: number;
};

export const useTableCellElementState = ({
  ignoreReadOnly,
}: {
  /**
   * Ignores editable readOnly mode
   */
  ignoreReadOnly?: boolean;
} = {}): TableCellElementState => {
  const editor = useEditorRef();
  const cellElement = useElement<TTableCellElement>();

  const colSpan = getColSpan(cellElement);
  const rowSpan = getRowSpan(cellElement);

  const readOnly = useReadOnly();

  const isCellSelected = useIsCellSelected(cellElement);
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const selectedCells = useTableStore().get.selectedCells();

  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const rowElement = useElement<TTableRowElement>(ELEMENT_TR);

  const { _cellIndices } = useMemo(
    () => getPluginOptions<TablePlugin>(editor as any, ELEMENT_TABLE),
    [editor]
  );

  let x: { col: number; row: number };
  const fromWeakMap = _cellIndices.get(cellElement);
  if (fromWeakMap) {
    x = fromWeakMap;
    console.log('from weak map', x, 'cellElement', cellElement);
  } else {
    const x1 = getCellIndices(editor, tableElement, cellElement);
    if (x1) {
      x = x1;
      console.log('computed', x, 'cellElement', cellElement);
    } else {
      const defaultColIndex = getTableColumnIndex(editor, cellElement);
      const defaultRowIndex = getTableRowIndex(editor, cellElement);
      x = { col: defaultColIndex, row: defaultRowIndex };
      console.log('get default', x, 'cellElement', cellElement);
    }
  }
  const colIndex = x.col;
  const rowIndex = x.row;

  const endingRowIndex = rowIndex + rowSpan - 1;
  const endingColIndex = colIndex + colSpan - 1;

  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();
  const rowSize =
    rowSizeOverrides.get(endingRowIndex) ?? rowElement?.size ?? undefined;

  const isFirstCell = colIndex === 0;
  const isFirstRow = tableElement.children?.[0] === rowElement;

  const borders = getTableCellBorders(cellElement, {
    isFirstCell,
    isFirstRow,
  });

  return {
    colIndex: endingColIndex,
    rowIndex: endingRowIndex,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === endingColIndex,
    hoveredLeft: isFirstCell && hoveredColIndex === -1,
    rowSize,
    borders,
    isSelectingCell: !!selectedCells,
    colSpan,
  };
};

export const useTableCellElement = ({
  element,
}: {
  element: TTableCellElement;
}) => {
  const setHoveredColIndex = useTableStore().set.hoveredColIndex();

  useEffect(() => {
    setHoveredColIndex(null);
  }, [element, setHoveredColIndex]);

  return {
    props: {
      colSpan: element.colSpan,
      rowSpan: element.rowSpan,
    },
  };
};
