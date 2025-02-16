import { type SlateEditor, type TLocation, NodeApi } from '@udecode/plate';

import { getTableGridAbove } from '../queries/getTableGridAbove';
import { getCellTypes } from '../utils/getCellType';

/** Move selection by cell unit. */
export const moveSelectionFromCell = (
  editor: SlateEditor,
  {
    at,
    edge,
    fromOneCell,
    reverse,
  }: {
    at?: TLocation;
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
        editor.tf.select({
          anchor: editor.api.start(anchorPath)!,
          focus: editor.api.start(focusPath)!,
        });
      }

      return true;
    }

    return;
  }

  const cellEntry = editor.api.block({
    at,
    match: { type: getCellTypes(editor) },
  });

  if (cellEntry) {
    const [, cellPath] = cellEntry;

    const nextCellPath = [...cellPath];

    const offset = reverse ? -1 : 1;

    nextCellPath[nextCellPath.length - 2] += offset;

    if (NodeApi.has(editor, nextCellPath)) {
      editor.tf.select(editor.api.start(nextCellPath)!);
    } else {
      const tablePath = cellPath.slice(0, -2);

      if (reverse) {
        editor.tf.withoutNormalizing(() => {
          editor.tf.select(editor.api.start(tablePath)!);
          editor.tf.move({ reverse: true });
        });
      } else {
        editor.tf.withoutNormalizing(() => {
          editor.tf.select(editor.api.end(tablePath)!);
          editor.tf.move();
        });
      }
    }

    return true;
  }
};
