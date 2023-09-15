import { Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { PlateId } from '../createPlateStore';
import { useEditorRef } from './useEditorRef';
import { useEditorVersion } from './useEditorVersion';

/**
 * Get editor state which is updated on editor change.
 */
export const useEditorState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId
) => {
  useEditorVersion(id);

  return useEditorRef<V, E>(id);
};
