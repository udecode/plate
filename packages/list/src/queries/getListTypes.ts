import { type PlateEditor, getPluginType } from '@udecode/plate-common';

import {
  ListItemPlugin,
  ListItemContentPlugin,
  ListOrderedPlugin,
  ListUnorderedPlugin,
} from '../ListPlugin';

export const getUnorderedListType = (editor: PlateEditor) => {
  return getPluginType(editor, ListUnorderedPlugin.key);
};

export const getOrderedListType = (editor: PlateEditor) => {
  return getPluginType(editor, ListOrderedPlugin.key);
};

export const getListTypes = (editor: PlateEditor) => {
  return [getOrderedListType(editor), getUnorderedListType(editor)];
};

export const getListItemType = (editor: PlateEditor) => {
  return getPluginType(editor, ListItemPlugin.key);
};

export const getListItemContentType = (editor: PlateEditor) => {
  return getPluginType(editor, ListItemContentPlugin.key);
};
