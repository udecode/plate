import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_TR } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from './getEmptyCellNode';

export const getEmptyRowNode = (
  editor: SPEditor,
  { header, colCount }: TablePluginOptions & { colCount: number }
) => {
  return {
    type: getSlatePluginType(editor, ELEMENT_TR),
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode(editor, { header })),
  };
};
