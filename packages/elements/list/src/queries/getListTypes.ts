import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const getListTypes = (editor: SPEditor) => {
  return [
    getSlatePluginType(editor, ELEMENT_OL),
    getSlatePluginType(editor, ELEMENT_UL),
  ];
};
