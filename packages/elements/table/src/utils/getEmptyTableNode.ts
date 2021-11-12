import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (
  editor: PlateEditor,
  { header }: TablePluginOptions
) => {
  return {
    type: getPluginType(editor, ELEMENT_TABLE),
    children: [
      getEmptyRowNode(editor, { header, colCount: 2 }),
      getEmptyRowNode(editor, { header: false, colCount: 2 }),
    ],
  };
};
