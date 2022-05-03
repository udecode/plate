import {
  ELEMENT_DEFAULT,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';
import { TablePluginOptions } from '../types';

export const getEmptyCellNode = <V extends Value>(
  editor: PlateEditor<V>,
  { header }: TablePluginOptions
) => {
  return {
    type: header
      ? getPluginType(editor, ELEMENT_TH)
      : getPluginType(editor, ELEMENT_TD),
    children: [
      {
        type: getPluginType(editor, ELEMENT_DEFAULT),
        children: [{ text: '' }],
      },
    ],
  };
};
