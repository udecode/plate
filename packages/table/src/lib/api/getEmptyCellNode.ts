import type { SlateEditor, TElement } from '@udecode/plate-common';

import type { CreateCellOptions } from '../types';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
} from '../BaseTablePlugin';

export const getEmptyCellNode = (
  editor: SlateEditor,
  { children, header, row }: CreateCellOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as TElement).children.every(
          (c) => c.type === editor.getType(BaseTableCellHeaderPlugin)
        )
      : false);

  return {
    children: children ?? [editor.api.create.block()],
    type: header
      ? editor.getType(BaseTableCellHeaderPlugin)
      : editor.getType(BaseTableCellPlugin),
  };
};
