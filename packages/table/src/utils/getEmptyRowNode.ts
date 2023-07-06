import { PlateEditor, Value, getPluginType } from '@udecode/plate-common';

import { ELEMENT_TR } from '../createTablePlugin';
import { GetEmptyCellNodeOptions, getEmptyCellNode } from './getEmptyCellNode';

export interface GetEmptyRowNodeOptions extends GetEmptyCellNodeOptions {
  colCount?: number;
}

export const getEmptyRowNode = <V extends Value>(
  editor: PlateEditor<V>,
  { colCount = 1, ...options }: GetEmptyRowNodeOptions = {}
) => {
  return {
    type: getPluginType(editor, ELEMENT_TR),
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => getEmptyCellNode(editor, options)),
  };
};
