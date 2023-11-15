import {
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  removeNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { cloneDeep } from 'lodash';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getTableGridAbove } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { TablePlugin, TTableCellElement, TTableElement } from '../types';
import { getEmptyCellNode } from '../utils';
import { computeCellIndices } from './computeCellIndices';

/**
 * Merges multiple selected cells into one.
 */
export const mergeTableCells = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  withoutNormalizing(editor, () => {
    const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);
    const tableEntry = getBlockAbove(editor, {
      at: editor.selection?.anchor.path,
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })!;

    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    // calculate the colSpan which is the number of horizontal cells that a cell should span.
    let colSpan = 0;
    for (const entry of cellEntries) {
      const [data, path] = entry;

      // count only those cells that are in the first selected row.
      if (path[1] === cellEntries[0][1][1]) {
        const cellColSpan = getColSpan(data as TTableCellElement);
        colSpan += cellColSpan;
      }
    }

    // calculate the rowSpan which is the number of vertical cells that a cell should span.
    let rowSpan = 0;
    const { col } = options._cellIndices.get(
      cellEntries[0][0] as TTableCellElement
    )!;
    cellEntries.forEach((cE) => {
      const cell = cE[0] as TTableCellElement;
      const { col: curCol } =
        options._cellIndices.get(cell) ||
        computeCellIndices(editor, tableEntry[0] as TTableElement, cell)!;
      if (col === curCol) {
        rowSpan += getRowSpan(cell);
      }
    });

    // This will store the content of all cells we are merging
    const contents = [];
    for (const cellEntry of cellEntries) {
      const [el] = cellEntry;
      contents.push(...cloneDeep(el.children));
    }

    // Create a hash map where keys are col paths,
    // and values are an array of all paths with that column
    const cols: { [key: string]: number[][] } = {};

    // A boolean to keep track if we have a header cell among the cells we are merging
    let hasHeaderCell = false;

    cellEntries.forEach(([entry, path]) => {
      if (!hasHeaderCell && entry.type === 'table_header_cell') {
        hasHeaderCell = true;
      }
      if (cols[path[1]]) {
        cols[path[1]].push(path);
      } else {
        cols[path[1]] = [path];
      }
    });

    // removes multiple cells with on same path.
    // once cell removed, next cell in the row will settle down on that path
    Object.values(cols).forEach((paths) => {
      paths?.forEach(() => {
        removeNodes(editor, { at: paths[0] });
      });
    });

    // Create a new cell to replace the merged cells, with
    // calculated colSpan and rowSpan attributes and combined content
    const mergedCell = {
      ...getEmptyCellNode(editor, {
        header: cellEntries[0][0].type === 'th',
        newCellChildren: contents,
      }),
      colSpan,
      rowSpan,
    };

    // insert the new merged cell in place of the first cell in the selection
    insertElements(editor, mergedCell, { at: cellEntries[0][1] });

    // /**
    //  * Update cell indices in weak map
    //  */
    // const tableEntry = findNode(editor, {
    //   at: cellEntries[0][1],
    //   match: { type: getPluginType(editor, ELEMENT_TABLE) },
    // })!; // TODO: improve typing
    // const cellEntry = findNode(editor, {
    //   at: cellEntries[0][1],
    //   match: { type: getCellTypes(editor) },
    // })!; // TODO: improve typing

    // const realTable = tableEntry[0] as TTableElement;
    // const mC = cellEntry[0] as TTableCellElement;
    // console.log('realTable', realTable, 'mC', mC);

    // computeCellIndices(editor, realTable, mC);
    // console.log('should be computed');
  });
};
