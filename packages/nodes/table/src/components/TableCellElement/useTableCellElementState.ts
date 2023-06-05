import { useEffect } from 'react';
import { useElement, usePlateEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';
import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin';
import { getTableColumnIndex, getTableRowIndex } from '../../queries';
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
  const cellElement = useElement<TTableCellElement>();

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

  const isFirstCell = colIndex === 0;
  const isFirstRow = tableElement.children[0] === rowElement;

  const borders = getTableCellBorders(cellElement, {
    isFirstCell,
    isFirstRow,
  });

  return {
    colIndex,
    rowIndex,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === colIndex,
    hoveredLeft: isFirstCell && hoveredColIndex === -1,
    rowSize,
    borders,
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
    },
  };
};
