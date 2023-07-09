import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Get the editor readOnly.
 */
export const usePlateReadOnly = (id?: PlateId) => {
  return usePlateSelectors(id).readOnly();
};
