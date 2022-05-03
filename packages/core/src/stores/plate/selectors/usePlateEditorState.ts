import { Value } from '../../../slate/types/TEditor';
import { usePlateSelectors } from '../platesStore';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const usePlateEditorState = <V extends Value, T = {}>(id?: string) => {
  usePlateSelectors(id).keyEditor();

  return usePlateEditorRef<V, T>(id);
};
