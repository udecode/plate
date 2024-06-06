import {
  type PlateEditor,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../createListPlugin';

export const getUnorderedListType = <V extends Value>(
  editor: PlateEditor<V>
) => {
  return getPluginType(editor, ELEMENT_UL);
};

export const getOrderedListType = <V extends Value>(editor: PlateEditor<V>) => {
  return getPluginType(editor, ELEMENT_OL);
};

export const getListTypes = <V extends Value>(editor: PlateEditor<V>) => {
  return [getOrderedListType(editor), getUnorderedListType(editor)];
};

export const getListItemType = <V extends Value>(editor: PlateEditor<V>) => {
  return getPluginType(editor, ELEMENT_LI);
};

export const getListItemContentType = <V extends Value>(
  editor: PlateEditor<V>
) => {
  return getPluginType(editor, ELEMENT_LIC);
};
