import { getPluginTypes, PlateEditor, Value } from '@udecode/plate-common';

import { ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';

/**
 * Get td and th types
 */
export const getCellTypes = <V extends Value>(editor: PlateEditor<V>) =>
  getPluginTypes(editor, [ELEMENT_TD, ELEMENT_TH]);
