import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Version incremented on selection change.
 */
export const useSelectionVersion = (id?: PlateId) => {
  return usePlateSelectors().versionSelection({ scope: id });
};
