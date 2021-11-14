import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const usePlateEditorState = <T = {}>(id?: string | null) => {
  usePlateStore(() => getPlateState<T>(id)?.keyEditor);

  return usePlateEditorRef<T>(id);
};
