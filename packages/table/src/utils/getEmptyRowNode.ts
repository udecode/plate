import {
  type PlateEditor,
  getPluginOptions,
  getPluginType,
} from '@udecode/plate-common/server';

import type { CellFactoryOptions, TablePluginOptions } from '../types';

import { ELEMENT_TABLE, ELEMENT_TR } from '../TablePlugin';

export interface GetEmptyRowNodeOptions extends CellFactoryOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: PlateEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { cellFactory } = getPluginOptions<TablePluginOptions>(
    editor,
    ELEMENT_TABLE
  );

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => cellFactory!(cellOptions)),
    type: getPluginType(editor, ELEMENT_TR),
  };
};
