import {
  getPluginType,
  PlateEditor,
  TDescendant,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePluginOptions, TTableElement } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = <V extends Value>(
  editor: PlateEditor<V>,
  {
    header,
    rowCount = 0,
    colCount,
    cellChildren,
  }: TablePluginOptions & {
    rowCount?: number;
    colCount?: number;
    cellChildren?: TDescendant[];
  } = {}
): TTableElement => {
  const rows = Array(rowCount)
    .fill(rowCount)
    .map(() => getEmptyRowNode(editor, { header, colCount, cellChildren }));

  return {
    type: getPluginType(editor, ELEMENT_TABLE),
    children: rows,
  };
};
