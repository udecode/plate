import { MutableRefObject, useEffect, useRef } from 'react';
import { useEditorRef, useElement } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin.js';
import { getTableColumnIndex, getTableRowIndex } from '../../queries/index.js';
import { useTableStore } from '../../stores/tableStore.js';
import {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../../types.js';
import { getClosest } from './getClosest.js';
import { getColSpan } from './getColSpan.js';
import { getRowSpan } from './getRowSpan.js';
import {
  BorderStylesDefault,
  getTableCellBorders,
} from './getTableCellBorders.js';
import { useIsCellSelected } from './useIsCellSelected.js';

export type TableCellElementState = {
  colIndex: number;
  colSpan: number;
  rowIndex: number;
  readOnly: boolean;
  hovered: boolean;
  hoveredLeft: boolean;
  selected: boolean;
  rowSize: number | undefined;
  borders: BorderStylesDefault;
  isSelectingCell: boolean;
  cellRef: MutableRefObject<HTMLTableCellElement | null>;
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
  const cellRef = useRef<HTMLTableCellElement>(null);

  // TODO: get rid of mutating element here
  // currently needed only for pasting tables from clipboard to gather span attributes
  cellElement.colSpan = getColSpan(cellElement);
  cellElement.rowSpan = getRowSpan(cellElement);

  const rowIndex = getTableRowIndex(editor, cellElement);
  cellElement.rowIndex = rowIndex; // TODO: get rid of mutation or make it more explicit
  const endRowIndex = rowIndex + cellElement.rowSpan - 1;

  const readOnly = useReadOnly();

  const isCellSelected = useIsCellSelected(cellElement);
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const selectedCells = useTableStore().get.selectedCells();
  const cellOffsets = useTableStore().get.cellsOffsets();

  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const rowElement = useElement<TTableRowElement>(ELEMENT_TR);
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();
  const rowSize =
    rowSizeOverrides.get(endRowIndex) ?? rowElement?.size ?? undefined;

  const endColIndex = useRef<number>(getTableColumnIndex(editor, cellElement));
  const startCIndex = useRef<number>(getTableColumnIndex(editor, cellElement));

  // TODO: measure performance on huge tables with the following approach.
  // consider using cached offsets to calculate "closest" per column only (not for each cell)
  if (cellRef.current && hoveredColIndex === null && cellOffsets) {
    const cellOffset = cellRef.current.offsetLeft;
    const startColIndex = getClosest(cellOffset, cellOffsets);
    cellElement.colIndex = startColIndex; // TODO: get rid of mutation or make it more explicit

    startCIndex.current = startColIndex;
    endColIndex.current = startColIndex + cellElement.colSpan - 1;
  }

  const isFirstCell = startCIndex.current === 0;
  const isFirstRow = tableElement.children?.[0] === rowElement;

  const borders = getTableCellBorders(cellElement, {
    isFirstCell,
    isFirstRow,
  });

  return {
    colIndex: endColIndex.current,
    rowIndex: endRowIndex,
    colSpan: cellElement.colSpan,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === endColIndex.current,
    hoveredLeft: isFirstCell && hoveredColIndex === -1,
    rowSize,
    borders,
    isSelectingCell: !!selectedCells,
    cellRef,
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
