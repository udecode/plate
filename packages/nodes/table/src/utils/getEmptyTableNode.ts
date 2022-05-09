import { getPluginType, PlateEditor, Value } from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePluginOptions, TTableElement } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = <V extends Value>(
  editor: PlateEditor<V>,
  { header }: TablePluginOptions
): TTableElement => {
  return {
    type: getPluginType(editor, ELEMENT_TABLE),
    children: [
      getEmptyRowNode(editor, { header, colCount: 2 }),
      getEmptyRowNode(editor, { header: false, colCount: 2 }),
    ],
  };
};
