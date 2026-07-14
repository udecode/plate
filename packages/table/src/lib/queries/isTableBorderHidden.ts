import type { BaseEditor } from '@platejs/core';
import type { TTableCellElement } from '@platejs/utils';

import type { BorderDirection } from '../types';

import { getCellTypes } from '../utils';
import { getLeftTableCell } from './getLeftTableCell';
import { getTopTableCell } from './getTopTableCell';

export const isTableBorderHidden = (
  editor: BaseEditor,
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
    editor.read.nodes.find<TTableCellElement>({
      match: { type: getCellTypes(editor) },
    })?.[0].borders?.[border]?.size === 0
  );
};
