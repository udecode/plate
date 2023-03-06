import { Value } from '@udecode/slate';
import { castArray } from 'lodash';
import { PlateEditor } from '../../types/plate/PlateEditor';

/**
 * Get plugin keys by types
 */
export const getKeysByTypes = <V extends Value>(
  editor: PlateEditor<V>,
  type: string | string[]
) => {
  const types = castArray<string>(type);

  const found = Object.values(editor.pluginsByKey).filter((plugin) => {
    return types.includes(plugin.type);
  });

  return found.map((p) => p.key);
};
