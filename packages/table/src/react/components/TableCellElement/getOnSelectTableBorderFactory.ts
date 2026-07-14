import type { Path } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TTableCellElement } from '@platejs/utils';

import {
  type BorderDirection,
  getCellIndices,
  getCellTypes,
  getColSpan,
  getLeftTableCell,
  getRowSpan,
  getSelectedCellsBorders,
  getSelectedCellsBoundingBox,
  getTopTableCell,
  isSelectedCellBorder,
  type SetBorderSizeOptions,
  setBorderSizes,
} from '../../../lib';
import { BaseTablePlugin } from '../../../lib/BaseTablePlugin';

/** Helper: sets one cell's specific border(s) to `size`. */
function setCellBorderSize(
  updates: SetBorderSizeOptions[],
  at: Path | null,
  directions: BorderDirection[] | 'all',
  size: number
) {
  if (!at) return;
  if (directions === 'all') {
    updates.push({ at, border: 'all', size });
  } else {
    for (const dir of directions) {
      updates.push({ at, border: dir, size });
    }
  }
}

type SelectedCellBorderTarget = {
  cSpan: number;
  col: number;
  leftCellPath: Path | null;
  path: Path | null;
  rSpan: number;
  row: number;
  topCellPath: Path | null;
};

const getSelectedCellBorderTargets = (
  editor: BaseEditor,
  cells: TTableCellElement[]
): SelectedCellBorderTarget[] =>
  cells.map((cell) => {
    const path = editor.read.nodes.path(cell) ?? null;
    const { col, row } = getCellIndices(editor, cell);

    return {
      cSpan: getColSpan(cell),
      col,
      leftCellPath: path
        ? (getLeftTableCell(editor, { at: path })?.[1] ?? null)
        : null,
      path,
      rSpan: getRowSpan(cell),
      row,
      topCellPath: path
        ? (getTopTableCell(editor, { at: path })?.[1] ?? null)
        : null,
    };
  });

/**
 * Toggle logic for `'none'`, `'outer'`, `'top'|'bottom'|'left'|'right'`.
 * `'none'` toggles no borders ↔ all borders, `'outer'` toggles the bounding
 * rectangle's outer edges on/off, `'top'|'bottom'|'left'|'right'` toggles only
 * that side of the bounding rect.
 */
export function setSelectedCellsBorder(
  editor: BaseEditor,
  {
    border,
    cells,
  }: {
    border: BorderDirection | 'none' | 'outer';
    cells: TTableCellElement[];
  }
) {
  if (cells.length === 0) return;
  const targets = getSelectedCellBorderTargets(editor, cells);
  const updates: SetBorderSizeOptions[] = [];
  const applyUpdates = () => setBorderSizes(editor, updates);

  // 1) none => toggle all edges vs none
  if (border === 'none') {
    const { none: allNone } = getSelectedCellsBorders(editor, cells);
    const newSize = allNone ? 1 : 0;

    for (const target of targets) {
      if (!target.path) continue;

      const edges: BorderDirection[] = [];

      // For first row or first column cells, we set their top/left borders
      if (target.row === 0) edges.push('top');
      if (target.col === 0) edges.push('left');

      // Always set bottom and right borders
      edges.push('bottom', 'right');

      // For non-first row/column cells, set borders on adjacent cells
      if (target.row > 0) {
        setCellBorderSize(updates, target.topCellPath, ['bottom'], newSize);
      }
      if (target.col > 0) {
        setCellBorderSize(updates, target.leftCellPath, ['right'], newSize);
      }
      if (edges.length > 0) {
        setCellBorderSize(updates, target.path, edges, newSize);
      }
    }

    return applyUpdates();
  }
  // 2) outer => bounding rectangle edges only
  if (border === 'outer') {
    const { outer: allOut } = getSelectedCellsBorders(editor, cells);
    const newSize = allOut ? 0 : 1;

    const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
      editor,
      cells
    );

    for (const target of targets) {
      if (!target.path) continue;

      for (let rr = target.row; rr < target.row + target.rSpan; rr++) {
        for (let cc = target.col; cc < target.col + target.cSpan; cc++) {
          const edges: BorderDirection[] = [];

          if (rr === minRow) edges.push('top');
          if (rr === maxRow) edges.push('bottom');
          if (cc === minCol) edges.push('left');
          if (cc === maxCol) edges.push('right');
          if (edges.length > 0) {
            setCellBorderSize(updates, target.path, edges, newSize);
          }
        }
      }
    }

    return applyUpdates();
  }

  // 3) single side => bounding rectangle but only that side
  const allSet = isSelectedCellBorder(editor, cells, border);
  const newSize = allSet ? 0 : 1;

  // bounding box
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cells
  );

  for (const target of targets) {
    if (!target.path) continue;

    const edges: BorderDirection[] = [];

    if (border === 'top' && target.row === minRow) {
      const isFirstRow = target.row === 0;

      if (isFirstRow) {
        edges.push('top');
      } else {
        setCellBorderSize(updates, target.topCellPath, ['bottom'], newSize);
      }
    }
    if (border === 'bottom' && target.row + target.rSpan - 1 === maxRow) {
      edges.push('bottom');
    }
    if (border === 'left' && target.col === minCol) {
      const isFirstCell = target.col === 0;

      if (isFirstCell) {
        edges.push('left');
      } else {
        setCellBorderSize(updates, target.leftCellPath, ['right'], newSize);
      }
    }
    if (border === 'right' && target.col + target.cSpan - 1 === maxCol) {
      edges.push('right');
    }
    if (edges.length > 0) {
      setCellBorderSize(updates, target.path, edges, newSize);
    }
  }

  applyUpdates();
}

/**
 * Returns a function that sets borders on the selection with toggling logic. If
 * selection has one or many cells, it's the same approach: we read the bounding
 * rectangle, then decide which edges to flip on/off.
 */
export const getOnSelectTableBorderFactory =
  (editor: BaseEditor) =>
  (border: BorderDirection | 'none' | 'outer') =>
  () => {
    let cells = editor.plugin(BaseTablePlugin).api.getSelectedCells();

    if (!cells || cells.length === 0) {
      const cell = editor.read.nodes.block({
        match: { type: getCellTypes(editor) },
      });

      if (cell) {
        cells = [cell[0]];
      } else {
        return;
      }
    }

    // Convert them to TTableCellElement
    const cellElems = cells.map((v) => v as TTableCellElement);
    setSelectedCellsBorder(editor, { border, cells: cellElems });
  };
