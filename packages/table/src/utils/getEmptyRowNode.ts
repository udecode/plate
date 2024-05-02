import { getPluginType, PlateEditor, Value } from '@udecode/plate-common/server';

import { ELEMENT_TR } from '../createTablePlugin';
import { getEmptyCellNode, GetEmptyCellNodeOptions } from './getEmptyCellNode';

export interface GetEmptyRowNodeOptions
  extends Omit<GetEmptyCellNodeOptions, '_cellIndices'> {
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
