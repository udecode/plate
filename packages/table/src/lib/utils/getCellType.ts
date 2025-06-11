import { type SlateEditor, getPluginTypes, KEYS } from 'platejs';

/** Get td and th types */
export const getCellTypes = (editor: SlateEditor) =>
  getPluginTypes(editor, [KEYS.td, KEYS.th]);
