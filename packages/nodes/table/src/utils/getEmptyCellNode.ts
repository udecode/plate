import {
  ELEMENT_DEFAULT,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';
import { TablePlugin } from '../types';

export interface GetEmptyCellNodeOptions extends TablePlugin {
  /**
   * Header cell
   */
  header?: boolean;
}

export const getEmptyCellNode = <V extends Value>(
  editor: PlateEditor<V>,
  {
    header,
    newCellChildren = [
      {
        type: getPluginType(editor, ELEMENT_DEFAULT),
        children: [{ text: '' }],
      },
    ],
  }: GetEmptyCellNodeOptions
) => {
  return {
    type: header
      ? getPluginType(editor, ELEMENT_TH)
      : getPluginType(editor, ELEMENT_TD),
    children: newCellChildren,
  };
};
