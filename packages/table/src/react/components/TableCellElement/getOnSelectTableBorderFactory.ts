import type { Path, SlateEditor, TElement, TTableCellElement } from 'platejs';

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
  setBorderSize,
} from '../../../lib';
import { TablePlugin } from '../../TablePlugin';

/** Helper: sets one cell's specific border(s) to `size`. */
function setCellBorderSize(
  editor: SlateEditor,
  at: Path | null,
  directions: BorderDirection[] | 'all',
  size: number
) {
  if (!at) return;
  if (directions === 'all') {
    setBorderSize(editor, size, { at, border: 'all' });
  } else {
    for (const dir of directions) {
      setBorderSize(editor, size, { at, border: dir });
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
  editor: SlateEditor,
  cells: TTableCellElement[]
): SelectedCellBorderTarget[] =>
  cells.map((cell) => {
    const path = editor.api.findPath(cell) ?? null;
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
  editor: SlateEditor,
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
        setCellBorderSize(editor, target.topCellPath, ['bottom'], newSize);
      }
      if (target.col > 0) {
        setCellBorderSize(editor, target.leftCellPath, ['right'], newSize);
      }
      if (edges.length > 0) {
        setCellBorderSize(editor, target.path, edges, newSize);
      }
    }

    return;
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
            setCellBorderSize(editor, target.path, edges, newSize);
          }
        }
      }
    }

    return;
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
        setCellBorderSize(editor, target.topCellPath, ['bottom'], newSize);
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
        setCellBorderSize(editor, target.leftCellPath, ['right'], newSize);
      }
    }
    if (border === 'right' && target.col + target.cSpan - 1 === maxCol) {
      edges.push('right');
    }
    if (edges.length > 0) {
      setCellBorderSize(editor, target.path, edges, newSize);
    }
  }
}

/**
 * Returns a function that sets borders on the selection with toggling logic. If
 * selection has one or many cells, it's the same approach: we read the bounding
 * rectangle, then decide which edges to flip on/off.
 */
export const getOnSelectTableBorderFactory =
  (editor: SlateEditor) =>
  (border: BorderDirection | 'none' | 'outer') =>
  () => {
    let cells = editor.getApi(TablePlugin).table.getSelectedCells() as
      | TElement[]
      | null;

    if (!cells || cells.length === 0) {
      const cell = editor.api.block({ match: { type: getCellTypes(editor) } });

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
