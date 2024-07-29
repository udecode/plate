import castArray from 'lodash/castArray.js';

import type { PlateEditor } from '../types/PlateEditor';

/** Get plugin keys by types */
export const getKeysByTypes = (
  editor: PlateEditor,
  type: string | string[]
) => {
  const types = castArray<string>(type);

  const found = Object.values(editor.pluginsByKey).filter((plugin) => {
    return types.includes(plugin.type);
  });

  return found.map((p) => p.key);
};
