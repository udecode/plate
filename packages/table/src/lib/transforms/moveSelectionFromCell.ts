import type { BaseEditor } from '@platejs/core';
import { type Location, NodeApi } from '@platejs/plite';

import { getTableGridAbove } from '../queries/getTableGridAbove';
import { getCellTypes } from '../utils/getCellType';

/** Move selection by cell unit. */
export const moveSelectionFromCell = (
  editor: BaseEditor,
  {
    at,
    edge,
    fromOneCell,
    reverse,
  }: {
    at?: Location;
    /** Expand cell selection to an edge. */
    edge?: 'bottom' | 'left' | 'right' | 'top';
    /** Move selection from one selected cell */
    fromOneCell?: boolean;
    /** False: move selection to cell below true: move selection to cell above */
    reverse?: boolean;
  } = {}
) => {
  if (edge) {
    const cellEntries = getTableGridAbove(editor, { at, format: 'cell' });

    const minCell = fromOneCell ? 0 : 1;

    if (cellEntries.length > minCell) {
      const [, firstCellPath] = cellEntries[0];
      const [, lastCellPath] = cellEntries.at(-1)!;

      const anchorPath = [...firstCellPath];
      const focusPath = [...lastCellPath];

      switch (edge) {
        case 'bottom': {
          focusPath[focusPath.length - 2] += 1;

          break;
        }
        case 'left': {
          anchorPath[anchorPath.length - 1] -= 1;

          break;
        }
        case 'right': {
          focusPath[focusPath.length - 1] += 1;

          break;
        }
        case 'top': {
          anchorPath[anchorPath.length - 2] -= 1;

          break;
        }
        // No default
      }

      if (NodeApi.has(editor, anchorPath) && NodeApi.has(editor, focusPath)) {
        const anchor = editor.read.points.start(anchorPath);
        const focus = editor.read.points.start(focusPath);

        if (anchor && focus) editor.update.selection.set({ anchor, focus });
      }

      return true;
    }

    return;
  }

  const cellEntry = editor.read.nodes.block({
    at,
    match: { type: getCellTypes(editor) },
  });

  if (cellEntry) {
    const [, cellPath] = cellEntry;

    const nextCellPath = [...cellPath];

    const offset = reverse ? -1 : 1;

    nextCellPath[nextCellPath.length - 2] += offset;

    if (NodeApi.has(editor, nextCellPath)) {
      const point = editor.read.points.start(nextCellPath);

      if (point) editor.update.selection.set(point);
    } else {
      const tablePath = cellPath.slice(0, -2);
      const point = reverse
        ? editor.read.points.before(tablePath)
        : editor.read.points.after(tablePath);

      if (point) editor.update.selection.set({ anchor: point, focus: point });
    }

    return true;
  }
};
