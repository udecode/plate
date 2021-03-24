import { ELEMENT_DEFAULT } from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_TD } from '../defaults';
import { TablePluginOptions } from '../types';

export const getEmptyCellNode = (
  editor: SPEditor,
  { header }: TablePluginOptions
) => {
  return {
    type: header
      ? getPluginType(editor, ELEMENT_TD)
      : getPluginType(editor, ELEMENT_TD),
    children: [
      {
        type: getPluginType(editor, ELEMENT_DEFAULT),
        children: [{ text: '' }],
      },
    ],
  };
};
