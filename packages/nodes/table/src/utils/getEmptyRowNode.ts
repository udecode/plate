import { getPluginType, PlateEditor, Value } from '@udecode/plate-common';
import { ELEMENT_TR } from '../createTablePlugin';
import { getEmptyCellNode, GetEmptyCellNodeOptions } from './getEmptyCellNode';

export interface GetEmptyRowNodeOptions extends GetEmptyCellNodeOptions {
  colCount?: number;
}

export const getEmptyRowNode = <V extends Value>(
  editor: PlateEditor<V>,
  { colCount, ...options }: GetEmptyRowNodeOptions = {}
) => {
  return {
    type: getPluginType(editor, ELEMENT_TR),
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode(editor, options)),
  };
};
