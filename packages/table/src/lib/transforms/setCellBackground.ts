import type { Element } from '@platejs/plite';
import type { BasePlateEditor, TTableCellElement } from 'platejs';

import { getCellTypes } from '../utils/getCellType';
import { findTableNodePath } from '../utils/findTableNodePath';

export const setCellBackground = (
  editor: BasePlateEditor,
  options: {
    color: string | null;
    selectedCells?: Element[];
  }
) => {
  const { color, selectedCells } = options;

  const hasSelectedCells = selectedCells && selectedCells.length > 0;

  if (hasSelectedCells) {
    const cellPaths = selectedCells
      .map((cell) => findTableNodePath(editor, cell))
      .filter((cellPath): cellPath is NonNullable<typeof cellPath> =>
        Boolean(cellPath)
      );

    editor.update((tx) => {
      cellPaths.forEach((cellPath) => {
        if (color === null) {
          tx.nodes.unset('background', { at: cellPath });
        } else {
          tx.nodes.set(
            { background: color } satisfies Partial<TTableCellElement>,
            {
              at: cellPath,
            }
          );
        }
      });
    });

    return;
  }

  const currentCellEntry = editor.api.node<TTableCellElement>({
    match: { type: getCellTypes(editor) },
  });

  if (currentCellEntry) {
    const [, cellPath] = currentCellEntry;

    editor.update((tx) => {
      if (color === null) {
        tx.nodes.unset('background', { at: cellPath });
      } else {
        tx.nodes.set(
          { background: color } satisfies Partial<TTableCellElement>,
          {
            at: cellPath,
          }
        );
      }
    });
  }
};
