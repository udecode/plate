import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_TD, ELEMENT_TH } from '../defaults';
import { TablePluginOptions } from '../types';

export const getEmptyCellNode = (
  editor: SPEditor,
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
