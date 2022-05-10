import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { usePlateSelectors } from '../platesStore';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const usePlateEditorState = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => {
  usePlateSelectors(id).keyEditor();

  return usePlateEditorRef<V, E>(id);
};
