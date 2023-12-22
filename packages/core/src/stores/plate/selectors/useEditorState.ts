import { Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Get editor state which is updated on editor change.
 */
export const useEditorState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId
): E => {
  return usePlateSelectors(id).trackedEditor().editor;
};
