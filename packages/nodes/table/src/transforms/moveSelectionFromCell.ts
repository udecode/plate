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
} from '@udecode/plate-core';
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
    force,
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
     * Force selection to next cell
     */
    force?: boolean;
  } = {}
) => {
  if (edge) {
    const cellEntries = getTableGridAbove(editor, { at, format: 'cell' });

    const minCell = force ? 0 : 1;

    if (cellEntries.length > minCell) {
      const [, firstCellPath] = cellEntries[0];
      const [, lastCellPath] = cellEntries[cellEntries.length - 1];

      const anchorPath = [...firstCellPath];
      const focusPath = [...lastCellPath];

      if (edge === 'bottom') {
        focusPath[focusPath.length - 2] += 1;
      } else if (edge === 'top') {
        anchorPath[anchorPath.length - 2] -= 1;
      } else if (edge === 'right') {
        focusPath[focusPath.length - 1] += 1;
      } else if (edge === 'left') {
        anchorPath[anchorPath.length - 1] -= 1;
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

    // const a = getPointBefore(editor, editor.selection?.focus!, {
    //   unit: 'line',
    // });
    //
    // if (!isStartPoint(editor, a, cellPath)) return;

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
