import {
  getPluginType,
  PlateEditor,
  TDescendant,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_TR } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from './getEmptyCellNode';

export const getEmptyRowNode = <V extends Value>(
  editor: PlateEditor<V>,
  {
    header,
    colCount,
    cellChildren,
  }: TablePluginOptions & {
    colCount?: number;
    cellChildren?: TDescendant[];
  } = {}
) => {
  return {
    type: getPluginType(editor, ELEMENT_TR),
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode(editor, { header, cellChildren })),
  };
};
