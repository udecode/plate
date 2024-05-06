import {
  type PlateEditor,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TTableElement } from '../types';

import { ELEMENT_TABLE } from '../createTablePlugin';
import {
  type GetEmptyRowNodeOptions,
  getEmptyRowNode,
} from './getEmptyRowNode';

export interface GetEmptyTableNodeOptions extends GetEmptyRowNodeOptions {
  rowCount?: number;
}

export const getEmptyTableNode = <V extends Value>(
  editor: PlateEditor<V>,
  {
    colCount,
    header,
    newCellChildren,
    rowCount = 0,
  }: GetEmptyTableNodeOptions = {}
): TTableElement => {
  const rows = Array.from({ length: rowCount })
    .fill(rowCount)
    .map(() => getEmptyRowNode(editor, { colCount, header, newCellChildren }));

  return {
    children: rows,
    type: getPluginType(editor, ELEMENT_TABLE),
  };
};
