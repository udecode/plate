import type { SlateEditor, TElement } from '@udecode/plate';

import type { BorderDirection, TTableCellElement } from '../types';

import { getCellIndices, getCellTypes } from '../utils';
import { getColSpan } from './getColSpan';
import { getLeftTableCell } from './getLeftTableCell';
import { getRowSpan } from './getRowSpan';
import { getSelectedCellsBoundingBox } from './getSelectedCellsBoundingBox';
import { getTopTableCell } from './getTopTableCell';

export interface GetSelectedCellsBordersOptions {
  select?: {
    none?: boolean;
    outer?: boolean;
    side?: boolean;
  };
}

export interface TableBorderStates {
  bottom: boolean;
  left: boolean;
  none: boolean;
  outer: boolean;
  right: boolean;
  top: boolean;
}

/**
 * Get all border states for the selected cells at once. Returns an object with
 * boolean flags for each border state:
 *
 * - Top/bottom/left/right: true if border is visible (size > 0)
 * - Outer: true if all outer borders are visible
 * - None: true if all borders are hidden (size === 0)
 */
export const getSelectedCellsBorders = (
  editor: SlateEditor,
  selectedCells?: TElement[] | null,
  options: GetSelectedCellsBordersOptions = {}
): TableBorderStates => {
  const { select = { none: true, outer: true, side: true } } = options;

  // If no cells are selected, try to get the current cell
  if (!selectedCells || selectedCells.length === 0) {
    const cell = editor.api.block({ match: { type: getCellTypes(editor) } });

    if (cell) {
      selectedCells = [cell[0]];
    } else {
      return {
        bottom: true,
        left: true,
        none: false,
        outer: true,
        right: true,
        top: true,
      };
    }
  }

  // Convert to TTableCellElement
  const cells = selectedCells.map((cell) => cell as TTableCellElement);

  // Get bounding box once
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cells
  );

  // Track border states
  let hasAnyBorder = false;
  let allOuterBordersSet = true;
  const borderStates = {
    bottom: false,
    left: false,
    right: false,
    top: false,
  };

  // Single pass through cells to check all border conditions
  for (const cell of cells) {
    const { col, row } = getCellIndices(editor, cell);
    const cellPath = editor.api.findPath(cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const isFirstRow = row === 0;
    const isFirstCell = col === 0;

    if (!cellPath) continue;
    // Check borders for 'none' state
    if (select.none && !hasAnyBorder) {
      // Check own borders
      if (isFirstRow && (cell.borders?.top?.size ?? 1) > 0) hasAnyBorder = true;
      if (isFirstCell && (cell.borders?.left?.size ?? 1) > 0)
        hasAnyBorder = true;
      if ((cell.borders?.bottom?.size ?? 1) > 0) hasAnyBorder = true;
      if ((cell.borders?.right?.size ?? 1) > 0) hasAnyBorder = true;
      // Check adjacent cells if still no border found
      if (!hasAnyBorder) {
        if (!isFirstRow) {
          const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

          if (
            cellAboveEntry &&
            (cellAboveEntry[0].borders?.bottom?.size ?? 1) > 0
          ) {
            hasAnyBorder = true;
          }
        }
        if (!isFirstCell) {
          const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

          if (
            prevCellEntry &&
            (prevCellEntry[0].borders?.right?.size ?? 1) > 0
          ) {
            hasAnyBorder = true;
          }
        }
      }
    }
    // Only check borders if side or outer is requested
    if (select.side || select.outer) {
      // Check outer borders state
      for (let rr = row; rr < row + rSpan; rr++) {
        for (let cc = col; cc < col + cSpan; cc++) {
          // Top border
          if (rr === minRow) {
            if (isFirstRow) {
              if ((cell.borders?.top?.size ?? 1) < 1) {
                borderStates.top = false;

                if (select.outer) allOuterBordersSet = false;
              } else if (!borderStates.top) {
                borderStates.top = true;
              }
            } else {
              const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

              if (cellAboveEntry) {
                const [cellAbove] = cellAboveEntry;

                if ((cellAbove.borders?.bottom?.size ?? 1) < 1) {
                  borderStates.top = false;

                  if (select.outer) allOuterBordersSet = false;
                } else if (!borderStates.top) {
                  borderStates.top = true;
                }
              }
            }
          }
          // Bottom border
          if (rr === maxRow) {
            if ((cell.borders?.bottom?.size ?? 1) < 1) {
              borderStates.bottom = false;

              if (select.outer) allOuterBordersSet = false;
            } else if (!borderStates.bottom) {
              borderStates.bottom = true;
            }
          }
          // Left border
          if (cc === minCol) {
            if (isFirstCell) {
              if ((cell.borders?.left?.size ?? 1) < 1) {
                borderStates.left = false;

                if (select.outer) allOuterBordersSet = false;
              } else if (!borderStates.left) {
                borderStates.left = true;
              }
            } else {
              const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

              if (prevCellEntry) {
                const [prevCell] = prevCellEntry;

                if ((prevCell.borders?.right?.size ?? 1) < 1) {
                  borderStates.left = false;

                  if (select.outer) allOuterBordersSet = false;
                } else if (!borderStates.left) {
                  borderStates.left = true;
                }
              }
            }
          }
          // Right border
          if (cc === maxCol) {
            if ((cell.borders?.right?.size ?? 1) < 1) {
              borderStates.right = false;

              if (select.outer) allOuterBordersSet = false;
            } else if (!borderStates.right) {
              borderStates.right = true;
            }
          }
        }
      }
    }
  }

  return {
    ...(select.side
      ? borderStates
      : { bottom: true, left: true, right: true, top: true }),
    none: select.none ? !hasAnyBorder : false,
    outer: select.outer ? allOuterBordersSet : true,
  };
};

/**
 * Tells if the entire selection is currently borderless (size=0 on all edges).
 * If **any** edge is > 0, returns false.
 */
export function isSelectedCellBordersNone(
  editor: SlateEditor,
  cells: TTableCellElement[]
): boolean {
  return cells.every((cell) => {
    const { borders } = cell;
    const { col, row } = getCellIndices(editor, cell);
    const cellPath = editor.api.findPath(cell);

    if (!cellPath) return true;

    // Check own borders
    const isFirstRow = row === 0;
    const isFirstCell = col === 0;

    if (isFirstRow && (borders?.top?.size ?? 1) > 0) return false;
    if (isFirstCell && (borders?.left?.size ?? 1) > 0) return false;
    if ((borders?.bottom?.size ?? 1) > 0) return false;
    if ((borders?.right?.size ?? 1) > 0) return false;
    // Check adjacent cells' borders
    if (!isFirstRow) {
      const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

      if (cellAboveEntry) {
        const [cellAbove] = cellAboveEntry;

        if ((cellAbove.borders?.bottom?.size ?? 1) > 0) return false;
      }
    }
    if (!isFirstCell) {
      const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

      if (prevCellEntry) {
        const [prevCell] = prevCellEntry;

        if ((prevCell.borders?.right?.size ?? 1) > 0) return false;
      }
    }

    return true;
  });
}

/**
 * Tells if the bounding rectangle for the entire selection is fully set for the
 * **outer** edges, i.e. top/left/bottom/right edges have size=1. We ignore
 * internal edges, only bounding rectangle edges.
 */
export function isSelectedCellBordersOuter(
  editor: SlateEditor,
  cells: TTableCellElement[]
): boolean {
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cells
  );

  // For each cell, figure out which edges are relevant on the bounding rect
  // and confirm they are all size=1
  for (const cell of cells) {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);

    for (let rr = row; rr < row + rSpan; rr++) {
      for (let cc = col; cc < col + cSpan; cc++) {
        // If on top boundary => must have top=1, etc.
        if (rr === minRow && (cell.borders?.top?.size ?? 1) < 1) return false;
        if (rr === maxRow && (cell.borders?.bottom?.size ?? 1) < 1)
          return false;
        if (cc === minCol && (cell.borders?.left?.size ?? 1) < 1) return false;
        if (cc === maxCol && (cell.borders?.right?.size ?? 1) < 1) return false;
      }
    }
  }

  return true;
}

/**
 * Tells if the bounding rectangle for the entire selection is fully set for
 * that single side. Example: border='top' => if every cell that sits along the
 * top boundary has top=1.
 */
export function isSelectedCellBorder(
  editor: SlateEditor,
  cells: TTableCellElement[],
  side: BorderDirection
): boolean {
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cells
  );

  return cells.every((cell) => {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const cellPath = editor.api.findPath(cell);

    if (!cellPath) return true;

    for (let rr = row; rr < row + rSpan; rr++) {
      for (let cc = col; cc < col + cSpan; cc++) {
        if (side === 'top' && rr === minRow) {
          const isFirstRow = row === 0;

          if (isFirstRow) {
            return (cell.borders?.top?.size ?? 1) >= 1;
          }

          const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

          if (!cellAboveEntry) return true;

          const [cellAboveNode] = cellAboveEntry;

          return (cellAboveNode.borders?.bottom?.size ?? 1) >= 1;
        }
        if (side === 'bottom' && rr === maxRow) {
          return (cell.borders?.bottom?.size ?? 1) >= 1;
        }
        if (side === 'left' && cc === minCol) {
          const isFirstCell = col === 0;

          if (isFirstCell) {
            return (cell.borders?.left?.size ?? 1) >= 1;
          }

          const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

          if (!prevCellEntry) return true;

          const [prevCellNode] = prevCellEntry;

          return (prevCellNode.borders?.right?.size ?? 1) >= 1;
        }
        if (side === 'right' && cc === maxCol) {
          return (cell.borders?.right?.size ?? 1) >= 1;
        }
      }
    }

    return true;
  });
}
