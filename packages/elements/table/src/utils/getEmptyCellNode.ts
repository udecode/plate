import { ELEMENT_DEFAULT } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_TD } from '../defaults';
import { TablePluginOptions } from '../types';

export const getEmptyCellNode = (
  editor: SPEditor,
  { header }: TablePluginOptions
) => {
  return {
    type: header
      ? getSlatePluginType(editor, ELEMENT_TD)
      : getSlatePluginType(editor, ELEMENT_TD),
    children: [
      {
        type: getSlatePluginType(editor, ELEMENT_DEFAULT),
        children: [{ text: '' }],
      },
    ],
  };
};
