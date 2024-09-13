import React from 'react';

import { useEditorRef, useElement } from '@udecode/plate-common/react';
import { useReadOnly } from 'slate-react';

import {
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
  BaseTableRowPlugin,
  computeCellIndices,
  getCellIndices,
  getColSpan,
  getRowSpan,
} from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { getTableColumnIndex } from '../../merge';
import { getTableRowIndex } from '../../queries';
import { useTableStore } from '../../stores';
import {
  type BorderStylesDefault,
  getTableCellBorders,
} from './getTableCellBorders';
import { useIsCellSelected } from './useIsCellSelected';

export type TableCellElementState = {
  borders: BorderStylesDefault;
  colIndex: number;
  colSpan: number;
  hovered: boolean;
  hoveredLeft: boolean;
  isSelectingCell: boolean;
  readOnly: boolean;
  rowIndex: number;
  rowSize: number | undefined;
  selected: boolean;
};

export const useTableCellElementState = ({
  ignoreReadOnly,
}: {
  /** Ignores editable readOnly mode */
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

  const tableElement = useElement<TTableElement>(TablePlugin.key);
  const rowElement = useElement<TTableRowElement>(BaseTableRowPlugin.key);
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();

  const { _cellIndices, enableMerging } = editor.getOptions(TablePlugin);

  if (!enableMerging) {
    const colIndex = getTableColumnIndex(editor, cellElement);
    const rowIndex = getTableRowIndex(editor, cellElement);

    const rowSize =
      rowSizeOverrides.get?.(rowIndex) ?? rowElement?.size ?? undefined;

    const isFirstCell = colIndex === 0;
    const isFirstRow = tableElement.children?.[0] === rowElement;

    const borders = getTableCellBorders(cellElement, {
      isFirstCell,
      isFirstRow,
    });

    return {
      borders,
      colIndex,
      colSpan,
      hovered: hoveredColIndex === colIndex,
      hoveredLeft: isFirstCell && hoveredColIndex === -1,
      isSelectingCell: !!selectedCells,
      readOnly: !ignoreReadOnly && readOnly,
      rowIndex,
      rowSize,
      selected: isCellSelected,
    };
  }

  let result: { col: number; row: number };

  const calculated =
    getCellIndices(_cellIndices!, cellElement) ||
    computeCellIndices(editor, tableElement, cellElement);

  if (calculated) {
    result = calculated;
  } else {
    const defaultColIndex = getTableColumnIndex(editor, cellElement);
    const defaultRowIndex = getTableRowIndex(editor, cellElement);
    result = { col: defaultColIndex, row: defaultRowIndex };
  }

  const colIndex = result.col;
  const rowIndex = result.row;

  const endingRowIndex = rowIndex + rowSpan - 1;
  const endingColIndex = colIndex + colSpan - 1;

  const rowSize =
    rowSizeOverrides.get?.(endingRowIndex) ?? rowElement?.size ?? undefined;

  const isFirstCell = colIndex === 0;
  const isFirstRow = tableElement.children?.[0] === rowElement;

  const borders = getTableCellBorders(cellElement, {
    isFirstCell,
    isFirstRow,
  });

  return {
    borders,
    colIndex: endingColIndex,
    colSpan,
    hovered: hoveredColIndex === endingColIndex,
    hoveredLeft: isFirstCell && hoveredColIndex === -1,
    isSelectingCell: !!selectedCells,
    readOnly: !ignoreReadOnly && readOnly,
    rowIndex: endingRowIndex,
    rowSize,
    selected: isCellSelected,
  };
};

export const useTableCellElement = ({
  element,
}: {
  element: TTableCellElement;
}) => {
  const setHoveredColIndex = useTableStore().set.hoveredColIndex();

  React.useEffect(() => {
    setHoveredColIndex(null);
  }, [element, setHoveredColIndex]);

  return {
    props: {
      colSpan: getColSpan(element),
      rowSpan: getRowSpan(element),
    },
  };
};
