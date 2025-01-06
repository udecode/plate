import { useEditorPlugin, useElement } from '@udecode/plate/react';

import type { BorderStylesDefault, TTableCellElement } from '../../../lib';

import { TablePlugin } from '../../TablePlugin';
import { useCellIndices } from '../../hooks/useCellIndices';
import { useTableStore } from '../../stores';
import { useIsCellSelected } from './useIsCellSelected';
import { useTableCellBorders } from './useTableCellBorders';
import { useTableCellSize } from './useTableCellSize';

export type TableCellElementState = {
  borders: BorderStylesDefault;
  colIndex: number;
  colSpan: number;
  isSelectingCell: boolean;
  minHeight: number | undefined;
  rowIndex: number;
  selected: boolean;
  width: number | string;
};

export const useTableCellElement = (): TableCellElementState => {
  const { api } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const isCellSelected = useIsCellSelected(element);
  const selectedCells = useTableStore().get.selectedCells();
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();
  const { minHeight, width } = useTableCellSize();
  const borders = useTableCellBorders();

  /**
   * Row size: if rowSpan > 1, we might look up the rowSize for the bottom row
   * or you can do something simpler if row-spanning is unusual in your app.
   */
  const { col, row } = useCellIndices();
  const colSpan = api.table.getColSpan(element);
  const rowSpan = api.table.getRowSpan(element);
  const endingRowIndex = row + rowSpan - 1;
  const endingColIndex = col + colSpan - 1;

  return {
    borders,
    colIndex: endingColIndex,
    colSpan,
    isSelectingCell: !!selectedCells,
    minHeight: rowSizeOverrides.get?.(endingRowIndex) ?? minHeight,
    rowIndex: endingRowIndex,
    selected: isCellSelected,
    width,
  };
};
