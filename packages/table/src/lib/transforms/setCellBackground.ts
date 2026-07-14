import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import type { TTableCellElement } from '@platejs/utils';

import { getCellTypes } from '../utils/getCellType';

export const setCellBackground = (
  editor: BaseEditor,
  options: {
    color: string | null;
    selectedCells?: Element[];
  }
) => {
  const { color, selectedCells } = options;

  const hasSelectedCells = selectedCells && selectedCells.length > 0;

  if (hasSelectedCells) {
    editor.update((tx) => {
      selectedCells.forEach((cell) => {
        const cellPath = editor.read.nodes.path(cell);

        if (cellPath) {
          tx.nodes.set<TTableCellElement>(
            { background: color },
            { at: cellPath }
          );
        }
      });
    });

    return;
  }

  const currentCell = editor.read.nodes.find<TTableCellElement>({
    match: { type: getCellTypes(editor) },
  })?.[0];

  if (currentCell) {
    const cellPath = editor.read.nodes.path(currentCell);

    if (cellPath) {
      editor.update.nodes.set<TTableCellElement>(
        { background: color },
        { at: cellPath }
      );
    }
  }
};
