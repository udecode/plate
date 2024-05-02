import { findNode, PlateEditor, Value } from '@udecode/plate-common/server';

import { BorderDirection, TTableCellElement } from '../types';
import { getCellTypes } from '../utils/index';
import { getLeftTableCell } from './getLeftTableCell';
import { getTopTableCell } from './getTopTableCell';

export const isTableBorderHidden = <V extends Value>(
  editor: PlateEditor<V>,
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
