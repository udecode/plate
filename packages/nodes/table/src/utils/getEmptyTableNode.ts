import { getPluginType, PlateEditor, Value } from '@udecode/plate-common';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TTableElement } from '../types';
import { getEmptyRowNode, GetEmptyRowNodeOptions } from './getEmptyRowNode';

export interface GetEmptyTableNodeOptions extends GetEmptyRowNodeOptions {
  rowCount?: number;
}

export const getEmptyTableNode = <V extends Value>(
  editor: PlateEditor<V>,
  {
    header,
    rowCount = 0,
    colCount,
    newCellChildren,
  }: GetEmptyTableNodeOptions = {}
): TTableElement => {
  const rows = Array(rowCount)
    .fill(rowCount)
    .map(() => getEmptyRowNode(editor, { header, colCount, newCellChildren }));

  return {
    type: getPluginType(editor, ELEMENT_TABLE),
    children: rows,
  };
};
