import {
  insertElements,
  PlateEditor,
  removeNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep.js';

import { getTableGridAbove } from '../queries';
import { getEmptyCellNode } from '../utils';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';

/**
 * Merges multiple selected cells into one.
 */
export const mergeTableCells = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  withoutNormalizing(editor, () => {
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    // calculate the colSpan which is the number of horizontal cells that a cell should span.
    let colSpan = 0;
    for (const entry of cellEntries) {
      const [data, path] = entry;

      // count only those cells that are in the first selected row.
      if (path[1] === cellEntries[0][1][1]) {
        const cellColSpan = getColSpan(data);
        colSpan += cellColSpan;
      }
    }

    // calculate the rowSpan which is the number of vertical cells that a cell should span.
    let rowSpan = 1;
    const alreadyCounted: number[] = [];
    for (const entry of cellEntries) {
      const [data, path] = entry;
      const curRowCounted = alreadyCounted.includes(path[1]);

      // only count each row once, and ignore the first selected row.
      if (path[1] !== cellEntries[0][1][1] && !curRowCounted) {
        alreadyCounted.push(path[1]);

        const cellRowSpan = getRowSpan(data);
        rowSpan += cellRowSpan;
      }
    }

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
  });
};
