import {
  type PlateEditor,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TablePlugin } from '../types';

import { ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';

export interface GetEmptyCellNodeOptions
  extends Omit<TablePlugin, '_cellIndices'> {
  /** Header cell */
  header?: boolean;
}

export const getEmptyCellNode = <V extends Value>(
  editor: PlateEditor<V>,
  { header, newCellChildren = [editor.blockFactory()] }: GetEmptyCellNodeOptions
) => {
  return {
    children: newCellChildren,
    type: header
      ? getPluginType(editor, ELEMENT_TH)
      : getPluginType(editor, ELEMENT_TD),
  };
};
