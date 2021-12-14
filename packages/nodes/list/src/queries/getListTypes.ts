import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_OL, ELEMENT_UL } from '../createListPlugin';

export const getListTypes = (editor: PlateEditor) => {
  return [getPluginType(editor, ELEMENT_OL), getPluginType(editor, ELEMENT_UL)];
};
