import {
  getPluginType,
  insertNodes,
  PlateEditor,
  someNode,
  TElement,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export const insertTable = (
  editor: PlateEditor,
  { header }: TablePluginOptions
) => {
  if (
    !someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    insertNodes<TElement>(editor, getEmptyTableNode(editor, { header }));
  }
};
