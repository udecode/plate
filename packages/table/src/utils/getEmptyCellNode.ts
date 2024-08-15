import type { PlateEditor, TElement } from '@udecode/plate-common';

import type { CellFactoryOptions } from '../types';

import { TableCellHeaderPlugin, TableCellPlugin } from '../TablePlugin';

export const getEmptyCellNode = (
  editor: PlateEditor,
  { children, header, row }: CellFactoryOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as TElement).children.every(
          (c) => c.type === editor.getType(TableCellHeaderPlugin)
        )
      : false);

  return {
    children: children ?? [editor.api.blockFactory()],
    type: header
      ? editor.getType(TableCellHeaderPlugin)
      : editor.getType(TableCellPlugin),
  };
};
