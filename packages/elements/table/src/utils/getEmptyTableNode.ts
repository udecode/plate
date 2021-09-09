import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (
  editor: SPEditor,
  { header }: TablePluginOptions
) => {
  return {
    type: getPlatePluginType(editor, ELEMENT_TABLE),
    children: [
      getEmptyRowNode(editor, { header, colCount: 2 }),
      getEmptyRowNode(editor, { header: false, colCount: 2 }),
    ],
  };
};
