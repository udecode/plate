import { useEffect } from 'react';
import {
  collapseSelection,
  findNodePath,
  getNode,
  getPluginOptions,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE } from '../../createTablePlugin';
import { getTableRowIndex } from '../../queries';
import { useTableStore } from '../../stores/tableStore';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../../types';
import { useSelectedCells } from './useSelectedCells';
import { useTableColSizes } from './useTableColSizes';

export interface TableElementState {
  colSizes: number[];
  isSelectingCell: boolean;
  minColumnWidth: number;
  marginLeft: number;
}

export const useTableElementState = ({
  transformColSizes,
}: {
  /**
   * Transform node column sizes
   */
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): TableElementState => {
  const editor = useEditorRef();

  const { minColumnWidth, disableMarginLeft } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );

  const element = useElement<TTableElement>();
  const selectedCells = useTableStore().get.selectedCells();
  const marginLeftOverride = useTableStore().get.marginLeftOverride();

  // initial calc, than it will be calculated when each individual cell updated
  useEffect(() => {
    calculateCellIndexes(editor, element);
  }, [editor, element]);

  const marginLeft = disableMarginLeft
    ? 0
    : marginLeftOverride ?? element.marginLeft ?? 0;

  let colSizes = useTableColSizes(element);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }

  // add a last col to fill the remaining space
  if (!colSizes.includes(0)) {
    colSizes.push('100%' as any);
  }

  return {
    colSizes,
    isSelectingCell: !!selectedCells,
    minColumnWidth: minColumnWidth!,
    marginLeft,
  };
};

export const useTableElement = () => {
  const editor = useEditorRef();
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  return {
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (selectedCells) {
          collapseSelection(editor);
        }
      },
    },
    colGroupProps: {
      contentEditable: false,
      style: { width: '100%' },
    },
  };
};

function getCellIndices(
  editor: PlateEditor,
  tableEl: TTableElement,
  tablePath: Path,
  cellPath: Path
) {
  const tableNodes = tableEl.children;

  let rowIndex = -1;
  let colIndex = -1;

  for (let r = 0; r < tableNodes.length; r++) {
    const row = tableNodes[r] as TTableRowElement;
    // console.log('row.type', row.type);
    // if (row.type === 'tr') {
    rowIndex++;

    let cIndex = 0;
    for (let c = 0; c < row.children.length; c++) {
      const cell = row.children[c] as TTableCellElement;
      // console.log('current cell', cell);
      // console.log('cell.type', cell.type);
      // if (cell.type === 'th') {
      const curCellPath = [r, c];
      // const curCellPath = findNodePath(editor, cell)!;

      if (Path.equals(curCellPath, cellPath)) {
        // colIndex = cIndex;
        console.log('early break', cIndex);
        break;
      }
      cIndex += cell.colSpan || 1; // consider 0 and undefined as 1
      console.log('incrementing cell index,', cIndex);
      // }
    }

    // If target cell is not in this row, but the rowSpan from previous rows is impacting
    // the colIndex for the next row, then increment manually
    if (rowIndex >= 1) {
      console.log('tableNodes', tableNodes, 'rowIndex', rowIndex);
      tableNodes.slice(0, rowIndex).forEach((pR, _rowIndex) => {
        const prevRow = pR as TTableRowElement;
        console.log('current row', row, 'prevRow', prevRow);

        prevRow.children.forEach((pC) => {
          const prevCell = pC as TTableCellElement;
          console.log('prevCell', prevCell);
          if (
            prevCell.rowSpan &&
            prevCell.rowSpan > 1 &&
            rowIndex - _rowIndex < prevCell.rowSpan
          ) {
            cIndex += prevCell.colSpan || 1;
            console.log(
              'increment by affected row span:',
              _rowIndex,
              cIndex,
              cellPath
            );
          }
        });
      });
    }
    // }

    if (colIndex !== -1) {
      // Break once we've found the target cell
      colIndex = cIndex;
      console.log('breaking, we found cell');
      break;
    }
  }

  if (rowIndex === -1 || colIndex === -1) {
    console.log('Invalid cell location.');
    return null;
  }

  return { row: rowIndex, col: colIndex };
}

const calculateCellIndexes = (
  editor: PlateEditor,
  tableNode: TTableElement
) => {
  // (Place the `getCellIndices()` function from the previous response here)

  // Initialize an array to store the indices of each cell
  const cellIndicesArray = [];

  const tablePath = findNodePath(editor, tableNode)!;

  // Iterate through the table rows
  for (let r = 0; r < tableNode.children.length; r++) {
    const row = tableNode.children[r] as TTableRowElement;
    const rowIndicesArray = [];

    // Iterate through the row cells
    for (let c = 0; c < row.children.length; c++) {
      const cell = row.children[c] as TTableCellElement;

      // Get cell indices and store them in the row's array
      // const cellPath = findNodePath(editor, cell)!; // TODO: use concat instead of findNodePath
      const cellPath = [r, c];
      console.log(
        'searching for',
        cell.children.map((m) => {
          return (m as any).children[0].text;
        }),
        tableNode,
        tablePath,
        cellPath
      );

      const indices = getCellIndices(editor, tableNode, tablePath, cellPath);
      rowIndicesArray.push(indices);
    }

    // Push the rowIndicesArray to the cellIndicesArray
    cellIndicesArray.push(rowIndicesArray);
  }

  console.log('cellIndicesArray', cellIndicesArray);
  return cellIndicesArray;
};
