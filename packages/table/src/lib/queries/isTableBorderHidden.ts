import { type SlateEditor, findNode } from '@udecode/plate-common';

import type { BorderDirection, TTableCellElement } from '../types';

import { getCellTypes } from '../utils';
import { getLeftTableCell } from './getLeftTableCell';
import { getTopTableCell } from './getTopTableCell';

export const isTableBorderHidden = (
  editor: SlateEditor,
  border: BorderDirection
) => {
  if (border === 'left') {
    const node = getLeftTableCell(editor)?.[0];

    if (node) {
      return node.borders?.right?.size === 0;
    }
  }
  if (border === 'top') {
    const node = getTopTableCell(editor)?.[0];

    if (node) {
      return node.borders?.bottom?.size === 0;
    }
  }

  return (
    findNode<TTableCellElement>(editor, {
      match: { type: getCellTypes(editor) },
    })?.[0].borders?.[border]?.size === 0
  );
};
