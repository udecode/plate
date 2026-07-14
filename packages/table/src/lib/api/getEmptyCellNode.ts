import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';

import { KEYS } from '@platejs/utils';

import type { CreateCellOptions } from '../types';

export const getEmptyCellNode = (
  editor: BaseEditor,
  { children, header, row }: CreateCellOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as Element).children.every(
          (c) => c.type === editor.getType(KEYS.th)
        )
      : false);

  return {
    children: children ?? [
      { children: [{ text: '' }], type: editor.getType(KEYS.p) },
    ],
    type: header ? editor.getType(KEYS.th) : editor.getType(KEYS.td),
  };
};
