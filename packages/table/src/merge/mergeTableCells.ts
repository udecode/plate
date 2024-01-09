import {
  collapseSelection,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  isElementEmpty,
  PlateEditor,
  removeNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep.js';

import { ELEMENT_TABLE, ELEMENT_TH } from '../createTablePlugin';
import { getTableGridAbove } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { TablePlugin, TTableCellElement, TTableElement } from '../types';
import { getEmptyCellNode } from '../utils';
import { computeCellIndices } from './computeCellIndices';
import { getCellIndices } from './getCellIndices';

/**
 * Merges multiple selected cells into one.
 */
export const mergeTableCells = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  withoutNormalizing(editor, () => {
    const { _cellIndices } = getPluginOptions<TablePlugin, V>(
      editor,
      ELEMENT_TABLE
    );
    const tableEntry = getBlockAbove(editor, {
      at: editor.selection?.anchor.path,
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })!;

    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    // calculate the colSpan which is the number of horizontal cells that a cell should span.
    let colSpan = 0;
    for (const entry of cellEntries) {
      const [data, path] = entry;

      const rowIndex = path.at(-2)!;

      // count only those cells that are in the first selected row.
      if (rowIndex === cellEntries[0][1].at(-2)!) {
        const cellColSpan = getColSpan(data as TTableCellElement);
        colSpan += cellColSpan;
      }
    }

    // calculate the rowSpan which is the number of vertical cells that a cell should span.
    let rowSpan = 0;
    const { col } = getCellIndices(
      _cellIndices!,
      cellEntries[0][0] as TTableCellElement
    )!;
    cellEntries.forEach((cE) => {
      const cell = cE[0] as TTableCellElement;
      const { col: curCol } =
        _cellIndices?.get(cell) ||
        computeCellIndices(editor, tableEntry[0] as TTableElement, cell)!;
      if (col === curCol) {
        rowSpan += getRowSpan(cell);
      }
    });

    // This will store the content of all cells we are merging
    const contents = [];
    for (const cellEntry of cellEntries) {
      const [el] = cellEntry;
      if (
        el.children.length !== 1 ||
        !isElementEmpty(editor, el.children[0] as any)
      ) {
        contents.push(...cloneDeep(el.children));
      }
    }

    // Create a hash map where keys are col paths,
    // and values are an array of all paths with that column
    const cols: { [key: string]: number[][] } = {};

    cellEntries.forEach(([entry, path]) => {
      const rowIndex = path.at(-2)!;

      if (cols[rowIndex]) {
        cols[rowIndex].push(path);
      } else {
        cols[rowIndex] = [path];
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
        header: cellEntries[0][0].type === getPluginType(editor, ELEMENT_TH),
        newCellChildren: contents,
      }),
      colSpan,
      rowSpan,
    };

    // insert the new merged cell in place of the first cell in the selection
    insertElements(editor, mergedCell, { at: cellEntries[0][1] });
    collapseSelection(editor);
  });
};
