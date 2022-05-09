import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { getKeysByTypes } from './getKeysByTypes';

/**
 * Get plugin key by type
 */
export const getKeyByType = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  type: string
): string | undefined => {
  return getKeysByTypes<V, T>(editor, type)[0];
};
