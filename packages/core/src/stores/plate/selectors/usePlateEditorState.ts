import { usePlateSelectors } from '../platesStore';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const usePlateEditorState = <T = {}>(id?: string) => {
  usePlateSelectors(id).keyEditor();

  return usePlateEditorRef<T>(id);
};
