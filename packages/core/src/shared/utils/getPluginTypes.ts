import type { PlateEditor } from '../types/PlateEditor';

import { getPluginType } from './getPluginType';

/** Get plugin types option by plugin keys. */
export const getPluginTypes = (editor: PlateEditor, keys: string[]) =>
  keys.map((key) => getPluginType(editor, key));
