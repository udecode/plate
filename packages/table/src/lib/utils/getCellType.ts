import { type SlateEditor, getPluginTypes } from '@udecode/plate';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
} from '../BaseTablePlugin';

/** Get td and th types */
export const getCellTypes = (editor: SlateEditor) =>
  getPluginTypes(editor, [BaseTableCellPlugin, BaseTableCellHeaderPlugin]);
