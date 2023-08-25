import { MutableRefObject, useEffect, useRef } from 'react';
import { useElement, usePlateEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { ELEMENT_TABLE, ELEMENT_TR } from '../../createTablePlugin';
import { getTableColumnIndex, getTableRowIndex } from '../../queries/index';
import { useTableStore } from '../../stores/tableStore';
import {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../../types';
import { getClosest } from './getClosest';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';
import {
  BorderStylesDefault,
  getTableCellBorders,
} from './getTableCellBorders';
import { useIsCellSelected } from './useIsCellSelected';
import { useTableCellElementResizableState } from './useTableCellElementResizable';

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
  cellRef: MutableRefObject<HTMLTableCellElement | undefined>;
  resizableState: {
    disableMarginLeft: boolean | undefined;
    colIndex: number;
    rowIndex: number;
    colSpan: number;
    stepX: number | undefined;
    stepY: number | undefined;
  };
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
  const cellRef = useRef<HTMLTableDataCellElement>();

  // TODO: get rid of mutating element here
  cellElement.colSpan = getColSpan(cellElement);
  cellElement.rowSpan = getRowSpan(cellElement);

  const rowIndex =
    getTableRowIndex(editor, cellElement) + cellElement.rowSpan - 1;

  const readOnly = useReadOnly();

  const isCellSelected = useIsCellSelected(cellElement);
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const selectedCells = useTableStore().get.selectedCells();

  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const rowElement = useElement<TTableRowElement>(ELEMENT_TR);
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();
  const rowSize =
    rowSizeOverrides.get(rowIndex) ?? rowElement?.size ?? undefined;

  const endColIndex = useRef<number>(getTableColumnIndex(editor, cellElement));
  const startCIndex = useRef<number>(getTableColumnIndex(editor, cellElement));

  if (cellRef.current && hoveredColIndex === null) {
    const cellOffset = cellRef.current?.offsetLeft;

    // TODO: improve typing. colSizes always presented when rendering cell
    const colSizes = tableElement.colSizes!;
    const { offsets } = colSizes.reduce(
      (acc, current) => {
        const currentOffset = acc.prevOffset + current;
        acc.offsets.push(currentOffset);
        acc.prevOffset = currentOffset;
        return acc;
      },
      {
        offsets: [0],
        prevOffset: 0,
      }
    );

    const startColIndex = getClosest(cellOffset, offsets);
    cellElement.colIndex = startColIndex;
    startCIndex.current = startColIndex;
    endColIndex.current = startColIndex + cellElement.colSpan - 1;
  }

  const resizableState = useTableCellElementResizableState({
    colIndex: endColIndex.current,
    rowIndex,
    colSpan: cellElement.colSpan!,
  });

  const content = cellElement.children
    .map((node) => (node as TTableCellElement).children[0].text)
    .join(' ');

  console.log('cell element component');

  // console.log(
  //   'content',
  //   content,
  //   resizableState
  //   // 'rowIndex',
  //   // rowIndex,
  //   // 'colIndex',
  //   // cIndex.current,
  //   // 'path',
  //   // path,
  //   // 'props.nodeProps',
  //   // props.nodeProps,
  //   // 'cellRef.current',
  //   // cellRef.current,
  //   // 'offset',
  //   // cellOffset,

  //   // 'cellElement.colSpan',
  //   // cellElement.colSpan,
  //   // 'cellWidth',
  //   // cellWidth,
  //   // 'offsets',
  //   // offsets,
  //   // 'colSpan',
  //   // cellElement.colSpan,
  //   // 'rowSpan',
  //   // cellElement.rowSpan,
  //   // 'startColIndex',
  //   // startCIndex.current,
  //   // 'endColIndex',
  //   // endColIndex.current
  //   // colSizes,
  // );

  const isFirstCell = startCIndex.current === 0;
  const isFirstRow = tableElement.children?.[0] === rowElement;

  const borders = getTableCellBorders(cellElement, {
    isFirstCell,
    isFirstRow,
  });

  return {
    colIndex: endColIndex.current,
    rowIndex,
    colSpan: cellElement.colSpan,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === endColIndex.current,
    hoveredLeft: isFirstCell && hoveredColIndex === -1,
    rowSize,
    borders,
    isSelectingCell: !!selectedCells,
    cellRef,
    resizableState,
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
