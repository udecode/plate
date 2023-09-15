import { Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { PlateId, usePlateSelectors } from '../createPlateStore';
import { useEditorRef } from './useEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const useEditorState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId
) => {
  usePlateSelectors(id).keyEditor();

  return useEditorRef<V, E>(id);
};
