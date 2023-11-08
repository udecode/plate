import { PlateId } from '../createPlateStore';
import { useEditorRef } from './useEditorRef';
import { useSelectionVersion } from './useSelectionVersion';

/**
 * Get the editor selection (deeply memoized).
 */
export const useEditorSelection = (id?: PlateId) => {
  useSelectionVersion(id);

  return useEditorRef(id).selection;
};
