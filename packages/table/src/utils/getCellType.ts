import { type PlateEditor, getPluginTypes } from '@udecode/plate-common';

import { ELEMENT_TD, ELEMENT_TH } from '../TablePlugin';

/** Get td and th types */
export const getCellTypes = (editor: PlateEditor) =>
  getPluginTypes(editor, [ELEMENT_TD, ELEMENT_TH]);
