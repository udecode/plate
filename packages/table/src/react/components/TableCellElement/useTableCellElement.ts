import React, { useState } from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import {
  type BorderStylesDefault,
  type TTableCellElement,
  type TTableElement,
  computeCellIndices,
  getCellIndices,
  getTableCellBorders,
} from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { useTableStore } from '../../stores';
import { useTableColSizes } from '../TableElement';
import { useIsCellSelected } from './useIsCellSelected';

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
  const { api, editor } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const colSpan = api.table.getColSpan(element);
  const rowSpan = api.table.getRowSpan(element);
  const isCellSelected = useIsCellSelected(element);
  const selectedCells = useTableStore().get.selectedCells();
  const tableElement = useElement<TTableElement>(TablePlugin.key);
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();
  const [indices, setIndices] = useState(() =>
    getCellIndices(editor, {
      cellNode: element,
      tableNode: tableElement,
    })
  );

  const colSizes = useTableColSizes(tableElement);

  const { minHeight, width } = React.useMemo(
    () => api.table.getCellSize({ colSizes, element }),
    [api.table, colSizes, element]
  );

  const borders = React.useMemo(
    () => getTableCellBorders(editor, { element }),
    [editor, element]
  );

  React.useEffect(() => {
    setIndices(
      computeCellIndices(editor, {
        cellNode: element,
        tableNode: tableElement,
      })
    );
  }, [editor, element, tableElement]);

  /**
   * Row size: if rowSpan > 1, we might look up the rowSize for the bottom row
   * or you can do something simpler if row-spanning is unusual in your app.
   */
  const endingRowIndex = indices.row + rowSpan - 1;
  const endingColIndex = indices.col + colSpan - 1;

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
