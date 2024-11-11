import React from 'react';

import { findNode } from '@udecode/plate-common';
import {
  findNodePath,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';
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
import { TableCellPlugin, TablePlugin } from '../../TablePlugin';
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
  isFirstCell: boolean;
  readOnly: boolean;
  selected: boolean;
};

export const useTableCellElementState = ({
  ignoreReadOnly,
}: {
  /** Ignores editable readOnly mode */
  ignoreReadOnly?: boolean;
} = {}): TableCellElementState => {
  const editor = useEditorRef();
  const cellElement = useElement<TTableCellElement>(TableCellPlugin.key);
  const cellPath = findNodePath(editor, cellElement);

  const readOnly = useReadOnly();
  const isCellSelected = useIsCellSelected(cellElement);

  const [tableElement] = findNode<TTableElement>(editor, {
    at: cellPath,
    match: { type: TablePlugin.key },
  })!;
  const [rowElement] = findNode<TTableRowElement>(editor, {
    at: cellPath,
    match: { type: BaseTableRowPlugin.key },
  })!;

  const { _cellIndices, enableMerging } = editor.getOptions(TablePlugin);

  if (!enableMerging) {
    const colIndex = getTableColumnIndex(editor, cellElement);

    const isFirstCell = colIndex === 0;
    const isFirstRow = tableElement.children?.[0] === rowElement;

    const borders = getTableCellBorders(cellElement, {
      isFirstCell,
      isFirstRow,
    });

    return {
      borders,
      isFirstCell,
      readOnly: !ignoreReadOnly && readOnly,
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

  const isFirstCell = colIndex === 0;
  const isFirstRow = tableElement.children?.[0] === rowElement;

  const borders = getTableCellBorders(cellElement, {
    isFirstCell,
    isFirstRow,
  });

  return {
    borders,
    isFirstCell,
    readOnly: !ignoreReadOnly && readOnly,
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
