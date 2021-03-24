import { someNode } from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ELEMENT_TABLE } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export const insertTable = (
  editor: SPEditor,
  { header }: TablePluginOptions
) => {
  if (
    !someNode(editor, { match: { type: getPluginType(editor, ELEMENT_TABLE) } })
  ) {
    Transforms.insertNodes(editor, getEmptyTableNode(editor, { header }));
  }
};
