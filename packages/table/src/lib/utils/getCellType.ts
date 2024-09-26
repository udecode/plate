import { type SlateEditor, getPluginTypes } from '@udecode/plate-common';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
} from '../BaseTablePlugin';

/** Get td and th types */
export const getCellTypes = (editor: SlateEditor) =>
  getPluginTypes(editor, [BaseTableCellPlugin, BaseTableCellHeaderPlugin]);
