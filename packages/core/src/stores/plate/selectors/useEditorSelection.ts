import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Get the editor selection (deeply memoized).
 */
export const useEditorSelection = (id?: PlateId) =>
  usePlateSelectors(id).trackedSelection().selection;
