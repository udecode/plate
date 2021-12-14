import { PlateEditor } from '../types/PlateEditor';
import { getKeysByTypes } from './getKeysByTypes';

/**
 * Get plugin key by type
 */
export const getKeyByType = <T = {}>(
  editor: PlateEditor<T>,
  type: string
): string | undefined => {
  return getKeysByTypes<T>(editor, type)[0];
};
