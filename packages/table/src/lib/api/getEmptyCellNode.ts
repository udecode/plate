import type { SlateEditor, TElement } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { CreateCellOptions } from '../types';

export const getEmptyCellNode = (
  editor: SlateEditor,
  { children, header, row }: CreateCellOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as TElement).children.every(
          (c) => c.type === editor.getType(KEYS.th)
        )
      : false);

  return {
    children: children ?? [editor.api.create.block()],
    type: header ? editor.getType(KEYS.th) : editor.getType(KEYS.td),
  };
};
