import { type PlateEditor, getPluginType } from '@udecode/plate-common';

import type { CellFactoryOptions } from '../types';

import { TablePlugin, TableRowPlugin } from '../TablePlugin';

export interface GetEmptyRowNodeOptions extends CellFactoryOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: PlateEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const api = editor.getApi(TablePlugin);

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => api.table.cellFactory!(cellOptions)),
    type: editor.getType(TableRowPlugin),
  };
};
