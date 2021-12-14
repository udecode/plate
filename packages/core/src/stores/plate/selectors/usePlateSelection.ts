import { usePlateSelectors } from '../platesStore';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get the editor selection which is updated on editor change.
 */
export const usePlateSelection = (id?: string) => {
  usePlateSelectors(id).keySelection();

  return usePlateEditorRef(id)?.selection;
};
