import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Version incremented on change.
 */
export const useEditorVersion = (id?: PlateId) => {
  return usePlateSelectors(id).versionEditor();
};
