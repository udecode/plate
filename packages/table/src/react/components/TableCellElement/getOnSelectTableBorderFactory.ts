import type { SlateEditor, TElement } from '@udecode/plate';

import {
  type BorderDirection,
  type TTableCellElement,
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

/** Helper: sets one cell's specific border(s) to `size`. */
function setCellBorderSize(
  editor: SlateEditor,
  cell: TElement,
  directions: BorderDirection[] | 'all',
  size: number
) {
  const at = editor.api.findPath(cell);

  if (!at) return;
  if (directions === 'all') {
    setBorderSize(editor, size, { at, border: 'all' });
  } else {
    for (const dir of directions) {
      setBorderSize(editor, size, { at, border: dir });
    }
  }
}

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
  // 1) none => toggle all edges vs none
  if (border === 'none') {
    const { none: allNone } = getSelectedCellsBorders(editor, cells);
    const newSize = allNone ? 1 : 0;

    for (const cell of cells) {
      const cellPath = editor.api.findPath(cell);

      if (!cellPath) continue;

      const { col, row } = getCellIndices(editor, cell);
      const edges: BorderDirection[] = [];

      // For first row or first column cells, we set their top/left borders
      if (row === 0) edges.push('top');
      if (col === 0) edges.push('left');

      // Always set bottom and right borders
      edges.push('bottom', 'right');

      // For non-first row/column cells, set borders on adjacent cells
      if (row > 0) {
        const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

        if (cellAboveEntry) {
          const [cellAbove] = cellAboveEntry;
          setCellBorderSize(editor, cellAbove, ['bottom'], newSize);
        }
      }
      if (col > 0) {
        const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

        if (prevCellEntry) {
          const [prevCell] = prevCellEntry;
          setCellBorderSize(editor, prevCell, ['right'], newSize);
        }
      }
      if (edges.length > 0) {
        setCellBorderSize(editor, cell, edges, newSize);
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

    for (const cell of cells) {
      const { col, row } = getCellIndices(editor, cell);
      const cSpan = getColSpan(cell);
      const rSpan = getRowSpan(cell);

      for (let rr = row; rr < row + rSpan; rr++) {
        for (let cc = col; cc < col + cSpan; cc++) {
          const edges: BorderDirection[] = [];

          if (rr === minRow) edges.push('top');
          if (rr === maxRow) edges.push('bottom');
          if (cc === minCol) edges.push('left');
          if (cc === maxCol) edges.push('right');
          if (edges.length > 0) {
            setCellBorderSize(editor, cell, edges, newSize);
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

  for (const cell of cells) {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const cellPath = editor.api.findPath(cell);

    if (!cellPath) continue;

    const edges: BorderDirection[] = [];

    if (border === 'top' && row === minRow) {
      const isFirstRow = row === 0;

      if (isFirstRow) {
        edges.push('top');
      } else {
        const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

        if (cellAboveEntry) {
          const [cellAbove] = cellAboveEntry;
          setCellBorderSize(editor, cellAbove, ['bottom'], newSize);
        }
      }
    }
    if (border === 'bottom' && row + rSpan - 1 === maxRow) {
      edges.push('bottom');
    }
    if (border === 'left' && col === minCol) {
      const isFirstCell = col === 0;

      if (isFirstCell) {
        edges.push('left');
      } else {
        const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

        if (prevCellEntry) {
          const [prevCell] = prevCellEntry;
          setCellBorderSize(editor, prevCell, ['right'], newSize);
        }
      }
    }
    if (border === 'right' && col + cSpan - 1 === maxCol) {
      edges.push('right');
    }
    if (edges.length > 0) {
      setCellBorderSize(editor, cell, edges, newSize);
    }
  }
}

/**
 * Returns a function that sets borders on the selection with toggling logic. If
 * selection has one or many cells, it's the same approach: we read the bounding
 * rectangle, then decide which edges to flip on/off.
 */
export const getOnSelectTableBorderFactory =
  (editor: SlateEditor, selectedCells: TElement[] | null) =>
  (border: BorderDirection | 'none' | 'outer') =>
  () => {
    if (!selectedCells || selectedCells.length === 0) {
      const cell = editor.api.block({ match: { type: getCellTypes(editor) } });

      if (cell) {
        selectedCells = [cell[0]];
      } else {
        return;
      }
    }

    // Convert them to TTableCellElement
    const cellElems = selectedCells.map((v) => v as TTableCellElement);
    setSelectedCellsBorder(editor, { border, cells: cellElems });
  };
