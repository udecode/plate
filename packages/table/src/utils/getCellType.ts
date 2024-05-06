import {
  type PlateEditor,
  type Value,
  getPluginTypes,
} from '@udecode/plate-common/server';

import { ELEMENT_TD, ELEMENT_TH } from '../createTablePlugin';

/** Get td and th types */
export const getCellTypes = <V extends Value>(editor: PlateEditor<V>) =>
  getPluginTypes(editor, [ELEMENT_TD, ELEMENT_TH]);
