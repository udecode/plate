import type { SlateEditor, TElement } from '@udecode/plate';

import type { TTableCellElement } from '../types';

import { getCellTypes } from '../utils/index';

export const setCellBackgroundColor = (
  editor: SlateEditor,
  options: {
    color: string;
    selectedCells: TElement[] | null;
  }
) => {
  const { color, selectedCells } = options;

  const hasSelectedCells = selectedCells && selectedCells.length > 0;

  if (hasSelectedCells) {
    selectedCells.forEach((cell) =>
      setSingleCellBackgroundColor(editor, cell, color)
    );

    return;
  }

  const cellPath = editor.api.node<TTableCellElement>({
    match: { type: getCellTypes(editor) },
  })?.[1];

  if (cellPath) {
    editor.tf.setNodes<TTableCellElement>(
      { backgroundColor: color },
      {
        at: cellPath,
      }
    );
  }
};

const setSingleCellBackgroundColor = (
  editor: SlateEditor,
  cell: TTableCellElement,
  color: string
) => {
  const cellPath = editor.api.findPath(cell);

  if (cellPath) {
    editor.tf.setNodes<TTableCellElement>(
      { backgroundColor: color },
      {
        at: cellPath,
      }
    );
  }
};
