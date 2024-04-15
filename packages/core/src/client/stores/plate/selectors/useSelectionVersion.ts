import {
  PlateId,
  UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/**
 * Version incremented on selection change.
 */
export const useSelectionVersion = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) => {
  return usePlateSelectors(id, {
    debugHookName: 'useSelectionVersion',
    ...options,
  }).versionSelection();
};
