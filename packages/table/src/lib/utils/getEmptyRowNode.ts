import { type SlateEditor, getEditorPlugin } from '@udecode/plate-common';

import type { CellFactoryOptions } from '../types';

import { TablePlugin, TableRowPlugin } from '../TablePlugin';

export interface GetEmptyRowNodeOptions extends CellFactoryOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: SlateEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { api } = getEditorPlugin(editor, TablePlugin);

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => api.table.cellFactory!(cellOptions)),
    type: editor.getType(TableRowPlugin),
  };
};
