import { type PlateEditor, getPluginType } from '@udecode/plate-common';

import {
  ListItemContentPlugin,
  ListItemPlugin,
  ListOrderedPlugin,
  ListUnorderedPlugin,
} from '../ListPlugin';

export const getUnorderedListType = (editor: PlateEditor) => {
  return editor.getType(ListUnorderedPlugin);
};

export const getOrderedListType = (editor: PlateEditor) => {
  return editor.getType(ListOrderedPlugin);
};

export const getListTypes = (editor: PlateEditor) => {
  return [getOrderedListType(editor), getUnorderedListType(editor)];
};

export const getListItemType = (editor: PlateEditor) => {
  return editor.getType(ListItemPlugin);
};

export const getListItemContentType = (editor: PlateEditor) => {
  return editor.getType(ListItemContentPlugin);
};
