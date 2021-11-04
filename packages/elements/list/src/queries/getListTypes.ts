import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const getListTypes = (editor: PlateEditor) => {
  return [
    getPlatePluginType(editor, ELEMENT_OL),
    getPlatePluginType(editor, ELEMENT_UL),
  ];
};
