import type { Element } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import type { CreateCellOptions } from '../types';

export const getEmptyCellNode = (
  editor: BasePlateEditor,
  { children, header, row }: CreateCellOptions = {}
) => {
  const createBlock = (
    editor.api.create as { block?: typeof editor.api.create.block }
  ).block;

  header =
    header ??
    (row
      ? (row as Element).children.every(
          (c) => c.type === editor.getType(KEYS.th)
        )
      : false);

  return {
    children: children ?? [
      createBlock?.() ?? {
        children: [{ text: '' }],
        type: editor.getType(KEYS.p),
      },
    ],
    type: header ? editor.getType(KEYS.th) : editor.getType(KEYS.td),
  };
};
