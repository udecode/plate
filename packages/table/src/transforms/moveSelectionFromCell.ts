import {
  getBlockAbove,
  getEndPoint,
  getStartPoint,
  hasNode,
  moveSelection,
  PlateEditor,
  select,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Location } from 'slate';

import { getTableGridAbove } from '../queries/getTableGridAbove';
import { getCellTypes } from '../utils/getCellType';

/**
 * Move selection by cell unit.
 */
export const moveSelectionFromCell = <V extends Value = Value>(
  editor: PlateEditor<V>,
  {
    at,
    reverse,
    edge,
    fromOneCell,
  }: {
    at?: Location;

    /**
     * false: move selection to cell below
     * true: move selection to cell above
     */
    reverse?: boolean;
    /**
     * Expand cell selection to an edge.
     */
    edge?: 'top' | 'left' | 'right' | 'bottom';

    /**
     * Move selection from one selected cell
     */
    fromOneCell?: boolean;
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
        case 'top': {
          anchorPath[anchorPath.length - 2] -= 1;

          break;
        }
        case 'right': {
          focusPath[focusPath.length - 1] += 1;

          break;
        }
        case 'left': {
          anchorPath[anchorPath.length - 1] -= 1;

          break;
        }
        // No default
      }

      if (hasNode(editor, anchorPath) && hasNode(editor, focusPath)) {
        select(editor, {
          anchor: getStartPoint(editor, anchorPath),
          focus: getStartPoint(editor, focusPath),
        });
      }
      return true;
    }
    return;
  }

  const cellEntry = getBlockAbove(editor, {
    at,
    match: { type: getCellTypes(editor) },
  });

  if (cellEntry) {
    const [, cellPath] = cellEntry;

    const nextCellPath = [...cellPath];

    const offset = reverse ? -1 : 1;

    nextCellPath[nextCellPath.length - 2] += offset;

    if (hasNode(editor, nextCellPath)) {
      select(editor, getStartPoint(editor, nextCellPath));
    } else {
      const tablePath = cellPath.slice(0, -2);

      if (reverse) {
        withoutNormalizing(editor, () => {
          select(editor, getStartPoint(editor, tablePath));
          moveSelection(editor, { reverse: true });
        });
      } else {
        withoutNormalizing(editor, () => {
          select(editor, getEndPoint(editor, tablePath));
          moveSelection(editor);
        });
      }
    }

    return true;
  }
};
