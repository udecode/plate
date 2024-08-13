import {
  type PlateEditor,
  getPluginOptions,
  getPluginType,
} from '@udecode/plate-common';

import type { CellFactoryOptions, TablePluginOptions } from '../types';

import { TablePlugin, TableRowPlugin } from '../TablePlugin';

export interface GetEmptyRowNodeOptions extends CellFactoryOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: PlateEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { cellFactory } = getPluginOptions<TablePluginOptions>(
    editor,
    TablePlugin.key
  );

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => cellFactory!(cellOptions)),
    type: getPluginType(editor, TableRowPlugin.key),
  };
};
