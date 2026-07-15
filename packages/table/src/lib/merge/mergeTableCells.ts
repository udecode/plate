import {
  type Descendant,
  type EditorUpdateTransaction,
  type NodeEntry,
  ElementApi,
} from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TTableCellElement } from '@platejs/utils';

import cloneDeep from 'lodash/cloneDeep.js';
import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { getCellIndices } from '..';
import { BaseTablePlugin } from '../BaseTablePlugin';
import { getTableGridAbove } from '../queries';

/** Merges multiple selected cells into one. */
export const mergeTableCells = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const { api } = getEditorPlugin(editor, BaseTablePlugin);

  const cellEntries = getTableGridAbove(editor, {
    format: 'cell',
  }) as NodeEntry<TTableCellElement>[];

  if (cellEntries.length < 2) return;

  // calculate the colSpan which is the number of horizontal cells that a cell should span.
  let colSpan = 0;

  for (const entry of cellEntries) {
    const [cell, path] = entry;

    const rowIndex = path.at(-2)!;

    // count only those cells that are in the first selected row.
    if (rowIndex === cellEntries[0][1].at(-2)!) {
      const cellColSpan = api.getColSpan(cell);
      colSpan += cellColSpan;
    }
  }

  // calculate the rowSpan which is the number of vertical cells that a cell should span.
  let rowSpan = 0;
  const { col } = getCellIndices(editor, cellEntries[0][0]);
  cellEntries.forEach((entry) => {
    const cell = entry[0];
    const { col: curCol } = getCellIndices(editor, cell);

    if (col === curCol) {
      rowSpan += api.getRowSpan(cell);
    }
  });

  // This will store the content of all cells we are merging
  const mergingCellChildren: Descendant[] = [];

  for (const cellEntry of cellEntries) {
    const [el] = cellEntry;

    const cellChildren = api.getCellChildren!(el);

    if (
      cellChildren.length !== 1 ||
      !ElementApi.isElement(cellChildren[0]) ||
      !editor.read.nodes.isEmpty(cellChildren[0])
    ) {
      mergingCellChildren.push(...cloneDeep(cellChildren));
    }
  }

  // Create a hash map where keys are col paths,
  // and values are an array of all paths with that column
  const cols: Record<string, number[][]> = {};

  cellEntries.forEach(([_entry, path]) => {
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
      tx.nodes.remove({ at: paths[0] });
    });
  });

  // Create a new cell to replace the merged cells, with
  // calculated colSpan and rowSpan attributes and combined content
  const mergedCell = {
    ...api.createCell({
      children: mergingCellChildren,
      header: cellEntries[0][0].type === editor.getType(KEYS.th),
    }),
    colSpan,
    rowSpan,
  };

  // insert the new merged cell in place of the first cell in the selection
  tx.nodes.insert(mergedCell, { at: cellEntries[0][1] });

  const point = tx.points.end(cellEntries[0][1]);

  if (point) tx.selection.set(point);
};
