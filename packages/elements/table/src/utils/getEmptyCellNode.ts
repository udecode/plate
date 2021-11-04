import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_TD, ELEMENT_TH } from '../defaults';
import { TablePluginOptions } from '../types';

export const getEmptyCellNode = (
  editor: PlateEditor,
  { header }: TablePluginOptions
) => {
  return {
    type: header
      ? getPlatePluginType(editor, ELEMENT_TH)
      : getPlatePluginType(editor, ELEMENT_TD),
    children: [
      {
        type: getPlatePluginType(editor, ELEMENT_DEFAULT),
        children: [{ text: '' }],
      },
    ],
  };
};
