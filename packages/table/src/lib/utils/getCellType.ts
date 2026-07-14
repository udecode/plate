import { type BaseEditor, getPluginTypes } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Get td and th types */
export const getCellTypes = (editor: BaseEditor) =>
  getPluginTypes(editor, [KEYS.td, KEYS.th]);
