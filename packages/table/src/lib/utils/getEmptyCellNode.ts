import type { SlateEditor, TElement } from '@udecode/plate-common';

import type { CreateCellOptions } from '../types';

import { TableCellHeaderPlugin, TableCellPlugin } from '../TablePlugin';

export const getEmptyCellNode = (
  editor: SlateEditor,
  { children, header, row }: CreateCellOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as TElement).children.every(
          (c) => c.type === editor.getType(TableCellHeaderPlugin)
        )
      : false);

  return {
    children: children ?? [editor.api.create.block()],
    type: header
      ? editor.getType(TableCellHeaderPlugin)
      : editor.getType(TableCellPlugin),
  };
};
