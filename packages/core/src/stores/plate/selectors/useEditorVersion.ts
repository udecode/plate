import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Version incremented on each editor change.
 */
export const useEditorVersion = (id?: PlateId) => {
  return usePlateSelectors().versionEditor({ scope: id });
};
