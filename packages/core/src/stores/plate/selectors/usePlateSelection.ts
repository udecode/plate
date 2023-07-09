import { PlateId, usePlateSelectors } from '../createPlateStore';
import { usePlateEditorRef } from './usePlateEditorRef';

/**
 * Get the editor selection which is updated on editor change.
 */
export const usePlateSelection = (id?: PlateId) => {
  usePlateSelectors(id).keySelection();

  return usePlateEditorRef(id).selection;
};
