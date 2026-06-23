import { type BasePlateEditor, getPluginTypes, KEYS } from 'platejs';

/** Get td and th types */
export const getCellTypes = (editor: BasePlateEditor) =>
  getPluginTypes(editor, [KEYS.td, KEYS.th]);
