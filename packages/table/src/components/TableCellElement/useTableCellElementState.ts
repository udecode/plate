import { useEffect } from 'react';
import { useEditorRef, useElement } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin';
import { getTableColumnIndex, getTableRowIndex } from '../../queries/index';
import { useTableStore } from '../../stores/tableStore';
import {
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

/**
 * Returns the colspan attribute of the table cell element.
 * @default 1 if undefined.
 */
export const getColSpan = (cellElem: TTableCellElement) => {
  const attrColSpan = Number(cellElem.attributes?.colspan);
  return cellElem.colSpan || attrColSpan || 1;
};

/**
 * Returns the rowspan attribute of the table cell element.
 * @default 1 if undefined
 */
export const getRowSpan = (cellElem: TTableCellElement) => {
  const attrRowSpan = Number(cellElem.attributes?.rowspan);
  return cellElem.rowSpan || attrRowSpan || 1;
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

  const defaultColIndex = getTableColumnIndex(editor, cellElement);
  const defaultRowIndex = getTableRowIndex(editor, cellElement);

  const readOnly = useReadOnly();

  const isCellSelected = useIsCellSelected(cellElement);
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const selectedCells = useTableStore().get.selectedCells();
  const cellAttributes = useTableStore().get.cellAttributes();

  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const rowElement = useElement<TTableRowElement>(ELEMENT_TR);

  const x = cellAttributes.get(cellElement);
  const colIndex = x?.col ?? defaultColIndex;
  const rowIndex = x?.row ?? defaultRowIndex;

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
