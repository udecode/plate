import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const getListTypes = (editor: Editor) => {
  return [getPluginType(editor, ELEMENT_OL), getPluginType(editor, ELEMENT_UL)];
};
