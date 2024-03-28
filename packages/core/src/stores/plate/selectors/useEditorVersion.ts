import {
  PlateId,
  UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/**
 * Version incremented on each editor change.
 */
export const useEditorVersion = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorVersion',
    ...options,
  }).versionEditor();
};
