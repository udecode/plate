import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_TABLE } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (
  editor: Editor,
  { header }: TablePluginOptions
) => {
  return {
    type: getPluginType(editor, ELEMENT_TABLE),
    children: [
      getEmptyRowNode(editor, { header, colCount: 2 }),
      getEmptyRowNode(editor, { header, colCount: 2 }),
    ],
  };
};
