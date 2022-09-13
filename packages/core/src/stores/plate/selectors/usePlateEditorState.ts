import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { PlateId, usePlateSelectors } from '../createPlateStore';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const usePlateEditorState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
) => {
  usePlateSelectors(id).keyEditor();

  return usePlateEditorRef<V, E>(id);
};
