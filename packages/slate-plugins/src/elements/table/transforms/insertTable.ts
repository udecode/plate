import { someNode } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_TABLE } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export const insertTable = (editor: Editor, { header }: TablePluginOptions) => {
  if (
    !someNode(editor, { match: { type: getPluginType(editor, ELEMENT_TABLE) } })
  ) {
    Transforms.insertNodes(editor, getEmptyTableNode(editor, { header }));
  }
};
