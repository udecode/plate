import type { TTableCellElement } from '@platejs/utils';

import {
  useEditorPlugin,
  useEditorSelector,
  useElement,
} from '@platejs/core/react';

import type { BorderStylesDefault } from '../../../lib';
import { BaseTablePlugin } from '../../../lib/BaseTablePlugin';

import { useCellIndices } from '../../hooks/useCellIndices';
import { useTableValue } from '../../stores';
import { TablePlugin } from '../../TablePlugin';
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
  const isSelectingCell = useEditorSelector(
    (editor) => editor.plugin(BaseTablePlugin).api.isSelectingCell(),
    []
  );

  const rowSizeOverrides = useTableValue('rowSizeOverrides');
  const { minHeight, width } = useTableCellSize({ element });
  const borders = useTableCellBorders({ element });

  /**
   * Row size: if rowSpan > 1, we might look up the rowSize for the bottom row
   * or you can do something simpler if row-spanning is unusual in your app.
   */
  const { col, row } = useCellIndices();
  const colSpan = api.getColSpan(element);
  const rowSpan = api.getRowSpan(element);
  const endingRowIndex = row + rowSpan - 1;
  const endingColIndex = col + colSpan - 1;

  return {
    borders,
    colIndex: endingColIndex,
    colSpan,
    isSelectingCell,
    minHeight: rowSizeOverrides.get?.(endingRowIndex) ?? minHeight,
    rowIndex: endingRowIndex,
    selected: isCellSelected,
    width,
  };
};
