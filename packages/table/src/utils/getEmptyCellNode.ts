import {
  type PlateEditor,
  type TElement,
  getPluginType,
} from '@udecode/plate-common';

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
          (c) => c.type === getPluginType(editor, TableCellHeaderPlugin.key)
        )
      : false);

  return {
    children: children ?? [editor.api.blockFactory()],
    type: header
      ? getPluginType(editor, TableCellHeaderPlugin.key)
      : getPluginType(editor, TableCellPlugin.key),
  };
};
