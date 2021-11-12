import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_TR } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from './getEmptyCellNode';

export const getEmptyRowNode = (
  editor: PlateEditor,
  { header, colCount }: TablePluginOptions & { colCount: number }
) => {
  return {
    type: getPluginType(editor, ELEMENT_TR),
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode(editor, { header })),
  };
};
