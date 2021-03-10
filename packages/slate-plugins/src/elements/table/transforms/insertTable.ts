import { someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { TablePluginOptions } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export const insertTable = (
  editor: Editor,
  { header }: TablePluginOptions,
  options: SlatePluginsOptions
) => {
  const { table } = options;

  if (!someNode(editor, { match: { type: table.type } })) {
    Transforms.insertNodes(editor, getEmptyTableNode({ header }, options));
  }
};
