import { usePlateEditorRef } from './usePlateEditorRef';
import { usePlateKey } from './usePlateKey';

/**
 * Get the editor selection which is updated on editor change.
 */
export const usePlateSelection = (id?: string | null) => {
  usePlateKey('keySelection', id);

  return usePlateEditorRef(id)?.selection;
};
