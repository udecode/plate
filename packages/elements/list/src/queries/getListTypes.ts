import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const getListTypes = (editor: SPEditor) => {
  return [getPluginType(editor, ELEMENT_OL), getPluginType(editor, ELEMENT_UL)];
};
