import { PlateId, usePlateSelectors } from '../createPlateStore';
import { useEditorRef } from './useEditorRef';

/**
 * Get the editor selection which is updated on editor change.
 */
export const usePlateSelection = (id?: PlateId) => {
  usePlateSelectors(id).keySelection();

  return useEditorRef(id).selection;
};
