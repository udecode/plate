import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_TABLE } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (
  editor: SPEditor,
  { header }: TablePluginOptions
) => {
  return {
    type: getSlatePluginType(editor, ELEMENT_TABLE),
    children: [
      getEmptyRowNode(editor, { header, colCount: 2 }),
      getEmptyRowNode(editor, { header, colCount: 2 }),
    ],
  };
};
