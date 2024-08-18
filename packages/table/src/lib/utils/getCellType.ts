import { type SlateEditor, getPluginTypes } from '@udecode/plate-common';

import { TableCellHeaderPlugin, TableCellPlugin } from '../TablePlugin';

/** Get td and th types */
export const getCellTypes = (editor: SlateEditor) =>
  getPluginTypes(editor, [TableCellPlugin.key, TableCellHeaderPlugin.key]);
