import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { getKeysByTypes } from './getKeysByTypes';

/**
 * Get plugin key by type
 */
export const getKeyByType = <V extends Value>(
  editor: PlateEditor<V>,
  type: string
): string | undefined => {
  return getKeysByTypes<V>(editor, type)[0];
};
