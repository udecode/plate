import { type SlateEditor, getPluginKey, getPluginType } from 'platejs';

export const getPluginKeyByType = (editor: SlateEditor, type: string) => {
  const nodeType = getPluginType(editor, type);
  return getPluginKey(editor, nodeType) ?? type;
};
