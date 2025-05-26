import type { SlateEditor, TElement, TTableCellElement } from '@udecode/plate';

import { getCellTypes } from '../utils/getCellType';

export const setCellBackground = (
  editor: SlateEditor,
  options: {
    color: string | null;
    selectedCells?: TElement[];
  }
) => {
  const { color, selectedCells } = options;

  const hasSelectedCells = selectedCells && selectedCells.length > 0;

  if (hasSelectedCells) {
    selectedCells.forEach((cell) => {
      const cellPath = editor.api.findPath(cell);

      if (cellPath) {
        editor.tf.setNodes<TTableCellElement>(
          { background: color },
          {
            at: cellPath,
          }
        );
      }
    });

    return;
  }

  const currentCell = editor.api.node<TTableCellElement>({
    match: { type: getCellTypes(editor) },
  })?.[0];

  if (currentCell) {
    const cellPath = editor.api.findPath(currentCell);

    if (cellPath) {
      editor.tf.setNodes<TTableCellElement>(
        { background: color },
        {
          at: cellPath,
        }
      );
    }
  }
};
