import { getPluginType, PlateEditor } from '@udecode/plate-core';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../createListPlugin';

export const getUnorderedListType = (editor: PlateEditor) => {
  return getPluginType(editor, ELEMENT_UL);
};

export const getOrderedListType = (editor: PlateEditor) => {
  return getPluginType(editor, ELEMENT_OL);
};

export const getListTypes = (editor: PlateEditor) => {
  return [getOrderedListType(editor), getUnorderedListType(editor)];
};

export const getListItemType = (editor: PlateEditor) => {
  return getPluginType(editor, ELEMENT_LI);
};

export const getListItemContentType = (editor: PlateEditor) => {
  return getPluginType(editor, ELEMENT_LIC);
};
