import {
  type PlateEditor,
  type Value,
  getPluginOptions,
  getPluginType,
} from '@udecode/plate-common/server';

import type { CellFactoryOptions, TablePlugin } from '../types';

import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';

export interface GetEmptyRowNodeOptions extends CellFactoryOptions {
  colCount?: number;
}

export const getEmptyRowNode = <V extends Value>(
  editor: PlateEditor<V>,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { cellFactory } = getPluginOptions<TablePlugin, V>(
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
